import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Wind, Eye, Calendar, MapPin } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', full_name: '', phone: '', email: '', address: '' });
  const [isEdit, setIsEdit] = useState(false);

  // State for Customer AC Units Modal
  const [selectedCustomerForUnits, setSelectedCustomerForUnits] = useState<any | null>(null);
  const [customerUnits, setCustomerUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      console.error('Database connection failed');
      alert('Gagal memuat data pelanggan dari server database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCustomerUnits = async (customer: any) => {
    setSelectedCustomerForUnits(customer);
    setLoadingUnits(true);
    try {
      const res = await fetch(`/api/ac-units?customer_id=${customer.id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerUnits(Array.isArray(data) ? data : []);
      } else {
        setCustomerUnits([]);
      }
    } catch (e) {
      console.error('Failed to load customer units:', e);
      setCustomerUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEdit ? `/api/customers/${formData.id}` : '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert(isEdit ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!');
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        throw new Error('Gagal menyimpan');
      }
    } catch (error) {
      alert('Gagal menyimpan data ke server database.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pelanggan ini?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Data berhasil dihapus');
        fetchCustomers();
      } else {
        throw new Error('Gagal menghapus');
      }
    } catch (error) {
      alert('Gagal menghapus data dari server database.');
    }
  };

  const openEditModal = (customer: any) => {
    setFormData(customer);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({ id: '', full_name: '', phone: '', email: '', address: '' });
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pelanggan</h1>
          <p className="text-slate-600">Daftar semua pelanggan yang terdaftar di sistem.</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
          <Plus size={18} /> Tambah Pelanggan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau no handphone..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">ID Pelanggan</th>
                <th className="px-6 py-4 font-medium">Nama Pelanggan</th>
                <th className="px-6 py-4 font-medium">Kontak</th>
                <th className="px-6 py-4 font-medium">Alamat</th>
                <th className="px-6 py-4 font-medium">Unit AC Terdaftar</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Memuat data...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Data tidak ditemukan</td></tr>
              ) : (
                filteredCustomers.map((cust, i) => (
                  <tr key={cust.id || i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-700">{cust.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{cust.full_name}</td>
                    <td className="px-6 py-4">
                      <p>{cust.email || '-'}</p>
                      <p className="text-slate-500">{cust.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{cust.address || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewCustomerUnits(cust)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                      >
                        <Wind size={13} className="text-blue-500" />
                        <span>{cust.total_ac_units || 0} Unit AC</span>
                        <Eye size={12} className="ml-0.5 text-blue-400" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(cust)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit Pelanggan">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(cust.id)} className="text-red-500 hover:text-red-700 p-1" title="Hapus Pelanggan">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">{isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">No Telepon</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Daftar Unit AC Pelanggan */}
      {selectedCustomerForUnits && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wind size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Unit AC Terdaftar</h3>
                  <p className="text-xs text-slate-500">
                    Pelanggan: <span className="font-semibold text-slate-700">{selectedCustomerForUnits.full_name}</span> ({selectedCustomerForUnits.phone || '-'})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomerForUnits(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4">
              {loadingUnits ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Memuat data unit AC...
                </div>
              ) : customerUnits.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Wind size={36} className="mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-700">Belum ada unit AC terdaftar untuk pelanggan ini</p>
                  <p className="text-xs text-slate-400">Unit AC yang ditambahkan oleh pelanggan melalui dashboard mereka akan muncul di sini.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {customerUnits.map((u, idx) => (
                    <div 
                      key={u.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">{u.brand}</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                            {u.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-slate-700">
                            <MapPin size={13} className="text-slate-400" />
                            Lokasi: <span className="font-medium text-slate-800">{u.location}</span>
                          </span>
                          {u.last_service_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-slate-400" />
                              Servis Terakhir: {new Date(u.last_service_date).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.status === 'Normal' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : u.status === 'Perlu Servis'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {u.status || 'Normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Total: <span className="font-semibold text-slate-800">{customerUnits.length}</span> unit AC
              </span>
              <button 
                onClick={() => setSelectedCustomerForUnits(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
