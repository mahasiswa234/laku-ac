import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react';
import { showAlert, showConfirm } from '../utils/dialog';

type Product = {
  id: number;
  product_code: string;
  name: string;
  category: 'indoor' | 'outdoor' | 'freon';
  brand: string;
  description?: string;
  price: number;
  image_url?: string | null;
  status: string;
};

const emptyForm = { id: '', product_code: '', name: '', category: 'indoor', brand: '', description: '', price: '', image_url: '', status: 'Aktif' };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat produk');
      setProducts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      showAlert(e.message || 'Gagal memuat produk.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    try {
      const res = await fetch(edit ? `/api/products/${form.id}` : '/api/products', {
        method: edit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan produk');
      showAlert(edit ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.');
      setOpen(false); setForm(emptyForm); setEdit(false); fetchProducts();
    } catch (e: any) { showAlert(e.message || 'Gagal menyimpan produk.'); }
  };

  const remove = async (id: number) => {
    if (!(await showConfirm('Produk akan dinonaktifkan dari katalog.', { variant: 'danger', title: 'Nonaktifkan Produk?' }))) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      if (!res.ok) throw new Error('Gagal menonaktifkan produk');
      fetchProducts();
    } catch (e: any) { showAlert(e.message || 'Gagal menonaktifkan produk.'); }
  };

  const openAdd = () => { setForm(emptyForm); setEdit(false); setOpen(true); };
  const openEdit = (p: Product) => { setForm({ ...p, price: String(p.price || '') }); setEdit(true); setOpen(true); };

  const categoryLabel = (c: string) => c === 'indoor' ? 'Unit Indoor' : c === 'outdoor' ? 'Unit Outdoor' : 'Freon';

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
      <div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Produk</h1><p className="text-slate-500 dark:text-slate-400">Kelola unit indoor, outdoor, dan freon yang tampil di katalog pelanggan.</p></div>
      <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold"><Plus size={18}/> Tambah Produk</button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {loading ? <div className="col-span-full py-12 text-center text-slate-500">Memuat produk...</div> : products.map(p => <div key={p.id} className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="h-44 bg-slate-50 dark:bg-black flex items-center justify-center p-4"><img src={p.image_url || `/products/${p.category === 'indoor' ? 'indoor-daikin' : p.category === 'outdoor' ? 'outdoor-daikin' : 'freon-r32'}.svg`} alt={`${p.brand} ${p.name}`} className="h-full w-full object-contain" /></div>
        <div className="p-5 space-y-2">
          <div className="flex justify-between gap-3"><span className="text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-blue-50 text-blue-700">{categoryLabel(p.category)}</span><span className="text-xs text-slate-400">{p.product_code}</span></div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">{p.brand} — {p.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 min-h-8">{p.description}</p>
          <p className="text-lg font-extrabold text-blue-600">Rp {Number(p.price).toLocaleString('id-ID')}</p>
          <div className="flex gap-2 pt-2"><button onClick={() => openEdit(p)} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-blue-600"><Edit2 size={15} className="inline mr-1"/> Edit</button><button onClick={() => remove(p.id)} className="px-3 py-2 rounded-lg border border-red-100 text-red-600"><Trash2 size={15}/></button></div>
        </div>
      </div>)}
    </div>

    {open && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white dark:bg-black rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between"><h2 className="font-bold">{edit ? 'Edit Produk' : 'Tambah Produk'}</h2><button onClick={() => setOpen(false)}><X size={20}/></button></div>
      <form onSubmit={submit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Kode Produk<input required value={form.product_code} onChange={e=>setForm({...form,product_code:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="IND-004"/></label><label className="text-sm font-medium">Kategori<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2"><option value="indoor">Unit Indoor</option><option value="outdoor">Unit Outdoor</option><option value="freon">Freon</option></select></label></div>
        <label className="text-sm font-medium block">Nama Produk<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Unit Indoor 1 PK"/></label>
        <label className="text-sm font-medium block">Merk<input required value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Daikin"/></label>
        <label className="text-sm font-medium block">Harga<input required min="0" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2"/></label>
        <label className="text-sm font-medium block">Gambar (URL atau data gambar)<input value={form.image_url || ''} onChange={e=>setForm({...form,image_url:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="https://... atau /products/...svg"/></label>
        <label className="text-sm font-medium block">Deskripsi<textarea value={form.description || ''} onChange={e=>setForm({...form,description:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" rows={3}/></label>
        <div className="flex justify-end gap-2"><button type="button" onClick={()=>setOpen(false)} className="px-4 py-2 rounded-lg border">Batal</button><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Simpan</button></div>
      </form>
    </div></div>}
  </div>;
}
