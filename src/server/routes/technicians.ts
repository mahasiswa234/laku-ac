import { Router } from 'express';
import db from '../db/connection';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// GET all technicians (Protected - but accessible by authenticated users)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM technicians ORDER BY full_name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data teknisi' });
  }
});

// GET single technician
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM technicians WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Teknisi tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data teknisi' });
  }
});

// POST new technician (Admin Only)
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { user_id, full_name, phone, skills, status } = req.body;
  try {
    const [result]: any = await db.query(
      'INSERT INTO technicians (user_id, full_name, phone, skills, status) VALUES (?, ?, ?, ?, ?)',
      [user_id || 2, full_name, phone, skills, status || 'Aktif']
    );
    res.status(201).json({ id: result.insertId, message: 'Teknisi berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambahkan teknisi' });
  }
});

// PUT update technician (Admin Only)
router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { full_name, phone, skills, status } = req.body;
  try {
    await db.query(
      'UPDATE technicians SET full_name = ?, phone = ?, skills = ?, status = ? WHERE id = ?',
      [full_name, phone, skills, status, req.params.id]
    );
    res.json({ message: 'Teknisi berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate teknisi' });
  }
});

// DELETE technician (Admin Only)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM technicians WHERE id = ?', [req.params.id]);
    res.json({ message: 'Teknisi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus teknisi' });
  }
});

export default router;
