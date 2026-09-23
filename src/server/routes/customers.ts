import { Router } from 'express';
import db from '../db/connection';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

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

// POST new customer (Protected)
router.post('/', authenticateJWT, async (req, res) => {
  const { user_id, full_name, phone, address } = req.body;
  try {
    const [result]: any = await db.query(
      'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
      [user_id || 1, full_name, phone, address]
    );
    res.status(201).json({ id: result.insertId, message: 'Pelanggan berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambahkan pelanggan' });
  }
});

// PUT update customer (Protected)
router.put('/:id', authenticateJWT, async (req, res) => {
  const { full_name, phone, address } = req.body;
  try {
    await db.query(
      'UPDATE customers SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, req.params.id]
    );
    res.json({ message: 'Pelanggan berhasil diupdate' });
  } catch (error) {
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
