import React, { useState, useEffect } from 'react';
import { Users, Wrench, CalendarCheck, Clock, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceRequest {
  id: number;
  request_code: string;
  customer: string;
  customer_phone?: string;
  service: string;
  date: string;
  status: string;
  ac_brand?: string;
  ac_location?: string;
  customer_notes?: string;
  technician_name?: string;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalTechnicians, setTotalTechnicians] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch requests
      const resReq = await fetch('/api/requests');
      if (resReq.ok) {
        const json = await resReq.json();
        setRequests(json.data || []);
      }

      // 2. Fetch customers count
      const resCust = await fetch('/api/customers');
      if (resCust.ok) {
        const dataCust = await resCust.json();
        if (Array.isArray(dataCust)) setTotalCustomers(dataCust.length);
      }

      // 3. Fetch technicians count
      const resTech = await fetch('/api/technicians');
      if (resTech.ok) {
        const dataTech = await resTech.json();
        if (Array.isArray(dataTech)) setTotalTechnicians(dataTech.length);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Menunggu');
  const scheduledRequests = requests.filter(r => r.status === 'Dijadwalkan' || r.status === 'Diproses');
  const completedRequests = requests.filter(r => r.status === 'Selesai');

  const stats = [
    { 
      label: 'Pesanan Menunggu', 
      value: pendingRequests.length, 
      desc: 'Perlu konfirmasi & jadwal',
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 border-amber-200' 
    },
    { 
      label: 'Jadwal Aktif / Proses', 
      value: scheduledRequests.length, 
      desc: 'Dalam penanganan teknisi',
      icon: CalendarCheck, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-200' 
    },
    { 
      label: 'Teknisi Tersedia', 
      value: totalTechnicians || 3, 
      desc: 'Siap ditugaskan',
      icon: Wrench, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200' 
    },
    { 
      label: 'Total Pelanggan', 
      value: totalCustomers || 12, 
      desc: 'Pelanggan terdaftar',
      icon: Users, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50 border-indigo-200' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ringkasan Admin</h1>
          <p className="text-slate-500 text-sm">Monitoring operasional servis dan permintaan masuk secara real-time.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Segarkan Data
        </button>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.desc}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Alert for Pending Orders */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={22} />
            <div>
              <p className="text-sm font-bold">Ada {pendingRequests.length} Permintaan Servis Menunggu Konfirmasi!</p>
              <p className="text-xs text-amber-700">Pelanggan baru saja mengajukan pesanan. Segera tentukan jadwal dan tugaskan teknisi.</p>
            </div>
          </div>
          <Link
            to="/admin/pesanan"
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap shadow-xs"
          >
            Kelola di Manajemen Pesanan &rarr;
          </Link>
        </div>
      )}

      {/* Pesanan Terbaru Masuk */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">Permintaan Servis Terbaru</h2>
            <p className="text-xs text-slate-500">Daftar pesanan yang diajukan langsung oleh pelanggan</p>
          </div>
          <Link to="/admin/pesanan" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            Lihat Semua Pesanan <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-3.5">Kode / ID</th>
                <th className="px-6 py-3.5">Pelanggan</th>
                <th className="px-6 py-3.5">Layanan & Unit</th>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Memuat data permintaan masuk...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Belum ada permintaan servis yang masuk.
                  </td>
                </tr>
              ) : (
                requests.slice(0, 6).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-blue-600">
                      {req.request_code || `#REQ-${req.id}`}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-sm">{req.customer}</p>
                      {req.customer_phone && (
                        <p className="text-xs text-slate-400">{req.customer_phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700 text-sm">{req.service}</p>
                      {req.ac_brand && (
                        <p className="text-xs text-slate-400">Unit: {req.ac_brand} ({req.ac_location || 'AC'})</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {req.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 ${
                        req.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'Dijadwalkan' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'Diproses' ? 'bg-purple-100 text-purple-700' :
                        req.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {req.status === 'Menunggu' && <Clock size={12} />}
                        {req.status === 'Selesai' && <CheckCircle size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/admin/pesanan"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Tinjau
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
