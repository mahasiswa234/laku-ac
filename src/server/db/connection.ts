
import mysql from 'mysql2/promise';

let mysqlPool: mysql.Pool | null = null;

/**
 * Membuat koneksi pool ke MySQL Aiven.
 *
 * Seluruh konfigurasi database diambil dari environment variable.
 * Jangan menyimpan credential database langsung di source code.
 */
function createMySQLPool(): mysql.Pool {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  // Validasi environment variable
  if (!host) {
    throw new Error('DB_HOST belum diatur.');
  }

  if (!process.env.DB_PORT || !Number.isInteger(port) || port <= 0) {
    throw new Error('DB_PORT belum diatur atau tidak valid.');
  }

  if (!user) {
    throw new Error('DB_USER belum diatur.');
  }

  if (!password) {
    throw new Error('DB_PASSWORD belum diatur.');
  }

  if (!database) {
    throw new Error('DB_NAME belum diatur.');
  }

  /**
   * CA Certificate Aiven bersifat opsional.
   *
   * Jika DB_SSL_CA tersedia:
   * - koneksi menggunakan SSL/TLS
   * - sertifikat server diverifikasi menggunakan CA
   *
   * Jika DB_SSL_CA tidak tersedia:
   * - koneksi tetap menggunakan SSL/TLS
   * - sertifikat CA tidak diverifikasi
   *
   * Ini sesuai kebutuhan SSL Mode = REQUIRED.
   */
  const sslCa = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');

  const poolConfig: mysql.PoolOptions = {
    host,
    port,
    user,
    password,
    database,

    waitForConnections: true,
    connectionLimit: Number(
      process.env.DB_CONNECTION_LIMIT || 10
    ),
    queueLimit: 0,

    connectTimeout: 10000,

    charset: 'utf8mb4',

    // Aiven membutuhkan koneksi SSL/TLS.
    ssl: sslCa
      ? {
          ca: sslCa,
          rejectUnauthorized: true
        }
      : {
          rejectUnauthorized: false
        }
  };

  return mysql.createPool(poolConfig);
}

/**
 * Mendapatkan MySQL connection pool.
 */
function getPool(): mysql.Pool {
  if (!mysqlPool) {
    mysqlPool = createMySQLPool();
  }

  return mysqlPool;
}

/**
 * Menguji koneksi ke database.
 */
async function testDatabaseConnection(): Promise<void> {
  const pool = getPool();

  let connection: mysql.PoolConnection | null = null;

  try {
    connection = await pool.getConnection();

    await connection.query('SELECT 1');

    console.log('==========================================');
    console.log('MySQL database connected successfully.');
    console.log(`Database : ${process.env.DB_NAME}`);
    console.log(`Host     : ${process.env.DB_HOST}`);
    console.log(`Port     : ${process.env.DB_PORT}`);
    console.log('SSL      : Enabled');
    console.log('==========================================');
  } catch (error: any) {
    console.error('==========================================');
    console.error('MySQL database connection failed.');
    console.error(`Error: ${error?.message || error}`);
    console.error('==========================================');

    throw error;
  } finally {
    connection?.release();
  }
}

/**
 * Object database yang digunakan oleh seluruh API.
 */
const db = {
  /**
   * Menjalankan query SQL.
   */
  async query(
    sql: string,
    params: any[] = []
  ): Promise<[any, any]> {
    const pool = getPool();

    return await pool.query(sql, params);
  },

  /**
   * Menjalankan prepared statement.
   */
  async execute(
    sql: string,
    params: any[] = []
  ): Promise<[any, any]> {
    const pool = getPool();

    return await pool.execute(sql, params);
  },

  /**
   * Mendapatkan koneksi individual dari pool.
   *
   * Koneksi harus dipanggil release() setelah selesai digunakan.
   */
  async getConnection(): Promise<mysql.PoolConnection> {
    const pool = getPool();

    return await pool.getConnection();
  }
};

/**
 * Menguji koneksi ketika module pertama kali dijalankan.
 *
 * Tidak ada fallback ke SQLite.
 * Jika Aiven gagal diakses, error akan ditampilkan.
 */
testDatabaseConnection().catch((error) => {
  console.error(
    'Database initialization failed:',
    error?.message || error
  );
});

export {
  db,
  getPool,
  testDatabaseConnection
};

export default db;

