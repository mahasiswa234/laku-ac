import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

// Seluruh route AC unit memerlukan otentikasi JWT yang valid
router.use(authenticateJWT);

// GET all AC units (with optional customer_id or user_id query)
router.get('/', async (req, res) => {
  const { customer_id, user_id } = req.query;
  try {
    let query = `
      SELECT u.*, c.full_name as customer_name, c.phone as customer_phone
      FROM ac_units u
      LEFT JOIN customers c ON u.customer_id = c.id
    `;
    const params: any[] = [];

    if (customer_id) {
      query += ' WHERE u.customer_id = ?';
      params.push(customer_id);
    } else if (user_id) {
      query += ' WHERE c.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY u.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching AC units:', error);
    res.status(500).json({ error: 'Gagal mengambil data unit AC' });
  }
});

// GET ac units by customer
router.get('/customer/:customer_id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ac_units WHERE customer_id = ? ORDER BY created_at DESC', [req.params.customer_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data unit AC' });
  }
});

// POST new AC unit
router.post('/', async (req, res) => {
  let { customer_id, user_id, brand, type, location, status, last_service_date } = req.body;

  if (!brand || !type || !location) {
    return res.status(400).json({ message: 'Merek, tipe AC, dan lokasi wajib diisi' });
  }

  try {
    // If customer_id is missing but user_id is provided, find customer
    if (!customer_id && user_id) {
      const [custRows]: any = await db.query('SELECT id FROM customers WHERE user_id = ?', [user_id]);
      if (custRows.length > 0) {
        customer_id = custRows[0].id;
      }
    }

    // Default to first customer if still no customer_id
    if (!customer_id) {
      const [allCust]: any = await db.query('SELECT id FROM customers LIMIT 1');
      customer_id = allCust.length > 0 ? allCust[0].id : 1;
    }

    const unitStatus = status || 'Normal';
    const serviceDate = last_service_date || null;

    const [result]: any = await db.query(
      'INSERT INTO ac_units (customer_id, brand, type, location, status, last_service_date) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id, brand, type, location, unitStatus, serviceDate]
    );

    const [newUnitRows]: any = await db.query('SELECT * FROM ac_units WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Unit AC berhasil ditambahkan',
      unit: newUnitRows[0] || { id: result.insertId, customer_id, brand, type, location, status: unitStatus, last_service_date: serviceDate }
    });
  } catch (error) {
    console.error('Error inserting AC unit:', error);
    res.status(500).json({ message: 'Gagal menambahkan unit AC ke database' });
  }
});

// PUT update AC unit
router.put('/:id', async (req, res) => {
  const { brand, type, location, status, last_service_date } = req.body;
  try {
    await db.query(
      'UPDATE ac_units SET brand = ?, type = ?, location = ?, status = ?, last_service_date = ? WHERE id = ?',
      [brand, type, location, status || 'Normal', last_service_date || null, req.params.id]
    );
    res.json({ message: 'Data unit AC berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui unit AC' });
  }
});

// DELETE AC unit
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ac_units WHERE id = ?', [req.params.id]);
    res.json({ message: 'Unit AC berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus unit AC' });
  }
});

export default router;
