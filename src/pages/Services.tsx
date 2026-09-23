import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wind,
  Wrench,
  Gauge,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  Building2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  SlidersHorizontal,
  Search,
  X,
  PhoneCall,
  MapPin,
  Navigation,
  Check,
  Truck
} from 'lucide-react';
import { SERVICE_AREAS, ServiceAreaItem } from '../data/serviceAreasData';

interface ServiceDetail {
  id: number;
  service_code?: string;
  name: string;
  category: string;
  base_price: number | string;
  description: string;
  features: string[];
  duration: string;
  warranty: string;
  recommendedFor: string;
  badge?: string;
}

const DEFAULT_SERVICES_DETAILS: ServiceDetail[] = [
  {
    id: 1,
    service_code: 'SVC-001',
    name: 'Cuci AC Standard & Steam',
    category: 'Perawatan',
    base_price: 75000,
    badge: 'Paling Populer',
    description: 'Pembersihan mendalam untuk unit indoor dan outdoor menggunakan steam bertekanan. Menghilangkan debu, jamur, serta lendir pada talang air agar udara kembali sejuk dan sehat.',
    features: [
      'Pembersihan filter udara & cover indoor',
      'Penyemprotan steam evaporator indoor & sirip kondensor',
      'Pembersihan talang pembuangan air anti-bocor',
      'Pengecekan tekanan freon & arus listrik (ampere)'
    ],
    duration: '45 - 60 Menit',
    warranty: 'Garansi Servis 14 Hari',
    recommendedFor: 'Rutin setiap 2 - 3 bulan sekali untuk hunian dan apartemen'
  },
  {
    id: 2,
    service_code: 'SVC-002',
    name: 'Service AC / Perbaikan Komponen',
    category: 'Perbaikan',
    base_price: 150000,
    badge: 'Garansi Komponen',
    description: 'Penanganan masalah teknis seperti AC tidak dingin, unit indoor meneteskan air (bocor air), kompresor mendengung, timbul suara berisik, hingga perbaikan modul PCB elektronik.',
    features: [
      'Pemeriksaan menyeluruh sumber kerusakan komponen',
      'Penanganan pipa bocor & pengelasan sambungan pipa',
      'Penggantian kapasitor, motor blower, atau thermistor sensor',
      'Uji coba fungsi otomatis remote dan sensor suhu'
    ],
    duration: '60 - 90 Menit',
    warranty: 'Garansi Komponen hingga 30 Hari',
    recommendedFor: 'Unit AC yang mengalami gangguan operasional atau mati total'
  },
  {
    id: 3,
    service_code: 'SVC-003',
    name: 'Tambah / Isi Freon Refrigerant',
    category: 'Isi Refrigerant',
    base_price: 150000,
    badge: 'Freon Murni',
    description: 'Pengisian refrigerant (R32, R410A, atau R22) menggunakan manifold gauge berkalibrasi sesuai takaran tekanan pabrik agar pendinginan kembali maksimal dan hemat daya listrik.',
    features: [
      'Pemeriksaan tekanan awal dengan manifold gauge',
      'Uji kebocoran pipa nevel dengan detector sabun/sensor',
      'Pengisian freon berkualitas murni tanpa campuran oli kotor',
      'Pengukuran ampere kompresor agar tidak overload'
    ],
    duration: '30 - 45 Menit',
    warranty: 'Garansi Tekanan 30 Hari',
    recommendedFor: 'AC yang kurang dingin, pipa outdoor berembun es, atau setelah perbaikan bocor'
  },
  {
    id: 4,
    service_code: 'SVC-004',
    name: 'Bongkar Pasang & Relokasi AC',
    category: 'Instalasi',
    base_price: 300000,
    badge: 'Instalasi Rapi',
    description: 'Jasa pemindahan unit AC dari lokasi lama ke lokasi baru, atau pemasangan unit AC baru dengan flaring pipa tembaga presisi, vakum udara instalasi, dan ducting kabel rapi.',
    features: [
      'Proses pump-down penyimpanan freon agar tidak terbuang',
      'Pelepasan unit & braket dengan aman tanpa merusak dinding',
      'Pemasangan braket kokoh dengan waterpass presisi',
      'Vakum pipa sebelum operasional untuk performa kompresor awet'
    ],
    duration: '90 - 150 Menit',
    warranty: 'Garansi Instalasi 30 Hari',
    recommendedFor: 'Pindah rumah/kantor, ganti unit AC baru, atau renovasi ruangan'
  },
  {
    id: 5,
    service_code: 'SVC-005',
    name: 'Pengecekan & Diagnosa Menyeluruh',
    category: 'Pemeriksaan',
    base_price: 50000,
    badge: 'Diagnosa Cepat',
    description: 'Inspeksi profesional untuk mendeteksi akar masalah sebelum pengerjaan perbaikan besar. Meliputi cek voltase listrik, tekanan refrigeran, kondisi pipa, dan efisiensi dingin.',
    features: [
      'Pengukuran suhu hembusan indoor dan suhu ruang',
      'Pemeriksaan kelistrikan dan grounding unit',
      'Pemeriksaan fisik pipa insulasi dan pembuangan',
      'Rekomendasi estimasi biaya transparan sebelum tindakan'
    ],
    duration: '30 Menit',
    warranty: 'Laporan Diagnosa Tertulis',
    recommendedFor: 'Pemeriksaan sebelum membeli properti atau AC yang terasa tidak efisien'
  },
  {
    id: 6,
    service_code: 'SVC-006',
    name: 'Pemeliharaan Kontrak Komersial',
    category: 'Kontrak Pemeliharaan',
    base_price: 'Hubungi Kami',
    badge: 'Perusahaan & Ruko',
    description: 'Layanan perawatan berkala terjadwal khusus perkantoran, ruko, restoran, klinik, atau gedung instansi dengan laporan berkala, penanganan darurat, dan tarif korporat hemat.',
    features: [
      'Jadwal servis berkala terjadwal (bulanan / triwulan)',
      'Dokumentasi digital & kartu riwayat servis tiap unit AC',
      'Prioritas respon teknisi untuk panggilan kendala mendesak',
      'Faktur pajak / invoice resmi perusahaan'
    ],
    duration: 'Sesuai Jumlah Unit',
    warranty: 'Perjanjian Kerja Sama (PKS) Resmi',
    recommendedFor: 'Perkantoran, coworking space, kafe, restoran, dan instansi bisnis'
  }
];

const FAQS = [
  {
    q: 'Berapa bulan sekali AC idealnya dicuci?',
    a: 'Untuk hunian rumah atau apartemen, pencucian ideal dilakukan setiap 2 hingga 3 bulan sekali. Untuk ruangan kerja atau perkantoran dengan jam kerja aktif panjang (lebih dari 8 jam sehari), disarankan setiap 1.5 hingga 2 bulan sekali agar udara tetap higienis dan kompresor tidak bekerja terlalu berat.'
  },
  {
    q: 'Mengapa AC saya tidak dingin padahal baru dicuci?',
    a: 'Jika AC baru dicuci namun tetap tidak dingin, kemungkinan penyebabnya adalah tekanan freon yang berkurang akibat kebocoran halus pada sambungan pipa, kapasitor kompresor yang sudah melemah, atau pengaturan remote/sensor suhu yang bermasalah. Teknisi kami dapat melakukan pengecekan menyeluruh untuk memastikan penyebab pastinya.'
  },
  {
    q: 'Wilayah mana saja di Jabodetabek yang dilayani Laku AC?',
    a: 'Kami melayani seluruh wilayah Jakarta (Selatan, Pusat, Barat, Timur, Utara), Tangerang & Tangerang Selatan (BSD, Bintaro, Pamulang, Ciputat), Depok (Margonda, Cinere, Sawangan), serta area Bekasi dan Bogor tertentu dengan menempatkan armada teknisi di pos siaga strategis.'
  },
  {
    q: 'Apakah ada biaya ongkos jalan atau transportasi untuk teknisi?',
    a: 'Tidak ada biaya transportasi (GRATIS) untuk radius hingga 10 km dari pos teknisi siaga terdekat. Untuk lokasi di atas radius 10 km, dikenakan biaya kompensasi transparan mulai dari Rp 15.000 hingga Rp 25.000 yang dikonfirmasikan sebelum teknisi berangkat.'
  },
  {
    q: 'Apakah ada garansi untuk pengerjaan servis?',
    a: 'Ya, seluruh pekerjaan servis dan perbaikan di Laku AC memiliki garansi resmi mulai dari 14 hingga 30 hari tergantung jenis layanan. Bukti garansi tercatat secara digital di sistem dan tertera pada invoice resmi pengerjaan.'
  },
  {
    q: 'Apakah proses cuci AC bisa membuat ruangan kotor atau basah?',
    a: 'Tidak. Teknisi kami bekerja menggunakan SOP ketat: memasang plastik pelindung cerobong air khusus untuk unit indoor, penampung air limbah di ember, serta pelindung dinding dan lantai di sekitar unit kerja agar ruangan Anda tetap bersih dan kering.'
  }
];

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();

  const [servicesList, setServicesList] = useState<ServiceDetail[]>(DEFAULT_SERVICES_DETAILS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModalService, setSelectedModalService] = useState<ServiceDetail | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Area state integrated in Services
  const [areaSearch, setAreaSearch] = useState<string>('');
  const [areaRegionFilter, setAreaRegionFilter] = useState<string>('Semua');

  // Smooth scroll to area when navigated via #area or #area-jabodetabek
  useEffect(() => {
    if (location.hash === '#area' || location.hash === '#area-jabodetabek') {
      const timer = setTimeout(() => {
        const el = document.getElementById('area-jabodetabek');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // Fetch from /api/services to sync with database if admin updated base prices
  useEffect(() => {
    fetch('/api/services')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch services');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with rich details
          const merged = DEFAULT_SERVICES_DETAILS.map((detail) => {
            const apiMatch = data.find(
              (item: any) =>
                item.id === detail.id ||
                item.name.toLowerCase().includes(detail.name.toLowerCase().split(' ')[0])
            );
            if (apiMatch) {
              return {
                ...detail,
                name: apiMatch.name || detail.name,
                category: apiMatch.category || detail.category,
                base_price: apiMatch.base_price || detail.base_price
              };
            }
            return detail;
          });
          setServicesList(merged);
        }
      })
      .catch((err) => {
        console.warn('Using local service catalog details:', err.message);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_SERVICES_DETAILS.forEach((s) => set.add(s.category));
    return ['Semua', ...Array.from(set)];
  }, []);

  const filteredServices = useMemo(() => {
    return servicesList.filter((item) => {
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [servicesList, selectedCategory, searchQuery]);

  // Filter Jabodetabek Areas
  const filteredAreas = useMemo(() => {
    return SERVICE_AREAS.filter((area) => {
      let matchRegion = true;
      if (areaRegionFilter === 'Jakarta') {
        matchRegion = area.region.includes('Jakarta');
      } else if (areaRegionFilter === 'Tangerang') {
        matchRegion = area.region.includes('Tangerang');
      } else if (areaRegionFilter === 'Depok') {
        matchRegion = area.region.includes('Depok');
      } else if (areaRegionFilter === 'Bekasi & Bogor') {
        matchRegion = area.region.includes('Bekasi') || area.region.includes('Bogor');
      }

      const q = areaSearch.toLowerCase().trim();
      if (!q) return matchRegion;

      const matchText =
        area.region.toLowerCase().includes(q) ||
        area.districts.some((d) => d.toLowerCase().includes(q)) ||
        area.features.some((f) => f.toLowerCase().includes(q));

      return matchRegion && matchText;
    });
  }, [areaSearch, areaRegionFilter]);

  // Instant matched district lookup helper
  const matchedDistrictInfo = useMemo(() => {
    const q = areaSearch.trim().toLowerCase();
    if (!q || q.length < 3) return null;

    for (const area of SERVICE_AREAS) {
      const foundDistrict = area.districts.find((d) => d.toLowerCase().includes(q));
      if (foundDistrict) {
        return {
          district: foundDistrict,
          region: area.region,
          responseTime: area.responseTime,
          activeTechs: area.activeTechnicians,
          hotline: area.hotline
        };
      }
    }
    return null;
  }, [areaSearch]);

  // Handle Book Service click with Authentication Guard
  const handleBooking = (service: ServiceDetail) => {
    const userStr = localStorage.getItem('user');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        user = null;
      }
    }

    if (user && user.role === 'customer') {
      navigate('/pelanggan/pesan', {
        state: {
          preferredService: service.name,
          preferredServiceId: String(service.id),
          preferredNotes: `Pemesanan dari katalog Layanan: ${service.name}`
        }
      });
    } else {
      navigate('/login', {
        state: {
          message: `Silakan masuk atau daftar terlebih dahulu untuk memesan layanan ${service.name}.`,
          redirectTo: '/pelanggan/pesan'
        }
      });
    }
  };

  // Handle Area Booking with Authentication Guard
  const handleAreaBooking = (areaName: string) => {
    const userStr = localStorage.getItem('user');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        user = null;
      }
    }

    if (user && user.role === 'customer') {
      navigate('/pelanggan/pesan', {
        state: {
          preferredArea: areaName,
          preferredNotes: `Permintaan teknisi untuk area: ${areaName}`
        }
      });
    } else {
      navigate('/login', {
        state: {
          message: `Silakan masuk atau daftar terlebih dahulu untuk memanggil teknisi di wilayah ${areaName}.`,
          redirectTo: '/pelanggan/pesan'
        }
      });
    }
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === 'number') {
      return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
    }
    return price;
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Perawatan':
        return <Wind className="text-blue-600" size={24} />;
      case 'Perbaikan':
        return <Wrench className="text-amber-600" size={24} />;
      case 'Isi Refrigerant':
        return <Gauge className="text-cyan-600" size={24} />;
      case 'Instalasi':
        return <Sparkles className="text-emerald-600" size={24} />;
      case 'Pemeriksaan':
        return <CheckCircle2 className="text-indigo-600" size={24} />;
      case 'Kontrak Pemeliharaan':
        return <Building2 className="text-purple-600" size={24} />;
      default:
        return <Wrench className="text-blue-600" size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Layanan Servis & Pemeliharaan AC Jabodetabek
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Daftar lengkap jenis jasa perawatan, perbaikan, instalasi AC, serta informasi cakupan pos siaga teknisi di seluruh wilayah Jakarta, Bogor, Depok, Tangerang, dan Bekasi.
          </p>

          {/* Quick Jump Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <a
              href="#katalog-layanan"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Wrench size={14} className="text-blue-600" />
              <span>Katalog Jenis Layanan</span>
            </a>
            <a
              href="#area-jabodetabek"
              className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <MapPin size={14} className="text-blue-600" />
              <span>Area Layanan Jabodetabek</span>
            </a>
            <a
              href="#sop-pengerjaan"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Standar SOP</span>
            </a>
            <a
              href="#faq-layanan"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <HelpCircle size={14} className="text-purple-600" />
              <span>FAQ & Garansi</span>
            </a>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div id="katalog-layanan" className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari layanan (misal: Cuci, Freon, Perbaikan, Bongkar)..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Total Results Counter */}
            <div className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 self-center md:self-auto">
              <SlidersHorizontal size={15} className="text-slate-400" />
              <span>
                Menampilkan <strong className="text-slate-800">{filteredServices.length}</strong> jenis layanan
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-sm">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div>
                {/* Top Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getServiceIcon(svc.category)}
                  </div>
                  {svc.badge && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {svc.badge}
                    </span>
                  )}
                </div>

                {/* Service Title & Category */}
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase block mb-1">
                  {svc.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {svc.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-3">
                  {svc.description}
                </p>

                {/* Features Checklist */}
                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Cakupan Pekerjaan:
                  </span>
                  {svc.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Meta info chips */}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 font-medium mb-6">
                  <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <Clock size={12} className="text-slate-400" />
                    {svc.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    {svc.warranty}
                  </span>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium">Biaya Mulai:</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    {formatPrice(svc.base_price)}
                    {typeof svc.base_price === 'number' && (
                      <span className="text-xs font-normal text-slate-400"> / unit</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedModalService(svc)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Info size={13} />
                    <span>Rincian SOP</span>
                  </button>
                  <button
                    onClick={() => handleBooking(svc)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Pesan Layanan</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SOP Workflow Section */}
        <div id="sop-pengerjaan" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">
              Standar Operasional Prosedur (SOP)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Bagaimana Teknisi Kami Bekerja di Lokasi Anda?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Kami menjamin kebersihan rumah atau kantor Anda tetap terjaga dengan prosedur perlindungan ketat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-base">Diagnosa & Cek Awal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pemeriksaan suhu hembusan keluar, arus listrik ampere, dan identifikasi keluhan sebelum unit dibongkar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-base">Proteksi Area Kerja</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pemasangan terpal dan plastik cerobong air anti-cipratan pada dinding serta penampungan air kotor ke ember.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-800 text-base">Pengerjaan Presisi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pembersihan steam jet, flaring pipa presisi, atau pengisian freon menggunakan manifold gauge akurat.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-slate-800 text-base">Uji Dingin & Garansi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengukuran suhu akhir (16-18°C), serah terima nota digital, dan aktivasi garansi servis resmi.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* AREA LAYANAN JABODETABEK (DISATUKAN DALAM HALAMAN LAYANAN) */}
        {/* ======================================================== */}
        <section id="area-jabodetabek" className="scroll-mt-24 mb-16">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  <MapPin size={13} />
                  <span>Jangkauan Operasional Jabodetabek</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Area Layanan & Pos Teknisi Siaga
                </h2>
                <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
                  Layanan Laku AC hadir menjangkau 6 zona wilayah Jabodetabek. Teknisi kami disiagakan di pos-pos strategis untuk mempercepat waktu kedatangan dan menggratiskan biaya perjalanan (radius 10 km).
                </p>
              </div>

              {/* Free Transport Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shrink-0">
                <Truck size={28} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-800 block">Bebas Biaya Transportasi</span>
                  <p className="text-[11px] text-emerald-700">Gratis untuk radius 10 km dari pos siaga</p>
                </div>
              </div>
            </div>

            {/* Instant Coverage Checker Bar */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    placeholder="Ketik nama kecamatan Anda (misal: Tebet, BSD, Margonda, Cilandak, Menteng, Bintaro)..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                  />
                  {areaSearch && (
                    <button
                      onClick={() => setAreaSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Region Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 text-xs">
                  {['Semua', 'Jakarta', 'Tangerang', 'Depok', 'Bekasi & Bogor'].map((reg) => (
                    <button
                      key={reg}
                      onClick={() => setAreaRegionFilter(reg)}
                      className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                        areaRegionFilter === reg
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched District Feedback */}
              {matchedDistrictInfo && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      Wilayah <strong>{matchedDistrictInfo.district}</strong> terlayani oleh <strong>Pos Siaga {matchedDistrictInfo.region}</strong> (ETA: <strong>{matchedDistrictInfo.responseTime}</strong>, {matchedDistrictInfo.activeTechs} teknisi aktif).
                    </span>
                  </div>
                  <button
                    onClick={() => handleAreaBooking(matchedDistrictInfo.region)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] whitespace-nowrap shrink-0 transition-colors"
                  >
                    Pesan Teknisi
                  </button>
                </div>
              )}
            </div>

            {/* Area Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAreas.map((area) => (
                <div
                  key={area.id}
                  className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full inline-block mb-1.5">
                          {area.badge}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {area.region}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                        {area.responseTime}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <Navigation size={13} className="text-blue-600" />
                        <span>{area.coverageTag}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{area.activeTechnicians} Teknisi Siaga</span>
                      </div>
                    </div>

                    {/* Districts Covered */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Kecamatan Terlayani:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {area.districts.map((district, dIdx) => {
                          const isSearched =
                            areaSearch.trim().length > 1 &&
                            district.toLowerCase().includes(areaSearch.toLowerCase().trim());
                          return (
                            <span
                              key={dIdx}
                              className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                                isSearched
                                  ? 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {district}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      {area.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-5 mt-4 border-t border-slate-200/70">
                    <button
                      onClick={() => handleAreaBooking(area.region)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
                    >
                      <MapPin size={14} />
                      <span>Pesan Teknisi di {area.region.split(' ')[0]}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredAreas.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm">
                <p>Tidak ada kecamatan atau area yang cocok dengan pencarian "<strong>{areaSearch}</strong>".</p>
                <button
                  onClick={() => { setAreaSearch(''); setAreaRegionFilter('Semua'); }}
                  className="mt-2 text-blue-600 font-semibold text-xs underline"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <div id="faq-layanan" className="max-w-4xl mx-auto mb-16 scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle size={28} className="text-blue-600" />
              <span>Pertanyaan Seputar Layanan Servis AC</span>
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Hal-hal yang sering ditanyakan oleh pelanggan sebelum memesan layanan.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} className="shrink-0 text-blue-600" /> : <ChevronDown size={18} className="shrink-0 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Commercial Consultation CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Layanan Khusus & Korporasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Butuh Servis untuk Kantor, Restoran, atau Gedung?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Kami melayani survei gratis dan penawaran kontrak pemeliharaan berkala untuk gedung perkantoran, kafe, pabrik, dan instalasi AC Cassette / Central.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/kontak"
                className="px-6 py-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2"
              >
                <PhoneCall size={16} />
                <span>Konsultasi Proyek & Survei</span>
              </Link>
              <Link
                to="/harga"
                className="px-6 py-3 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                Lihat Daftar Estimasi Harga
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Detail Modal / SOP Info */}
      {selectedModalService && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedModalService(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {getServiceIcon(selectedModalService.category)}
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                    {selectedModalService.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedModalService.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedModalService(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 text-sm">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Deskripsi Lengkap Layanan:</h4>
                <p className="text-slate-600 leading-relaxed">
                  {selectedModalService.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Item Pekerjaan yang Dilakukan Teknisi:</h4>
                <ul className="space-y-2">
                  {selectedModalService.features.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Estimasi Waktu Pengerjaan</span>
                  <strong className="text-slate-800 font-semibold flex items-center gap-1">
                    <Clock size={13} className="text-slate-500" />
                    {selectedModalService.duration}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Jaminan Garansi Resmi</span>
                  <strong className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    {selectedModalService.warranty}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Direkomendasikan Untuk:</span>
                <p className="text-xs text-slate-700 font-medium">
                  {selectedModalService.recommendedFor}
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Tarif Transparan</span>
                <span className="text-xl font-extrabold text-blue-600">
                  {formatPrice(selectedModalService.base_price)}
                </span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedModalService(null)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    const svc = selectedModalService;
                    setSelectedModalService(null);
                    handleBooking(svc);
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Lanjut Pemesanan</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
