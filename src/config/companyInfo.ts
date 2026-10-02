/**
 * Informasi Perusahaan
 * ---------------------------------------------------
 * Ubah nilai-nilai di bawah ini untuk menyesuaikan nama
 * perusahaan, alamat, kontak, dan lokasi kantor yang tampil di
 * Invoice, halaman Kontak, Area Layanan, dan Footer.
 *
 * Tidak perlu mengubah file lain — cukup edit di sini.
 */

export interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  /** Koordinat untuk menghitung jarak GPS (derajat desimal). */
  lat: number;
  lng: number;
  /** true = koordinat masih perkiraan area; ganti dengan titik pasti lalu hapus/ubah ke false. */
  approximate?: boolean;
  phone: string;
  /** Radius layanan reguler dari kantor ini (km). Atur sesuai kebijakan perusahaan. */
  serviceRadiusKm: number;
}

const OFFICE_ADDRESS = 'JL Palapa, Villa Dago Tol, Tangerang, Banten, Indonesia';

export const COMPANY_INFO = {
  name: 'Laku AC',
  tagline: 'Sistem Informasi Servis & Pemeliharaan AC',
  address: OFFICE_ADDRESS,
  phone: '0813-1402-2911',
  email: 'info@lakuac.com',

  /**
   * Teks pencarian untuk Google Maps. Google yang menentukan titik pastinya
   * dari alamat ini, jadi pin pada peta dan tombol "Petunjuk Arah" selalu mengikuti alamat.
   */
  mapQuery: OFFICE_ADDRESS,

  /** Logo: letakkan file di folder `public/` dengan nama ini (PNG/SVG/WebP). */
  logoPath: '/logo.png',
};

/**
 * Daftar kantor / pos untuk fitur "Cari Kantor Terdekat (GPS)".
 * Tambahkan objek baru jika perusahaan punya cabang lain.
 *
 * PENTING: koordinat di bawah ini hanya PERKIRAAN pusat area Pamulang, Tangerang Selatan
 * (bukan titik pasti Jl. Palapa). Cara mengambil titik pasti:
 *   1. Buka Google Maps, cari alamat kantor, klik kanan pada pin.
 *   2. Klik angka koordinat paling atas (mis. -6.3441, 106.7392) untuk menyalinnya.
 *   3. Tempel ke lat dan lng di bawah, lalu ubah approximate menjadi false.
 */
export const OFFICES: OfficeLocation[] = [
  {
    id: 'pusat',
    name: 'Kantor Pusat Laku AC',
    address: OFFICE_ADDRESS,
    lat: -6.342778,
    lng: 106.738333,
    approximate: true,
    phone: COMPANY_INFO.phone,
    serviceRadiusKm: 25,
  },
];
