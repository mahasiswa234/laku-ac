import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Wrench, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  X, 
  ShieldAlert, 
  Sparkles, 
  MapPin,
  CreditCard,
  Upload,
  Copy,
  Check,
  Receipt,
  Building2,
  Trash2,
  Bell,
  BellRing,
  RotateCw,
  Loader2,
  CheckCheck,
  Inbox,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ACUnit {
  id: number;
  customer_id: number;
  brand: string;
  type: string;
  location: string;
  status: string;
  last_service_date?: string;
}

interface ServiceRequest {
  id: number;
  request_code: string;
  customer_id: number;
  customer: string;
  service: string;
  service_price?: number;
  ac_unit_id?: number;
  ac_brand?: string;
  ac_type?: string;
  ac_location?: string;
  date: string;
  status: string;
  customer_notes?: string;
  created_at?: string;
  technician_name?: string;
  before_photo_url?: string;
  after_photo_url?: string;
  technician_notes?: string;
  payment_status?: string;
  payment_method?: string;
  payment_amount?: number;
  payment_date?: string;
  payment_proof_url?: string;
  payment_notes?: string;
  additional_cost?: number;
  additional_cost_desc?: string;
  verified_by_admin?: number;
}

export interface OrderNotification {
  id: string;
  requestId: number;
  requestCode: string;
  serviceName: string;
  oldStatus?: string;
  newStatus: string;
  type: 'status_change' | 'payment_verified' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Helper untuk format waktu relatif notifikasi
function formatRelativeTime(isoString: string): string {
  try {
    const past = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 45) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  } catch (e) {
    return 'Baru saja';
  }
}

export default function CustomerDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [units, setUnits] = useState<ACUnit[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<OrderNotification | null>(null);
  const prevStatusesRef = useRef<Map<number, { status: string; payment_status?: string }>>(new Map());
  const isFirstLoadRef = useRef(true);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Modal Pembayaran (Opsi 2: Upload Bukti Transfer)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayRequest, setSelectedPayRequest] = useState<ServiceRequest | null>(null);
  const [paymentBank, setPaymentBank] = useState('BCA');
  const [senderAccountName, setSenderAccountName] = useState('');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofNotes, setProofNotes] = useState('');
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const proofFileInputRef = useRef<HTMLInputElement>(null);

  // Form states for Unit AC
  const [unitForm, setUnitForm] = useState({
    brand: 'Daikin',
    customBrand: '',
    type: 'AC Split 1 PK',
    location: '',
    status: 'Normal',
    last_service_date: ''
  });
  const [unitSubmitting, setUnitSubmitting] = useState(false);
  const [unitError, setUnitError] = useState('');

  // Form states for Service Request
  const [requestForm, setRequestForm] = useState({
    ac_unit_id: '',
    serviceType: 'Cuci AC',
    service_id: '1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    notes: ''
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');

  const servicesList = [
    { id: 1, name: 'Cuci AC', price: 75000, category: 'Perawatan' },
    { id: 2, name: 'Service AC / Perbaikan', price: 150000, category: 'Perbaikan' },
    { id: 3, name: 'Tambah / Isi Refrigerant', price: 150000, category: 'Perawatan' },
    { id: 4, name: 'Bongkar Pasang AC', price: 300000, category: 'Instalasi' },
    { id: 5, name: 'Pengecekan AC', price: 50000, category: 'Pemeriksaan' }
  ];

  // Auto-close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationDropdownRef.current && 
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    initUserAndData();
  }, []);

  // Background polling setiap 12 detik untuk mendeteksi perubahan status pesanan oleh admin
  useEffect(() => {
    if (!userData) return;

    const intervalId = setInterval(() => {
      loadCustomerData(userData, true);
    }, 12000);

    return () => clearInterval(intervalId);
  }, [userData]);

  const initUserAndData = async () => {
    setIsLoading(true);
    let currentUser: any = null;
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (e) {
        currentUser = null;
      }
    }

    // If not logged in as customer, do not inject mock credentials
    if (!currentUser || currentUser.role !== 'customer') {
      setIsLoading(false);
      return;
    }

    // Load saved notifications for this user
    try {
      const savedNotifs = localStorage.getItem(`lakuac_notifications_${currentUser.id}`);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
    } catch (e) {
      console.warn('Gagal membaca cache notifikasi:', e);
    }

    if (!currentUser.customer) {
      try {
        const resCust = await fetch(`/api/customers/by-user/${currentUser.id}`);
        if (resCust.ok) {
          const cust = await resCust.json();
          if (cust && cust.id) {
            currentUser = { ...currentUser, customer: cust };
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        }
      } catch (err) {
        console.error('Error auto-resolving customer profile:', err);
      }
    }

    setUserData(currentUser);
    await loadCustomerData(currentUser, false);
  };

  const loadCustomerData = async (user: any, isBackground = false) => {
    if (isBackground) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const custId = user?.customer?.id || 1;

      // 1. Fetch units
      const unitUrl = `/api/ac-units?customer_id=${custId}`;
      const resUnits = await fetch(unitUrl);
      if (resUnits.ok) {
        const dataUnits = await resUnits.json();
        setUnits(Array.isArray(dataUnits) ? dataUnits : []);
      }

      // 2. Fetch service requests
      const reqUrl = `/api/requests?customer_id=${custId}`;
      const resReq = await fetch(reqUrl);
      if (resReq.ok) {
        const resData = await resReq.json();
        const incomingRequests: ServiceRequest[] = resData.data || (Array.isArray(resData) ? resData : []);
        setRequests(incomingRequests);

        // Bandingkan dengan snapshot status sebelumnya jika bukan initial load
        if (!isFirstLoadRef.current && prevStatusesRef.current.size > 0) {
          const detectedNotifs: OrderNotification[] = [];

          incomingRequests.forEach(req => {
            const prev = prevStatusesRef.current.get(req.id);
            if (prev) {
              // 1. Cek perubahan status servis utama oleh Admin / Teknisi
              if (prev.status !== req.status) {
                let notifType: OrderNotification['type'] = 'status_change';
                let title = `Status Pesanan Diperbarui!`;
                let msg = `Status pesanan ${req.service} (${req.request_code}) diubah menjadi "${req.status}".`;

                if (req.status === 'Dijadwalkan') {
                  notifType = 'scheduled';
                  title = 'Pesanan Dijadwalkan Admin';
                  msg = `Pesanan ${req.service} (${req.request_code}) telah disetujui & dijadwalkan untuk ${req.date}. Teknisi segera bersiap.`;
                } else if (req.status === 'Diproses') {
                  notifType = 'in_progress';
                  title = 'Teknisi Sedang Menuju / Mengerjakan';
                  msg = `Teknisi ${req.technician_name ? `(${req.technician_name}) ` : ''}sedang memproses pekerjaan servis ${req.service} Anda.`;
                } else if (req.status === 'Selesai') {
                  notifType = 'completed';
                  title = 'Pengerjaan Servis Selesai!';
                  msg = `Pekerjaan servis ${req.service} (${req.request_code}) telah rampung dilakukan oleh teknisi.`;
                } else if (req.status === 'Dibatalkan') {
                  notifType = 'cancelled';
                  title = 'Pesanan Servis Dibatalkan';
                  msg = `Pesanan servis ${req.request_code} telah dibatalkan oleh pihak admin.`;
                }

                detectedNotifs.push({
                  id: `${req.id}-${req.status}-${Date.now()}`,
                  requestId: req.id,
                  requestCode: req.request_code,
                  serviceName: req.service,
                  oldStatus: prev.status,
                  newStatus: req.status,
                  type: notifType,
                  title,
                  message: msg,
                  timestamp: new Date().toISOString(),
                  read: false
                });
              }

              // 2. Cek perubahan status pembayaran
              if (prev.payment_status !== req.payment_status && req.payment_status === 'Lunas') {
                detectedNotifs.push({
                  id: `${req.id}-pay-${Date.now()}`,
                  requestId: req.id,
                  requestCode: req.request_code,
                  serviceName: req.service,
                  newStatus: 'Lunas',
                  type: 'payment_verified',
                  title: 'Pembayaran Telah Diverifikasi Lunas!',
                  message: `Admin telah mengonfirmasi pembayaran untuk pesanan ${req.request_code} (${req.service}).`,
                  timestamp: new Date().toISOString(),
                  read: false
                });
              }
            }
          });

          // Jika ada notifikasi perubahan status baru
          if (detectedNotifs.length > 0) {
            setNotifications(prev => {
              const updated = [...detectedNotifs, ...prev].slice(0, 40);
              if (user?.id) {
                try {
                  localStorage.setItem(`lakuac_notifications_${user.id}`, JSON.stringify(updated));
                } catch (e) {}
              }
              return updated;
            });

            // Tampilkan floating live toast pop-up
            setActiveToast(detectedNotifs[0]);
          }
        }

        // Simpan snapshot status sekarang ke memory ref
        const newStatusMap = new Map<number, { status: string; payment_status?: string }>();
        incomingRequests.forEach(r => {
          newStatusMap.set(r.id, { status: r.status, payment_status: r.payment_status });
        });
        prevStatusesRef.current = newStatusMap;
        isFirstLoadRef.current = false;
      }

      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    if (userData) {
      loadCustomerData(userData, true);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      if (userData?.id) {
        try {
          localStorage.setItem(`lakuac_notifications_${userData.id}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (userData?.id) {
      try {
        localStorage.removeItem(`lakuac_notifications_${userData.id}`);
      } catch (e) {}
    }
  };

  const markSingleNotificationRead = (notifId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notifId ? { ...n, read: true } : n);
      if (userData?.id) {
        try {
          localStorage.setItem(`lakuac_notifications_${userData.id}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnitError('');
    const finalBrand = unitForm.brand === 'Lainnya' ? unitForm.customBrand : unitForm.brand;

    if (!finalBrand.trim()) {
      setUnitError('Merek AC wajib diisi');
      return;
    }
    if (!unitForm.location.trim()) {
      setUnitError('Lokasi penempatan AC wajib diisi (contoh: Kamar Utama)');
      return;
    }

    setUnitSubmitting(true);
    try {
      const payload = {
        user_id: userData?.id,
        customer_id: userData?.customer?.id,
        brand: finalBrand,
        type: unitForm.type,
        location: unitForm.location,
        status: unitForm.status,
        last_service_date: unitForm.last_service_date || null
      };

      const res = await fetch('/api/ac-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsUnitModalOpen(false);
        setUnitForm({
          brand: 'Daikin',
          customBrand: '',
          type: 'AC Split 1 PK',
          location: '',
          status: 'Normal',
          last_service_date: ''
        });
        setSuccessBanner('Unit AC baru berhasil didaftarkan ke sistem database!');
        setTimeout(() => setSuccessBanner(null), 5000);
        loadCustomerData(userData);
      } else {
        setUnitError(data.message || 'Gagal menambahkan unit AC');
      }
    } catch (err) {
      setUnitError('Terjadi kesalahan koneksi saat menambahkan unit AC.');
    } finally {
      setUnitSubmitting(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');

    if (!requestForm.date) {
      setRequestError('Tanggal kunjungan servis wajib dipilih');
      return;
    }

    setRequestSubmitting(true);
    try {
      const selectedService = servicesList.find(s => s.name === requestForm.serviceType) || servicesList[0];
      const payload = {
        user_id: userData?.id,
        customer_id: userData?.customer?.id,
        name: userData?.customer?.full_name || userData?.email?.split('@')[0] || 'Pelanggan',
        phone: userData?.customer?.phone || '08123456789',
        service_id: selectedService.id,
        serviceType: selectedService.name,
        ac_unit_id: requestForm.ac_unit_id ? parseInt(requestForm.ac_unit_id, 10) : null,
        date: requestForm.date,
        complaint: requestForm.notes,
        customer_notes: requestForm.notes
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsRequestModalOpen(false);
        setRequestForm({
          ac_unit_id: '',
          serviceType: 'Cuci AC',
          service_id: '1',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          notes: ''
        });
        setSuccessBanner(`Permintaan servis ${data.data?.request_code || ''} berhasil dikirim dan tersampaikan langsung ke Admin!`);
        setTimeout(() => setSuccessBanner(null), 6000);
        loadCustomerData(userData);
      } else {
        setRequestError(data.message || 'Gagal mengirim permintaan servis');
      }
    } catch (err) {
      setRequestError('Terjadi kesalahan koneksi saat mengirim permintaan servis.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleOpenPaymentModal = (req: ServiceRequest) => {
    setSelectedPayRequest(req);
    const total = Number(req.payment_amount || req.service_price || 75000);
    setTransferAmount(total);
    setSenderAccountName(userData?.customer?.full_name || userData?.name || '');
    setTransferDate(new Date().toISOString().split('T')[0]);
    setProofImage(null);
    setProofNotes('');
    setPaymentBank('BCA');
    setIsPaymentModalOpen(true);
  };

  const processProofImage = (file: File) => {
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
          setProofImage(compressed);
        } else {
          setProofImage(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processProofImage(file);
    }
  };

  const handleCopyAccount = (accNo: string, bank: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 3000);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayRequest) return;
    if (!proofImage) {
      alert('Silakan pilih atau unggah foto bukti transfer bank terlebih dahulu.');
      return;
    }

    setIsUploadingPayment(true);
    try {
      const res = await fetch(`/api/requests/${selectedPayRequest.id}/upload-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_proof_url: proofImage,
          payment_notes: `Transfer via ${paymentBank} a/n ${senderAccountName.trim()} (${transferDate}). Catatan: ${proofNotes.trim()}`.trim(),
          payment_amount: Number(transferAmount) || 0,
          payment_method: `Transfer Bank (${paymentBank})`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsPaymentModalOpen(false);
        setSuccessBanner(`Bukti transfer pesanan ${selectedPayRequest.request_code} berhasil diunggah! Status: Menunggu Verifikasi Admin.`);
        setTimeout(() => setSuccessBanner(null), 6000);
        await loadCustomerData(userData);
      } else {
        alert(data.message || 'Gagal mengunggah bukti transfer.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat mengunggah bukti transfer.');
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const openServiceForUnit = (unitId: number) => {
    setRequestForm(prev => ({
      ...prev,
      ac_unit_id: String(unitId)
    }));
    setIsRequestModalOpen(true);
  };

  const customerDisplayName = userData?.customer?.full_name || userData?.email?.split('@')[0] || 'Pelanggan';

  const pendingCount = requests.filter(r => r.status === 'Menunggu').length;
  const inProgressCount = requests.filter(r => r.status === 'Dijadwalkan' || r.status === 'Diproses').length;
  const completedCount = requests.filter(r => r.status === 'Selesai').length;

  return (
    <div className="space-y-6">
      {/* Floating Live Notification Toast saat Admin Mengubah Status Pesanan */}
      {activeToast && (
        <div 
          id="live-order-toast"
          className="fixed top-5 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/90 dark:border-blue-800 p-4 transition-all duration-300 animate-in slide-in-from-top-4"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${
              activeToast.newStatus === 'Selesai' || activeToast.newStatus === 'Lunas' 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                : activeToast.newStatus === 'Diproses'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : activeToast.newStatus === 'Dijadwalkan'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : activeToast.newStatus === 'Dibatalkan'
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
            }`}>
              <BellRing size={20} className="animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{activeToast.title}</h4>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">Baru saja</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{activeToast.message}</p>
              <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  Status Baru: {activeToast.newStatus}
                </span>
                <button
                  onClick={() => {
                    markSingleNotificationRead(activeToast.id);
                    setActiveToast(null);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1 -mr-1 -mt-1 rounded-lg"
              aria-label="Tutup notifikasi"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successBanner && (
        <div id="customer-success-banner" className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={20} />
            <span className="font-medium text-sm">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Welcome & Actions Header with Notification Center */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900/20 px-3 py-1 rounded-full text-xs font-medium mb-2 backdrop-blur-sm">
            <Sparkles size={14} /> Panel Pelanggan Laku AC
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Selamat Datang, {customerDisplayName}!</h1>
          <p className="text-blue-100 mt-1 max-w-xl text-sm sm:text-base">
            Pantau kondisi unit AC Anda dan ajukan permintaan servis berkala secara langsung ke tim teknisi kami.
          </p>

          {/* Sync Status Badge */}
          <div className="mt-3 flex items-center gap-3 text-xs text-blue-100/90">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-300 animate-ping' : 'bg-emerald-400'}`}></span>
              {isRefreshing ? 'Menyinkronkan data pesanan...' : (lastSyncTime ? `Tersinkronisasi pukul ${lastSyncTime}` : 'Sistem aktif terhubung')}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 text-blue-200 hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50"
              title="Segarkan data pesanan dari server"
            >
              <RotateCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Notification Bell Dropdown Button */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              id="btn-lonceng-notifikasi"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 bg-white dark:bg-slate-900/10 hover:bg-white dark:hover:bg-slate-900/20 text-white rounded-xl transition-colors border border-white/20 flex items-center justify-center"
              title="Notifikasi Status Pesanan"
              aria-label="Lihat Notifikasi"
            >
              {notifications.some(n => !n.read) ? (
                <BellRing size={20} className="text-amber-300" />
              ) : (
                <Bell size={20} />
              )}

              {/* Badge Jumlah Unread */}
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-indigo-700 shadow-sm animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {isNotificationOpen && (
              <div 
                id="popup-notifikasi-pelanggan"
                className="absolute right-0 sm:right-0 top-12 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Header Dropdown */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifikasi Pesanan</h3>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="text-[11px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                        {notifications.filter(n => !n.read).length} baru
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded-lg transition-colors"
                        title="Tandai semua telah dibaca"
                      >
                        <CheckCheck size={14} /> Tandai Dibaca
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition-colors"
                        title="Bersihkan riwayat notifikasi"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* List Notifikasi */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="py-10 px-4 text-center">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Inbox size={20} />
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Belum Ada Notifikasi Baru</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                        Pembaruan status pesanan Anda oleh Admin akan muncul otomatis di sini secara real-time.
                      </p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => markSingleNotificationRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors cursor-pointer flex items-start gap-3 ${
                          !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                          notif.newStatus === 'Selesai' || notif.newStatus === 'Lunas'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : notif.newStatus === 'Diproses'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : notif.newStatus === 'Dijadwalkan'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : notif.newStatus === 'Dibatalkan'
                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        }`}>
                          {notif.newStatus === 'Selesai' || notif.newStatus === 'Lunas' ? (
                            <CheckCircle size={16} />
                          ) : notif.newStatus === 'Diproses' ? (
                            <Wrench size={16} />
                          ) : notif.newStatus === 'Dijadwalkan' ? (
                            <Calendar size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {formatRelativeTime(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                              {notif.requestCode} • {notif.newStatus}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Dropdown */}
                {notifications.length > 0 && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
                    Status diperbarui otomatis dari server
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            id="btn-tambah-unit-dashboard"
            onClick={() => setIsUnitModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <Plus size={18} />
            Tambah Unit AC
          </button>
          <button 
            id="btn-kirim-servis-dashboard"
            onClick={() => setIsRequestModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm border border-blue-400/50 dark:border-blue-700"
          >
            <Calendar size={18} />
            Kirim Permintaan Servis
          </button>
        </div>
      </div>

      {/* Quick Summary Cards (dengan Skeleton Loading Ringan) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(item => (
            <div key={item} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-2.5 w-32 bg-slate-100 dark:bg-slate-900 rounded"></div>
              </div>
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex-shrink-0"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Unit AC</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{units.length} Unit</p>
              <p className="text-xs text-slate-400 mt-1">Terdaftar di akun Anda</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Wrench size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Menunggu Admin</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount} Pesanan</p>
              <p className="text-xs text-slate-400 mt-1">Sedang ditinjau jadwalnya</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Servis Selesai</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount} Selesai</p>
              <p className="text-xs text-slate-400 mt-1">Riwayat pengerjaan</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Units List & Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Unit AC */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <Wrench size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Unit AC Anda</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Daftar AC yang terhubung ke akun Anda</p>
              </div>
            </div>
            <button
              onClick={() => setIsUnitModalOpen(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} /> Tambah Unit
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 flex-1">
              {[1, 2].map(i => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 animate-pulse space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                  </div>
                  <div className="h-3 w-48 bg-slate-200/70 dark:bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : units.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                <Wrench size={24} />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Belum Ada Unit AC Terdaftar</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-4">
                Daftarkan AC Anda agar teknisi dapat mengetahui riwayat dan spesifikasi unit saat pemesanan.
              </p>
              <button
                onClick={() => setIsUnitModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Tambah Unit Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
              {units.map(unit => (
                <div 
                  key={unit.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{unit.brand}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">• {unit.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {unit.location}
                      </span>
                      {unit.last_service_date && (
                        <span>Servis: {unit.last_service_date}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      unit.status === 'Normal' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      unit.status === 'Perlu Servis' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                    }`}>
                      {unit.status}
                    </span>
                    <button
                      onClick={() => openServiceForUnit(unit.id)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded-md transition-colors"
                    >
                      Pesan Servis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Kebutuhan kustomisasi lebih lanjut?</span>
            <Link to="/pelanggan/unit" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Kelola Semua Unit &rarr;
            </Link>
          </div>
        </div>

        {/* Right Card: Service Requests & Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Status Permintaan Servis</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Permintaan langsung terhubung ke sistem Admin</p>
              </div>
            </div>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} /> Pesan Baru
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 flex-1">
              {[1, 2].map(i => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 animate-pulse space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                  </div>
                  <div className="h-3 w-56 bg-slate-200/70 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded"></div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                <Calendar size={24} />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Belum Ada Permintaan Servis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-4">
                AC Anda terasa kurang dingin atau butuh cuci berkala? Kirimkan permintaan sekarang, Admin akan segera memproses.
              </p>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Kirim Permintaan Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
              {requests.map(req => (
                <div 
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-xs flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{req.service}</span>
                        <span className="text-xs font-mono text-slate-400 font-semibold">{req.request_code}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Jadwal: <span className="font-medium text-slate-700 dark:text-slate-300">{req.date}</span>
                        {req.ac_brand && ` • Unit: ${req.ac_brand} (${req.ac_location || 'AC'})`}
                      </p>
                    </div>

                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 ${
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
                  </div>

                  {req.customer_notes && (
                    <p className="text-xs bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 p-2 rounded-lg italic">
                      "{req.customer_notes}"
                    </p>
                  )}

                  {req.technician_name && (
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      Teknisi ditugaskan: {req.technician_name}
                    </p>
                  )}

                  {req.status === 'Selesai' && (req.before_photo_url || req.after_photo_url || req.technician_notes) && (
                    <div className="mt-2 p-3 bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle size={13} /> Dokumentasi Pengerjaan Teknisi:
                      </p>
                      {req.technician_notes && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-2 rounded border border-emerald-100/50 dark:border-emerald-800">
                          {req.technician_notes}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {req.before_photo_url && (
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Sebelum</span>
                            <img 
                              src={req.before_photo_url} 
                              alt="Kondisi Sebelum" 
                              className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-800 mt-0.5" 
                            />
                          </div>
                        )}
                        {req.after_photo_url && (
                          <div>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Sesudah Selesai</span>
                            <img 
                              src={req.after_photo_url} 
                              alt="Kondisi Sesudah" 
                              className="w-full h-24 object-cover rounded-lg border border-emerald-200 dark:border-emerald-800 mt-0.5" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {req.status === 'Selesai' && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Pembayaran:</span>
                            {req.payment_status === 'Lunas' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
                                <CheckCircle size={13} /> LUNAS ({req.payment_method || 'Tunai'})
                              </span>
                            ) : req.payment_status === 'Menunggu Verifikasi' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/30 px-2.5 py-0.5 rounded-full">
                                <Clock size={13} /> Menunggu Verifikasi Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-900/30 px-2.5 py-0.5 rounded-full">
                                <AlertCircle size={13} /> Belum Bayar
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                            Total Tagihan: Rp {(req.payment_amount || req.service_price || 75000).toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.payment_status !== 'Lunas' && req.payment_status !== 'Menunggu Verifikasi' && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(req)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <CreditCard size={14} /> Unggah Bukti Transfer
                            </button>
                          )}

                          {req.payment_status === 'Menunggu Verifikasi' && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(req)}
                              className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Upload size={13} /> Ganti Bukti
                            </button>
                          )}

                          <Link 
                            to={`/invoice/${req.request_code || req.id}`}
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <FileText size={14} className="text-blue-600 dark:text-blue-400" /> Invoice
                          </Link>
                        </div>
                      </div>

                      {req.payment_status === 'Menunggu Verifikasi' && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                          ⏳ Bukti transfer Anda sedang diverifikasi oleh Admin. Setelah disetujui, status pembayaran akan otomatis berubah menjadi <strong>LUNAS</strong>.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Status pesanan diperbarui oleh Admin secara real-time.</span>
            <Link to="/pelanggan/pesan" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Formulir Lengkap &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH UNIT AC BARU                                              */}
      {/* ========================================================================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Wrench className="text-blue-600 dark:text-blue-400" size={22} />
                <h3 className="text-lg font-bold">Tambah Unit AC Baru</h3>
              </div>
              <button 
                onClick={() => setIsUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {unitError && (
              <div className="mt-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{unitError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUnit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Merek AC *
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                  value={unitForm.brand}
                  onChange={e => setUnitForm({ ...unitForm, brand: e.target.value })}
                >
                  <option value="Daikin">Daikin</option>
                  <option value="Panasonic">Panasonic</option>
                  <option value="Sharp">Sharp</option>
                  <option value="LG">LG</option>
                  <option value="Gree">Gree</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                  <option value="Polytron">Polytron</option>
                  <option value="Aqua">Aqua</option>
                  <option value="Lainnya">Lainnya...</option>
                </select>

                {unitForm.brand === 'Lainnya' && (
                  <input
                    type="text"
                    placeholder="Ketik merek AC Anda..."
                    className="w-full mt-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={unitForm.customBrand}
                    onChange={e => setUnitForm({ ...unitForm, customBrand: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tipe & Kapasitas AC *
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                  value={unitForm.type}
                  onChange={e => setUnitForm({ ...unitForm, type: e.target.value })}
                >
                  <option value="AC Split 0.5 PK">AC Split 0.5 PK</option>
                  <option value="AC Split 0.75 PK">AC Split 0.75 PK</option>
                  <option value="AC Split 1 PK">AC Split 1 PK</option>
                  <option value="AC Split 1.5 PK">AC Split 1.5 PK</option>
                  <option value="AC Split 2 PK">AC Split 2 PK</option>
                  <option value="AC Inverter 1 PK">AC Inverter 1 PK</option>
                  <option value="AC Inverter 1.5 PK">AC Inverter 1.5 PK</option>
                  <option value="AC Cassette">AC Cassette (Plafon)</option>
                  <option value="AC Floor Standing">AC Floor Standing</option>
                  <option value="AC Central / Ducting">AC Central / Ducting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Lokasi Penempatan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kamar Utama Lt. 2, Ruang Tamu, Kantor"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={unitForm.location}
                  onChange={e => setUnitForm({ ...unitForm, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Kondisi Awal
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                    value={unitForm.status}
                    onChange={e => setUnitForm({ ...unitForm, status: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Perlu Servis">Perlu Servis</option>
                    <option value="Rusak">Rusak / Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Servis Terakhir
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                    value={unitForm.last_service_date}
                    onChange={e => setUnitForm({ ...unitForm, last_service_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={unitSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {unitSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    'Simpan Unit AC'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KIRIM PERMINTAAN SERVIS LANGSUNG KE ADMIN                         */}
      {/* ========================================================================= */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Calendar className="text-indigo-600 dark:text-indigo-400" size={22} />
                <div>
                  <h3 className="text-lg font-bold">Kirim Permintaan Servis</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Permintaan akan langsung diterima oleh admin</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {requestError && (
              <div className="mt-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Pilih Unit AC Terdaftar
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900"
                  value={requestForm.ac_unit_id}
                  onChange={e => setRequestForm({ ...requestForm, ac_unit_id: e.target.value })}
                >
                  <option value="">-- Tanpa Unit Khusus / Semua Unit --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.brand} ({u.type}) - Lokasi: {u.location}
                    </option>
                  ))}
                </select>
                {units.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Tips: Anda juga dapat mendaftarkan unit AC terlebih dahulu agar riwayat pengerjaan tercatat rapi.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Jenis Layanan *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {servicesList.map(s => (
                    <label 
                      key={s.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        requestForm.serviceType === s.name 
                          ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900 ring-1 ring-indigo-600' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="serviceType"
                          value={s.name}
                          checked={requestForm.serviceType === s.name}
                          onChange={() => setRequestForm({ ...requestForm, serviceType: s.name, service_id: String(s.id) })}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                        <span>{s.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Rp {s.price.toLocaleString('id-ID')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tanggal Kunjungan Diharapkan *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900"
                  value={requestForm.date}
                  onChange={e => setRequestForm({ ...requestForm, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Keluhan / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: AC kurang dingin, netes air dari indoor unit, mohon datang siang..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={requestForm.notes}
                  onChange={e => setRequestForm({ ...requestForm, notes: e.target.value })}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <ShieldAlert size={16} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Permintaan Anda akan langsung tampil di dashboard admin dengan status <strong>Menunggu</strong> untuk kemudian dijadwalkan teknisi.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={requestSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {requestSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengirim Permintaan...</span>
                    </>
                  ) : (
                    'Kirim Langsung ke Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UNGGAH BUKTI TRANSFER BANK (OPSI 2)                              */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && selectedPayRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-scaleUp">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Unggah Bukti Transfer Bank</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedPayRequest.request_code} • {selectedPayRequest.service}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPaymentProof} className="p-5 space-y-4">
              {/* Rekening Pembayaran Resmi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Rekening Tujuan Pembayaran Resmi
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl relative">
                    <span className="font-bold text-blue-900 dark:text-blue-300 block">Bank BCA</span>
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide block mt-0.5">
                      8830-1234-5678
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">a/n PT Laku AC Mandiri</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('883012345678', 'BCA')}
                      className="mt-2 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      {copiedBank === 'BCA' ? (
                        <>
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Salin No. Rekening
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50/70 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl relative">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">Bank Mandiri</span>
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide block mt-0.5">
                      137-00-9876543-2
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">a/n PT Laku AC Mandiri</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('1370098765432', 'Mandiri')}
                      className="mt-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 flex items-center gap-1"
                    >
                      {copiedBank === 'Mandiri' ? (
                        <>
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Salin No. Rekening
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Tagihan */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Nominal Yang Harus Ditransfer:</span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    Rp {(selectedPayRequest.payment_amount || selectedPayRequest.service_price || 75000).toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                  Bebas Biaya Admin
                </span>
              </div>

              {/* Form Input Detail Transfer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Tujuan Transfer <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <select
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="BRI">Bank BRI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pemilik Rekening Pengirim <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderAccountName}
                    onChange={(e) => setSenderAccountName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Transfer <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jumlah Ditransfer (Rp) <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={transferAmount || ''}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Upload Foto Bukti Struk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Bukti / Struk Transfer <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>

                {proofImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
                    <img src={proofImage} alt="Bukti Transfer" className="w-full h-44 object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setProofImage(null)}
                      className="absolute top-3 right-3 bg-rose-600 text-white p-1.5 rounded-lg shadow-md hover:bg-rose-700 transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => proofFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-600 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/30 transition-all cursor-pointer text-center group"
                  >
                    <Upload size={24} className="mb-1.5 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih / Foto Struk Bukti Transfer</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Format JPG, PNG, atau Screenshot M-Banking</span>
                    <input
                      ref={proofFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProofFileChange}
                    />
                  </div>
                )}
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Contoh: Transfer lewat BCA Mobile jam 10:15 WIB"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3 sticky bottom-0 bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPayment}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isUploadingPayment ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Mengunggah Bukti...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Kirim Bukti Pembayaran</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
