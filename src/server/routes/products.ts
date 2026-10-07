import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();


const DEFAULT_PRODUCTS = [
  {
    code: 'IND-001',
    name: 'Unit Indoor 1 PK',
    category: 'indoor',
    brand: 'Daikin',
    description: 'Unit indoor Daikin 1 PK dengan desain modern dan nyaman digunakan untuk kebutuhan AC rumah maupun ruangan kerja.',
    price: 3500000,
    image: '/products/indoor-daikin.png'
  },
  {
    code: 'IND-002',
    name: 'Unit Indoor 1 PK',
    category: 'indoor',
    brand: 'Panasonic',
    description: 'Unit indoor Panasonic 1 PK dengan desain simpel dan cocok untuk membuat ruangan terasa lebih sejuk dan nyaman.',
    price: 3200000,
    image: '/products/indoor-panasonic.png'
  },
  {
    code: 'IND-003',
    name: 'Unit Indoor 1 PK',
    category: 'indoor',
    brand: 'Sharp',
    description: 'Unit indoor Sharp 1 PK yang cocok untuk rumah, kamar, maupun ruang kerja dengan kebutuhan pendinginan sehari-hari.',
    price: 2950000,
    image: '/products/indoor-sharp.png'
  },

  {
    code: 'OUT-001',
    name: 'Unit Outdoor 1 PK',
    category: 'outdoor',
    brand: 'Daikin',
    description: 'Unit outdoor Daikin 1 PK yang dirancang untuk mendukung kinerja AC tetap optimal dan menjaga kesejukan ruangan.',
    price: 3300000,
    image: '/products/outdoor-daikin.png'
  },
  {
    code: 'OUT-002',
    name: 'Unit Outdoor 1 PK',
    category: 'outdoor',
    brand: 'Panasonic',
    description: 'Unit outdoor Panasonic 1 PK dengan performa stabil untuk menemani penggunaan AC sehari-hari di rumah maupun kantor.',
    price: 3050000,
    image: '/products/outdoor-panasonic.png'
  },
  {
    code: 'OUT-003',
    name: 'Unit Outdoor 1 PK',
    category: 'outdoor',
    brand: 'Sharp',
    description: 'Unit outdoor Sharp 1 PK yang dapat menjadi pilihan untuk penggantian unit lama agar sistem AC kembali bekerja dengan baik.',
    price: 2800000,
    image: '/products/outdoor-sharp.png'
  },

  {
    code: 'FRE-001',
    name: 'Freon R32',
    category: 'freon',
    brand: 'Daikin',
    description: 'Freon R32 untuk membantu mengembalikan performa pendinginan AC agar ruangan kembali terasa sejuk dan nyaman.',
    price: 350000,
    image: '/products/freon-r32.png'
  },
  {
    code: 'FRE-002',
    name: 'Freon R410A',
    category: 'freon',
    brand: 'Honeywell',
    description: 'Freon R410A yang digunakan untuk AC dengan sistem refrigeran R410A dan membantu menjaga proses pendinginan tetap optimal.',
    price: 400000,
    image: '/products/freon-r410a.png'
  }
];



async function ensureProductsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_code VARCHAR(30) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      category ENUM('indoor','outdoor','freon') NOT NULL,
      brand VARCHAR(80) NOT NULL,
      description TEXT,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      image_url LONGTEXT,
      status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_products_category (category),
      INDEX idx_products_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const [rows]: any = await db.query('SELECT COUNT(*) AS total FROM products');
  if (Number(rows?.[0]?.total || 0) === 0) {
    for (const product of DEFAULT_PRODUCTS) {
      await db.query(
        `INSERT IGNORE INTO products (product_code, name, category, brand, description, price, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
        [product.code, product.name, product.category, product.brand, product.description, product.price, product.image || null]
      );
    }
  }
}

router.get('/', async (req, res) => {
  try {
    await ensureProductsTable();
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const params: any[] = [];
    let sql = `SELECT id, product_code, name, category, brand, description, price, image_url, status, created_at, updated_at
               FROM products WHERE status = 'Aktif'`;
    if (['indoor', 'outdoor', 'freon'].includes(category)) {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY category, brand, name, id';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error: any) {
    console.error('GET /products:', error);
    res.status(500).json({ message: 'Gagal mengambil data produk', detail: error?.message || String(error) });
  }
});

router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await ensureProductsTable();
    const { product_code, name, category, brand, description, price, image_url, status } = req.body;
    if (!product_code || !name || !category || !brand || Number(price) < 0) {
      return res.status(400).json({ message: 'Kode, nama, kategori, merk, dan harga produk wajib diisi.' });
    }
    const [result]: any = await db.query(
      `INSERT INTO products (product_code, name, category, brand, description, price, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_code, name, category, brand, description || null, Number(price), image_url || null, status || 'Aktif']
    );
    res.status(201).json({ id: result.insertId, message: 'Produk berhasil ditambahkan.' });
  } catch (error: any) {
    console.error('POST /products:', error);
    res.status(500).json({ message: 'Gagal menambahkan produk', detail: error?.message || String(error) });
  }
});

router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await ensureProductsTable();
    const { product_code, name, category, brand, description, price, image_url, status } = req.body;
    await db.query(
      `UPDATE products SET product_code=?, name=?, category=?, brand=?, description=?, price=?, image_url=?, status=? WHERE id=?`,
      [product_code, name, category, brand, description || null, Number(price), image_url || null, status || 'Aktif', req.params.id]
    );
    res.json({ message: 'Produk berhasil diperbarui.' });
  } catch (error: any) {
    console.error('PUT /products:', error);
    res.status(500).json({ message: 'Gagal memperbarui produk', detail: error?.message || String(error) });
  }
});

router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    await ensureProductsTable();
    await db.query('UPDATE products SET status = \'Nonaktif\' WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produk berhasil dinonaktifkan.' });
  } catch (error: any) {
    console.error('DELETE /products:', error);
    res.status(500).json({ message: 'Gagal menghapus produk', detail: error?.message || String(error) });
  }
});

export { ensureProductsTable };
export default router;
