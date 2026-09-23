import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Navigation
} from 'lucide-react';
import { SERVICE_AREAS, ServiceAreaItem } from '../data/serviceAreasData';

const FAQS = [
  {
    q: 'Apakah ada biaya tambahan untuk transportasi teknisi?',
    a: 'Tidak ada biaya transportasi tambahan untuk seluruh area yang berada dalam radius operasional utama kami (maksimal 10 km dari pos teknisi terdekat). Biaya yang Anda bayar murni sesuai dengan jenis jasa yang Anda pesan.'
  },
  {
    q: 'Bagaimana jika kecamatan saya tidak terdaftar di daftar di atas?',
    a: 'Jika lokasi Anda berada di area perbatasan atau belum terdaftar dalam daftar utama, silakan hubungi customer service kami melalui WhatsApp atau formulir kontak. Kami sering kali dapat mengatur jadwal teknisi khusus ke lokasi Anda.'
  },
  {
    q: 'Apakah teknisi melayani pengerjaan di apartemen atau gedung bertingkat?',
    a: 'Ya, seluruh teknisi kami terbiasa menangani unit AC di apartemen dan gedung bertingkat dengan membawa perlengkapan pengaman, selang panjang khusus, dan plastik cerobong air pelindung agar tidak mengotori unit maupun koridor gedung.'
  },
  {
    q: 'Berapa lama estimasi teknisi tiba di lokasi setelah pemesanan?',
    a: 'Untuk pemesanan reguler atau hari yang sama (Same-Day Service), rata-rata teknisi kami dapat tiba di lokasi antara 30 hingga 60 menit setelah jadwal dikonfirmasi oleh admin, tergantung kepadatan lalu lintas dan jarak pos terdekat.'
  }
];

export default function ServiceArea() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<ServiceAreaItem[]>(SERVICE_AREAS);
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkInput, setCheckInput] = useState<string>('');
  const [checkResult, setCheckResult] = useState<{
    found: boolean;
    area?: ServiceAreaItem;
    districtName?: string;
  } | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Fetch from API to allow dynamic updates
  useEffect(() => {
    fetch('/api/service-areas')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('API failed');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAreas(data);
        }
      })
      .catch((err) => {
        console.warn('Using local service areas data fallback:', err.message);
      });
  }, []);

  const regionTabs = useMemo(() => {
    const list = ['Semua', ...areas.map((a) => a.region)];
    return Array.from(new Set(list));
  }, [areas]);

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchRegion = selectedRegion === 'Semua' || area.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        area.region.toLowerCase().includes(q) ||
        area.districts.some((d) => d.toLowerCase().includes(q));
      return matchRegion && matchSearch;
    });
  }, [areas, selectedRegion, searchQuery]);

  // Handle checking district coverage
  const handleCheckCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = checkInput.toLowerCase().trim();
    if (!query) {
      setCheckResult(null);
      return;
    }

    let foundArea: ServiceAreaItem | undefined;
    let foundDistrict: string | undefined;

    for (const area of areas) {
      const match = area.districts.find(
        (d) => d.toLowerCase().includes(query) || query.includes(d.toLowerCase())
      );
      if (match) {
        foundArea = area;
        foundDistrict = match;
        break;
      }
      if (area.region.toLowerCase().includes(query)) {
        foundArea = area;
        foundDistrict = area.region;
        break;
      }
    }

    if (foundArea) {
      setCheckResult({
        found: true,
        area: foundArea,
        districtName: foundDistrict
      });
    } else {
      setCheckResult({
        found: false
      });
    }
  };

  // Handle Book Technician with Authentication Guard
  const handleOrderArea = (area: ServiceAreaItem, district?: string) => {
    const userStr = localStorage.getItem('user');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        user = null;
      }
    }

    const areaNote = district
      ? `Area Layanan: ${district}, ${area.region}`
      : `Area Layanan: ${area.region}`;

    if (user && user.role === 'customer') {
      navigate('/pelanggan/pesan', {
        state: {
          preferredNotes: `Permintaan servis untuk wilayah ${areaNote}`
        }
      });
    } else {
      navigate('/login', {
        state: {
          message: `Silakan masuk atau daftar terlebih dahulu untuk memesan teknisi ke area ${area.region}.`,
          redirectTo: '/pelanggan/pesan'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase">
            <MapPin size={14} />
            <span>Jangkauan Layanan Jabodetabek</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Area Layanan Servis & Pemeliharaan AC
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Teknisi profesional kami tersebar di berbagai pos siaga strategis untuk menjamin kedatangan yang cepat, tepat waktu, dan bebas biaya transportasi tambahan.
          </p>
        </div>

        {/* Coverage Checker Box */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-sm">
              <Navigation size={13} />
              <span>Cek Jangkauan Cepat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Apakah Lokasi Rumah atau Kantor Anda Dijangkau?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto">
              Ketik nama kecamatan atau kota Anda untuk mengetahui estimasi waktu kedatangan teknisi terdekat.
            </p>

            {/* Checker Form */}
            <form onSubmit={handleCheckCoverage} className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={checkInput}
                  onChange={(e) => {
                    setCheckInput(e.target.value);
                    if (!e.target.value) setCheckResult(null);
                  }}
                  placeholder="Ketik kecamatan (misal: Tebet, Cilandak, BSD, Margonda, Bintaro)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Periksa Area</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Checker Result Alert */}
            {checkResult && (
              <div className="pt-4 text-left animate-fadeIn">
                {checkResult.found && checkResult.area ? (
                  <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-emerald-200 font-bold text-base">
                            Area Tercover: {checkResult.districtName}
                          </strong>
                          <span className="text-xs bg-emerald-500/40 px-2 py-0.5 rounded-full text-emerald-100 font-medium">
                            {checkResult.area.region}
                          </span>
                        </div>
                        <p className="text-xs text-blue-100 mt-1">
                          Pos teknisi siaga aktif. Estimasi kedatangan teknisi: <strong>{checkResult.area.responseTime}</strong>. Bebas biaya antar.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOrderArea(checkResult.area!, checkResult.districtName)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs shadow-md transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Pesan Teknisi Sekarang</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-rose-500/20 border border-rose-400/40 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle size={22} />
                      </div>
                      <div>
                        <strong className="text-rose-200 font-bold text-base">
                          Kecamatan Belum Terdaftar di Pos Siaga Reguler
                        </strong>
                        <p className="text-xs text-blue-100 mt-1">
                          Jangan khawatir! Kami tetap bisa menjadwalkan teknisi khusus untuk area Anda melalui koordinasi langsung.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/kontak"
                      className="px-5 py-2.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 font-bold text-xs shadow-md transition-colors inline-flex items-center gap-1.5 shrink-0"
                    >
                      <PhoneCall size={14} />
                      <span>Hubungi Customer Service</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama wilayah atau kecamatan..."
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

            {/* Results Count */}
            <div className="text-xs sm:text-sm text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{filteredAreas.length}</strong> zona wilayah utama
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-sm">
            {regionTabs.map((reg) => {
              const isActive = selectedRegion === reg;
              return (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {reg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Area Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredAreas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Badge & Popular indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {area.badge}
                  </span>
                  {area.isPopular && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Sparkles size={12} />
                      Pos Siaga Utama
                    </span>
                  )}
                </div>

                {/* Region Title */}
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-blue-600 shrink-0" size={20} />
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {area.region}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  {area.coverageTag}
                </p>

                {/* Operational Quick Stats */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-0.5">Waktu Tiba:</span>
                    <strong className="text-slate-800 flex items-center gap-1 font-semibold">
                      <Clock size={13} className="text-blue-600" />
                      {area.responseTime}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-0.5">Teknisi Pos:</span>
                    <strong className="text-slate-800 flex items-center gap-1 font-semibold">
                      <Users size={13} className="text-emerald-600" />
                      {area.activeTechnicians} Siaga
                    </strong>
                  </div>
                </div>

                {/* Districts Chips */}
                <div className="mb-5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                    Kecamatan & Kelurahan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {area.districts.map((district, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60"
                      >
                        {district}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Area Features */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-6">
                  {area.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleOrderArea(area)}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Pesan Teknisi ke {area.region}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Value Prop Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-2">
              Keunggulan Pos Tersebar
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Mengapa Sistem Pos Siaga Kami Menguntungkan Anda?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Kami tidak beroperasi dari satu titik kantor saja, melainkan menempatkan armada teknisi di titik pos strategis kota Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Clock size={28} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Respon Cepat & Tepat Waktu</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Karena teknisi berangkat dari pos terdekat di wilayah Anda, waktu tempuh menjadi sangat singkat tanpa terhambat kemacetan lintas kota.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Bebas Biaya Transportasi</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tidak ada biaya tersembunyi untuk ongkos jalan teknisi pada radius 10 km dari pos siaga kami. Harga yang Anda bayar murni untuk jasa yang dipesan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Users size={28} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Teknisi Tersertifikasi</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Seluruh teknisi telah lolos pelatihan standarisasi pendingin, beretika sopan, dan dilengkapi alat kerja modern serta alat pelindung diri.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle size={26} className="text-blue-600" />
              <span>Pertanyaan Seputar Area Jangkauan</span>
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Jawaban atas hal-hal yang sering ditanyakan mengenai wilayah operasional kami.
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

        {/* Bottom Consultation Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Layanan Seluruh Wilayah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ingin Menjadwalkan Servis AC Hari Ini?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Hubungi layanan pelanggan kami untuk konsultasi kendala AC Anda atau lakukan pemesanan mandiri secara online melalui sistem pemesanan kami.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/kontak"
                className="px-6 py-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2"
              >
                <PhoneCall size={16} />
                <span>Konsultasi WhatsApp</span>
              </Link>
              <Link
                to="/harga"
                className="px-6 py-3 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                Lihat Daftar Harga Servis
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
