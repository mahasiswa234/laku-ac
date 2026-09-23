import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  CreditCard,
  User,
  MapPin,
  Phone,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface ServiceInvoiceData {
  id: number;
  request_code: string;
  customer_id: number;
  customer: string;
  customer_phone?: string;
  customer_address?: string;
  service: string;
  service_price: number;
  date: string;
  status: string;
  ac_brand?: string;
  ac_type?: string;
  ac_location?: string;
  customer_notes?: string;
  technician_name?: string;
  technician_phone?: string;
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
  verified_by_admin?: string | number;
  additional_cost?: number;
  additional_cost_desc?: string;
}

export default function Invoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<ServiceInvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErrorMessage('Kode tagihan atau pesanan tidak valid.');
      setIsLoading(false);
      return;
    }

    const fetchInvoiceData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/requests/${id}`);
        if (!res.ok) {
          throw new Error('Data tagihan / pesanan servis tidak ditemukan');
        }
        const data = await res.json();
        setInvoice(data);
      } catch (err: any) {
        console.error('Gagal mengambil data invoice:', err);
        setErrorMessage(err.message || 'Gagal memuat rincian invoice.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Memuat rincian tagihan & status invoice...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Invoice Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">
            {errorMessage || `Tagihan dengan kode atau ID "${id}" tidak terdaftar dalam sistem.`}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Kembali
            </button>
            <Link
              to="/pelanggan/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Dashboard Pelanggan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Perhitungan Keuangan
  const basePrice = Number(invoice.service_price || 75000);
  const additionalCost = Number(invoice.additional_cost || 0);
  const totalAmount = Number(invoice.payment_amount || (basePrice + additionalCost));
  const isPaid = invoice.payment_status === 'Lunas';
  const isPendingVerification = invoice.payment_status === 'Menunggu Verifikasi';

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 font-sans text-slate-800 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation & Action Bar (Hidden on Print) */}
        <div className="flex flex-wrap justify-between items-center gap-3 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Printer size={16} />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* Paper Invoice Container */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200/80 relative print:shadow-none print:border-none print:p-0 print:rounded-none">
          
          {/* Watermark Status LUNAS jika sudah dibayar */}
          {isPaid && (
            <div className="absolute right-10 top-24 pointer-events-none select-none opacity-20 border-4 border-emerald-600 text-emerald-700 px-6 py-2 rounded-2xl rotate-[-12deg] font-black tracking-widest text-2xl uppercase print:opacity-30">
              LUNAS / PAID
            </div>
          )}

          {/* Header Tagihan */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-100 pb-8 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-xs shrink-0">
                <Wrench size={26} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-blue-900 tracking-tight">[NAMA_PERUSAHAAN]</h1>
                <p className="text-xs text-slate-500 font-medium">Sistem Informasi Servis & Pemeliharaan AC</p>
                <p className="text-[11px] text-slate-400 mt-1">[ALAMAT_PERUSAHAAN]</p>
                <p className="text-[11px] text-slate-400">Telp/WA: [NOMOR_TELEPON] | Email: [EMAIL]</p>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-300 uppercase tracking-widest leading-none mb-2">
                INVOICE
              </h2>
              <p className="font-mono font-bold text-blue-700 text-base">
                INV-{invoice.request_code || invoice.id}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center sm:justify-end gap-1">
                <Calendar size={13} />
                Tgl: {invoice.payment_date || invoice.date || 'Sesuai Jadwal'}
              </p>
            </div>
          </div>

          {/* Informasi Pelanggan & Status Servis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 py-2">
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <User size={13} /> Ditagihkan Kepada:
              </h3>
              <p className="font-bold text-slate-800 text-base">{invoice.customer}</p>
              {invoice.customer_phone && (
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" /> {invoice.customer_phone}
                </p>
              )}
              {invoice.customer_address && (
                <p className="text-xs text-slate-600 mt-1 flex items-start gap-1">
                  <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" /> 
                  <span>{invoice.customer_address}</span>
                </p>
              )}
              {invoice.customer_notes && (
                <p className="text-[11px] italic text-slate-500 mt-2 bg-white p-2 rounded-lg border border-slate-200">
                  Catatan: "{invoice.customer_notes}"
                </p>
              )}
            </div>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FileCheck2 size={13} /> Detail Pengerjaan:
              </h3>
              <table className="text-xs w-full">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1 text-slate-500">Unit AC</td>
                    <td className="py-1 font-semibold text-slate-800 text-right">
                      {invoice.ac_brand || 'AC'} ({invoice.ac_type || 'AC Split'})
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500">Lokasi Unit</td>
                    <td className="py-1 font-medium text-slate-700 text-right">
                      {invoice.ac_location || 'Ruang Servis'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500">Teknisi Bertugas</td>
                    <td className="py-1 font-semibold text-slate-800 text-right">
                      {invoice.technician_name || 'Belum ditugaskan'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500">Jadwal Servis</td>
                    <td className="py-1 font-medium text-slate-700 text-right">
                      {invoice.date}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500">Status Servis</td>
                    <td className="py-1 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold inline-block ${
                        invoice.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                        invoice.status === 'Diproses' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rincian Tagihan Layanan & Biaya Tambahan */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Rincian Layanan & Sparepart
            </h3>
            
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Deskripsi Layanan / Suku Cadang</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Tarif Satuan</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {/* Item 1: Jasa Pokok */}
                  <tr>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 text-sm">{invoice.service}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Layanan servis pada unit {invoice.ac_brand || 'AC'} ({invoice.ac_location || 'Lokasi Terdaftar'})
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">1 unit</td>
                    <td className="py-3.5 px-4 text-right text-slate-700">
                      Rp {basePrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      Rp {basePrice.toLocaleString('id-ID')}
                    </td>
                  </tr>

                  {/* Item 2: Biaya Tambahan / Sparepart jika ada */}
                  {additionalCost > 0 && (
                    <tr className="bg-blue-50/20">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">
                          {invoice.additional_cost_desc || 'Suku Cadang / Penggantian Part / Tambah Freon'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tindakan perbaikan tambahan oleh teknisi
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-700">1 paket</td>
                      <td className="py-3.5 px-4 text-right text-slate-700">
                        Rp {additionalCost.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        Rp {additionalCost.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Subtotal & Total */}
                <tfoot className="bg-slate-50/50 text-xs border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 text-right font-semibold text-slate-600">
                      Subtotal
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                      Rp {(basePrice + additionalCost).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 text-right font-semibold text-slate-600">
                      Biaya Transportasi Teknisi
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-emerald-700">
                      Gratis (Termasuk)
                    </td>
                  </tr>
                  <tr className="border-t border-slate-300 bg-blue-50/40">
                    <td colSpan={3} className="py-3.5 px-4 text-right font-black text-sm text-slate-800 uppercase tracking-wide">
                      TOTAL TAGIHAN
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-base text-blue-700">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Kotak Status Pembayaran & Validasi */}
          <div className="border border-slate-200 rounded-2xl p-5 mb-8 bg-slate-50/60">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard size={15} /> Status & Validasi Pembayaran
            </h4>

            {isPaid ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white rounded-md text-xs font-bold uppercase tracking-wider">
                      LUNAS
                    </span>
                    <p className="text-xs text-emerald-900 mt-1 font-medium">
                      Metode: <strong className="text-slate-800">{invoice.payment_method || 'Tunai (Cash)'}</strong>
                    </p>
                    {invoice.payment_date && (
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Waktu Pembayaran: {invoice.payment_date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200 w-full sm:w-auto">
                  <div className="flex items-center sm:justify-end gap-1 text-emerald-800 text-xs font-bold">
                    <ShieldCheck size={16} /> Terverifikasi
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Oleh: {invoice.verified_by_admin || 'Admin Keuangan'}
                  </p>
                </div>
              </div>
            ) : isPendingVerification ? (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-amber-500 text-white rounded-md text-xs font-bold uppercase tracking-wider">
                      MENUNGGU VERIFIKASI ADMIN
                    </span>
                    <p className="text-xs text-amber-900 mt-1">
                      Bukti transfer bank telah diunggah oleh pelanggan. Admin sedang memverifikasi mutasi rekening.
                    </p>
                    {invoice.payment_notes && (
                      <p className="text-[11px] text-amber-800 mt-1 italic">
                        Catatan Pengirim: "{invoice.payment_notes}"
                      </p>
                    )}
                  </div>
                </div>

                {invoice.payment_proof_url && (
                  <a
                    href={invoice.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink size={13} /> Lihat Bukti Transfer
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-rose-600 text-white rounded-md text-xs font-bold uppercase tracking-wider">
                      BELUM DIBAYAR (UNPAID)
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Tagihan dapat dibayarkan secara <strong>Tunai (Cash)</strong> kepada teknisi di lokasi saat servis selesai, atau melalui <strong>Transfer Bank</strong> dengan mengunggah bukti bayar di Dashboard Pelanggan.
                    </p>
                  </div>
                </div>

                <Link
                  to="/pelanggan/dashboard"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap print:hidden"
                >
                  Bayar / Upload Struk
                </Link>
              </div>
            )}
          </div>

          {/* Dokumentasi Teknisi (Jika Ada Foto Sebelum/Sesudah) */}
          {(invoice.before_photo_url || invoice.after_photo_url || invoice.technician_notes) && (
            <div className="border-t border-slate-200 pt-6 mb-8 print:break-inside-avoid">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Dokumentasi Hasil Pengerjaan Teknisi
              </h4>

              {invoice.technician_notes && (
                <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <strong>Catatan Teknisi:</strong> {invoice.technician_notes}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {invoice.before_photo_url && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Foto Sebelum Servis:</p>
                    <img 
                      src={invoice.before_photo_url} 
                      alt="Sebelum Servis" 
                      className="h-32 w-full object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
                {invoice.after_photo_url && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Foto Setelah Servis:</p>
                    <img 
                      src={invoice.after_photo_url} 
                      alt="Setelah Servis" 
                      className="h-32 w-full object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kolom Tanda Tangan / Cap Validasi (Print Friendly) */}
          <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-8 mt-10 text-center text-xs text-slate-600 print:break-inside-avoid">
            <div>
              <p className="text-slate-400 font-medium mb-16">Penerima Jasa (Pelanggan)</p>
              <div className="w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold text-slate-800 mt-1">{invoice.customer}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-16">Teknisi / Petugas Servis</p>
              <div className="w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold text-slate-800 mt-1">{invoice.technician_name || 'Teknisi AC'}</p>
            </div>
          </div>

          {/* Footer Invoice */}
          <div className="text-center text-slate-400 text-[11px] border-t border-slate-100 pt-8 mt-12 space-y-1">
            <p>Terima kasih atas kepercayaan Anda menggunakan layanan jasa kami.</p>
            <p>Invoice ini sah dan diterbitkan secara digital oleh sistem manajemen servis AC.</p>
            <p className="text-[10px] text-slate-400">
              Pertanyaan & Bantuan: Email [EMAIL] | WhatsApp [NOMOR_TELEPON]
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
