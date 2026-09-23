export interface ServiceAreaItem {
  id: number;
  region: string;
  badge: string;
  coverageTag: string;
  responseTime: string;
  activeTechnicians: number;
  districts: string[];
  features: string[];
  hotline: string;
  isPopular?: boolean;
}

export const SERVICE_AREAS: ServiceAreaItem[] = [
  {
    id: 1,
    region: 'Jakarta Selatan',
    badge: 'Cakupan Prioritas',
    coverageTag: 'Siaga Penuh Setiap Hari',
    responseTime: '30 - 45 Menit',
    activeTechnicians: 8,
    isPopular: true,
    districts: [
      'Kebayoran Baru',
      'Kebayoran Lama',
      'Cilandak',
      'Pesanggrahan',
      'Pasar Minggu',
      'Jagakarsa',
      'Mampang Prapatan',
      'Pancoran',
      'Tebet',
      'Setiabudi'
    ],
    features: [
      'Bebas biaya transportasi teknisi (radius 10 km)',
      'Layanan Same-Day Service (Pesan hari ini datang hari ini)',
      'Teknisi standby di pos siaga Kebayoran & Cilandak'
    ],
    hotline: '+62 812-3456-7890'
  },
  {
    id: 2,
    region: 'Jakarta Pusat & Jakarta Barat',
    badge: 'Respon Cepat',
    coverageTag: 'Respon Cepat 7 Hari/Minggu',
    responseTime: '45 - 60 Menit',
    activeTechnicians: 6,
    districts: [
      'Menteng',
      'Tanah Abang',
      'Gambir',
      'Senen',
      'Kebon Jeruk',
      'Palmerah',
      'Kembangan',
      'Grogol Petamburan',
      'Cengkareng',
      'Kalideres'
    ],
    features: [
      'Melayani apartemen & perkantoran komersial',
      'Peralatan steam jet lengkap dan aman lantai parket',
      'Garansi pengerjaan resmi s/d 30 hari'
    ],
    hotline: '+62 812-3456-7890'
  },
  {
    id: 3,
    region: 'Jakarta Timur & Jakarta Utara',
    badge: 'Jangkauan Luas',
    coverageTag: 'Jangkauan Luas & Terjadwal',
    responseTime: '45 - 60 Menit',
    activeTechnicians: 5,
    districts: [
      'Matraman',
      'Jatinegara',
      'Duren Sawit',
      'Kramat Jati',
      'Pasar Rebo',
      'Kelapa Gading',
      'Tanjung Priok',
      'Pademangan',
      'Penjaringan',
      'Sunter'
    ],
    features: [
      'Spesialis AC Split, Inverter, dan AC Cassette',
      'Pengecekan kebocoran pipa freon mendalam',
      'Faktur invoice resmi untuk instansi & ruko'
    ],
    hotline: '+62 812-3456-7890'
  },
  {
    id: 4,
    region: 'Tangerang & Tangerang Selatan (Tangsel)',
    badge: 'Cakupan Terfavorit',
    coverageTag: 'Pos Siaga BSD & Bintaro',
    responseTime: '30 - 60 Menit',
    activeTechnicians: 7,
    isPopular: true,
    districts: [
      'BSD City',
      'Serpong',
      'Serpong Utara',
      'Ciputat',
      'Ciputat Timur',
      'Pamulang',
      'Pondok Aren (Bintaro)',
      'Setu',
      'Karawaci',
      'Ciledug',
      'Tangerang Kota'
    ],
    features: [
      'Pos teknisi siaga di BSD dan Bintaro Sektor 9',
      'Pemesanan darurat AC bocor air atau bau apek',
      'Layanan perawatan berkala perumahan dan cluster'
    ],
    hotline: '+62 812-3456-7890'
  },
  {
    id: 5,
    region: 'Depok & Sekitarnya',
    badge: 'Layanan Rutin',
    coverageTag: 'Jadwal Siaga Harian',
    responseTime: '45 - 60 Menit',
    activeTechnicians: 5,
    districts: [
      'Margonda',
      'Beji',
      'Pancoran Mas',
      'Sukmajaya',
      'Cilodong',
      'Cimanggis',
      'Cinere',
      'Limo',
      'Sawangan',
      'Bojongsari'
    ],
    features: [
      'Melayani kos-kosan, ruko Margonda, dan perumahan Cinere',
      'Tarif transparan tanpa markup ongkos jalan',
      'Pengisian freon R32 / R410A murni bergaransi'
    ],
    hotline: '+62 812-3456-7890'
  },
  {
    id: 6,
    region: 'Bekasi & Bogor (Area Terpilih)',
    badge: 'Penjadwalan Khusus',
    coverageTag: 'Penjadwalan 1 Hari Sebelumnya',
    responseTime: '60 - 90 Menit',
    activeTechnicians: 4,
    districts: [
      'Bekasi Barat',
      'Bekasi Selatan',
      'Harapan Indah',
      'Rawalumbu',
      'Jatiasih',
      'Cibubur',
      'Cileungsi',
      'Bogor Kota',
      'Cibinong',
      'Sentul City'
    ],
    features: [
      'Layanan khusus booking terjadwal (H-1 atau Same-day pagi)',
      'Bongkar pasang & instalasi unit AC baru',
      'Survei gratis untuk kontrak komersial di atas 5 unit'
    ],
    hotline: '+62 812-3456-7890'
  }
];
