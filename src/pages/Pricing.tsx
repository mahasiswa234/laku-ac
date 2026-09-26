import React from 'react';
import { Check, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const services = [
    {
      name: 'Cuci AC Standard & Steam',
      price: '75.000',
      unit: '/ unit',
      badge: 'Terpopuler',
      description: 'Pembersihan rutin untuk menjaga performa AC agar tetap dingin, higienis, dan awet.',
      features: [
        'Cuci filter udara & cover indoor',
        'Steam evaporator indoor bertekanan',
        'Cuci kondensor outdoor',
        'Pembersihan talang air anti bocor',
        'Cek tekanan freon & ampere listrik',
        'Garansi servis 14 hari'
      ]
    },
    {
      name: 'Service AC / Perbaikan',
      price: '150.000',
      unit: '/ tindakan',
      badge: 'Solusi Tuntas',
      description: 'Penanganan kerusakan komponen seperti AC bocor air, berisik, atau mati total.',
      features: [
        'Diagnosa menyeluruh kerusakan',
        'Perbaikan pipa bocor / kondensasi',
        'Penggantian kapasitor / modul PCB',
        'Pengecekan kelistrikan & kompresor',
        'Uji suhu dingin maksimal',
        'Garansi pengerjaan 30 hari'
      ]
    },
    {
      name: 'Isi Freon (R32 / R410A / R22)',
      price: '150.000',
      unit: '/ unit',
      badge: 'Freon Murni',
      description: 'Penambahan atau isi ulang freon murni berstandar pabrik agar ruangan kembali dingin beku.',
      features: [
        'Cek kebocoran nepel & sambungan',
        'Pengukuran manifold gauge presisi',
        'Isi / tambah freon murni berkualitas',
        'Pengecekan ampere beban kompresor',
        'Garansi tekanan freon 30 hari'
      ]
    },
    {
      name: 'Bongkar Pasang AC',
      price: '300.000',
      unit: '/ unit',
      badge: 'Instalasi Presisi',
      description: 'Jasa pemindahan unit AC lama ke lokasi baru atau instalasi AC baru bergaransi.',
      features: [
        'Pump down simpan freon aman',
        'Bongkar unit indoor & outdoor rapi',
        'Pasang braket kokoh dengan waterpass',
        'Vakum instalasi pipa tembaga',
        'Testing operasional dingin',
        'Garansi instalasi 30 hari'
      ]
    }
  ];

  const handleBooking = (serviceName: string) => {
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
          preferredService: serviceName,
          preferredNotes: `Pemesanan dari halaman Harga: ${serviceName}`
        }
      });
    } else {
      navigate('/login', {
        state: {
          message: `Silakan masuk atau daftar terlebih dahulu untuk memesan paket ${serviceName}.`,
          redirectTo: '/pelanggan/pesan'
        }
      });
    }
  };

  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12 max-w-3xl mx-auto space-y-3">
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Daftar Harga & Paket Layanan AC
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Semua harga transparan tanpa biaya tersembunyi. Dikerjakan oleh teknisi bersertifikat menggunakan peralatan standar pabrikan dan bergaransi resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative group"
          >
            <div>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {service.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {service.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed min-h-[36px]">
                  {service.description}
                </p>
                <div className="mt-4 flex items-baseline text-blue-600 dark:text-blue-400">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Rp {service.price}
                  </span>
                  <span className="ml-1 text-xs font-medium text-slate-400">
                    {service.unit}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-3">
                  Fitur & Jaminan Layanan:
                </span>
                <ul className="space-y-2.5">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => handleBooking(service.name)}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Pesan Paket Ini</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 text-center border border-blue-100/80 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left space-y-1">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            Butuh penawaran untuk gedung kantor atau unit dalam jumlah banyak?
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Dapatkan tarif khusus korporat dan survei teknisi gratis ke lokasi Anda.
          </p>
        </div>
        <Link
          to="/kontak"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm whitespace-nowrap transition-colors"
        >
          Hubungi Tim Kami
        </Link>
      </div>
    </div>
  );
}
