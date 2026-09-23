import mysql from 'mysql2/promise';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let mysqlPool: mysql.Pool | null = null;
let isMysqlOnline = false;
let sqliteDb: any = null;
let initPromise: Promise<void> | null = null;

const SQLITE_FILE = path.join(process.cwd(), 'data', 'app_database.sqlite');
const SCHEMA_FILE = path.join(process.cwd(), 'database_schema.sql');

// Helper to persist SQLite state to disk
function persistSqlite() {
  if (!sqliteDb) return;
  try {
    const dir = path.dirname(SQLITE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = sqliteDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(SQLITE_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database:', err);
  }
}

// Initialize SQLite fallback database
async function initSqlite() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(SQLITE_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(SQLITE_FILE);
      sqliteDb = new SQL.Database(fileBuffer);
      console.log('Loaded existing SQLite database from disk.');

      // Ensure payment columns exist on existing table
      const paymentColumns = [
        "ALTER TABLE service_requests ADD COLUMN payment_status TEXT DEFAULT 'Belum Bayar'",
        "ALTER TABLE service_requests ADD COLUMN payment_method TEXT",
        "ALTER TABLE service_requests ADD COLUMN payment_amount DECIMAL(10,2)",
        "ALTER TABLE service_requests ADD COLUMN payment_date TEXT",
        "ALTER TABLE service_requests ADD COLUMN payment_proof_url TEXT",
        "ALTER TABLE service_requests ADD COLUMN payment_notes TEXT",
        "ALTER TABLE service_requests ADD COLUMN verified_by_admin TEXT",
        "ALTER TABLE service_requests ADD COLUMN additional_cost DECIMAL(10,2) DEFAULT 0",
        "ALTER TABLE service_requests ADD COLUMN additional_cost_desc TEXT"
      ];
      for (const colSql of paymentColumns) {
        try {
          sqliteDb.run(colSql);
        } catch (_) {
          // Column already exists, ignore
        }
      }
      persistSqlite();
      return;
    } catch (e) {
      console.warn('Could not read existing SQLite file, creating fresh one:', e);
    }
  }

  sqliteDb = new SQL.Database();
  console.log('Initializing fresh SQLite database with database_schema.sql schema & seed data...');

  if (fs.existsSync(SCHEMA_FILE)) {
    const rawSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    const cleanedSql = rawSql
      .replace(/CREATE DATABASE[^\n]*;/gi, '')
      .replace(/USE[^\n]*;/gi, '')
      .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/ON UPDATE CURRENT_TIMESTAMP/gi, '')
      .replace(/ENUM\([^)]+\)/gi, 'TEXT')
      .replace(/INSERT IGNORE INTO/gi, 'INSERT OR IGNORE INTO');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        sqliteDb.run(stmt);
      } catch (err: any) {
        console.warn('SQLite init statement notice:', stmt.substring(0, 40), err.message);
      }
    }
  }

  persistSqlite();
  console.log('SQLite database ready and initialized with seed data.');
}

async function ensureDbReady() {
  if (!initPromise) {
    initPromise = (async () => {
      // 1. Try MySQL
      try {
        mysqlPool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'servis_ac',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 2000
        });

        const conn = await mysqlPool.getConnection();
        console.log('Successfully connected to MySQL database.');
        conn.release();
        isMysqlOnline = true;
      } catch (err: any) {
        console.warn('MySQL not reachable on port 3306 (' + (err.code || err.message) + ').');
        console.log('Activating embedded SQLite database fallback...');
        isMysqlOnline = false;
        await initSqlite();
      }
    })();
  }
  await initPromise;
}

// Start initialization immediately
ensureDbReady().catch(console.error);

// Clean up params for SQLite binding
function cleanParams(params: any[]): any[] {
  return params.map(p => {
    if (p === undefined) return null;
    if (typeof p === 'boolean') return p ? 1 : 0;
    return p;
  });
}

const db = {
  async query(sql: string, params: any[] = []): Promise<[any, any]> {
    await ensureDbReady();

    if (isMysqlOnline && mysqlPool) {
      try {
        return await mysqlPool.query(sql, params);
      } catch (err: any) {
        // If MySQL drops, fallback to SQLite
        if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.warn('MySQL connection lost during query, falling back to SQLite...');
          isMysqlOnline = false;
          if (!sqliteDb) await initSqlite();
        } else {
          throw err;
        }
      }
    }

    // SQLite Execution
    if (!sqliteDb) await initSqlite();

    const normalizedSql = sql.trim();
    const isSelect = /^(SELECT|PRAGMA|SHOW|DESCRIBE)/i.test(normalizedSql);

    if (isSelect) {
      const stmt = sqliteDb.prepare(normalizedSql);
      if (params && params.length > 0) {
        stmt.bind(cleanParams(params));
      }
      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return [rows, null];
    } else {
      if (params && params.length > 0) {
        sqliteDb.run(normalizedSql, cleanParams(params));
      } else {
        sqliteDb.run(normalizedSql);
      }

      let insertId = 0;
      let affectedRows = 0;

      try {
        const idRes = sqliteDb.exec('SELECT last_insert_rowid() as id');
        if (idRes.length > 0 && idRes[0].values.length > 0) {
          insertId = Number(idRes[0].values[0][0]) || 0;
        }
      } catch (_) {}

      try {
        const affRes = sqliteDb.exec('SELECT changes() as cnt');
        if (affRes.length > 0 && affRes[0].values.length > 0) {
          affectedRows = Number(affRes[0].values[0][0]) || 0;
        }
      } catch (_) {}

      // Persist changes on disk
      persistSqlite();

      return [{ insertId, affectedRows }, null];
    }
  },

  async execute(sql: string, params: any[] = []): Promise<[any, any]> {
    return this.query(sql, params);
  },

  async getConnection() {
    await ensureDbReady();
    if (isMysqlOnline && mysqlPool) {
      return await mysqlPool.getConnection();
    }
    // Return mock connection interface
    return {
      query: (sql: string, params: any[]) => db.query(sql, params),
      execute: (sql: string, params: any[]) => db.execute(sql, params),
      release: () => {},
    };
  }
};

export { db };
export default db;
