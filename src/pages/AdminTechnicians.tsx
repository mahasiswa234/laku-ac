import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminTechnicians() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', full_name: '', phone: '', skills: '', status: 'Aktif' });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/technicians');
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data);
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
      const url = isEdit ? `/api/technicians/${formData.id}` : '/api/technicians';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert(isEdit ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!');
        setIsModalOpen(false);
        fetchTechnicians();
      } else {
        throw new Error('Gagal menyimpan');
      }
    } catch (error) {
      alert('Gagal menyimpan data ke server database.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus teknisi ini?')) return;
    try {
      const res = await fetch(`/api/technicians/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Data berhasil dihapus');
        fetchTechnicians();
      } else {
        throw new Error('Gagal menghapus');
      }
    } catch (error) {
      alert('Gagal menghapus data dari server database.');
    }
  };

  const openEditModal = (tech: any) => {
    setFormData(tech);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({ id: '', full_name: '', phone: '', skills: '', status: 'Aktif' });
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const filtered = technicians.filter(t => 
    t.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Teknisi</h1>
          <p className="text-slate-600">Kelola data teknisi dan ketersediaan mereka.</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
          <Plus size={18} /> Tambah Teknisi
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
              placeholder="Cari nama teknisi..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">ID Teknisi</th>
                <th className="px-6 py-4 font-medium">Nama Teknisi</th>
                <th className="px-6 py-4 font-medium">Keahlian</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">Data tidak ditemukan</td></tr>
              ) : (
                filtered.map((tech, i) => (
                  <tr key={tech.id || i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-700">{tech.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <p>{tech.full_name}</p>
                      <p className="text-xs font-normal text-slate-500">{tech.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{tech.skills}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        tech.status === 'Aktif' ? 'bg-green-100 text-green-700' : 
                        tech.status === 'Sibuk' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tech.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(tech)} className="text-blue-500 hover:text-blue-700 p-1">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(tech.id)} className="text-red-500 hover:text-red-700 p-1">
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
              <h2 className="font-bold text-lg">{isEdit ? 'Edit Teknisi' : 'Tambah Teknisi'}</h2>
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
                <label className="block text-sm font-medium mb-1">No Telepon</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keahlian</label>
                <input type="text" placeholder="Cth: AC Split, Inverter" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="Aktif">Aktif</option>
                  <option value="Sibuk">Sibuk</option>
                  <option value="Libur">Libur</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
