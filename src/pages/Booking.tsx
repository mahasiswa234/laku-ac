import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CheckCircle, AlertCircle, Wrench, Clock, ShieldCheck } from 'lucide-react';

interface ACUnit {
  id: number;
  brand: string;
  type: string;
  location: string;
}

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [units, setUnits] = useState<ACUnit[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: 'Jakarta Selatan',
    address: '',
    serviceType: 'Cuci AC',
    service_id: '1',
    ac_unit_id: '',
    complaint: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const services = [
    { id: 1, name: 'Cuci AC', price: 75000, desc: 'Pembersihan indoor & outdoor unit agar udara bersih dan dingin maksimal.' },
    { id: 2, name: 'Service AC / Perbaikan', price: 150000, desc: 'Penanganan AC mati, bocor air, berisik, atau bau tak sedap.' },
    { id: 3, name: 'Tambah / Isi Refrigerant', price: 150000, desc: 'Pengisian freon R32 / R410A / R22 sesuai tekanan standar pabrik.' },
    { id: 4, name: 'Bongkar Pasang AC', price: 300000, desc: 'Relokasi atau instalasi unit AC baru dengan instalasi pipa rapi.' },
    { id: 5, name: 'Pengecekan AC', price: 50000, desc: 'Inspeksi menyeluruh kompresor, kelistrikan, dan tekanan freon.' },
    { id: 6, name: 'Pemeliharaan AC / Kontrak', price: 100000, desc: 'Perawatan berkala rutin terjadwal untuk ruko, kantor, atau hunian.' },
  ];

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login', {
        replace: true,
        state: {
          message: 'Silakan masuk ke akun Anda terlebih dahulu untuk membuat pesanan servis.',
          redirectTo: '/pelanggan/pesan'
        }
      });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'customer') {
        navigate('/login', { replace: true });
        return;
      }
      setUserData(user);
      
      // Check for preferred service from navigation state (e.g. from gallery)
      const navState = location.state as any;
      let initialService = 'Cuci AC';
      let initialServiceId = '1';
      let initialNotes = '';

      if (navState?.preferredService) {
        const found = services.find(s => s.name.toLowerCase().includes(navState.preferredService.toLowerCase()) || navState.preferredService.toLowerCase().includes(s.name.toLowerCase()));
        if (found) {
          initialService = found.name;
          initialServiceId = String(found.id);
        }
      }
      if (navState?.preferredNotes) {
        initialNotes = navState.preferredNotes;
      }

      let initialArea = 'Jakarta Selatan';
      if (navState?.preferredArea) {
        initialArea = navState.preferredArea;
      } else if (user.customer?.address) {
        if (user.customer.address.includes('Depok')) initialArea = 'Depok & Sekitarnya';
        else if (user.customer.address.includes('Tangerang') || user.customer.address.includes('BSD') || user.customer.address.includes('Bintaro')) initialArea = 'Tangerang & Tangsel';
        else if (user.customer.address.includes('Bekasi') || user.customer.address.includes('Bogor')) initialArea = 'Bekasi & Bogor';
        else if (user.customer.address.includes('Pusat') || user.customer.address.includes('Barat')) initialArea = 'Jakarta Pusat & Barat';
        else if (user.customer.address.includes('Timur') || user.customer.address.includes('Utara')) initialArea = 'Jakarta Timur & Utara';
      }

      // Auto populate customer contact info
      setFormData(prev => ({
        ...prev,
        name: user.customer?.full_name || (user.email ? user.email.split('@')[0] : ''),
        phone: user.customer?.phone || '',
        area: initialArea,
        address: user.customer?.address || prev.address || '',
        serviceType: initialService,
        service_id: initialServiceId,
        complaint: initialNotes || prev.complaint
      }));

      // Fetch user's registered units
      const unitUrl = user.customer?.id 
        ? `/api/ac-units?customer_id=${user.customer.id}`
        : `/api/ac-units?user_id=${user.id}`;
      
      fetch(unitUrl)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUnits(data);
          }
        })
        .catch(err => console.error('Failed to load user units:', err));
    } catch (e) {
      navigate('/login', { replace: true });
    }
  }, [navigate, location.state]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor WhatsApp wajib diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat atau patokan lokasi wajib diisi';
    if (!formData.serviceType) newErrors.serviceType = 'Pilih jenis layanan';
    if (!formData.date) newErrors.date = 'Pilih tanggal kunjungan';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const selectedService = services.find(s => s.name === formData.serviceType) || services[0];
      const fullAddress = formData.address ? `${formData.address} (${formData.area})` : formData.area;
      const combinedNotes = formData.complaint 
        ? `[Area: ${formData.area}] ${formData.complaint}`
        : `[Area: ${formData.area}]`;

      const payload = {
        name: formData.name,
        phone: formData.phone,
        customer_address: fullAddress,
        customer_id: userData?.customer?.id,
        user_id: userData?.id,
        service_id: selectedService.id,
        serviceType: selectedService.name,
        ac_unit_id: formData.ac_unit_id ? parseInt(formData.ac_unit_id, 10) : null,
        date: formData.date,
        complaint: combinedNotes,
        customer_notes: combinedNotes
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        const code = result.data?.request_code || 'REQ-BARU';
        setSuccessCode(code);
      } else {
        alert(result.message || 'Gagal mengirim permintaan servis.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-6 animate-scaleUp">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle size={44} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Permintaan Servis Diterima
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
              Pesanan Anda Telah Tersampaikan ke Admin!
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
              Kode pemesanan Anda adalah <span className="font-mono font-bold text-blue-600 text-base">{successCode}</span>. Admin kami akan segera memeriksa ketersediaan teknisi dan memperbarui status pesanan Anda.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-slate-600">
              <span>Layanan:</span>
              <span className="font-bold text-slate-800">{formData.serviceType}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tanggal Rencana:</span>
              <span className="font-bold text-slate-800">{formData.date}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status Awal:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Menunggu Konfirmasi</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/pelanggan/dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              Lihat di Dashboard Saya
            </button>
            <button
              onClick={() => {
                setSuccessCode(null);
                setFormData(prev => ({ ...prev, complaint: '', ac_unit_id: '' }));
              }}
              className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all"
            >
              Buat Pesanan Lainnya
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Form Pemesanan Servis AC</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8 pb-6 border-b border-slate-100">
          Silakan lengkapi formulir di bawah ini. Permintaan Anda langsung diteruskan ke sistem Admin untuk penjadwalan teknisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap *
              </label>
              <input 
                type="text" 
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${
                  errors.name ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                }`}
                placeholder="Masukkan nama Anda"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp / Telepon *
              </label>
              <input 
                type="text" 
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${
                  errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                }`}
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Area & Alamat Layanan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Zona Area Layanan *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Pusat & Barat">Jakarta Pusat & Barat</option>
                <option value="Tangerang & Tangsel">Tangerang & Tangsel</option>
                <option value="Depok & Sekitarnya">Depok & Sekitarnya</option>
                <option value="Jakarta Timur & Utara">Jakarta Timur & Utara</option>
                <option value="Bekasi & Bogor">Bekasi & Bogor</option>
              </select>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                ✓ Bebas ongkos transportasi (radius 10 km)
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Lengkap / Patokan Lokasi *
              </label>
              <input 
                type="text" 
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${
                  errors.address ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                }`}
                placeholder="Contoh: Jl. Tebet Barat Dalam No. 12, Kel. Tebet Barat (patokan dekat masjid)"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Unit AC Terdaftar */}
          {units.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Unit AC Terdaftar (Opsional)
              </label>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                value={formData.ac_unit_id}
                onChange={(e) => setFormData({...formData, ac_unit_id: e.target.value})}
              >
                <option value="">-- Tanpa Unit Khusus / Unit Baru --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.brand} ({u.type}) - Lokasi: {u.location}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Jenis Layanan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Jenis Layanan *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(service => (
                <label 
                  key={service.id}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    formData.serviceType === service.name
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-blue-900 font-medium'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="serviceType" 
                        value={service.name}
                        checked={formData.serviceType === service.name}
                        onChange={() => setFormData({...formData, serviceType: service.name, service_id: String(service.id)})}
                        className="text-blue-600"
                      />
                      <span className="font-bold text-sm text-slate-800">{service.name}</span>
                    </div>
                    <span className="font-bold text-blue-600 whitespace-nowrap">
                      Rp {service.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 pl-5">
                    {service.desc}
                  </p>
                </label>
              ))}
            </div>
            {errors.serviceType && <p className="text-rose-500 text-xs mt-1">{errors.serviceType}</p>}
          </div>

          {/* Tanggal Kunjungan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Rencana Tanggal Kunjungan *
            </label>
            <input 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white ${
                errors.date ? 'border-rose-500' : 'border-slate-200'
              }`}
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
            {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Keluhan / Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Keluhan atau Catatan Tambahan (Opsional)
            </label>
            <textarea 
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              placeholder="Jelaskan kendala AC Anda (misal: AC bocor air, bau apek, tidak dingin sama sekali, dll.)"
              value={formData.complaint}
              onChange={(e) => setFormData({...formData, complaint: e.target.value})}
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Transparansi dan Kualitas Terjamin:</span>
              <p className="mt-0.5 text-slate-500">
                Permintaan ini tersambung langsung ke panel admin. Teknisi akan membawa peralatan lengkap dan melakukan diagnosa menyeluruh sebelum pengerjaan.
              </p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirimkan Pesanan...' : 'Kirim Permintaan Servis Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
