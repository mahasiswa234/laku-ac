import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  Edit3, 
  X, 
  UserCheck, 
  RefreshCw,
  Receipt,
  FileText,
  ShieldCheck,
  Check,
  ExternalLink
} from 'lucide-react';

interface ServiceRequest {
  id: number;
  request_code: string;
  customer_id: number;
  customer: string;
  customer_phone?: string;
  customer_address?: string;
  service: string;
  service_price?: number;
  date: string;
  status: string;
  ac_brand?: string;
  ac_type?: string;
  ac_location?: string;
  customer_notes?: string;
  technician_name?: string;
  before_photo_url?: string;
  after_photo_url?: string;
  technician_notes?: string;
  created_at?: string;
  payment_status?: string;
  payment_method?: string;
  payment_amount?: number;
  payment_date?: string;
  payment_proof_url?: string;
  payment_notes?: string;
  verified_by_admin?: number;
  additional_cost?: number;
  additional_cost_desc?: string;
}

export default function AdminOrders() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Modal for changing status & assigning technician
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [newStatus, setNewStatus] = useState('Menunggu');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal for Verifying Payment (Opsi 2)
  const [selectedPaymentReq, setSelectedPaymentReq] = useState<ServiceRequest | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchOrdersAndTechs();
  }, []);

  const fetchOrdersAndTechs = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch requests
      const resReq = await fetch('/api/requests');
      if (resReq.ok) {
        const json = await resReq.json();
        setRequests(json.data || []);
      }

      // 2. Fetch technicians
      const resTech = await fetch('/api/technicians');
      if (resTech.ok) {
        const dataTech = await resTech.json();
        setTechnicians(dataTech || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStatusModal = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setSelectedTechnician(req.technician_name || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, technician: selectedTechnician })
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedRequest(null);
        setFeedback({ 
          type: 'success', 
          message: `Status pesanan ${selectedRequest.request_code} berhasil diubah menjadi ${newStatus}` 
        });
        setTimeout(() => setFeedback(null), 4000);
        fetchOrdersAndTechs();
      } else {
        alert(data.message || 'Gagal mengubah status');
      }
    } catch (err) {
      alert('Terjadi kesalahan server saat memperbarui status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Payment Verification Modal (Opsi 2)
  const handleOpenPaymentVerifyModal = (req: ServiceRequest) => {
    setSelectedPaymentReq(req);
    setVerificationNotes('');
  };

  const handleVerifyPayment = async (decision: 'Lunas' | 'Ditolak') => {
    if (!selectedPaymentReq) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/requests/${selectedPaymentReq.id}/verify-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          notes: verificationNotes.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedPaymentReq(null);
        setFeedback({
          type: 'success',
          message: decision === 'Lunas' 
            ? `Pembayaran pesanan ${selectedPaymentReq.request_code} berhasil diverifikasi & tercatat LUNAS.`
            : `Pembayaran pesanan ${selectedPaymentReq.request_code} ditolak. Pelanggan diminta mengunggah ulang bukti transfer.`
        });
        setTimeout(() => setFeedback(null), 5000);
        fetchOrdersAndTechs();
      } else {
        alert(data.message || 'Gagal memverifikasi pembayaran.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick mark as Paid for cash settlement
  const handleQuickMarkPaid = async (req: ServiceRequest) => {
    if (!confirm(`Konfirmasi tandai pembayaran pesanan ${req.request_code} sebagai LUNAS?`)) return;
    try {
      const res = await fetch(`/api/requests/${req.id}/verify-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Lunas',
          notes: 'Diverifikasi langsung oleh Admin (Tunai/Cash)'
        })
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Pembayaran ${req.request_code} berhasil ditandai LUNAS.` });
        setTimeout(() => setFeedback(null), 4000);
        fetchOrdersAndTechs();
      }
    } catch (e) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const pendingVerificationCount = requests.filter(r => r.payment_status === 'Menunggu Verifikasi').length;

  const filteredRequests = requests.filter(req => {
    let matchesStatus = true;
    if (statusFilter === 'Menunggu Verifikasi Pembayaran') {
      matchesStatus = req.payment_status === 'Menunggu Verifikasi';
    } else if (statusFilter === 'Lunas') {
      matchesStatus = req.payment_status === 'Lunas';
    } else if (statusFilter !== 'Semua') {
      matchesStatus = req.status === statusFilter;
    }

    const query = search.toLowerCase();
    const matchesSearch = 
      (req.request_code && req.request_code.toLowerCase().includes(query)) ||
      (req.customer && req.customer.toLowerCase().includes(query)) ||
      (req.service && req.service.toLowerCase().includes(query)) ||
      (req.ac_brand && req.ac_brand.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
          feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Alert Banner: Pending Payment Verification */}
      {pendingVerificationCount > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-xl">
              <Receipt size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Ada {pendingVerificationCount} Bukti Pembayaran Transfer Bank Menunggu Verifikasi
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Pelanggan telah mengunggah bukti transfer. Silakan periksa mutasi rekening dan setujui untuk mengubah status menjadi LUNAS pada invoice.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Menunggu Verifikasi Pembayaran')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
          >
            Tampilkan Yang Menunggu Verifikasi
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Manajemen Pesanan & Pembayaran</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Kelola seluruh permintaan servis, penugasan teknisi, verifikasi transfer bank, dan invoice.</p>
        </div>
        <button
          onClick={fetchOrdersAndTechs}
          className="flex items-center gap-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 px-3.5 py-2.5 rounded-xl transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Segarkan Data
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-950">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kode request, nama pelanggan, layanan..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 pl-1">
              <Filter size={14} /> Filter:
            </span>
            {['Semua', 'Menunggu', 'Dijadwalkan', 'Diproses', 'Selesai'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {status}
              </button>
            ))}

            <button
              onClick={() => setStatusFilter('Menunggu Verifikasi Pembayaran')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'Menunggu Verifikasi Pembayaran'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30'
              }`}
            >
              <span>Verifikasi Transfer</span>
              {pendingVerificationCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-full text-[10px] font-bold">
                  {pendingVerificationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('Lunas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === 'Lunas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              Lunas
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="px-5 py-4">Kode Request</th>
                <th className="px-5 py-4">Pelanggan</th>
                <th className="px-5 py-4">Layanan & Unit</th>
                <th className="px-5 py-4">Status Servis</th>
                <th className="px-5 py-4">Status Pembayaran</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    Memuat data pesanan & pembayaran...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Tidak ada pesanan servis yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {req.request_code || `#REQ-${req.id}`}
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">{req.date}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{req.customer}</p>
                      {req.customer_phone && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{req.customer_phone}</p>
                      )}
                      {req.customer_address && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{req.customer_address}</p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{req.service}</p>
                      {req.ac_brand && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Unit: {req.ac_brand} ({req.ac_location || 'AC'})</p>
                      )}
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        Tarif: Rp {Number(req.service_price || 75000).toLocaleString('id-ID')}
                        {req.additional_cost ? ` + Part: Rp ${req.additional_cost.toLocaleString('id-ID')}` : ''}
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 ${
                        req.status === 'Menunggu' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 
                        req.status === 'Dijadwalkan' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 
                        req.status === 'Diproses' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 
                        req.status === 'Selesai' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 
                        'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                      }`}>
                        {req.status === 'Menunggu' && <Clock size={12} />}
                        {req.status === 'Selesai' && <CheckCircle size={12} />}
                        {req.status}
                      </span>
                      {req.technician_name ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Teknisi: {req.technician_name}</p>
                      ) : (
                        <p className="text-[10px] text-rose-500 dark:text-rose-400 italic mt-1">Belum ditugaskan</p>
                      )}
                    </td>

                    {/* Kolom Pembayaran & Validasi */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {req.payment_status === 'Lunas' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
                              <CheckCircle size={12} /> LUNAS
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {req.payment_method || 'Tunai (Cash)'}
                            </p>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Rp {Number(req.payment_amount || req.service_price || 75000).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ) : req.payment_status === 'Menunggu Verifikasi' ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 rounded-full animate-pulse">
                              <Clock size={12} /> Perlu Verifikasi
                            </span>
                            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                              {req.payment_method || 'Transfer Bank'}
                            </p>
                            <button
                              onClick={() => handleOpenPaymentVerifyModal(req)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1"
                            >
                              <ShieldCheck size={13} /> Cek Bukti Transfer
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md">
                              Belum Bayar
                            </span>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                              Rp {Number(req.payment_amount || req.service_price || 75000).toLocaleString('id-ID')}
                            </p>
                            {req.status === 'Selesai' && (
                              <button
                                onClick={() => handleQuickMarkPaid(req)}
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold block mt-1 hover:underline"
                              >
                                + Tandai Lunas Tunai
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenStatusModal(req)}
                          className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Edit3 size={13} /> Status & Teknisi
                        </button>

                        <Link
                          to={`/invoice/${req.request_code || req.id}`}
                          className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          title="Buka Invoice"
                        >
                          <FileText size={13} className="text-blue-600 dark:text-blue-400" /> Invoice
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: UPDATE STATUS & PENUGASAN TEKNISI                                   */}
      {/* ========================================================================= */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Update Status Pesanan</h3>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400">{selectedRequest.request_code}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Pelanggan:</span> {selectedRequest.customer} ({selectedRequest.customer_phone || '-'})</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Layanan:</span> {selectedRequest.service}</p>
              {selectedRequest.ac_brand && (
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Unit:</span> {selectedRequest.ac_brand} ({selectedRequest.ac_location || 'AC'})</p>
              )}
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Rencana:</span> {selectedRequest.date}</p>
              {selectedRequest.customer_notes && (
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Catatan Pelanggan:</span> {selectedRequest.customer_notes}</p>
              )}
              {selectedRequest.technician_notes && (
                <p><span className="font-semibold text-emerald-700 dark:text-emerald-300">Catatan Teknisi:</span> {selectedRequest.technician_notes}</p>
              )}
              {(selectedRequest.before_photo_url || selectedRequest.after_photo_url) && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Dokumentasi Foto Teknisi:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.before_photo_url && (
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sebelum:</span>
                        <img src={selectedRequest.before_photo_url} alt="Sebelum" className="w-full h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-800 mt-0.5" />
                      </div>
                    )}
                    {selectedRequest.after_photo_url && (
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Sesudah:</span>
                        <img src={selectedRequest.after_photo_url} alt="Sesudah" className="w-full h-20 object-cover rounded-lg border border-emerald-200 dark:border-emerald-800 mt-0.5" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ubah Status Pesanan *
                </label>
                <select
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 font-medium"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value="Menunggu">Menunggu (Pending)</option>
                  <option value="Dijadwalkan">Dijadwalkan (Confirmed / Scheduled)</option>
                  <option value="Diproses">Diproses (In Progress)</option>
                  <option value="Selesai">Selesai (Completed)</option>
                  <option value="Dibatalkan">Dibatalkan (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Pilih / Tugaskan Teknisi
                </label>
                <select
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                  value={selectedTechnician}
                  onChange={e => setSelectedTechnician(e.target.value)}
                >
                  <option value="">-- Belum Ditugaskan --</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.full_name}>
                      {tech.full_name} ({tech.skills || 'Teknisi AC'})
                    </option>
                  ))}
                  <option value="Budi Santoso">Budi Santoso (Senior AC)</option>
                  <option value="Andi Wijaya">Andi Wijaya (Spesialis Inverter)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VERIFIKASI BUKTI TRANSFER BANK (OPSI 2)                           */}
      {/* ========================================================================= */}
      {selectedPaymentReq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scaleUp">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Verifikasi Bukti Transfer Bank</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedPaymentReq.request_code} - {selectedPaymentReq.customer}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPaymentReq(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Rincian Tagihan & Nominal */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Layanan Pokok:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPaymentReq.service}</span>
                </div>
                {selectedPaymentReq.additional_cost ? (
                  <div className="flex justify-between text-amber-800 dark:text-amber-300">
                    <span>Tambahan ({selectedPaymentReq.additional_cost_desc || 'Suku cadang'}):</span>
                    <span className="font-semibold">+ Rp {selectedPaymentReq.additional_cost.toLocaleString('id-ID')}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Tagihan Invoice:</span>
                  <span className="text-blue-700 dark:text-blue-300">
                    Rp {Number(selectedPaymentReq.payment_amount || selectedPaymentReq.service_price || 75000).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Catatan Transfer dari Pelanggan */}
              {selectedPaymentReq.payment_notes && (
                <div className="p-3 bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                  <span className="font-bold block mb-0.5">Catatan Transfer Pelanggan:</span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedPaymentReq.payment_notes}</p>
                </div>
              )}

              {/* Foto Bukti Transfer Struk */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Foto Bukti Transfer Struk / M-Banking:
                </label>
                {selectedPaymentReq.payment_proof_url ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
                    <img 
                      src={selectedPaymentReq.payment_proof_url} 
                      alt="Struk Bukti Transfer" 
                      className="w-full max-h-72 object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Tidak ada foto bukti transfer yang diunggah.
                  </div>
                )}
              </div>

              {/* Catatan Verifikasi Admin (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Verifikasi Admin (Opsional jika menolak/menerima)
                </label>
                <input
                  type="text"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Contoh: Dana Rp 150.000 sudah masuk ke mutasi BCA jam 10:20 WIB"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Action Buttons: Terima (Lunas) vs Tolak */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleVerifyPayment('Ditolak')}
                  className="flex-1 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  ❌ Tolak (Minta Upload Ulang)
                </button>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleVerifyPayment('Lunas')}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle size={15} />
                  {isVerifying ? 'Memproses...' : '✅ Setujui & Terbitkan Lunas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
