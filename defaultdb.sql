-- ==========================================================
-- Skema Database MySQL: Sistem Manajemen Servis AC (Laku AC)
-- ==========================================================


USE defaultdb;

-- 1. Tabel Users (Otentikasi Utama)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'technician', 'customer') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Customers (Data Profil Pelanggan)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabel Technicians (Data Profil Teknisi)
CREATE TABLE technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    skills TEXT, -- Contoh: "AC Split, AC Inverter"
    status ENUM('Aktif', 'Sibuk', 'Libur') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabel AC Units (Data Unit AC milik Pelanggan)
CREATE TABLE ac_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    brand VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL, -- Contoh: "Kamar Utama"
    status ENUM('Normal', 'Perlu Servis', 'Rusak') DEFAULT 'Normal',
    last_service_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. Tabel Services (Master Data Layanan & Harga)
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Service Requests (Permintaan Servis dari Pelanggan & Pembayaran/Invoice)
CREATE TABLE service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(20) UNIQUE NOT NULL, -- Contoh: REQ-203
    customer_id INT NOT NULL,
    service_id INT NOT NULL,
    ac_unit_id INT, -- Opsional, jika spesifik per unit
    request_date DATE NOT NULL,
    status ENUM('Menunggu', 'Dijadwalkan', 'Diproses', 'Selesai', 'Dibatalkan') DEFAULT 'Menunggu',
    customer_notes TEXT,
    -- Field Pembayaran & Invoice
    payment_status ENUM('Belum Bayar', 'Menunggu Verifikasi', 'Lunas', 'Ditolak') DEFAULT 'Belum Bayar',
    payment_method VARCHAR(50), -- 'Tunai (Cash)', 'Transfer Bank BCA', dsb
    payment_amount DECIMAL(10, 2),
    payment_date DATETIME,
    payment_proof_url LONGTEXT,
    payment_notes TEXT,
    verified_by_admin VARCHAR(100),
    additional_cost DECIMAL(10, 2) DEFAULT 0,
    additional_cost_desc TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (ac_unit_id) REFERENCES ac_units(id)
);

-- 7. Tabel Service Schedules (Penugasan Teknisi & Jadwal)
CREATE TABLE service_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    technician_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

-- 8. Tabel Service History & Details (Hasil Pekerjaan & Dokumentasi)
CREATE TABLE service_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    before_photo_url VARCHAR(255),
    after_photo_url VARCHAR(255),
    technician_notes TEXT,
    completed_at DATETIME NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    customer_review TEXT,
    FOREIGN KEY (schedule_id) REFERENCES service_schedules(id) ON DELETE CASCADE
);

-- ==========================================================
-- Data Awal (Seed Data)
-- ==========================================================

-- Data Layanan
INSERT IGNORE INTO services (id, service_code, name, category, base_price) VALUES
(1, 'SVC-001', 'Cuci AC', 'Perawatan', 75000),
(2, 'SVC-002', 'Service AC / Perbaikan', 'Perbaikan', 150000),
(3, 'SVC-003', 'Tambah / Isi Refrigerant', 'Perawatan', 150000),
(4, 'SVC-004', 'Bongkar Pasang AC', 'Instalasi', 300000),
(5, 'SVC-005', 'Pengecekan AC', 'Pemeriksaan', 50000);

-- Data Pengguna (Users)
INSERT IGNORE INTO users (id, email, password, role) VALUES
(1, 'admin@lakuac.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'), -- password: password
(2, 'budi.teknisi@lakuac.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'technician'),
(3, 'andi.teknisi@lakuac.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'technician'),
(4, 'pelanggan1@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
(5, 'pelanggan2@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- Data Teknisi (Technicians)
INSERT IGNORE INTO technicians (id, user_id, full_name, phone, skills, status) VALUES
(1, 2, 'Budi Santoso', '081234567890', 'AC Split, AC Inverter', 'Aktif'),
(2, 3, 'Andi Wijaya', '081298765432', 'AC Cassette, AC Split', 'Aktif');

-- Data Pelanggan (Customers)
INSERT IGNORE INTO customers (id, user_id, full_name, phone, address) VALUES
(1, 4, 'Siti Aminah', '085712345678', 'Jl. Merdeka No. 45, Jakarta Selatan'),
(2, 5, 'Rudi Hermawan', '081911223344', 'Komp. Mawar Blok B2, Depok');

-- Data Unit AC Pelanggan (AC Units)
INSERT IGNORE INTO ac_units (id, customer_id, brand, type, location, status, last_service_date) VALUES
(1, 1, 'Daikin', 'AC Split 1 PK', 'Kamar Utama', 'Normal', '2023-08-10'),
(2, 1, 'Panasonic', 'AC Split 0.5 PK', 'Kamar Anak', 'Perlu Servis', '2023-01-15'),
(3, 2, 'Sharp', 'AC Inverter 1.5 PK', 'Ruang Tamu', 'Rusak', '2022-11-05');

-- Data Permintaan Servis (Service Requests)
INSERT IGNORE INTO service_requests (id, request_code, customer_id, service_id, ac_unit_id, request_date, status, customer_notes) VALUES
(1, 'REQ-20230901', 1, 1, 1, '2023-09-15', 'Selesai', 'Cuci rutin tahunan'),
(2, 'REQ-20230905', 1, 2, 2, '2023-09-18', 'Selesai', 'AC tidak dingin dan meneteskan air'),
(3, 'REQ-20230910', 2, 4, 3, '2023-09-20', 'Dijadwalkan', 'Bongkar pasang dari rumah lama');

-- Data Penugasan Jadwal (Service Schedules)
INSERT IGNORE INTO service_schedules (id, request_id, technician_id, scheduled_date, start_time, end_time) VALUES
(1, 1, 1, '2023-09-15', '09:00:00', '10:30:00'),
(2, 2, 2, '2023-09-18', '13:00:00', '15:00:00'),
(3, 3, 1, '2023-09-20', '10:00:00', '13:00:00');

-- Data Riwayat dan Hasil Servis (Service History)
INSERT IGNORE INTO service_history (id, schedule_id, technician_notes, completed_at, rating, customer_review) VALUES
(1, 1, 'Filter sangat kotor, sudah dicuci bersih. Freon masih full.', '2023-09-15 10:25:00', 5, 'Teknisi ramah dan tepat waktu. AC jadi dingin banget.'),
(2, 2, 'Ada kebocoran di selang pembuangan, sudah ditambal. Tambah freon.', '2023-09-18 14:50:00', 4, 'Bagus, kerjaan rapi tapi sempat telat datang 10 menit.');
