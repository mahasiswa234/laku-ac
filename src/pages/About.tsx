import { Users, Target, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">Tentang Kami</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Mengenal lebih dekat visi, misi, dan perjalanan Laku AC dalam memberikan layanan mesin pendingin terbaik.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden shadow-sm">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqY-pJD1yOMtFCSt8FRzm0JIR-PZ1duMIy8UJdyPOzxQ&s=10" 
            alt="Foto Bersama Kru Laku AC" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Sejarah Laku AC</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Didirikan pada tahun 2026 Laku AC hadir sebagai solusi terpercaya untuk segala permasalahan tata udara. Kami menyadari betapa pentingnya udara yang bersih, sejuk, dan sehat untuk kenyamanan aktivitas sehari-hari, baik di rumah maupun di tempat kerja.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Berawal dari sebuah tim kecil yang melayani perbaikan AC rumahan, kami telah berkembang melayani ribuan pelanggan di Jabodetabek dengan mengedepankan kualitas, transparansi harga, dan pelayanan pelanggan yang responsif.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Target size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">Visi</h3>
          <p className="text-slate-600 dark:text-slate-400">Menjadi perusahaan penyedia jasa pemeliharaan AC nomor satu di Jabodetabek yang paling dipercaya oleh masyarakat dan instansi.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">Misi</h3>
          <p className="text-slate-600 dark:text-slate-400">Memberikan layanan tepat waktu, teknisi tersertifikasi, penggunaan suku cadang asli, dan edukasi perawatan berkala kepada pelanggan.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">Integritas</h3>
          <p className="text-slate-600 dark:text-slate-400">Kami menjamin transparansi harga tanpa biaya tersembunyi, serta garansi pasti untuk setiap pengerjaan unit AC Anda.</p>
        </div>
      </div>
    </div>
  );
}
