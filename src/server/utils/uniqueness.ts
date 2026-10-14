import db from '../db/connection.js';

/**
 * Validasi keunikan email & nomor HP.
 *
 * Dipakai bersama oleh: Daftar (auth.ts), Tambah/Edit Teknisi (technicians.ts) dan
 * Tambah/Edit Pelanggan (customers.ts) supaya aturannya SAMA di semua tempat:
 *   - email yang sudah terdaftar  -> ditolak
 *   - no HP yang sudah terdaftar  -> ditolak
 */

export const EMAIL_TAKEN_MESSAGE = 'Email sudah terdaftar';
export const PHONE_TAKEN_MESSAGE = 'No. WhatsApp / HP sudah terdaftar';
export const PHONE_FORMAT_MESSAGE = 'No. WhatsApp harus berupa angka (10-15 digit)';

type Queryable = { query: (sql: string, params?: any[]) => Promise<[any, any]> };

/** Aturan format yang sama dengan form Daftar: hanya angka, 10-15 digit. */
export function isValidPhoneFormat(raw: unknown): boolean {
  return /^[0-9]{10,15}$/.test(String(raw ?? '').trim());
}

/**
 * Menyamakan penulisan nomor agar 0813..., 62813... dan +62813... dianggap nomor yang sama.
 * Karakter selain angka (spasi, tanda hubung, +) dibuang, awalan 62 diubah menjadi 0.
 */
export function normalizePhone(raw: unknown): string {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('62')) digits = '0' + digits.slice(2);
  return digits;
}

/** Apakah email sudah dipakai akun lain (tidak membedakan huruf besar/kecil). */
export async function isEmailTaken(
  email: string,
  opts: { excludeUserId?: number | null } = {},
  q: Queryable = db
): Promise<boolean> {
  const params: any[] = [String(email).trim()];
  let sql = 'SELECT id FROM users WHERE LOWER(email) = LOWER(?)';
  if (opts.excludeUserId) {
    sql += ' AND id <> ?';
    params.push(opts.excludeUserId);
  }
  const [rows]: any = await q.query(`${sql} LIMIT 1`, params);
  return Array.isArray(rows) && rows.length > 0;
}

/**
 * Apakah no HP sudah terdaftar pada pelanggan ATAU teknisi.
 *
 * Baris milik orang yang sama dikecualikan (lewat excludeUserId / excludeCustomerId /
 * excludeTechnicianId). Ini perlu karena satu akun bisa punya profil di tabel customers
 * sekaligus technicians dengan nomor yang sama, dan saat edit nomor miliknya sendiri
 * tidak boleh dianggap bentrok.
 */
export async function isPhoneTaken(
  phone: string,
  opts: {
    excludeUserId?: number | null;
    excludeCustomerId?: number | null;
    excludeTechnicianId?: number | null;
  } = {},
  q: Queryable = db
): Promise<boolean> {
  const target = normalizePhone(phone);
  if (!target) return false;

  const [custRows]: any = await q.query('SELECT id, user_id, phone FROM customers');
  const [techRows]: any = await q.query('SELECT id, user_id, phone FROM technicians');

  const sameOwner = (row: any, excludeRowId?: number | null) => {
    if (opts.excludeUserId && Number(row.user_id) === Number(opts.excludeUserId)) return true;
    if (excludeRowId && Number(row.id) === Number(excludeRowId)) return true;
    return false;
  };

  for (const row of custRows || []) {
    if (sameOwner(row, opts.excludeCustomerId)) continue;
    if (normalizePhone(row.phone) === target) return true;
  }
  for (const row of techRows || []) {
    if (sameOwner(row, opts.excludeTechnicianId)) continue;
    if (normalizePhone(row.phone) === target) return true;
  }
  return false;
}

/** Error duplikat dari MySQL (UNIQUE users.email) -> true. Menutup celah dua request bersamaan. */
export function isDuplicateEntryError(error: any): boolean {
  return error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062;
}
