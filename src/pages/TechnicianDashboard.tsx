import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Upload, 
  X, 
  Phone, 
  AlertCircle, 
  PlayCircle, 
  RefreshCw, 
  Image, 
  Trash2, 
  CreditCard, 
  Receipt, 
  FileText, 
  DollarSign, 
  Check 
} from 'lucide-react';

export default function TechnicianDashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [techNotes, setTechNotes] = useState('');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  // Form Pembayaran Teknisi (Opsi 1)
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [additionalDesc, setAdditionalDesc] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai (Cash)' | 'Transfer Bank'>('Tunai (Cash)');
  const [transferSettledNow, setTransferSettledNow] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const json = await reqRes.json();
        const allRequests = json.data || [];
        const mapped = allRequests.map((item: any) => ({
          id: item.id,
          schedule_id: item.schedule_id || item.id,
          requestCode: item.request_code || `REQ-${item.id}`,
          customer: item.customer || 'Pelanggan',
          customerPhone: item.customer_phone || '-',
          service: item.service || 'Service AC',
          servicePrice: Number(item.service_price || 75000),
          address: item.customer_address || 'Alamat Pelanggan',
          time: item.start_time ? `${item.start_time.slice(0, 5)} - ${item.end_time ? item.end_time.slice(0, 5) : '12:00'}` : '09:00 - 12:00',
          date: item.scheduled_date || item.date || 'Hari ini',
          status: item.status,
          acUnit: item.ac_brand ? `${item.ac_brand} (${item.ac_location || 'Unit'})` : 'Unit AC',
          notes: item.customer_notes,
          technicianName: item.technician_name,
          paymentStatus: item.payment_status || 'Belum Bayar',
          paymentMethod: item.payment_method,
          paymentAmount: Number(item.payment_amount || item.service_price || 75000),
          additionalCost: Number(item.additional_cost || 0),
          additionalDesc: item.additional_cost_desc || '',
          paymentDate: item.payment_date,
          beforePhoto: item.before_photo_url,
          afterPhoto: item.after_photo_url
        }));
        setJobs(mapped);
        return;
      }

      // Fallback to schedules
      const res = await fetch('/api/schedules');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            id: item.request_id || item.id,
            schedule_id: item.id,
            requestCode: item.request_code || `REQ-${item.request_id}`,
            customer: item.customer_name || 'Pelanggan',
            customerPhone: item.customer_phone || '-',
            service: item.service_type || 'Perbaikan AC',
            servicePrice: 75000,
            address: item.customer_address || 'Alamat Pelanggan',
            time: `${item.start_time ? item.start_time.slice(0, 5) : '09:00'} - ${item.end_time ? item.end_time.slice(0, 5) : '11:00'}`,
            date: item.scheduled_date || 'Hari ini',
            status: item.request_status || 'Dijadwalkan',
            acUnit: item.ac_brand ? `${item.ac_brand} (${item.ac_location || 'Unit'})` : 'Unit AC',
            notes: item.customer_notes,
            paymentStatus: 'Belum Bayar',
            paymentMethod: null,
            paymentAmount: 75000,
            additionalCost: 0,
            additionalDesc: ''
          }));
          setJobs(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to fetch technician jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStartWork = async (jobId: number) => {
    try {
      const res = await fetch(`/api/requests/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Diproses' })
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Status pekerjaan diubah menjadi Diproses. Silakan mulai pengerjaan.' });
        setTimeout(() => setFeedback(null), 4000);
        fetchJobs();
      } else {
        alert('Gagal mengubah status pekerjaan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleOpenCompleteModal = (job: any) => {
    setSelectedJob(job);
    setTechNotes('');
    setBeforePhoto(null);
    setAfterPhoto(null);
    setAdditionalCost(0);
    setAdditionalDesc('');
    setPaymentMethod('Tunai (Cash)');
    setTransferSettledNow(true);
    setShowModal(true);
  };

  // Process file to base64 with image resizing
  const processImageFile = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          callback(compressed);
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBeforePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => setBeforePhoto(dataUrl));
    }
  };

  const handleAfterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => setAfterPhoto(dataUrl));
    }
  };

  const handleSaveCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);

    const parsedAdditional = Math.max(0, Number(additionalCost) || 0);
    const totalPayment = (selectedJob.servicePrice || 75000) + parsedAdditional;
    const finalPaymentStatus = paymentMethod === 'Tunai (Cash)' 
      ? 'Lunas' 
      : (transferSettledNow ? 'Lunas' : 'Belum Bayar');

    try {
      const res = await fetch(`/api/requests/${selectedJob.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Selesai',
          notes: techNotes,
          before_photo: beforePhoto,
          after_photo: afterPhoto,
          payment_method: paymentMethod,
          payment_status: finalPaymentStatus,
          additional_cost: parsedAdditional,
          additional_cost_desc: additionalDesc.trim(),
          payment_amount: totalPayment
        })
      });

      if (res.ok) {
        setShowModal(false);
        setFeedback({ 
          type: 'success', 
          message: `Pekerjaan ${selectedJob.requestCode} berhasil diselesaikan! Pembayaran tercatat ${finalPaymentStatus}.` 
        });
        setTimeout(() => setFeedback(null), 5000);
        fetchJobs();
      } else {
        alert('Gagal menyelesaikan pekerjaan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeJobs = jobs.filter(j => j.status === 'Dijadwalkan' || j.status === 'Diproses');
  const completedJobs = jobs.filter(j => j.status === 'Selesai');
  const displayedJobs = activeTab === 'active' ? activeJobs : completedJobs;

  return (
    <div className="space-y-6">
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

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Dashboard Kerja Teknisi</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Kelola tugas servis, dokumentasi pengerjaan, dan pencatatan pembayaran di lokasi.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'active' 
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tugas Aktif ({activeJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'completed' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Selesai ({completedJobs.length})
            </button>
          </div>
          <button
            onClick={fetchJobs}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-medium transition-colors"
            title="Muat ulang data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-blue-500 dark:text-blue-400" />
          <p>Memuat jadwal pekerjaan teknisi...</p>
        </div>
      ) : displayedJobs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
            {activeTab === 'active' ? 'Tidak Ada Tugas Aktif Saat Ini' : 'Belum Ada Riwayat Pekerjaan Selesai'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            {activeTab === 'active' 
              ? 'Pekerjaan yang ditugaskan oleh Admin akan muncul di sini secara otomatis.'
              : 'Pekerjaan yang telah Anda selesaikan dan input pembayarannya akan tersimpan di riwayat ini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedJobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-6 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{job.customer}</span>
                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-semibold">
                    {job.requestCode}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    job.status === 'Diproses' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : job.status === 'Selesai'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  }`}>
                    {job.status}
                  </span>

                  {/* Badge Pembayaran */}
                  {job.status === 'Selesai' && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      job.paymentStatus === 'Lunas' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      <Receipt size={12} />
                      {job.paymentStatus === 'Lunas' 
                        ? `LUNAS (${job.paymentMethod || 'Tunai'})` 
                        : 'Menunggu Pembayaran'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {job.service} ({job.acUnit})
                  </p>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Phone size={15} className="text-slate-400 shrink-0" />
                    <span>{job.customerPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 pt-1">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{job.address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span>{job.date}, jam {job.time}</span>
                </div>

                {job.notes && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Catatan Pelanggan:</span> {job.notes}
                  </div>
                )}

                {/* Info Biaya Jika Selesai */}
                {job.status === 'Selesai' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Jasa Pokok ({job.service}):</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {job.servicePrice.toLocaleString('id-ID')}</span>
                    </div>
                    {job.additionalCost > 0 && (
                      <div className="flex justify-between text-amber-700 dark:text-amber-300">
                        <span>Tambahan ({job.additionalDesc || 'Suku cadang/Freon'}):</span>
                        <span className="font-semibold">+ Rp {job.additionalCost.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>Total Tagihan:</span>
                      <span className="text-blue-700 dark:text-blue-300">Rp {job.paymentAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[200px] gap-2.5">
                {job.status === 'Dijadwalkan' && (
                  <button 
                    onClick={() => handleStartWork(job.id)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <PlayCircle size={18} />
                    Mulai Kerjakan
                  </button>
                )}

                {job.status !== 'Selesai' && (
                  <button 
                    onClick={() => handleOpenCompleteModal(job)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <CheckCircle size={18} />
                    Selesaikan & Tagih
                  </button>
                )}

                {job.status === 'Selesai' && (
                  <Link 
                    to={`/invoice/${job.requestCode || job.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-bold py-2.5 rounded-xl text-xs transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <FileText size={15} />
                    Buka Invoice
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Selesaikan Pekerjaan (Upload Foto, Rincian Biaya & Pilihan Metode Pembayaran - Opsi 1) */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Selesaikan Pekerjaan & Catat Pembayaran</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedJob.requestCode} - {selectedJob.customer}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCompletion}>
              <div className="p-6 space-y-5">
                {/* Info Singkat Unit */}
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 p-3.5 rounded-xl text-sm border border-blue-100 dark:border-blue-800">
                  <div className="flex justify-between items-center">
                    <p className="font-bold">{selectedJob.customer}</p>
                    <span className="text-xs font-semibold bg-blue-200 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                      {selectedJob.service}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Unit: {selectedJob.acUnit} • {selectedJob.address}</p>
                </div>

                {/* 1. Dokumentasi Foto */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">1. Dokumentasi Hasil Servis</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Foto Sebelum (Kondisi Awal)
                      </label>
                      {beforePhoto ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                          <img src={beforePhoto} alt="Sebelum" className="w-full h-28 object-cover" />
                          <button
                            type="button"
                            onClick={() => setBeforePhoto(null)}
                            className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md shadow-md hover:bg-rose-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => beforeFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/30 cursor-pointer text-center"
                        >
                          <Upload size={18} className="mb-1 text-slate-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Foto Kondisi Awal</span>
                          <span className="text-[10px] text-slate-400">JPG/PNG</span>
                          <input ref={beforeFileInputRef} type="file" className="hidden" accept="image/*" onChange={handleBeforePhotoChange} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Foto Sesudah (Hasil Servis)
                      </label>
                      {afterPhoto ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                          <img src={afterPhoto} alt="Sesudah" className="w-full h-28 object-cover" />
                          <button
                            type="button"
                            onClick={() => setAfterPhoto(null)}
                            className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md shadow-md hover:bg-rose-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => afterFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/30 cursor-pointer text-center"
                        >
                          <Upload size={18} className="mb-1 text-slate-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Foto Hasil Servis</span>
                          <span className="text-[10px] text-slate-400">JPG/PNG</span>
                          <input ref={afterFileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAfterPhotoChange} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Catatan Teknisi */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    2. Catatan Hasil Pengerjaan
                  </label>
                  <textarea 
                    rows={2} 
                    value={techNotes}
                    onChange={(e) => setTechNotes(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" 
                    placeholder="Contoh: Pembersihan filter & evaporator tuntas, arus 3.1A stabil, suhu hembusan 16°C."
                  ></textarea>
                </div>

                {/* 3. Rincian Biaya & Tambahan Suku Cadang */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt size={15} className="text-blue-600 dark:text-blue-400" />
                    3. Rincian Biaya & Komponen Tambahan
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Tarif Layanan Dasar</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={`Rp ${selectedJob.servicePrice.toLocaleString('id-ID')}`} 
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Biaya Tambahan (Freon / Part)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-semibold">Rp</span>
                        <input 
                          type="number" 
                          min={0}
                          step={5000}
                          value={additionalCost || ''}
                          onChange={(e) => setAdditionalCost(Number(e.target.value))}
                          placeholder="0"
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {additionalCost > 0 && (
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                        Deskripsi Komponen / Jasa Tambahan
                      </label>
                      <input 
                        type="text" 
                        value={additionalDesc}
                        onChange={(e) => setAdditionalDesc(e.target.value)}
                        placeholder="Contoh: Tambah Freon R32 20 PSI & Kapasitor 25uF" 
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-200">
                    <span>Total Tagihan Akhir:</span>
                    <span className="text-base text-blue-700 dark:text-blue-300">
                      Rp {((selectedJob.servicePrice || 75000) + (Number(additionalCost) || 0)).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* 4. Pilihan Metode Pembayaran (Opsi 1) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={15} className="text-emerald-600 dark:text-emerald-400" />
                    4. Metode Pembayaran di Lokasi (Opsi 1)
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('Tunai (Cash)');
                        setTransferSettledNow(true);
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        paymentMethod === 'Tunai (Cash)'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          💵 Tunai (Cash)
                        </span>
                        {paymentMethod === 'Tunai (Cash)' && <Check size={16} className="text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Diterima langsung di lokasi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Transfer Bank')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        paymentMethod === 'Transfer Bank'
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          🏦 Transfer Bank
                        </span>
                        {paymentMethod === 'Transfer Bank' && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Via M-Banking / Rekening</span>
                    </button>
                  </div>

                  {paymentMethod === 'Tunai (Cash)' ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Uang tunai diterima teknisi di lokasi.</p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                          Status invoice akan langsung tercatat <strong>LUNAS</strong> dengan tanggal dan jam saat ini.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2 text-xs text-blue-900 dark:text-blue-300">
                      <p className="font-bold">Konfirmasi Penerimaan Transfer Bank:</p>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="transfer_status" 
                            checked={transferSettledNow === true}
                            onChange={() => setTransferSettledNow(true)}
                            className="text-blue-600 dark:text-blue-400 focus:ring-blue-500" 
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            Pelanggan sudah transfer di tempat & diverifikasi teknisi (Status: <strong>LUNAS</strong>)
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="transfer_status" 
                            checked={transferSettledNow === false}
                            onChange={() => setTransferSettledNow(false)}
                            className="text-blue-600 dark:text-blue-400 focus:ring-blue-500" 
                          />
                          <span className="text-slate-700 dark:text-slate-300">
                            Pelanggan akan transfer nanti / unggah bukti di dashboard (Status: <strong>Belum Bayar</strong>)
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-950 sticky bottom-0 z-10">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold py-2.5 rounded-xl transition-colors text-xs"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-xs"
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'Menyimpan...' : 'Simpan & Terbitkan Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
