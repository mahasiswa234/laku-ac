import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Calendar, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  Sparkles, 
  Wind, 
  Eye, 
  SlidersHorizontal 
} from 'lucide-react';
import { GALLERY_ITEMS, GalleryItem } from '../data/galleryData';

type CategoryFilter = 'Semua' | 'Cuci AC' | 'Perbaikan' | 'Isi Freon' | 'Bongkar Pasang' | 'Komersial';

const CATEGORIES: CategoryFilter[] = [
  'Semua',
  'Cuci AC',
  'Perbaikan',
  'Isi Freon',
  'Bongkar Pasang',
  'Komersial'
];

const INITIAL_DISPLAY_COUNT = 8;
const LOAD_MORE_STEP = 4;

export default function Gallery() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_COUNT);
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  const handleOrderClick = (item?: GalleryItem | null) => {
    const userStr = localStorage.getItem('user');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        user = null;
      }
    }

    // If logged in as customer, proceed directly to booking
    if (user && user.role === 'customer') {
      navigate('/pelanggan/pesan', {
        state: {
          preferredService: item?.category,
          preferredNotes: item ? `Referensi galeri: ${item.title} (${item.acType})` : undefined
        }
      });
    } else {
      // If not logged in, redirect to login page with clear prompt
      navigate('/login', {
        state: {
          message: 'Silakan masuk ke akun Anda atau daftar terlebih dahulu untuk melakukan pemesanan servis AC.',
          redirectTo: '/pelanggan/pesan'
        }
      });
    }
  };

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        item.title.toLowerCase().includes(query) ||
        item.acType.toLowerCase().includes(query) ||
        item.locationType.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Items currently visible based on display limit
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayLimit);
  }, [filteredItems, displayLimit]);

  const hasMore = visibleItems.length < filteredItems.length;

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + LOAD_MORE_STEP);
  };

  const handleCategoryChange = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    setDisplayLimit(INITIAL_DISPLAY_COUNT); // Reset limit when switching categories
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setDisplayLimit(INITIAL_DISPLAY_COUNT);
  };

  const handleImageError = (id: number) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Galeri Pengerjaan Servis & Pemeliharaan AC
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Koleksi dokumentasi proses penanganan, pencucian steam, perbaikan kompresor, hingga instalasi unit AC yang telah dikerjakan secara profesional oleh teknisi bersertifikat.
          </p>
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
                onChange={handleSearchChange}
                placeholder="Cari dokumentasi (misal: Freon, Inverter, Cuci, Daikin)..."
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
                Menampilkan <strong className="text-slate-800">{visibleItems.length}</strong> dari <strong className="text-slate-800">{filteredItems.length}</strong> hasil
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-sm">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const count =
                cat === 'Semua'
                  ? GALLERY_ITEMS.length
                  : GALLERY_ITEMS.filter((i) => i.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Dokumentasi Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 mb-6">
              Tidak ada foto pekerjaan yang sesuai dengan kata kunci "{searchQuery}". Coba kata kunci lain atau pilih kategori Semua.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-xl text-sm transition-colors"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleItems.map((item) => {
              const isFallback = imageErrorMap[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveModalItem(item)}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Container with Zoom effect */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {isFallback ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
                        <Wind size={36} className="text-slate-300 mb-2" />
                        <span className="text-xs font-semibold">{item.title}</span>
                      </div>
                    ) : (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(item.id)}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600/90 backdrop-blur-sm text-white shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    {/* Highlight Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/90 backdrop-blur-sm text-white shadow-sm flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        {item.badge}
                      </span>
                    </div>

                    {/* Hover Peek Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <span className="px-4 py-2 rounded-xl bg-white/95 text-slate-900 font-semibold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Eye size={14} className="text-blue-600" />
                        Lihat Detail
                      </span>
                    </div>

                    {/* Location Badge bottom */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1 text-[11px] text-blue-200 font-medium truncate mb-1">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{item.locationType}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-200 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                        <Wrench size={13} className="text-blue-500" />
                        <span>{item.acType}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {item.date}
                      </span>
                      <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        Detail <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button Section */}
        {hasMore && (
          <div className="mt-12 text-center space-y-3">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border-2 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-sm transition-all duration-200 active:scale-95"
            >
              <ChevronDown size={18} />
              <span>Muat Lebih Banyak ({filteredItems.length - visibleItems.length} foto lagi)</span>
            </button>
            <p className="text-xs text-slate-400">
              Menampilkan {visibleItems.length} dari {filteredItems.length} total foto dokumentasi
            </p>
          </div>
        )}

        {/* All Loaded Indicator */}
        {!hasMore && filteredItems.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Semua {filteredItems.length} dokumentasi pada kategori ini telah ditampilkan</span>
            </div>
          </div>
        )}

        {/* Bottom Booking CTA Banner */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
            <Wind size={300} />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Layanan Bergaransi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ingin AC Anda Kembali Bersih, Sejuk & Hemat Listrik?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Jadwalkan teknisi profesional kami ke rumah, kantor, atau apartemen Anda hari ini. Proses pemesanan mudah tanpa biaya di awal.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => handleOrderClick(null)}
                className="px-6 py-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Pesan Servis Sekarang</span>
                <ArrowRight size={16} />
              </button>
              <Link
                to="/kontak"
                className="px-6 py-3 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                Konsultasi WhatsApp
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox / Detail Modal */}
      {activeModalItem && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 animate-scaleUp my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-slate-900">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                title="Tutup (Esc)"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-600 text-white">
                    {activeModalItem.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white">
                    {activeModalItem.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {activeModalItem.title}
                </h3>
              </div>
            </div>

            {/* Modal Details Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Meta information tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Tipe & Merek Unit</span>
                  <strong className="text-slate-800 flex items-center gap-1 font-semibold">
                    <Wrench size={13} className="text-blue-500" />
                    {activeModalItem.acType}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Lokasi Pengerjaan</span>
                  <strong className="text-slate-800 flex items-center gap-1 font-semibold">
                    <MapPin size={13} className="text-rose-500" />
                    {activeModalItem.locationType}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tanggal Dokumentasi</span>
                  <strong className="text-slate-800 flex items-center gap-1 font-semibold">
                    <Calendar size={13} className="text-emerald-500" />
                    {activeModalItem.date}
                  </strong>
                </div>
              </div>

              {/* Action Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Detail Tindakan & Hasil Pengerjaan:
                </h4>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {activeModalItem.description}
                </p>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Semua pekerjaan dilakukan sesuai standar SOP keselamatan kerja.
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => handleOrderClick(activeModalItem)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Pesan Servis Ini</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
