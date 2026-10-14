import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../middleware/authMiddleware.js';
import { hashPassword } from '../utils/password.js';
import {
  isEmailTaken,
  isPhoneTaken,
  isValidPhoneFormat,
  isDuplicateEntryError,
  EMAIL_TAKEN_MESSAGE,
  PHONE_TAKEN_MESSAGE,
  PHONE_FORMAT_MESSAGE
} from '../utils/uniqueness.js';

const router = Router();

// GET all customers (Admin Only)
router.get('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*, 
        u.email,
        COUNT(DISTINCT uac.id) as total_ac_units
      FROM customers c 
      LEFT JOIN users u ON c.user_id = u.id 
      LEFT JOIN ac_units uac ON uac.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pelanggan' });
  }
});

// GET customer by user_id (Protected)
router.get('/by-user/:userId', authenticateJWT, async (req, res) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM customers WHERE user_id = ?', [req.params.userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pelanggan' });
  }
});

// GET single customer (Protected)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pelanggan' });
  }
});

// POST new customer (Admin Only)
// Sama seperti form Daftar: membuat AKUN LOGIN (users, role customer) sekaligus PROFIL pelanggan
// (customers) yang terhubung lewat user_id. Email atau no HP yang sudah terdaftar -> ditolak.
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { full_name, address } = req.body;
  const phone = String(req.body.phone ?? '').trim();
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!full_name || !String(full_name).trim() || !phone) {
    return res.status(400).json({ error: 'Nama dan nomor telepon wajib diisi' });
  }
  if (!isValidPhoneFormat(phone)) {
    return res.status(400).json({ error: PHONE_FORMAT_MESSAGE });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Email pelanggan wajib diisi dengan format yang valid' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password pelanggan minimal 6 karakter' });
  }

  const conn = await db.getConnection();
  try {
    if (await isEmailTaken(email, {}, conn)) {
      return res.status(409).json({ error: EMAIL_TAKEN_MESSAGE });
    }
    if (await isPhoneTaken(phone, {}, conn)) {
      return res.status(409).json({ error: PHONE_TAKEN_MESSAGE });
    }

    await conn.beginTransaction();
    const [userResult]: any = await conn.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashPassword(password), 'customer']
    );
    const [custResult]: any = await conn.query(
      'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
      [userResult.insertId, String(full_name).trim(), phone, address || null]
    );
    await conn.commit();

    res.status(201).json({
      id: custResult.insertId,
      user_id: userResult.insertId,
      email,
      message: 'Pelanggan dan akun login berhasil ditambahkan'
    });
  } catch (error) {
    await conn.rollback().catch(() => {});
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({ error: EMAIL_TAKEN_MESSAGE });
    }
    console.error('Gagal menambahkan pelanggan:', error);
    res.status(500).json({ error: 'Gagal menambahkan pelanggan' });
  } finally {
    conn.release();
  }
});

// PUT update customer (Protected)
// Email hanya bisa diubah oleh admin. No HP / email yang diubah tidak boleh sudah terdaftar.
router.put('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  const { full_name, address } = req.body;
  const phone = req.body.phone == null ? req.body.phone : String(req.body.phone).trim();
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  try {
    const [custRows]: any = await db.query('SELECT id, user_id, phone FROM customers WHERE id = ? LIMIT 1', [req.params.id]);
    if (custRows.length === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
    const userId = custRows[0].user_id;

    // No HP hanya diperiksa jika memang diubah, agar data lama tidak menghalangi edit nama/alamat.
    if (phone && String(phone) !== String(custRows[0].phone ?? '')) {
      if (!isValidPhoneFormat(phone)) {
        return res.status(400).json({ error: PHONE_FORMAT_MESSAGE });
      }
      if (await isPhoneTaken(phone, { excludeUserId: userId, excludeCustomerId: custRows[0].id })) {
        return res.status(409).json({ error: PHONE_TAKEN_MESSAGE });
      }
    }

    let emailChanged = false;
    if (email && req.user?.role === 'admin') {
      const [curr]: any = await db.query('SELECT email FROM users WHERE id = ? LIMIT 1', [userId]);
      const currentEmail = curr?.[0]?.email ? String(curr[0].email).toLowerCase() : '';
      emailChanged = email !== currentEmail;
      if (emailChanged) {
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          return res.status(400).json({ error: 'Format email tidak valid' });
        }
        if (await isEmailTaken(email, { excludeUserId: userId })) {
          return res.status(409).json({ error: EMAIL_TAKEN_MESSAGE });
        }
        const [sharedUser]: any = await db.query('SELECT role FROM users WHERE id = ? LIMIT 1', [userId]);
        if (sharedUser?.[0]?.role === 'admin') {
          return res.status(409).json({ error: 'Email akun admin tidak dapat diubah dari menu pelanggan' });
        }
      }
    }

    await db.query(
      'UPDATE customers SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, req.params.id]
    );
    if (emailChanged) {
      await db.query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
    }
    res.json({ message: 'Pelanggan berhasil diupdate' });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({ error: EMAIL_TAKEN_MESSAGE });
    }
    console.error('Gagal mengupdate pelanggan:', error);
    res.status(500).json({ error: 'Gagal mengupdate pelanggan' });
  }
});

// DELETE customer (Admin Only)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pelanggan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus pelanggan' });
  }
});

export default router;
