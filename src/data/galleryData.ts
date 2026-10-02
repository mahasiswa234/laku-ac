export interface GalleryItem {
  id: number;
  title: string;
  category:
    | 'Cuci AC'
    | 'Perbaikan'
    | 'Isi Freon'
    | 'Bongkar Pasang'
    | 'Komersial';
  imageUrl: string;
  acType: string;
  locationType: string;
  description: string;
  badge: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: 'Service AC Outdoor',
    category: 'Perbaikan',
    imageUrl:
      'https://setiakaryateknikac.com/wp-content/uploads/2026/07/WhatsApp-Image-2024-11-20-at-12.36.16-1.jpeg',
    acType: 'AC Split',
    locationType: 'Gedung / Komersial',
    description:
      'Teknisi melakukan pemeriksaan dan perbaikan unit outdoor AC.',
    badge: 'Service AC',
  },
  {
    id: 2,
    title: 'Pengisian Freon AC',
    category: 'Isi Freon',
    imageUrl:
      'https://setiakaryateknikac.com/wp-content/uploads/2026/07/isi-freon-ac-2-e1784275811138.webp',
    acType: 'AC Split',
    locationType: 'Rumah / Gedung',
    description:
      'Teknisi melakukan pengisian freon menggunakan manifold gauge.',
    badge: 'Isi Freon',
  },
  {
    id: 3,
    title: 'Perbaikan Unit Outdoor',
    category: 'Perbaikan',
    imageUrl:
      'https://setiakaryateknikac.com/wp-content/uploads/2026/07/teknisi-ac-service-ac-cakung-1.webp',
    acType: 'AC Split',
    locationType: 'Rumah / Kantor',
    description:
      'Teknisi melakukan pemeriksaan dan perbaikan komponen unit outdoor.',
    badge: 'Perbaikan',
  },
  {
    id: 4,
    title: 'Pekerjaan Teknisi AC',
    category: 'Komersial',
    imageUrl:
      'https://setiakaryateknikac.com/wp-content/uploads/2026/07/dedikasi-service-ac-1-1.jpeg',
    acType: 'AC Komersial',
    locationType: 'Gedung',
    description:
      'Dokumentasi teknisi saat menangani pekerjaan AC pada area gedung.',
    badge: 'Komersial',
  },
  {
    id: 5,
    title: 'Persiapan Pemasangan AC',
    category: 'Bongkar Pasang',
    imageUrl:
      'https://setiakaryateknikac.com/wp-content/uploads/2026/07/PasangAC.jpeg',
    acType: 'AC Split',
    locationType: 'Rumah / Kantor',
    description:
      'Teknisi mempersiapkan unit dan perlengkapan untuk pemasangan AC.',
    badge: 'Instalasi',
  },
  {
    id: 6,
    title: 'Perawatan AC Cassette',
    category: 'Cuci AC',
    imageUrl:
      'https://setiakaryateknikac.com/wp-content/uploads/2026/07/WhatsApp-Image-2024-11-20-at-12.36.26-1-e1784297694172.jpeg',
    acType: 'AC Cassette',
    locationType: 'Kantor / Gedung',
    description:
      'Teknisi melakukan pemeriksaan dan perawatan unit AC cassette.',
    badge: 'Perawatan',
  },
  {
    id: 7,
    title: 'Pemeriksaan AC Gedung',
    category: 'Komersial',
    imageUrl:
      'https://setiakaryateknikac.com/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-09-at-16.57.02.jpeg',
    acType: 'AC Gedung',
    locationType: 'Gedung Komersial',
    description:
      'Dokumentasi teknisi saat melakukan pemeriksaan sistem AC di gedung.',
    badge: 'Komersial',
  },
];