import { Link } from 'react-router-dom';
import { Clock, User, CheckCircle, Star, Quote, MapPin, ArrowRight, ShieldCheck, Navigation } from 'lucide-react';

export default function Home() {
  const primaryAreas = [
    { name: 'Jakarta Selatan', eta: '30-45 Menit', note: 'Kebayoran, Cilandak, Tebet, Jagakarsa' },
    { name: 'Jakarta Pusat & Barat', eta: '45-60 Menit', note: 'Menteng, Kebon Jeruk, Palmerah, Grogol' },
    { name: 'Tangerang & Tangsel', eta: '30-60 Menit', note: 'BSD, Serpong, Bintaro, Ciputat, Pamulang' },
    { name: 'Depok & Sekitarnya', eta: '45-60 Menit', note: 'Margonda, Cinere, Beji, Cimanggis' },
    { name: 'Jakarta Timur & Utara', eta: '45-60 Menit', note: 'Duren Sawit, Kelapa Gading, Matraman' },
    { name: 'Bekasi & Bogor', eta: '60-90 Menit', note: 'Harapan Indah, Rawalumbu, Cibubur, Sentul' },
  ];
  const testimonials = [
    {
      name: 'Budi Santoso',
      location: 'Jakarta Selatan',
      comment: 'Pelayanan sangat profesional. Teknisi datang tepat waktu dan AC di rumah saya yang awalnya bocor sekarang sudah dingin kembali seperti baru.',
      initial: 'B'
    },
    {
      name: 'Siti Aminah',
      location: 'Depok',
      comment: 'Harga transparan dan tidak ada biaya tersembunyi. Cuci AC sangat bersih dan teknisinya ramah. Sangat direkomendasikan untuk perawatan rutin.',
      initial: 'S'
    },
    {
      name: 'PT. Maju Karya',
      location: 'Tangerang',
      comment: 'Kami menggunakan jasa Laku AC untuk perawatan seluruh unit di kantor. Pengerjaan cepat, rapi, dan tidak mengganggu aktivitas kerja.',
      initial: 'M'
    }
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section 
        className="w-full relative text-white py-32 px-4 text-center bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        {/* Overlay gelap biru agar teks tetap terbaca */}
        <div className="absolute inset-0 bg-blue-900/75 mix-blend-multiply"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
            Layanan Servis AC Profesional & Terpercaya
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-50 max-w-2xl mx-auto">
            Kami menyediakan jasa cuci, perbaikan, dan perawatan AC untuk hunian maupun perkantoran di Jabodetabek.
          </p>
          <Link to="/login" className="inline-block bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-lg">
            Pesan Layanan Sekarang
          </Link>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section className="py-20 px-4 w-full max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-slate-800 dark:text-slate-200">Kenapa Memilih Laku AC?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={24} />
            </div>
            <h3 className="font-semibold text-xl mb-2">Tepat Waktu</h3>
            <p className="text-slate-600 dark:text-slate-400">Teknisi kami datang sesuai jadwal yang telah disepakati bersama.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={24} />
            </div>
            <h3 className="font-semibold text-xl mb-2">Teknisi Berpengalaman</h3>
            <p className="text-slate-600 dark:text-slate-400">Dikerjakan oleh teknisi ahli yang tersertifikasi di bidang mesin pendingin.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-semibold text-xl mb-2">Garansi Layanan</h3>
            <p className="text-slate-600 dark:text-slate-400">Memberikan garansi pengerjaan untuk kenyamanan Anda.</p>
          </div>
        </div>
      </section>

      {/* Jangkauan Area Layanan Section */}
      <section className="py-16 px-4 w-full bg-slate-50 dark:bg-slate-950 border-y border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Jangkauan Area Layanan Laku AC
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
                Armada teknisi siaga di pos-pos strategis Jabodetabek siap melayani servis rutin maupun kendala darurat tanpa biaya transportasi tambahan.
              </p>
            </div>
            <Link
              to="/layanan#area-jabodetabek"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors whitespace-nowrap self-start md:self-auto"
            >
              <span>Cek Area & Pos Siaga</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {primaryAreas.map((area, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {area.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {area.eta}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Meliputi: {area.note}
                </p>
                <Link
                  to="/layanan#area-jabodetabek"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1 group-hover:underline"
                >
                  <span>Lihat pos siaga & pesan teknisi</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-blue-900 dark:text-blue-300 font-medium">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Bebas ongkos jalan / biaya transportasi untuk radius 10 km dari pos teknisi siaga terdekat.</span>
            </div>
            <Link to="/layanan#area-jabodetabek" className="text-blue-700 dark:text-blue-300 hover:underline font-bold whitespace-nowrap">
              Cek Radius Lokasi Anda &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Testimoni Section (Baru) */}
      <section className="py-20 px-4 w-full bg-slate-100 dark:bg-slate-900 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">Apa Kata Pelanggan Kami?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-12">Ulasan dan kepuasan pelanggan terhadap layanan Laku AC.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {testimonials.map((item, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm relative">
                <Quote className="absolute top-6 right-6 text-slate-200" size={32} />
                <div className="flex text-yellow-400 mb-4">
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic mb-6">
                  "{item.comment}"
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                    {item.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pelanggan di {item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
