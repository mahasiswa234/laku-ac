import db from '../db/connection.js';

/**
 * Mengambil SEMUA id teknisi (tabel technicians) yang terhubung ke akun login (users.id).
 *
 * Self-healing: jika akun ber-role 'technician' belum punya baris di tabel technicians
 * (misalnya akun dibuat lewat halaman Register, bukan lewat menu Manajemen Teknisi),
 * profil teknisi dibuat otomatis agar akun tersebut tidak "kosong" tanpa pesanan.
 */
export async function getTechnicianIdsByUserId(userId: number): Promise<number[]> {
  const [rows]: any = await db.query(
    'SELECT id FROM technicians WHERE user_id = ? ORDER BY id ASC',
    [userId]
  );
  if (rows && rows.length > 0) {
    return rows.map((r: any) => r.id);
  }

  const [users]: any = await db.query(
    'SELECT id, email, role FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!users || users.length === 0 || users[0].role !== 'technician') {
    return [];
  }

  // Ambil nama & telepon dari data pendaftaran (Register selalu membuat baris customers)
  const [custRows]: any = await db.query(
    'SELECT full_name, phone FROM customers WHERE user_id = ? LIMIT 1',
    [userId]
  );
  const fullName: string = custRows?.[0]?.full_name || String(users[0].email).split('@')[0];
  const phone: string = custRows?.[0]?.phone || '-';

  // INSERT ... WHERE NOT EXISTS agar tidak dobel jika dua request datang bersamaan
  await db.query(
    `INSERT INTO technicians (user_id, full_name, phone, skills, status)
     SELECT ?, ?, ?, 'Teknisi AC', 'Aktif' FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE user_id = ?)`,
    [userId, fullName, phone, userId]
  );

  const [after]: any = await db.query(
    'SELECT id FROM technicians WHERE user_id = ? ORDER BY id ASC',
    [userId]
  );
  return after ? after.map((r: any) => r.id) : [];
}

/**
 * Cek apakah sebuah permintaan servis (id angka asli) ditugaskan ke salah satu id teknisi.
 * Penugasan yang berlaku adalah jadwal TERBARU dari permintaan tersebut.
 */
export async function isRequestAssignedToTechnician(
  requestId: number,
  technicianIds: number[]
): Promise<boolean> {
  if (!technicianIds || technicianIds.length === 0) return false;
  const [rows]: any = await db.query(
    `SELECT id FROM service_schedules
      WHERE request_id = ?
        AND id = (SELECT MAX(s2.id) FROM service_schedules s2 WHERE s2.request_id = ?)
        AND technician_id IN (?)
      LIMIT 1`,
    [requestId, requestId, technicianIds]
  );
  return !!rows && rows.length > 0;
}
