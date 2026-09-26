import React, { useState, useEffect } from 'react';
import { Plus, Wrench, Settings, Trash2, Calendar, AlertCircle, CheckCircle, X, MapPin, Loader2 } from 'lucide-react';

interface ACUnit {
  id: number;
  customer_id: number;
  brand: string;
  type: string;
  location: string;
  status: string;
  last_service_date?: string;
  customer_name?: string;
}

export default function CustomerUnit() {
  const [units, setUnits] = useState<ACUnit[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Unit (Add / Edit)
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState({
    brand: 'Daikin',
    customBrand: '',
    type: 'AC Split 1 PK',
    location: '',
    status: 'Normal',
    last_service_date: ''
  });
  const [unitSubmitting, setUnitSubmitting] = useState(false);

  // Modal State for Service Booking
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedUnitForBooking, setSelectedUnitForBooking] = useState<ACUnit | null>(null);
  const [bookingForm, setBookingForm] = useState({
    serviceType: 'Cuci AC',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const servicesList = [
    { id: 1, name: 'Cuci AC', price: 75000 },
    { id: 2, name: 'Service AC / Perbaikan', price: 150000 },
    { id: 3, name: 'Tambah / Isi Refrigerant', price: 150000 },
    { id: 4, name: 'Bongkar Pasang AC', price: 300000 },
    { id: 5, name: 'Pengecekan AC', price: 50000 }
  ];

  useEffect(() => {
    initUserAndUnits();
  }, []);

  const initUserAndUnits = async () => {
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

    if (!currentUser || currentUser.role !== 'customer') {
      setIsLoading(false);
      return;
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
      } catch (e) {
        console.error('Error auto-resolving customer profile:', e);
      }
    }

    setUserData(currentUser);
    await fetchUnits(currentUser);
  };

  const fetchUnits = async (user: any) => {
    setIsLoading(true);
    try {
      const custId = user?.customer?.id || 1;
      const url = `/api/ac-units?customer_id=${custId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUnits(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentUnitId(null);
    setUnitForm({
      brand: 'Daikin',
      customBrand: '',
      type: 'AC Split 1 PK',
      location: '',
      status: 'Normal',
      last_service_date: ''
    });
    setIsUnitModalOpen(true);
  };

  const handleOpenEditModal = (unit: ACUnit) => {
    setIsEditMode(true);
    setCurrentUnitId(unit.id);
    const standardBrands = ['Daikin', 'Panasonic', 'Sharp', 'LG', 'Gree', 'Samsung', 'Mitsubishi', 'Polytron', 'Aqua'];
    const isStandard = standardBrands.includes(unit.brand);

    setUnitForm({
      brand: isStandard ? unit.brand : 'Lainnya',
      customBrand: isStandard ? '' : unit.brand,
      type: unit.type || 'AC Split 1 PK',
      location: unit.location || '',
      status: unit.status || 'Normal',
      last_service_date: unit.last_service_date ? unit.last_service_date.split('T')[0] : ''
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = unitForm.brand === 'Lainnya' ? unitForm.customBrand : unitForm.brand;

    if (!finalBrand.trim()) {
      setBanner({ type: 'error', message: 'Merek AC wajib diisi' });
      return;
    }
    if (!unitForm.location.trim()) {
      setBanner({ type: 'error', message: 'Lokasi penempatan AC wajib diisi' });
      return;
    }

    setUnitSubmitting(true);
    try {
      const payload = {
        user_id: userData?.id || 4,
        customer_id: userData?.customer?.id || 1,
        brand: finalBrand,
        type: unitForm.type,
        location: unitForm.location,
        status: unitForm.status,
        last_service_date: unitForm.last_service_date || null
      };

      const url = isEditMode && currentUnitId ? `/api/ac-units/${currentUnitId}` : '/api/ac-units';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsUnitModalOpen(false);
        setBanner({ 
          type: 'success', 
          message: isEditMode ? 'Data unit AC berhasil diperbarui' : 'Unit AC baru berhasil ditambahkan' 
        });
        setTimeout(() => setBanner(null), 5000);
        fetchUnits(userData);
      } else {
        setBanner({ type: 'error', message: data.message || 'Gagal menyimpan unit AC' });
      }
    } catch (err) {
      setBanner({ type: 'error', message: 'Terjadi kesalahan koneksi server.' });
    } finally {
      setUnitSubmitting(false);
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus unit AC ini?')) return;
    try {
      const res = await fetch(`/api/ac-units/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanner({ type: 'success', message: 'Unit AC berhasil dihapus' });
        setTimeout(() => setBanner(null), 4000);
        fetchUnits(userData);
      } else {
        alert('Gagal menghapus unit AC.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleOpenBooking = (unit: ACUnit) => {
    setSelectedUnitForBooking(unit);
    setBookingForm({
      serviceType: 'Cuci AC',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      notes: `Servis unit ${unit.brand} (${unit.type}) di ${unit.location}`
    });
    setIsBookingModalOpen(true);
  };

  const handleSendBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.date) {
      alert('Pilih tanggal servis terlebih dahulu');
      return;
    }

    setBookingSubmitting(true);
    try {
      const svc = servicesList.find(s => s.name === bookingForm.serviceType) || servicesList[0];
      const payload = {
        user_id: userData?.id,
        customer_id: userData?.customer?.id,
        name: userData?.customer?.full_name || userData?.email?.split('@')[0] || 'Pelanggan',
        phone: userData?.customer?.phone || '08123456789',
        service_id: svc.id,
        serviceType: svc.name,
        ac_unit_id: selectedUnitForBooking?.id,
        date: bookingForm.date,
        customer_notes: bookingForm.notes
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsBookingModalOpen(false);
        setBanner({ 
          type: 'success', 
          message: `Permintaan servis ${data.data?.request_code || ''} berhasil dikirim dan tersampaikan langsung ke Admin!` 
        });
        setTimeout(() => setBanner(null), 6000);
        fetchUnits(userData);
      } else {
        alert(data.message || 'Gagal mengirim permintaan servis');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {banner && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
          banner.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="opacity-70 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Manajemen Unit AC</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Daftar AC yang terpasang di lokasi Anda untuk kemudahan servis dan perawatan berkala.</p>
        </div>
        <button 
          id="btn-tambah-unit-page"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          <Plus size={18} />
          Tambah Unit AC Baru
        </button>
      </div>

      {/* Units Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded"></div>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded"></div>
              <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-900 rounded"></div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end">
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {units.map((unit) => (
            <div key={unit.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-800 transition-all">
              <div>
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wrench size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{unit.brand}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{unit.type}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    unit.status === 'Normal' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 
                    unit.status === 'Perlu Servis' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                <div className="p-5 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin size={14} /> Lokasi Ruangan:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{unit.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={14} /> Servis Terakhir:
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {unit.last_service_date ? unit.last_service_date.split('T')[0] : 'Belum pernah'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button 
                  onClick={() => handleOpenEditModal(unit)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Ubah Data Unit"
                >
                  <Settings size={14} /> Ubah
                </button>
                <button 
                  onClick={() => handleDeleteUnit(unit.id)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 p-2 rounded-xl text-xs transition-colors shadow-2xs"
                  title="Hapus Unit"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={() => handleOpenBooking(unit)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Calendar size={14} /> Pesan Servis
                </button>
              </div>
            </div>
          ))}

          {/* Add New Unit Quick Card */}
          <button 
            onClick={handleOpenAddModal}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-center mb-3 transition-colors">
              <Plus size={24} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-sm">Tambah Unit AC Lainnya</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Daftarkan seluruh AC di rumah atau kantor Anda untuk kemudahan tracking perawatan</p>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT UNIT AC                                              */}
      {/* ========================================================================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Wrench className="text-blue-600 dark:text-blue-400" size={22} />
                <h3 className="text-lg font-bold">
                  {isEditMode ? 'Ubah Data Unit AC' : 'Tambah Unit AC Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="mt-4 space-y-4">
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
                    placeholder="Tulis merek AC..."
                    className="w-full mt-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={unitForm.customBrand}
                    onChange={e => setUnitForm({ ...unitForm, customBrand: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tipe & Kapasitas *
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
                  placeholder="Contoh: Kamar Tidur Utama Lt. 2, Ruang Tamu"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={unitForm.location}
                  onChange={e => setUnitForm({ ...unitForm, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Status Kondisi
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
                    isEditMode ? 'Perbarui Data' : 'Simpan Unit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PESAN SERVIS DARI KARTU UNIT AC                                    */}
      {/* ========================================================================= */}
      {isBookingModalOpen && selectedUnitForBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Calendar className="text-blue-600 dark:text-blue-400" size={22} />
                <div>
                  <h3 className="text-base font-bold">Pesan Servis untuk AC Ini</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedUnitForBooking.brand} ({selectedUnitForBooking.location})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendBooking} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Pilih Layanan
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                  value={bookingForm.serviceType}
                  onChange={e => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                >
                  {servicesList.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} - Rp {s.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tanggal Kunjungan Diharapkan
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900"
                  value={bookingForm.date}
                  onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Catatan Keluhan / Instruksi
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bookingSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    'Kirim Permintaan'
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
