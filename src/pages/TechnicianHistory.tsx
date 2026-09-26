import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, RefreshCw, Star, Image, X, FileText } from 'lucide-react';

export default function TechnicianHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<any>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/requests?status=Selesai');
      if (res.ok) {
        const json = await res.json();
        const items = (json.data || []).map((item: any) => ({
          id: item.request_code || `REQ-${item.id}`,
          customer: item.customer || 'Pelanggan',
          service: item.service || 'Service AC',
          address: item.customer_address || '-',
          date: item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : 'Selesai'),
          status: 'Selesai',
          rating: item.rating || 5,
          unit: item.ac_brand ? `${item.ac_brand} (${item.ac_location || 'Unit'})` : '',
          before_photo: item.before_photo_url,
          after_photo: item.after_photo_url,
          notes: item.technician_notes
        }));
        setHistory(items);
      }
    } catch (err) {
      console.error('Failed to load technician history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Riwayat Pekerjaan Selesai</h1>
          <p className="text-slate-600 dark:text-slate-400">Daftar pekerjaan servis yang telah diselesaikan beserta dokumentasi hasil.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500 dark:text-blue-400" />
            <p>Memuat riwayat servis...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <CheckCircle size={36} className="mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada riwayat pekerjaan yang selesai</p>
            <p className="text-xs text-slate-400">Pekerjaan yang diselesaikan di tab Jadwal akan otomatis tampil di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">ID Pesanan</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Layanan & Unit</th>
                  <th className="px-6 py-4">Dokumentasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-950 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{item.id}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{item.customer}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{item.service}</p>
                      {item.unit && <p className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {item.before_photo || item.after_photo ? (
                        <button
                          onClick={() => setSelectedPhotoModal(item)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium transition-colors border border-blue-100 dark:border-blue-800"
                        >
                          <Image size={14} />
                          Lihat Foto
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tanpa foto</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max">
                        <CheckCircle size={13} /> {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={14} className={idx < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Dokumentasi Foto */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Dokumentasi Hasil Kerja Teknisi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPhotoModal.id} - {selectedPhotoModal.customer}</p>
              </div>
              <button 
                onClick={() => setSelectedPhotoModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {selectedPhotoModal.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Catatan Tindakan Teknisi:</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{selectedPhotoModal.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Foto Sebelum Pengerjaan:</p>
                  {selectedPhotoModal.before_photo ? (
                    <img 
                      src={selectedPhotoModal.before_photo} 
                      alt="Sebelum" 
                      className="w-full h-52 object-cover rounded-xl border border-slate-200 dark:border-slate-800" 
                    />
                  ) : (
                    <div className="w-full h-52 bg-slate-100 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                      Tidak ada foto awal
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Foto Sesudah Selesai:</p>
                  {selectedPhotoModal.after_photo ? (
                    <img 
                      src={selectedPhotoModal.after_photo} 
                      alt="Sesudah" 
                      className="w-full h-52 object-cover rounded-xl border border-emerald-200 dark:border-emerald-800" 
                    />
                  ) : (
                    <div className="w-full h-52 bg-slate-100 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                      Tidak ada foto akhir
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedPhotoModal(null)}
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
