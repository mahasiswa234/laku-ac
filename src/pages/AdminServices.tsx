import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', service_code: '', name: '', category: '', base_price: '', status: 'Aktif' });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.data ? data.data : data);
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      console.error('Database connection failed');
      alert('Gagal memuat data dari server database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEdit ? `/api/services/${formData.id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert(isEdit ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!');
        setIsModalOpen(false);
        fetchServices();
      } else {
        throw new Error('Gagal menyimpan');
      }
    } catch (error) {
      alert('Gagal menyimpan data ke server database.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus layanan ini?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Data berhasil dihapus');
        fetchServices();
      } else {
        throw new Error('Gagal menghapus');
      }
    } catch (error) {
      alert('Gagal menghapus data dari server database.');
    }
  };

  const openEditModal = (svc: any) => {
    setFormData(svc);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({ id: '', service_code: '', name: '', category: '', base_price: '', status: 'Aktif' });
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const filtered = services.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Layanan & Harga</h1>
          <p className="text-slate-600 dark:text-slate-400">Kelola daftar layanan servis AC beserta harga dasarnya.</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
          <Plus size={18} /> Tambah Layanan
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari layanan..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium">Kode</th>
                <th className="px-6 py-4 font-medium">Nama Layanan</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Harga Dasar</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">Data tidak ditemukan</td></tr>
              ) : (
                filtered.map((svc, i) => (
                  <tr key={svc.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{svc.service_code}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{svc.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full text-xs">{svc.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Rp {Number(svc.base_price).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(svc)} className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(svc.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1">
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
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">{isEdit ? 'Edit Layanan' : 'Tambah Layanan'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kode Layanan</label>
                <input required type="text" value={formData.service_code} onChange={e => setFormData({...formData, service_code: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Cth: SVC-001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama Layanan</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Perawatan">Perawatan</option>
                  <option value="Perbaikan">Perbaikan</option>
                  <option value="Instalasi">Instalasi</option>
                  <option value="Pemeriksaan">Pemeriksaan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Harga Dasar (Rp)</label>
                <input required type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
