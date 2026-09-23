import { Router } from 'express';
import db from '../db/connection';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// In-memory fallback if MySQL is offline
let mockRequests: any[] = [
  {
    id: 1,
    request_code: 'REQ-20230901',
    customer_id: 1,
    customer: 'Siti Aminah',
    customer_phone: '085712345678',
    customer_address: 'Jl. Merdeka No. 45, Jakarta Selatan',
    service_id: 1,
    service: 'Cuci AC',
    service_price: 75000,
    ac_unit_id: 1,
    ac_brand: 'Daikin',
    ac_type: 'AC Split 1 PK',
    ac_location: 'Kamar Utama',
    date: '2023-09-15',
    status: 'Selesai',
    customer_notes: 'Cuci rutin tahunan',
    created_at: '2023-09-01T08:00:00Z',
    technician_name: 'Budi Santoso',
    payment_status: 'Lunas',
    payment_method: 'Tunai (Cash)',
    payment_amount: 75000,
    payment_date: '2023-09-15 11:30:00',
    verified_by_admin: 'Budi Santoso (Teknisi)',
    additional_cost: 0,
    additional_cost_desc: '-'
  },
  {
    id: 2,
    request_code: 'REQ-20230905',
    customer_id: 1,
    customer: 'Siti Aminah',
    customer_phone: '085712345678',
    customer_address: 'Jl. Merdeka No. 45, Jakarta Selatan',
    service_id: 2,
    service: 'Service AC / Perbaikan',
    service_price: 150000,
    ac_unit_id: 2,
    ac_brand: 'Panasonic',
    ac_type: 'AC Split 0.5 PK',
    ac_location: 'Kamar Anak',
    date: '2023-09-18',
    status: 'Selesai',
    customer_notes: 'AC tidak dingin dan meneteskan air',
    created_at: '2023-09-05T10:30:00Z',
    technician_name: 'Andi Wijaya',
    payment_status: 'Lunas',
    payment_method: 'Transfer Bank BCA',
    payment_amount: 225000,
    payment_date: '2023-09-18 14:10:00',
    verified_by_admin: 'Admin Laku AC',
    additional_cost: 75000,
    additional_cost_desc: 'Tambah freon R32 20 psi'
  },
  {
    id: 3,
    request_code: 'REQ-20230910',
    customer_id: 2,
    customer: 'Rudi Hermawan',
    customer_phone: '081911223344',
    customer_address: 'Komp. Mawar Blok B2, Depok',
    service_id: 4,
    service: 'Bongkar Pasang AC',
    service_price: 300000,
    ac_unit_id: 3,
    ac_brand: 'Sharp',
    ac_type: 'AC Inverter 1.5 PK',
    ac_location: 'Ruang Tamu',
    date: '2023-09-20',
    status: 'Dijadwalkan',
    customer_notes: 'Bongkar pasang dari rumah lama',
    created_at: '2023-09-10T14:15:00Z',
    technician_name: 'Budi Santoso',
    payment_status: 'Belum Bayar',
    payment_method: null,
    payment_amount: 300000,
    payment_date: null,
    verified_by_admin: null,
    additional_cost: 0,
    additional_cost_desc: null
  }
];

// Helper to generate unique request code
function generateRequestCode(): string {
  const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `REQ-${timestamp}${randomSuffix}`;
}

// GET all requests (supports ?customer_id=... or ?user_id=... or ?status=...) - Protected
router.get('/', authenticateJWT, async (req, res) => {
  const { customer_id, user_id, status } = req.query;

  try {
    let query = `
      SELECT 
        sr.id,
        sr.request_code,
        sr.customer_id,
        c.user_id,
        c.full_name as customer,
        c.phone as customer_phone,
        c.address as customer_address,
        sr.service_id,
        s.name as service,
        s.base_price as service_price,
        sr.ac_unit_id,
        u.brand as ac_brand,
        u.type as ac_type,
        u.location as ac_location,
        sr.request_date as date,
        sr.status,
        sr.customer_notes,
        sr.created_at,
        sr.payment_status,
        sr.payment_method,
        sr.payment_amount,
        sr.payment_date,
        sr.payment_proof_url,
        sr.payment_notes,
        sr.verified_by_admin,
        sr.additional_cost,
        sr.additional_cost_desc,
        tech.full_name as technician_name,
        tech.phone as technician_phone,
        sch.id as schedule_id,
        sch.scheduled_date,
        sch.start_time,
        sh.before_photo_url,
        sh.after_photo_url,
        sh.technician_notes,
        sh.rating,
        sh.customer_review,
        sh.completed_at
      FROM service_requests sr
      LEFT JOIN customers c ON sr.customer_id = c.id
      LEFT JOIN services s ON sr.service_id = s.id
      LEFT JOIN ac_units u ON sr.ac_unit_id = u.id
      LEFT JOIN service_schedules sch ON sch.request_id = sr.id
      LEFT JOIN technicians tech ON sch.technician_id = tech.id
      LEFT JOIN service_history sh ON sh.schedule_id = sch.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (customer_id) {
      conditions.push('sr.customer_id = ?');
      params.push(customer_id);
    } else if (user_id) {
      conditions.push('c.user_id = ?');
      params.push(user_id);
    }

    if (status) {
      conditions.push('sr.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sr.id DESC';

    const [rows]: any = await db.query(query, params);
    res.json({
      success: true,
      message: 'Data permintaan servis berhasil diambil',
      data: rows
    });
  } catch (error) {
    console.error('Koneksi MySQL gagal, fallback data mock:', error);
    let filtered = [...mockRequests];
    if (customer_id) {
      filtered = filtered.filter(r => String(r.customer_id) === String(customer_id));
    }
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    res.json({
      success: true,
      message: 'Data permintaan servis (Mock Fallback)',
      data: filtered
    });
  }
});

// GET single request by ID or request_code
router.get('/:id', async (req, res) => {
  const target = req.params.id;
  try {
    const query = `
      SELECT 
        sr.id,
        sr.request_code,
        sr.customer_id,
        c.user_id,
        c.full_name as customer,
        c.phone as customer_phone,
        c.address as customer_address,
        sr.service_id,
        s.name as service,
        s.base_price as service_price,
        sr.ac_unit_id,
        u.brand as ac_brand,
        u.type as ac_type,
        u.location as ac_location,
        sr.request_date as date,
        sr.status,
        sr.customer_notes,
        sr.created_at,
        sr.payment_status,
        sr.payment_method,
        sr.payment_amount,
        sr.payment_date,
        sr.payment_proof_url,
        sr.payment_notes,
        sr.verified_by_admin,
        sr.additional_cost,
        sr.additional_cost_desc,
        tech.full_name as technician_name,
        tech.phone as technician_phone,
        sch.id as schedule_id,
        sch.scheduled_date,
        sch.start_time,
        sh.before_photo_url,
        sh.after_photo_url,
        sh.technician_notes,
        sh.rating,
        sh.customer_review,
        sh.completed_at
      FROM service_requests sr
      LEFT JOIN customers c ON sr.customer_id = c.id
      LEFT JOIN services s ON sr.service_id = s.id
      LEFT JOIN ac_units u ON sr.ac_unit_id = u.id
      LEFT JOIN service_schedules sch ON sch.request_id = sr.id
      LEFT JOIN technicians tech ON sch.technician_id = tech.id
      LEFT JOIN service_history sh ON sh.schedule_id = sch.id
      WHERE sr.id = ? OR sr.request_code = ?
      LIMIT 1
    `;
    const [rows]: any = await db.query(query, [target, target]);
    if (rows.length === 0) {
      const foundMock = mockRequests.find(r => String(r.id) === target || r.request_code === target);
      if (foundMock) return res.json(foundMock);
      return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    const found = mockRequests.find(r => String(r.id) === target || r.request_code === target);
    if (!found) return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });
    res.json(found);
  }
});

// POST Create new service request from Customer Dashboard / Booking form - Protected
router.post('/', authenticateJWT, async (req, res) => {
  const {
    name,
    phone,
    customer_id,
    user_id,
    service_id,
    serviceType,
    ac_unit_id,
    date,
    complaint,
    customer_notes
  } = req.body;

  const notes = customer_notes || complaint || '';
  const requestDate = date || new Date().toISOString().split('T')[0];

  try {
    let resolvedCustomerId = customer_id;

    // 1. Resolve Customer ID
    if (!resolvedCustomerId && user_id) {
      const [custByUser]: any = await db.query('SELECT id FROM customers WHERE user_id = ?', [user_id]);
      if (custByUser.length > 0) {
        resolvedCustomerId = custByUser[0].id;
      }
    }

    if (!resolvedCustomerId && phone) {
      const [custByPhone]: any = await db.query('SELECT id FROM customers WHERE phone = ?', [phone]);
      if (custByPhone.length > 0) {
        resolvedCustomerId = custByPhone[0].id;
      } else if (name) {
        // Auto create a customer record if needed
        const [createCust]: any = await db.query(
          'INSERT INTO customers (user_id, full_name, phone) VALUES (?, ?, ?)',
          [user_id || 4, name, phone]
        );
        resolvedCustomerId = createCust.insertId;
      }
    }

    // Default fallback customer if still not found
    if (!resolvedCustomerId) {
      const [firstCust]: any = await db.query('SELECT id FROM customers LIMIT 1');
      resolvedCustomerId = firstCust.length > 0 ? firstCust[0].id : 1;
    }

    // 2. Resolve Service ID
    let resolvedServiceId = service_id;
    if (!resolvedServiceId && serviceType) {
      const [svcRows]: any = await db.query('SELECT id FROM services WHERE name LIKE ? LIMIT 1', [`%${serviceType}%`]);
      if (svcRows.length > 0) {
        resolvedServiceId = svcRows[0].id;
      }
    }
    if (!resolvedServiceId) {
      const [firstSvc]: any = await db.query('SELECT id FROM services LIMIT 1');
      resolvedServiceId = firstSvc.length > 0 ? firstSvc[0].id : 1;
    }

    // 3. Generate Request Code
    const requestCode = generateRequestCode();
    const parsedAcUnitId = ac_unit_id ? parseInt(ac_unit_id, 10) : null;

    // 4. Insert into database
    const insertSql = `
      INSERT INTO service_requests (request_code, customer_id, service_id, ac_unit_id, request_date, status, customer_notes)
      VALUES (?, ?, ?, ?, ?, 'Menunggu', ?)
    `;

    const [insertResult]: any = await db.query(insertSql, [
      requestCode,
      resolvedCustomerId,
      resolvedServiceId,
      parsedAcUnitId,
      requestDate,
      notes
    ]);

    // If ac_unit_id was provided, update unit status to 'Perlu Servis'
    if (parsedAcUnitId) {
      await db.query('UPDATE ac_units SET status = ? WHERE id = ?', ['Perlu Servis', parsedAcUnitId]);
    }

    // Fetch newly created record with details
    const [createdRows]: any = await db.query(`
      SELECT 
        sr.id,
        sr.request_code,
        sr.customer_id,
        c.full_name as customer,
        c.phone as customer_phone,
        sr.service_id,
        s.name as service,
        s.base_price as service_price,
        sr.ac_unit_id,
        u.brand as ac_brand,
        u.type as ac_type,
        u.location as ac_location,
        sr.request_date as date,
        sr.status,
        sr.customer_notes,
        sr.created_at
      FROM service_requests sr
      LEFT JOIN customers c ON sr.customer_id = c.id
      LEFT JOIN services s ON sr.service_id = s.id
      LEFT JOIN ac_units u ON sr.ac_unit_id = u.id
      WHERE sr.id = ?
    `, [insertResult.insertId]);

    const createdRecord = createdRows[0] || {
      id: insertResult.insertId,
      request_code: requestCode,
      customer: name || 'Pelanggan',
      service: serviceType || 'Servis AC',
      status: 'Menunggu',
      date: requestDate,
      customer_notes: notes
    };

    // Also update mock fallback
    mockRequests.unshift(createdRecord);

    res.status(201).json({
      success: true,
      message: 'Permintaan servis berhasil dikirim langsung ke Admin!',
      data: createdRecord
    });

  } catch (error) {
    console.error('Koneksi MySQL gagal saat simpan permintaan, menggunakan fallback:', error);
    const requestCode = generateRequestCode();
    const fallbackItem = {
      id: Date.now(),
      request_code: requestCode,
      customer_id: customer_id || 1,
      customer: name || 'Pelanggan',
      customer_phone: phone || '-',
      service_id: service_id || 1,
      service: serviceType || 'Cuci AC',
      service_price: 75000,
      ac_unit_id: ac_unit_id || null,
      ac_brand: 'AC',
      ac_type: 'Split',
      ac_location: 'Ruangan',
      status: 'Menunggu',
      date: requestDate,
      customer_notes: notes,
      created_at: new Date().toISOString()
    };
    mockRequests.unshift(fallbackItem);

    res.status(201).json({
      success: true,
      message: 'Permintaan servis berhasil dikirim ke Admin!',
      data: fallbackItem
    });
  }
});

// PUT Update Status (For Admin / Technician) - Protected
router.put('/:id/status', authenticateJWT, async (req, res) => {
  const { status, technician, notes, before_photo, after_photo, payment_method, payment_status, additional_cost, additional_cost_desc, payment_amount } = req.body;
  const validStatuses = ['Menunggu', 'Dijadwalkan', 'Diproses', 'Selesai', 'Dibatalkan'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  const targetId = req.params.id;

  try {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const parsedAdditionalCost = additional_cost !== undefined ? parseFloat(additional_cost) : 0;
    const additionalDescVal = additional_cost_desc || null;

    if (status === 'Selesai') {
      const resolvedPaymentMethod = payment_method || 'Tunai (Cash)';
      const resolvedPaymentStatus = payment_status || (resolvedPaymentMethod === 'Tunai (Cash)' ? 'Lunas' : 'Belum Bayar');
      const resolvedPaymentDate = resolvedPaymentStatus === 'Lunas' ? nowStr : null;
      const resolvedVerifiedBy = resolvedPaymentStatus === 'Lunas' 
        ? (technician ? `${technician} (Teknisi di Lokasi)` : 'Teknisi di Lokasi') 
        : null;
      const paymentNotesVal = resolvedPaymentStatus === 'Lunas' && resolvedPaymentMethod === 'Tunai (Cash)'
        ? 'Diterima tunai oleh teknisi di tempat pengerjaan'
        : (req.body.payment_notes || null);

      await db.query(`
        UPDATE service_requests 
        SET 
          status = ?,
          payment_status = ?,
          payment_method = ?,
          payment_date = ?,
          verified_by_admin = ?,
          additional_cost = ?,
          additional_cost_desc = ?,
          payment_amount = COALESCE(?, payment_amount),
          payment_notes = COALESCE(?, payment_notes)
        WHERE id = ? OR request_code = ?
      `, [
        status,
        resolvedPaymentStatus,
        resolvedPaymentMethod,
        resolvedPaymentDate,
        resolvedVerifiedBy,
        parsedAdditionalCost,
        additionalDescVal,
        payment_amount || null,
        paymentNotesVal,
        targetId,
        targetId
      ]);
    } else {
      await db.query('UPDATE service_requests SET status = ? WHERE id = ? OR request_code = ?', [status, targetId, targetId]);
    }

    // Handle technician assignment if passed
    if (technician) {
      try {
        const [techRows]: any = await db.query('SELECT id FROM technicians WHERE full_name LIKE ? LIMIT 1', [`%${technician}%`]);
        if (techRows && techRows.length > 0) {
          const techId = techRows[0].id;
          const [schedRows]: any = await db.query('SELECT id FROM service_schedules WHERE request_id = ?', [targetId]);
          if (schedRows && schedRows.length > 0) {
            await db.query('UPDATE service_schedules SET technician_id = ? WHERE request_id = ?', [techId, targetId]);
          } else {
            await db.query(
              'INSERT INTO service_schedules (request_id, technician_id, scheduled_date, start_time, end_time) VALUES (?, ?, CURRENT_DATE, "09:00:00", "11:00:00")',
              [targetId, techId]
            );
          }
        }
      } catch (techErr) {
        console.warn('Notice assigning technician schedule:', techErr);
      }
    }

    // If status is 'Selesai', record documentation into service_history and update ac_unit
    if (status === 'Selesai') {
      try {
        // 1. Ensure schedule exists
        let scheduleId: number | null = null;
        const [schedRows]: any = await db.query('SELECT id, technician_id FROM service_schedules WHERE request_id = ? ORDER BY id DESC LIMIT 1', [targetId]);
        
        if (schedRows && schedRows.length > 0) {
          scheduleId = schedRows[0].id;
        } else {
          const [insSched]: any = await db.query(
            'INSERT INTO service_schedules (request_id, technician_id, scheduled_date, start_time, end_time) VALUES (?, 1, CURRENT_DATE, "09:00:00", "11:00:00")',
            [targetId]
          );
          scheduleId = insSched.insertId;
        }

        if (scheduleId) {
          const techNotesText = notes || 'Pekerjaan servis telah diselesaikan dengan baik.';
          const [histRows]: any = await db.query('SELECT id FROM service_history WHERE schedule_id = ?', [scheduleId]);
          if (histRows && histRows.length > 0) {
            await db.query(
              'UPDATE service_history SET before_photo_url = COALESCE(?, before_photo_url), after_photo_url = COALESCE(?, after_photo_url), technician_notes = ?, completed_at = ? WHERE schedule_id = ?',
              [before_photo || null, after_photo || null, techNotesText, nowStr, scheduleId]
            );
          } else {
            await db.query(
              'INSERT INTO service_history (schedule_id, before_photo_url, after_photo_url, technician_notes, completed_at, rating, customer_review) VALUES (?, ?, ?, ?, ?, 5, "Pelayanan sangat memuaskan")',
              [scheduleId, before_photo || null, after_photo || null, techNotesText, nowStr]
            );
          }
        }

        // 2. Update AC Unit status to 'Normal' and update last_service_date
        const [reqRows]: any = await db.query('SELECT ac_unit_id FROM service_requests WHERE id = ? OR request_code = ?', [targetId, targetId]);
        if (reqRows && reqRows.length > 0 && reqRows[0].ac_unit_id) {
          const todayDate = new Date().toISOString().split('T')[0];
          await db.query(
            'UPDATE ac_units SET status = "Normal", last_service_date = ? WHERE id = ?',
            [todayDate, reqRows[0].ac_unit_id]
          );
        }
      } catch (histErr) {
        console.error('Notice updating service_history/ac_units upon completion:', histErr);
      }
    }

    // Update in mock
    const item = mockRequests.find(r => String(r.id) === targetId || r.request_code === targetId);
    if (item) {
      item.status = status;
      if (technician) item.technician_name = technician;
      if (status === 'Selesai') {
        item.payment_method = payment_method || 'Tunai (Cash)';
        item.payment_status = payment_status || (item.payment_method === 'Tunai (Cash)' ? 'Lunas' : 'Belum Bayar');
        if (item.payment_status === 'Lunas') {
          item.payment_date = nowStr;
          item.verified_by_admin = technician ? `${technician} (Teknisi)` : 'Teknisi di Lokasi';
        }
        item.additional_cost = parsedAdditionalCost;
        item.additional_cost_desc = additionalDescVal;
        if (payment_amount) {
          item.payment_amount = payment_amount;
        } else {
          item.payment_amount = (item.service_price || 0) + parsedAdditionalCost;
        }
      }
    }

    res.json({
      success: true,
      message: `Status pesanan berhasil diubah menjadi ${status}`
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    const item = mockRequests.find(r => String(r.id) === targetId || r.request_code === targetId);
    if (item) {
      item.status = status;
      return res.json({ success: true, message: `Status berhasil diubah menjadi ${status}` });
    }
    res.status(500).json({ message: 'Gagal memperbarui status pesanan' });
  }
});

// POST Upload Payment Proof (Pelanggan - Opsi 2) - Protected
router.post('/:id/upload-payment', authenticateJWT, async (req, res) => {
  const targetId = req.params.id;
  const { payment_proof_url, payment_bank, payment_sender_name, payment_transfer_date, payment_amount, payment_notes } = req.body;

  if (!payment_proof_url) {
    return res.status(400).json({ message: 'Bukti transfer wajib disertakan.' });
  }

  try {
    const paymentMethod = payment_bank ? `Transfer Bank (${payment_bank})` : 'Transfer Bank';
    const notesDetail = [
      payment_sender_name ? `Pengirim: ${payment_sender_name}` : '',
      payment_transfer_date ? `Tgl Transfer: ${payment_transfer_date}` : '',
      payment_notes ? `Catatan: ${payment_notes}` : ''
    ].filter(Boolean).join(' | ');

    await db.query(`
      UPDATE service_requests 
      SET 
        payment_proof_url = ?, 
        payment_method = ?,
        payment_amount = COALESCE(?, payment_amount),
        payment_status = 'Menunggu Verifikasi',
        payment_notes = ?
      WHERE id = ? OR request_code = ?
    `, [payment_proof_url, paymentMethod, payment_amount || null, notesDetail, targetId, targetId]);

    // Update mock
    const item = mockRequests.find(r => String(r.id) === targetId || r.request_code === targetId);
    if (item) {
      item.payment_proof_url = payment_proof_url;
      item.payment_method = paymentMethod;
      if (payment_amount) item.payment_amount = payment_amount;
      item.payment_status = 'Menunggu Verifikasi';
      item.payment_notes = notesDetail;
    }

    res.json({
      success: true,
      message: 'Bukti transfer berhasil diunggah! Admin akan segera memverifikasi mutasi pembayaran.'
    });
  } catch (err: any) {
    console.error('Error uploading payment proof:', err);
    const item = mockRequests.find(r => String(r.id) === targetId || r.request_code === targetId);
    if (item) {
      item.payment_proof_url = payment_proof_url;
      item.payment_status = 'Menunggu Verifikasi';
      return res.json({ success: true, message: 'Bukti transfer tersimpan (Fallback).' });
    }
    res.status(500).json({ message: 'Gagal mengunggah bukti pembayaran' });
  }
});

// PUT Verify Payment (Admin - Opsi 2) - Admin Only
router.put('/:id/verify-payment', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const targetId = req.params.id;
  const { status, admin_name, notes } = req.body; // status: 'Lunas' | 'Ditolak'

  try {
    const isApproved = status === 'Lunas';
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (isApproved) {
      await db.query(`
        UPDATE service_requests 
        SET 
          payment_status = 'Lunas',
          payment_date = ?,
          verified_by_admin = ?,
          payment_notes = CASE WHEN ? != '' THEN ? ELSE payment_notes END
        WHERE id = ? OR request_code = ?
      `, [nowStr, admin_name || 'Admin Laku AC', notes || '', notes || '', targetId, targetId]);
    } else {
      await db.query(`
        UPDATE service_requests 
        SET 
          payment_status = 'Ditolak',
          payment_notes = ?
        WHERE id = ? OR request_code = ?
      `, [notes || 'Bukti transfer belum valid / mutasi rekening tidak sesuai', targetId, targetId]);
    }

    const item = mockRequests.find(r => String(r.id) === targetId || r.request_code === targetId);
    if (item) {
      item.payment_status = isApproved ? 'Lunas' : 'Ditolak';
      if (isApproved) {
        item.payment_date = nowStr;
        item.verified_by_admin = admin_name || 'Admin Laku AC';
      }
      if (notes) item.payment_notes = notes;
    }

    res.json({
      success: true,
      message: isApproved 
        ? 'Pembayaran berhasil diverifikasi menjadi LUNAS!' 
        : 'Bukti pembayaran ditolak. Pelanggan dapat mengunggah bukti baru.'
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ message: 'Gagal memproses verifikasi pembayaran' });
  }
});

export default router;
