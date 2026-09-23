import { Router } from 'express';
import db from '../db/connection';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// GET all services (Publik)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data layanan' });
  }
});

// POST new service (Admin Only - Protected by JWT)
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { service_code, name, category, base_price, status } = req.body;
  try {
    const [result]: any = await db.query(
      'INSERT INTO services (service_code, name, category, base_price, status) VALUES (?, ?, ?, ?, ?)',
      [service_code, name, category, base_price, status || 'Aktif']
    );
    res.status(201).json({ id: result.insertId, message: 'Layanan berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambahkan layanan' });
  }
});

// PUT update service (Admin Only - Protected by JWT)
router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { service_code, name, category, base_price, status } = req.body;
  try {
    await db.query(
      'UPDATE services SET service_code = ?, name = ?, category = ?, base_price = ?, status = ? WHERE id = ?',
      [service_code, name, category, base_price, status, req.params.id]
    );
    res.json({ message: 'Layanan berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate layanan' });
  }
});

// DELETE service (Admin Only - Protected by JWT)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Layanan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus layanan' });
  }
});

export default router;
