import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { hashPassword } from '../utils/password.js';

const router = Router();

const TECH_SELECT = `
  SELECT t.*, u.email
  FROM technicians t
  LEFT JOIN users u ON t.user_id = u.id
`;

// GET all technicians (Protected - but accessible by authenticated users)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query(`${TECH_SELECT} ORDER BY t.full_name ASC`);
    res.json(rows);
  } catch (error) {
    console.error('Gagal mengambil data teknisi:', error);
    res.status(500).json({ error: 'Gagal mengambil data teknisi' });
  }
});

// GET single technician
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [rows]: any = await db.query(`${TECH_SELECT} WHERE t.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Teknisi tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data teknisi' });
  }
});

// POST new technician (Admin Only)
// Membuat AKUN LOGIN (users, role technician) sekaligus PROFIL teknisi (technicians) yang
// saling terhubung lewat user_id, sehingga pesanan yang ditugaskan ke teknisi ini muncul
// di dashboard akun teknisi tersebut saat ia login.
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { full_name, phone, skills, status } = req.body;
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Nama dan nomor telepon wajib diisi' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Email login teknisi wajib diisi dengan format yang valid' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password teknisi minimal 6 karakter' });
  }

  const conn = await db.getConnection();
  try {
    const [existing]: any = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email sudah digunakan oleh akun lain' });
    }

    await conn.beginTransaction();
    const [userResult]: any = await conn.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashPassword(password), 'technician']
    );
    const [techResult]: any = await conn.query(
      'INSERT INTO technicians (user_id, full_name, phone, skills, status) VALUES (?, ?, ?, ?, ?)',
      [userResult.insertId, full_name, phone, skills || null, status || 'Aktif']
    );
    await conn.commit();

    res.status(201).json({
      id: techResult.insertId,
      user_id: userResult.insertId,
      email,
      message: 'Teknisi dan akun login berhasil ditambahkan'
    });
  } catch (error) {
    await conn.rollback().catch(() => {});
    console.error('Gagal menambahkan teknisi:', error);
    res.status(500).json({ error: 'Gagal menambahkan teknisi' });
  } finally {
    conn.release();
  }
});

// PUT update technician (Admin Only). email/password opsional (untuk ganti login teknisi).
router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { full_name, phone, skills, status } = req.body;
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  }

  try {
    const [techRows]: any = await db.query('SELECT id, user_id FROM technicians WHERE id = ? LIMIT 1', [req.params.id]);
    if (techRows.length === 0) return res.status(404).json({ error: 'Teknisi tidak ditemukan' });
    const userId = techRows[0].user_id;

    await db.query(
      'UPDATE technicians SET full_name = ?, phone = ?, skills = ?, status = ? WHERE id = ?',
      [full_name, phone, skills, status, req.params.id]
    );

    // Hanya ubah akun login jika email benar-benar berubah atau password baru diisi,
    // dan teknisi ini punya akun sendiri (tidak berbagi dengan teknisi lain)
    let currentEmail = '';
    if (email) {
      const [curr]: any = await db.query('SELECT email FROM users WHERE id = ? LIMIT 1', [userId]);
      currentEmail = curr?.[0]?.email ? String(curr[0].email).toLowerCase() : '';
    }
    const emailChanged = !!email && email !== currentEmail;

    if (emailChanged || password) {
      const [shared]: any = await db.query('SELECT COUNT(*) AS n FROM technicians WHERE user_id = ?', [userId]);
      if (Number(shared[0].n) > 1) {
        return res.status(409).json({
          error: 'Akun login teknisi ini masih dipakai bersama teknisi lain. Jalankan migrasi pada migrations/001_perbaikan_teknisi_dan_foto.sql terlebih dahulu.'
        });
      }
      if (emailChanged) {
        const [dup]: any = await db.query('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [email, userId]);
        if (dup.length > 0) return res.status(409).json({ error: 'Email sudah digunakan oleh akun lain' });
        await db.query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
      }
      if (password) {
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword(password), userId]);
      }
    }

    res.json({ message: 'Teknisi berhasil diupdate' });
  } catch (error) {
    console.error('Gagal mengupdate teknisi:', error);
    res.status(500).json({ error: 'Gagal mengupdate teknisi' });
  }
});

// DELETE technician (Admin Only)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM technicians WHERE id = ?', [req.params.id]);
    res.json({ message: 'Teknisi berhasil dihapus' });
  } catch (error: any) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2' || error?.errno === 1451) {
      return res.status(409).json({ error: 'Teknisi tidak dapat dihapus karena sudah memiliki riwayat penugasan. Ubah statusnya menjadi "Libur".' });
    }
    console.error('Gagal menghapus teknisi:', error);
    res.status(500).json({ error: 'Gagal menghapus teknisi' });
  }
});

export default router;
