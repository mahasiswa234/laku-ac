export interface GalleryItem {
  id: number;
  title: string;
  category: 'Cuci AC' | 'Perbaikan' | 'Isi Freon' | 'Bongkar Pasang' | 'Komersial';
  imageUrl: string;
  acType: string;
  locationType: string;
  description: string;
  date: string;
  badge: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: 'Steam & Cuci Evaporator Indoor AC Split',
    category: 'Cuci AC',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    acType: 'Daikin Inverter 1 PK',
    locationType: 'Kamar Tidur Utama',
    description: 'Pembersihan mendalam menggunakan plastik pelindung steam, membersihkan jamur dan debu tebal pada sirip evaporator serta blower fan.',
    date: '18 September 2026',
    badge: 'Hasil Maksimal'
  },
  {
    id: 2,
    title: 'Pengisian Freon R32 & Cek Tekanan Manifold',
    category: 'Isi Freon',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    acType: 'Panasonic Standard 1.5 PK',
    locationType: 'Outdoor Balkon',
    description: 'Pengecekan tekanan freon menggunakan manifold gauge presisi dan pengisian refrigerant R32 hingga mencapai tekanan standar pabrik (140-150 PSI).',
    date: '17 September 2026',
    badge: 'Freon Standar'
  },
  {
    id: 3,
    title: 'Inspeksi & Penggantian Kapasitor Kompresor',
    category: 'Perbaikan',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    acType: 'Sharp Plasmacluster 1 PK',
    locationType: 'Outdoor Belakang',
    description: 'Penanganan unit AC yang mendengung dan tidak dingin akibat kapasitor melemah. Dilakukan penggantian kapasitor original bergaransi.',
    date: '16 September 2026',
    badge: 'Komponen Baru'
  },
  {
    id: 4,
    title: 'Instalasi AC Split Baru dengan Pipa Rapi',
    category: 'Bongkar Pasang',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    acType: 'Gree Inverter 2 PK',
    locationType: 'Ruang Keluarga Residensial',
    description: 'Pemasangan unit baru lengkap dengan flaring pipa tembaga presisi tebal 0.7mm, ducting pelindung kabel, dan proses vakum pipa sebelum operasional.',
    date: '15 September 2026',
    badge: 'Instalasi Baru'
  },
  {
    id: 5,
    title: 'Pembersihan Filter Udara & Blower Fan',
    category: 'Cuci AC',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    acType: 'LG Dual Cool 0.5 PK',
    locationType: 'Ruang Kerja Rumah',
    description: 'Pencucian filter antibakteri dan deep clean blower fan yang kotor. Udara yang dihembuskan kembali segar dan tidak bau apek.',
    date: '14 September 2026',
    badge: 'Udara Segar'
  },
  {
    id: 6,
    title: 'Perbaikan Kebocoran Air Indoor Unit (Water Leak)',
    category: 'Perbaikan',
    imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    acType: 'Mitsubishi Heavy Duty 1 PK',
    locationType: 'Kamar Tamu',
    description: 'Penanganan pipa drainase pembuangan air AC yang tersumbat lendir kotoran. Dilakukan penyemprotan bertekanan dan perbaikan kemiringan pipa.',
    date: '13 September 2026',
    badge: 'Anti Bocor'
  },
  {
    id: 7,
    title: 'Pemeliharaan AC Central & Ruang Server Komersial',
    category: 'Komersial',
    imageUrl: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80',
    acType: 'VRV / Multi-Split Central',
    locationType: 'Gedung Perkantoran Sudirman',
    description: 'Pengecekan rutin sistem pendingin ruang server dan ducting kantor komersial untuk menjaga suhu stabil 18-20°C selama 24 jam nonstop.',
    date: '12 September 2026',
    badge: 'Proyek Komersial'
  },
  {
    id: 8,
    title: 'Bongkar Unit AC Lama & Pemindahan Lokasi',
    category: 'Bongkar Pasang',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    acType: 'Samsung Digital Inverter 1 PK',
    locationType: 'Relokasi Rumah Tinggal',
    description: 'Proses pump-down penyimpanan freon ke kompresor tanpa terbuang, pelepasan braket pipa aman, dan pemindahan ke lokasi ruangan baru.',
    date: '11 September 2026',
    badge: 'Pump-Down Rapi'
  },
  {
    id: 9,
    title: 'Pembersihan Outdoor Condenser Unit Cuci Tekanan Tinggi',
    category: 'Cuci AC',
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    acType: 'Daikin Multi-Split 2 PK',
    locationType: 'Area Outdoor Dinding Luar',
    description: 'Pembersihan kisi-kisi sirip kondenser outdoor yang tertutup jelaga dan debu jalanan agar pelepasan panas kompresor lancar dan hemat listrik.',
    date: '10 September 2026',
    badge: 'Hemat Energi'
  },
  {
    id: 10,
    title: 'Deteksi Kebocoran Pipa Freon dengan Leak Detector',
    category: 'Isi Freon',
    imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
    acType: 'Sharp J-Tech 1 PK',
    locationType: 'Sambungan Pipa Plafon',
    description: 'Pemeriksaan kebocoran mikroskopis pada nevel dan sambungan pipa kuningan menggunakan sensor elektronik, dilanjutkan pengelasan dan isi ulang freon.',
    date: '09 September 2026',
    badge: 'Uji Kebocoran'
  },
  {
    id: 11,
    title: 'Instalasi AC Cassette Ceiling 4-Way di Ruang Meeting',
    category: 'Komersial',
    imageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    acType: 'AC Cassette 4 PK Inverter',
    locationType: 'Kantor Coworking Space',
    description: 'Pemasangan AC plafon cassette dengan sebaran hembusan angin 4 arah merata untuk kenyamanan ruang rapat dan lounge kantor.',
    date: '08 September 2026',
    badge: 'Hembusan 4 Arah'
  },
  {
    id: 12,
    title: 'Penggantian Motor Blower Indoor & Bearing Baru',
    category: 'Perbaikan',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    acType: 'Polytron Neuva Ice 1 PK',
    locationType: 'Kamar Anak',
    description: 'Perbaikan suara bising mendecit saat AC menyala. Teknisi mengganti bearing dan karet dinamo motor blower sehingga AC kembali senyap.',
    date: '07 September 2026',
    badge: 'Suara Senyap'
  },
  {
    id: 13,
    title: 'Instalasi AC Kamar Tidur Minimalis Estetik',
    category: 'Bongkar Pasang',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    acType: 'Daikin Premium Breeze 1 PK',
    locationType: 'Master Bedroom Modern',
    description: 'Pemasangan AC split dengan jalur kabel dan pipa tersembunyi di balik dinding gypsum untuk interior kamar tidur yang bersih dan elegan.',
    date: '06 September 2026',
    badge: 'Desain Rapi'
  },
  {
    id: 14,
    title: 'Servis Berkala AC Floor Standing Aula & Kafe',
    category: 'Komersial',
    imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    acType: 'Floor Standing 3 PK',
    locationType: 'Restoran & Coffee Shop',
    description: 'Pembersihan menyeluruh unit standing floor berkapasitas besar, termasuk pengecekan motor fan dan pembersihan bak penampung air kondensasi.',
    date: '05 September 2026',
    badge: 'Kapasitas Besar'
  },
  {
    id: 15,
    title: 'Cuci Besar (Overhaul) Unit AC Indoor Berjamur',
    category: 'Cuci AC',
    imageUrl: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=800&q=80',
    acType: 'Aqua Japan 1 PK',
    locationType: 'Apartemen Studio',
    description: 'Pencucian total dengan menurunkan unit indoor dari dinding untuk pembersihan tuntas talang air belakang dan sirip pendingin yang berlendir.',
    date: '04 September 2026',
    badge: 'Cuci Total'
  },
  {
    id: 16,
    title: 'Pengisian Freon R410A untuk AC Inverter Hemat Daya',
    category: 'Isi Freon',
    imageUrl: 'https://images.unsplash.com/photo-1621905252472-943afaa20e20?auto=format&fit=crop&w=800&q=80',
    acType: 'Panasonic EcoNavi Inverter 1.5 PK',
    locationType: 'Outdoor Rooftop',
    description: 'Vakum sistem pipa dan pengisian freon R410A dalam kondisi cair menggunakan timbangan digital sesuai berat spesifikasi pabrikan.',
    date: '03 September 2026',
    badge: 'Presisi Timbangan'
  },
  {
    id: 17,
    title: 'Pemasangan Braket Outdoor Kokoh Anti Karat',
    category: 'Bongkar Pasang',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    acType: 'Sharp Split 1 PK',
    locationType: 'Balkon Apartemen',
    description: 'Instalasi braket dinding outdoor berlapis cat powder coating anti-karat dengan bantalan karet peredam getaran kompresor.',
    date: '02 September 2026',
    badge: 'Anti Getar'
  },
  {
    id: 18,
    title: 'Penanganan Modul PCB Sensor Suhu Error Kode H11',
    category: 'Perbaikan',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    acType: 'Panasonic Inverter 1 PK',
    locationType: 'Ruang Kerja Pribadi',
    description: 'Analisa kode error pada display AC dan perbaikan jalur komunikasi modul PCB thermistor yang mengalami korsleting kelistrikan.',
    date: '01 September 2026',
    badge: 'Diagnosa Digital'
  },
  {
    id: 19,
    title: 'Pengujian Aliran Udara & Termometer Digital Suhu Dingin',
    category: 'Cuci AC',
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
    acType: 'LG Hercules 1 PK',
    locationType: 'Kamar Tidur Utama',
    description: 'Pengukuran suhu hembusan keluar mencapai 16.5°C pasca cuci AC rutin, memastikan AC bekerja pada efisiensi pendinginan optimal.',
    date: '30 Agustus 2026',
    badge: 'Dingin Teruji'
  },
  {
    id: 20,
    title: 'Instalasi AC Split Ruang Santai Keluarga Rumah Minimalis',
    category: 'Bongkar Pasang',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    acType: 'Daikin Flash Inverter 1.5 PK',
    locationType: 'Living Room Residensial',
    description: 'Pemasangan AC yang serasi dengan nuansa estetika interior ruang keluarga modern dengan hembusan merata ke seluruh sudut ruangan.',
    date: '28 Agustus 2026',
    badge: 'Rapi & Estetik'
  }
];
