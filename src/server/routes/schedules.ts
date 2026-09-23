import { Router } from 'express';
import db from '../db/connection';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Seluruh route jadwal memerlukan otentikasi JWT yang valid
router.use(authenticateJWT);

// GET all schedules (with optional technician_id filter)
router.get('/', async (req, res) => {
  const { technician_id } = req.query;
  try {
    let query = `
      SELECT 
        s.*, 
        r.request_code, 
        r.status as request_status, 
        r.customer_notes, 
        svc.name as service_type, 
        c.full_name as customer_name, 
        c.phone as customer_phone, 
        c.address as customer_address, 
        t.full_name as technician_name,
        u.brand as ac_brand,
        u.type as ac_type,
        u.location as ac_location,
        sh.before_photo_url,
        sh.after_photo_url,
        sh.technician_notes,
        sh.rating,
        sh.customer_review,
        sh.completed_at
      FROM service_schedules s
      JOIN service_requests r ON s.request_id = r.id
      LEFT JOIN services svc ON r.service_id = svc.id
      JOIN customers c ON r.customer_id = c.id
      LEFT JOIN technicians t ON s.technician_id = t.id
      LEFT JOIN ac_units u ON r.ac_unit_id = u.id
      LEFT JOIN service_history sh ON sh.schedule_id = s.id
    `;
    const params: any[] = [];

    if (technician_id) {
      query += ' WHERE s.technician_id = ?';
      params.push(technician_id);
    }

    query += ' ORDER BY s.scheduled_date DESC, s.id DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Gagal mengambil data jadwal' });
  }
});

// POST new schedule
router.post('/', async (req, res) => {
  const { request_id, technician_id, scheduled_date, start_time, end_time } = req.body;
  try {
    const sDate = scheduled_date || new Date().toISOString().split('T')[0];
    const sTime = start_time || '09:00:00';
    const eTime = end_time || '11:00:00';

    const [result]: any = await db.query(
      'INSERT INTO service_schedules (request_id, technician_id, scheduled_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [request_id, technician_id, sDate, sTime, eTime]
    );
    
    // Update request status
    await db.query('UPDATE service_requests SET status = ? WHERE id = ?', ['Dijadwalkan', request_id]);
    
    res.status(201).json({ id: result.insertId, message: 'Jadwal teknisi berhasil ditambahkan' });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Gagal menambahkan jadwal' });
  }
});

export default router;
