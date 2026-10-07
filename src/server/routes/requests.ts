import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../middleware/authMiddleware.js';
import { getTechnicianIdsByUserId, isRequestAssignedToTechnician } from '../utils/technician.js';
import { ensureProductsTable } from './products.js';

const router = Router();

async function ensureRequestProductTables() {
  await ensureProductsTable();
  await db.query(`
    CREATE TABLE IF NOT EXISTS request_services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      service_id INT NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_request_service (request_id, service_id),
      FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS request_products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      price DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_request_product (request_id, product_id),
      FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

// Batas ukuran data URI bukti transfer (karakter). Gambar sudah dikompres ~600KB di browser.
const MAX_PROOF_LENGTH = 3_500_000;

// Helper to generate unique request code
function generateRequestCode(): string {
  const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `REQ-${timestamp}${randomSuffix}`;
}

// Membangun klausa WHERE yang aman terhadap strict SQL mode: kolom INT (id) tidak boleh
// dibandingkan langsung dengan string non-angka (request_code) dalam satu kondisi "id = ? OR request_code = ?".
function buildTargetClause(targetId: string, prefix = ''): { clause: string; params: any[] } {
  if (/^\d+$/.test(targetId)) {
    return { clause: `${prefix}id = ?`, params: [targetId] };
  }
  return { clause: `${prefix}request_code = ?`, params: [targetId] };
}

// Cari id asli (angka) service_requests dari id angka / request_code
async function resolveRealRequestId(targetId: string): Promise<number | null> {
  const { clause, params } = buildTargetClause(targetId);
  const [rows]: any = await db.query(`SELECT id FROM service_requests WHERE ${clause} LIMIT 1`, params);
  return rows && rows.length > 0 ? rows[0].id : null;
}

// Cari id pelanggan (tabel customers) milik user yang sedang login
async function getCustomerIdByUserId(userId: number): Promise<number | null> {
  const [rows]: any = await db.query('SELECT id FROM customers WHERE user_id = ? LIMIT 1', [userId]);
  return rows && rows.length > 0 ? rows[0].id : null;
}

// Cek apakah request milik pelanggan (user) tertentu
async function isRequestOwnedByUser(requestId: number, userId: number): Promise<boolean> {
  const [rows]: any = await db.query(
    `SELECT sr.id FROM service_requests sr
       JOIN customers c ON sr.customer_id = c.id
      WHERE sr.id = ? AND c.user_id = ? LIMIT 1`,
    [requestId, userId]
  );
  return !!rows && rows.length > 0;
}

/**
 * Kolom + join yang dipakai daftar & detail pesanan.
 *
 * - Hanya JADWAL TERBARU per permintaan yang di-join (sch.id = MAX(id)), sehingga satu
 *   pesanan = satu baris dan teknisi yang tampil adalah teknisi yang dipilih terakhir.
 * - payment_proof_url (data URI base64, bisa ratusan KB) TIDAK ikut di daftar. Daftar hanya
 *   membawa penanda has_payment_proof; gambar diambil lewat GET /:id/payment-proof.
 *   Ini mencegah respons daftar melewati batas 4,5MB Vercel serverless.
 */
const LIST_SELECT = `
  SELECT 
    sr.id,
    sr.request_code,
    sr.customer_id,
    c.user_id,
    c.full_name as customer,
    c.phone as customer_phone,
    c.address as customer_address,
    sr.service_id,
    COALESCE((SELECT GROUP_CONCAT(CONCAT(s2.name, ' (Rp ', FORMAT(rs2.price, 0), ')') ORDER BY rs2.id SEPARATOR ', ') FROM request_services rs2 JOIN services s2 ON s2.id = rs2.service_id WHERE rs2.request_id = sr.id), s.name) as service,
    COALESCE((SELECT SUM(rs2.price) FROM request_services rs2 WHERE rs2.request_id = sr.id), s.base_price) + COALESCE((SELECT SUM(rp.price * rp.quantity) FROM request_products rp WHERE rp.request_id = sr.id), 0) as service_price,
    (SELECT GROUP_CONCAT(CONCAT(p.brand, ' - ', p.name, ' (Rp ', FORMAT(rp.price, 0), ')') ORDER BY rp.id SEPARATOR ', ') FROM request_products rp JOIN products p ON p.id = rp.product_id WHERE rp.request_id = sr.id) as product_summary,
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
    (sr.payment_proof_url IS NOT NULL AND sr.payment_proof_url <> '') AS has_payment_proof,
    sr.payment_notes,
    sr.verified_by_admin,
    sr.additional_cost,
    sr.additional_cost_desc,
    tech.full_name as technician_name,
    tech.phone as technician_phone,
    tech.id as technician_id,
    sch.id as schedule_id,
    sch.scheduled_date,
    sch.start_time,
    sch.end_time,
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
  LEFT JOIN service_schedules sch 
         ON sch.id = (SELECT MAX(s2.id) FROM service_schedules s2 WHERE s2.request_id = sr.id)
  LEFT JOIN technicians tech ON sch.technician_id = tech.id
  LEFT JOIN service_history sh ON sh.schedule_id = sch.id
`;

function normalizeRow(row: any) {
  if (row) row.has_payment_proof = !!Number(row.has_payment_proof);
  return row;
}

// GET all requests (supports ?customer_id=... or ?user_id=... or ?status=...) - Protected
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  const { customer_id, user_id, status } = req.query;

  try {
    await ensureRequestProductTables();
    const conditions: string[] = [];
    const params: any[] = [];

    if (req.user?.role === 'technician') {
      // Teknisi hanya melihat permintaan yang ditugaskan admin ke akun teknisinya
      const myTechIds = await getTechnicianIdsByUserId(req.user.userId);
      if (myTechIds.length === 0) {
        return res.json({ success: true, message: 'Profil teknisi tidak ditemukan', data: [] });
      }
      conditions.push('sch.technician_id IN (?)');
      params.push(myTechIds);
    } else if (req.user?.role === 'customer') {
      // Pelanggan hanya boleh melihat pesanannya sendiri, apa pun query yang dikirim
      const myCustomerId = await getCustomerIdByUserId(req.user.userId);
      if (!myCustomerId) {
        return res.json({ success: true, message: 'Profil pelanggan tidak ditemukan', data: [] });
      }
      conditions.push('sr.customer_id = ?');
      params.push(myCustomerId);
    } else if (req.user?.role === 'admin') {
      if (customer_id) {
        conditions.push('sr.customer_id = ?');
        params.push(customer_id);
      } else if (user_id) {
        conditions.push('c.user_id = ?');
        params.push(user_id);
      }
    } else {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    if (status) {
      conditions.push('sr.status = ?');
      params.push(status);
    }

    let query = LIST_SELECT;
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY sr.id DESC';

    const [rows]: any = await db.query(query, params);
    res.json({
      success: true,
      message: 'Data permintaan servis berhasil diambil',
      data: rows.map(normalizeRow)
    });
  } catch (error) {
    console.error('Gagal mengambil daftar permintaan servis:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pesanan dari database',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET bukti transfer (gambar) satu pesanan - hanya admin atau pelanggan pemilik pesanan
router.get('/:id/payment-proof', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const realId = await resolveRealRequestId(req.params.id);
    if (!realId) return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      const owned = req.user?.role === 'customer' && (await isRequestOwnedByUser(realId, req.user.userId));
      if (!owned) return res.status(403).json({ message: 'Anda tidak berhak melihat bukti transfer ini.' });
    }

    const [rows]: any = await db.query(
      'SELECT payment_proof_url, payment_status, payment_notes FROM service_requests WHERE id = ? LIMIT 1',
      [realId]
    );
    const row = rows?.[0];
    if (!row || !row.payment_proof_url) {
      return res.status(404).json({ message: 'Belum ada bukti transfer yang diunggah.' });
    }

    res.json({
      payment_proof_url: row.payment_proof_url,
      payment_status: row.payment_status,
      payment_notes: row.payment_notes
    });
  } catch (error) {
    console.error('Gagal mengambil bukti transfer:', error);
    res.status(500).json({ message: 'Gagal mengambil bukti transfer dari database' });
  }
});

// GET single request by ID or request_code (dipakai halaman Invoice) - Protected
router.get('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  const target = req.params.id;
  try {
    await ensureRequestProductTables();
    const { clause, params } = buildTargetClause(target, 'sr.');
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
        COALESCE((SELECT GROUP_CONCAT(CONCAT(s2.name, ' (Rp ', FORMAT(rs2.price, 0), ')') ORDER BY rs2.id SEPARATOR ', ') FROM request_services rs2 JOIN services s2 ON s2.id = rs2.service_id WHERE rs2.request_id = sr.id), s.name) as service,
        COALESCE((SELECT SUM(rs2.price) FROM request_services rs2 WHERE rs2.request_id = sr.id), s.base_price) + COALESCE((SELECT SUM(rp.price * rp.quantity) FROM request_products rp WHERE rp.request_id = sr.id), 0) as service_price,
    (SELECT GROUP_CONCAT(CONCAT(p.brand, ' - ', p.name, ' (Rp ', FORMAT(rp.price, 0), ')') ORDER BY rp.id SEPARATOR ', ') FROM request_products rp JOIN products p ON p.id = rp.product_id WHERE rp.request_id = sr.id) as product_summary,
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
        tech.id as technician_id,
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
      LEFT JOIN service_schedules sch 
             ON sch.id = (SELECT MAX(s2.id) FROM service_schedules s2 WHERE s2.request_id = sr.id)
      LEFT JOIN technicians tech ON sch.technician_id = tech.id
      LEFT JOIN service_history sh ON sh.schedule_id = sch.id
      WHERE ${clause}
      LIMIT 1
    `;
    const [rows]: any = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });
    }
    const row = rows[0];

    // Ambil rincian layanan satu per satu agar invoice tidak menggabungkan
    // beberapa layanan berbeda menjadi satu baris dengan total gabungan.
    const [serviceItems]: any = await db.query(
      `SELECT rs.service_id, s.name, rs.price
       FROM request_services rs
       JOIN services s ON s.id = rs.service_id
       WHERE rs.request_id = ?
       ORDER BY rs.id ASC`,
      [row.id]
    );
    row.service_items = serviceItems.map((item: any) => ({
      service_id: Number(item.service_id),
      name: item.name,
      price: Number(item.price || 0)
    }));

    // Otorisasi: admin semua; pelanggan hanya miliknya; teknisi hanya yang ditugaskan padanya
    const role = req.user?.role;
    if (role === 'customer') {
      if (Number(row.user_id) !== Number(req.user!.userId)) {
        return res.status(403).json({ message: 'Anda tidak berhak melihat pesanan ini.' });
      }
    } else if (role === 'technician') {
      const myTechIds = await getTechnicianIdsByUserId(req.user!.userId);
      if (!row.technician_id || !myTechIds.includes(Number(row.technician_id))) {
        return res.status(403).json({ message: 'Pesanan ini tidak ditugaskan kepada Anda.' });
      }
      delete row.payment_proof_url;
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    res.json(row);
  } catch (error) {
    console.error('Gagal mengambil detail permintaan servis:', error);
    res.status(500).json({ message: 'Gagal mengambil detail pesanan dari database' });
  }
});

// POST Create new service request from Customer Dashboard / Booking form - Protected
router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  const {
    phone,
    customer_id,
    service_id,
    service_ids,
    product_ids,
    serviceType,
    ac_unit_id,
    date,
    complaint,
    customer_notes
  } = req.body;

  const notes = customer_notes || complaint || '';
  const requestDate = date || new Date().toISOString().split('T')[0];

  try {
    await ensureRequestProductTables();
    // 1. Tentukan pelanggan
    let resolvedCustomerId: number | null = null;

    if (req.user?.role === 'customer') {
      // Pesanan SELALU dibuat atas nama akun yang login (data customer_id/user_id dari klien diabaikan)
      resolvedCustomerId = await getCustomerIdByUserId(req.user.userId);
      if (!resolvedCustomerId) {
        return res.status(400).json({ message: 'Profil pelanggan untuk akun ini tidak ditemukan.' });
      }
    } else if (req.user?.role === 'admin') {
      if (customer_id) {
        resolvedCustomerId = Number(customer_id);
      } else if (phone) {
        const [custByPhone]: any = await db.query('SELECT id FROM customers WHERE phone = ? LIMIT 1', [phone]);
        if (custByPhone.length > 0) resolvedCustomerId = custByPhone[0].id;
      }
      if (!resolvedCustomerId) {
        return res.status(400).json({ message: 'Pelanggan tidak ditemukan. Sertakan customer_id yang valid.' });
      }
    } else {
      return res.status(403).json({ message: 'Hanya pelanggan atau admin yang dapat membuat permintaan servis.' });
    }

    // 2. Tentukan satu atau beberapa layanan
    let requestedServiceIds: number[] = Array.isArray(service_ids)
      ? service_ids.map((id: any) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0)
      : [];
    if (requestedServiceIds.length === 0 && service_id) {
      const legacyId = Number(service_id);
      if (Number.isInteger(legacyId) && legacyId > 0) requestedServiceIds = [legacyId];
    }
    requestedServiceIds = [...new Set(requestedServiceIds)];
    if (requestedServiceIds.length === 0 && serviceType) {
      const names = String(serviceType).split(',').map((x: string) => x.trim()).filter(Boolean);
      for (const name of names) {
        const [svcRows]: any = await db.query('SELECT id FROM services WHERE name = ? LIMIT 1', [name]);
        if (svcRows.length > 0) requestedServiceIds.push(Number(svcRows[0].id));
      }
    }
    if (requestedServiceIds.length === 0) {
      return res.status(400).json({ message: 'Pilih minimal satu layanan yang valid.' });
    }
    const placeholders = requestedServiceIds.map(() => '?').join(',');
    const [serviceRows]: any = await db.query(`SELECT id, name, base_price FROM services WHERE id IN (${placeholders})`, requestedServiceIds);
    if (serviceRows.length !== requestedServiceIds.length) {
      return res.status(400).json({ message: 'Salah satu layanan yang dipilih tidak ditemukan.' });
    }
    const resolvedServiceId = requestedServiceIds[0];

    const requestedProductIds: number[] = Array.isArray(product_ids)
      ? [...new Set(product_ids.map((id: any) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0))]
      : [];
    if (requestedProductIds.length > 0) {
      const productPlaceholders = requestedProductIds.map(() => '?').join(',');
      const [productRows]: any = await db.query(
        `SELECT id, category, price, brand, name FROM products WHERE id IN (${productPlaceholders}) AND status = 'Aktif'`,
        requestedProductIds
      );
      if (productRows.length !== requestedProductIds.length) {
        return res.status(400).json({ message: 'Produk yang dipilih tidak ditemukan atau sudah tidak aktif.' });
      }
      const selectedServiceNames = serviceRows.map((row:any) => String(row.name || '').toLowerCase());
      const needsIndoor = selectedServiceNames.some((name:string) => name.includes('ganti indoor'));
      const needsOutdoor = selectedServiceNames.some((name:string) => name.includes('ganti outdoor'));
      if (needsIndoor && !productRows.some((p:any) => p.category === 'indoor')) {
        return res.status(400).json({ message: 'Untuk layanan ganti indoor, pilih produk unit indoor.' });
      }
      if (needsOutdoor && !productRows.some((p:any) => p.category === 'outdoor')) {
        return res.status(400).json({ message: 'Untuk layanan ganti outdoor, pilih produk unit outdoor.' });
      }
    }

    // 3. Validasi unit AC (harus milik pelanggan yang sama)
    const parsedAcUnitId = ac_unit_id ? parseInt(ac_unit_id, 10) : null;
    if (parsedAcUnitId) {
      const [unitRows]: any = await db.query(
        'SELECT id FROM ac_units WHERE id = ? AND customer_id = ? LIMIT 1',
        [parsedAcUnitId, resolvedCustomerId]
      );
      if (unitRows.length === 0) {
        return res.status(400).json({ message: 'Unit AC tidak ditemukan pada akun Anda.' });
      }
    }

    // 4. Simpan
    const requestCode = generateRequestCode();
    const connection = await db.getConnection();
    let insertResult: any;
    try {
      await connection.beginTransaction();
      const [result]: any = await connection.query(
        `INSERT INTO service_requests (request_code, customer_id, service_id, ac_unit_id, request_date, status, customer_notes)
         VALUES (?, ?, ?, ?, ?, 'Menunggu', ?)`,
        [requestCode, resolvedCustomerId, resolvedServiceId, parsedAcUnitId, requestDate, notes]
      );
      insertResult = result;
      for (const svc of serviceRows) {
        await connection.query(
          'INSERT INTO request_services (request_id, service_id, price) VALUES (?, ?, ?)',
          [insertResult.insertId, svc.id, svc.base_price]
        );
      }
      if (requestedProductIds.length > 0) {
        const productPlaceholders = requestedProductIds.map(() => '?').join(',');
        const [selectedProducts]: any = await connection.query(
          `SELECT id, price FROM products WHERE id IN (${productPlaceholders}) AND status = 'Aktif'`,
          requestedProductIds
        );
        for (const product of selectedProducts) {
          await connection.query(
            'INSERT INTO request_products (request_id, product_id, quantity, price) VALUES (?, ?, 1, ?)',
            [insertResult.insertId, product.id, product.price]
          );
        }
      }
      if (parsedAcUnitId) {
        await connection.query('UPDATE ac_units SET status = ? WHERE id = ?', ['Perlu Servis', parsedAcUnitId]);
      }
      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }


    const [createdRows]: any = await db.query(`${LIST_SELECT} WHERE sr.id = ?`, [insertResult.insertId]);

    res.status(201).json({
      success: true,
      message: 'Permintaan servis berhasil dikirim langsung ke Admin!',
      data: normalizeRow(createdRows[0]) || {
        id: insertResult.insertId,
        request_code: requestCode,
        status: 'Menunggu',
        date: requestDate,
        customer_notes: notes
      }
    });
  } catch (error) {
    console.error('Gagal menyimpan permintaan servis:', error);
    res.status(500).json({
      message: 'Gagal menyimpan permintaan servis ke database',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

// PUT Update Status + penugasan teknisi (Admin) / progres pekerjaan (Teknisi) - Protected
router.put('/:id/status', authenticateJWT, async (req: AuthRequest, res) => {
  const { technician, technician_id, notes, before_photo, after_photo, payment_method, payment_status, additional_cost, additional_cost_desc, payment_amount } = req.body;
  let { status } = req.body;
  const validStatuses = ['Menunggu', 'Dijadwalkan', 'Diproses', 'Selesai', 'Dibatalkan'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  const targetId = req.params.id;
  const isAdmin = req.user?.role === 'admin';
  const isTechnician = req.user?.role === 'technician';

  // Pelanggan tidak boleh mengubah status pekerjaan
  if (!isAdmin && !isTechnician) {
    return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengubah status pesanan.' });
  }

  let warning: string | null = null;

  try {
    const realRequestId = await resolveRealRequestId(targetId);
    if (!realRequestId) {
      return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });
    }

    // actingTechnicianId: id teknisi yang sedang login (hanya untuk role teknisi)
    let actingTechnicianId: number | null = null;

    if (isTechnician) {
      const myTechIds = await getTechnicianIdsByUserId(req.user!.userId);
      if (myTechIds.length === 0 || !(await isRequestAssignedToTechnician(realRequestId, myTechIds))) {
        return res.status(403).json({ message: 'Pekerjaan ini tidak ditugaskan kepada Anda.' });
      }
      if (status !== 'Diproses' && status !== 'Selesai') {
        return res.status(403).json({ message: 'Teknisi hanya dapat mengubah status menjadi Diproses atau Selesai.' });
      }
      // Jadwal yang berlaku adalah milik teknisi yang sedang login
      const [mySched]: any = await db.query(
        'SELECT technician_id FROM service_schedules WHERE request_id = ? ORDER BY id DESC LIMIT 1',
        [realRequestId]
      );
      actingTechnicianId = mySched?.[0]?.technician_id ?? myTechIds[0];
    }

    // Penugasan teknisi HANYA boleh dilakukan admin.
    // technician_id: undefined = tidak mengubah penugasan, null/'' = batalkan penugasan, angka = teknisi terpilih
    let assignTechId: number | null | undefined = undefined;
    if (isAdmin) {
      if (technician_id !== undefined) {
        assignTechId = technician_id === null || technician_id === '' ? null : Number(technician_id);
        if (assignTechId !== null && Number.isNaN(assignTechId)) {
          return res.status(400).json({ message: 'ID teknisi tidak valid' });
        }
      } else if (technician) {
        // Kompatibilitas: klien lama masih mengirim nama teknisi -> cocokkan persis (bukan LIKE)
        const [byName]: any = await db.query('SELECT id FROM technicians WHERE full_name = ? LIMIT 1', [technician]);
        if (!byName || byName.length === 0) {
          return res.status(400).json({ message: `Teknisi "${technician}" tidak ditemukan` });
        }
        assignTechId = byName[0].id;
      }

      if (typeof assignTechId === 'number') {
        const [techExists]: any = await db.query('SELECT id FROM technicians WHERE id = ? LIMIT 1', [assignTechId]);
        if (!techExists || techExists.length === 0) {
          return res.status(400).json({ message: 'Teknisi yang dipilih tidak ditemukan' });
        }
        // Setelah ditugaskan, permintaan yang masih "Menunggu" otomatis menjadi "Dijadwalkan"
        // supaya langsung muncul di dashboard teknisi yang dipilih.
        if (status === 'Menunggu') status = 'Dijadwalkan';
      } else if (assignTechId === null && (status === 'Dijadwalkan' || status === 'Diproses')) {
        // Tanpa teknisi, status tidak boleh "Dijadwalkan"/"Diproses" (teknisi tidak akan tahu ada pekerjaan)
        status = 'Menunggu';
      }
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const parsedAdditionalCost = additional_cost !== undefined ? parseFloat(additional_cost) || 0 : 0;
    const additionalDescVal = additional_cost_desc || null;

    // === Status + penugasan disimpan dalam SATU transaksi: keduanya berhasil atau keduanya batal ===
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

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

        await conn.query(`
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
          WHERE id = ?
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
          realRequestId
        ]);
      } else {
        await conn.query('UPDATE service_requests SET status = ? WHERE id = ?', [status, realRequestId]);
      }

      // Simpan penugasan teknisi (hanya admin). Satu permintaan = satu teknisi terpilih.
      if (assignTechId !== undefined) {
        if (assignTechId === null) {
          // Admin membatalkan penugasan -> hapus jadwal (yang belum punya riwayat pengerjaan)
          await conn.query(
            `DELETE FROM service_schedules
              WHERE request_id = ?
                AND NOT EXISTS (SELECT 1 FROM service_history h WHERE h.schedule_id = service_schedules.id)`,
            [realRequestId]
          );
        } else {
          const [schedRows]: any = await conn.query(
            'SELECT id FROM service_schedules WHERE request_id = ? ORDER BY id DESC',
            [realRequestId]
          );
          if (schedRows && schedRows.length > 0) {
            // Pindahkan ke teknisi baru & pastikan hanya ada 1 jadwal aktif (hapus duplikat lama)
            await conn.query('UPDATE service_schedules SET technician_id = ? WHERE id = ?', [assignTechId, schedRows[0].id]);
            for (const extra of schedRows.slice(1)) {
              await conn.query(
                'DELETE FROM service_schedules WHERE id = ? AND NOT EXISTS (SELECT 1 FROM service_history h WHERE h.schedule_id = service_schedules.id)',
                [extra.id]
              );
            }
          } else {
            // Catatan: literal string memakai PARAMETER (bukan tanda kutip ganda) karena MySQL Aiven
            // berjalan dengan sql_mode ketat/ANSI, di mana "..." dianggap nama kolom, bukan teks.
            await conn.query(
              'INSERT INTO service_schedules (request_id, technician_id, scheduled_date, start_time, end_time) VALUES (?, ?, CURRENT_DATE, ?, ?)',
              [realRequestId, assignTechId, '09:00:00', '11:00:00']
            );
          }
        }
      }

      await conn.commit();
    } catch (txError) {
      await conn.rollback();
      throw txError;
    } finally {
      conn.release();
    }

    // === Dokumentasi pekerjaan saat Selesai (tidak membatalkan status jika gagal, tapi dilaporkan) ===
    if (status === 'Selesai') {
      try {
        let scheduleId: number | null = null;
        const [schedRows]: any = await db.query(
          'SELECT id FROM service_schedules WHERE request_id = ? ORDER BY id DESC LIMIT 1',
          [realRequestId]
        );

        if (schedRows && schedRows.length > 0) {
          scheduleId = schedRows[0].id;
        } else if (actingTechnicianId) {
          const [insSched]: any = await db.query(
            'INSERT INTO service_schedules (request_id, technician_id, scheduled_date, start_time, end_time) VALUES (?, ?, CURRENT_DATE, ?, ?)',
            [realRequestId, actingTechnicianId, '09:00:00', '11:00:00']
          );
          scheduleId = insSched.insertId;
        }
        // Jika belum ada teknisi sama sekali, jangan membuat jadwal palsu ke teknisi mana pun.

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
              'INSERT INTO service_history (schedule_id, before_photo_url, after_photo_url, technician_notes, completed_at) VALUES (?, ?, ?, ?, ?)',
              [scheduleId, before_photo || null, after_photo || null, techNotesText, nowStr]
            );
          }
        }

        // Update status unit AC menjadi Normal & catat tanggal servis terakhir
        const [reqRows]: any = await db.query('SELECT ac_unit_id FROM service_requests WHERE id = ?', [realRequestId]);
        if (reqRows && reqRows.length > 0 && reqRows[0].ac_unit_id) {
          const todayDate = new Date().toISOString().split('T')[0];
          await db.query(
            'UPDATE ac_units SET status = ?, last_service_date = ? WHERE id = ?',
            ['Normal', todayDate, reqRows[0].ac_unit_id]
          );
        }
      } catch (histErr) {
        console.error('Gagal menyimpan dokumentasi servis (service_history/ac_units):', histErr);
        warning = 'Status Selesai tersimpan, tetapi catatan/foto dokumentasi gagal disimpan. ' +
          'Pastikan kolom foto di tabel service_history bertipe LONGTEXT (lihat migrations/001_perbaikan_teknisi_dan_foto.sql).';
      }
    }

    res.json({
      success: true,
      message: `Status pesanan berhasil diubah menjadi ${status}`,
      status,
      ...(warning ? { warning } : {})
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      message: 'Gagal memperbarui status pesanan',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST Upload Payment Proof (Pelanggan - Opsi 2) - Protected
router.post('/:id/upload-payment', authenticateJWT, async (req: AuthRequest, res) => {
  const targetId = req.params.id;
  const { payment_proof_url, payment_bank, payment_method, payment_sender_name, payment_transfer_date, payment_amount, payment_notes } = req.body;

  if (!payment_proof_url) {
    return res.status(400).json({ message: 'Bukti transfer wajib disertakan.' });
  }
  if (typeof payment_proof_url !== 'string' || !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(payment_proof_url)) {
    return res.status(400).json({ message: 'Bukti transfer harus berupa file gambar (JPG/PNG/WEBP).' });
  }
  if (payment_proof_url.length > MAX_PROOF_LENGTH) {
    return res.status(413).json({ message: 'Ukuran gambar bukti transfer terlalu besar. Gunakan foto yang lebih kecil.' });
  }

  try {
    const realId = await resolveRealRequestId(targetId);
    if (!realId) {
      return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });
    }

    // Hanya pelanggan pemilik pesanan yang boleh mengunggah bukti. Admin hanya memverifikasi.
    if (req.user?.role !== 'customer' || !(await isRequestOwnedByUser(realId, req.user.userId))) {
      return res.status(403).json({ message: 'Hanya pelanggan pemilik pesanan yang dapat mengunggah bukti pembayaran. Admin melakukan verifikasi pembayaran.' });
    }

    const paymentMethodVal =
      (typeof payment_method === 'string' && payment_method.trim()) ||
      (payment_bank ? `Transfer Bank (${payment_bank})` : 'Transfer Bank');

    const notesDetail = (typeof payment_notes === 'string' && payment_notes.trim())
      ? payment_notes.trim()
      : [
          payment_sender_name ? `Pengirim: ${payment_sender_name}` : '',
          payment_transfer_date ? `Tgl Transfer: ${payment_transfer_date}` : ''
        ].filter(Boolean).join(' | ');

    const [result]: any = await db.query(`
      UPDATE service_requests 
      SET 
        payment_proof_url = ?, 
        payment_method = ?,
        payment_amount = COALESCE(?, payment_amount),
        payment_status = 'Menunggu Verifikasi',
        payment_notes = ?
      WHERE id = ?
    `, [payment_proof_url, paymentMethodVal, payment_amount || null, notesDetail, realId]);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Bukti transfer berhasil diunggah! Admin akan segera memverifikasi mutasi pembayaran.'
    });
  } catch (err: any) {
    console.error('Error uploading payment proof:', err);
    // Tidak ada "sukses palsu": jika database gagal menyimpan, pelanggan harus tahu.
    res.status(500).json({
      message: 'Gagal menyimpan bukti pembayaran ke database. Silakan coba lagi.',
      detail: err?.message || String(err)
    });
  }
});

// PUT Verify Payment (Admin - Opsi 2) - Admin Only
router.put('/:id/verify-payment', authenticateJWT, authorizeRoles('admin'), async (req: AuthRequest, res) => {
  const targetId = req.params.id;
  const { status, admin_name, notes } = req.body; // status: 'Lunas' | 'Ditolak'

  try {
    const realId = await resolveRealRequestId(targetId);
    if (!realId) {
      return res.status(404).json({ message: 'Permintaan servis tidak ditemukan' });
    }

    const isApproved = status === 'Lunas';
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const verifierName = admin_name || req.user?.email || 'Admin';

    if (isApproved) {
      await db.query(`
        UPDATE service_requests 
        SET 
          payment_status = 'Lunas',
          payment_date = ?,
          verified_by_admin = ?,
          payment_notes = CASE WHEN ? <> '' THEN ? ELSE payment_notes END
        WHERE id = ?
      `, [nowStr, verifierName, notes || '', notes || '', realId]);
    } else {
      await db.query(`
        UPDATE service_requests 
        SET 
          payment_status = 'Ditolak',
          payment_notes = ?
        WHERE id = ?
      `, [notes || 'Bukti transfer belum valid / mutasi rekening tidak sesuai', realId]);
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
