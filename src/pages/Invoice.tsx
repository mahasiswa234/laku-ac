
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  MapPin,
  FileCheck2,
  ExternalLink,
  Phone
} from 'lucide-react';
import { COMPANY_INFO } from '../config/companyInfo.js';
import { showAlert } from '../utils/dialog.js';

interface ServiceInvoiceData {
  id: number;
  request_code: string;
  customer_id: number;
  customer: string;
  customer_phone?: string;
  customer_address?: string;
  service: string;
  service_id?: number;
  service_price: number;
  service_items?: Array<{
    service_id: number;
    name: string;
    price: number;
  }>;
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

// ---------------------------------------------------------------------------
// CSS PAKSA MODE TERANG
// Invoice SELALU terang (layar, cetak, PDF) walaupun aplikasi sedang mode gelap.
// ---------------------------------------------------------------------------
const INVOICE_LIGHT_CSS = `
.invoice-root,
.invoice-root * {
  color-scheme: light !important;
}

.invoice-root {
  --color-white: #ffffff;
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;

  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-200: #bfdbfe;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-800: #1e40af;
  --color-blue-900: #1e3a8a;

  --color-emerald-50: #ecfdf5;
  --color-emerald-100: #d1fae5;
  --color-emerald-200: #a7f3d0;
  --color-emerald-600: #059669;
  --color-emerald-700: #047857;
  --color-emerald-800: #065f46;
  --color-emerald-900: #064e3b;

  --color-amber-50: #fffbeb;
  --color-amber-100: #fef3c7;
  --color-amber-200: #fde68a;
  --color-amber-300: #fcd34d;
  --color-amber-500: #f59e0b;
  --color-amber-800: #92400e;
  --color-amber-900: #78350f;

  --color-rose-50: #fff1f2;
  --color-rose-100: #ffe4e6;
  --color-rose-200: #fecdd3;
  --color-rose-600: #e11d48;
  --color-rose-700: #be123c;

  --color-purple-100: #f3e8ff;
  --color-purple-800: #6b21a8;

  background-color: #f1f5f9 !important;
  color: #1e293b !important;
}

.invoice-root.invoice-root .invoice-paper,
.invoice-root.invoice-root .bg-white {
  background-color: #ffffff !important;
}

.invoice-root.invoice-root .bg-slate-50,
.invoice-root.invoice-root .bg-slate-50\\/50,
.invoice-root.invoice-root .bg-slate-50\\/60,
.invoice-root.invoice-root .bg-slate-50\\/70 {
  background-color: #f8fafc !important;
}

.invoice-root.invoice-root .bg-slate-100 {
  background-color: #f1f5f9 !important;
}

.invoice-root.invoice-root .bg-blue-50\\/20 {
  background-color: rgba(239, 246, 255, 0.2) !important;
}

.invoice-root.invoice-root .bg-blue-50\\/40 {
  background-color: rgba(239, 246, 255, 0.4) !important;
}

.invoice-root.invoice-root .bg-emerald-50 {
  background-color: #ecfdf5 !important;
}

.invoice-root.invoice-root .bg-emerald-100 {
  background-color: #d1fae5 !important;
}

.invoice-root.invoice-root .bg-emerald-600 {
  background-color: #059669 !important;
}

.invoice-root.invoice-root .bg-amber-50 {
  background-color: #fffbeb !important;
}

.invoice-root.invoice-root .bg-amber-200 {
  background-color: #fde68a !important;
}

.invoice-root.invoice-root .bg-amber-500 {
  background-color: #f59e0b !important;
}

.invoice-root.invoice-root .bg-rose-50 {
  background-color: #fff1f2 !important;
}

.invoice-root.invoice-root .bg-rose-100 {
  background-color: #ffe4e6 !important;
}

.invoice-root.invoice-root .bg-rose-600 {
  background-color: #e11d48 !important;
}

.invoice-root.invoice-root .bg-blue-100 {
  background-color: #dbeafe !important;
}

.invoice-root.invoice-root .bg-purple-100 {
  background-color: #f3e8ff !important;
}

.invoice-root.invoice-root table,
.invoice-root.invoice-root thead,
.invoice-root.invoice-root tbody,
.invoice-root.invoice-root tfoot,
.invoice-root.invoice-root tr,
.invoice-root.invoice-root th,
.invoice-root.invoice-root td {
  background-color: transparent;
}

.invoice-root.invoice-root thead tr.bg-slate-50 {
  background-color: #f8fafc !important;
}

.invoice-root.invoice-root tfoot {
  background-color: rgba(248, 250, 252, 0.5) !important;
}

.invoice-root.invoice-root tr.bg-blue-50\\/20 {
  background-color: rgba(239, 246, 255, 0.2) !important;
}

.invoice-root.invoice-root tr.bg-blue-50\\/40 {
  background-color: rgba(239, 246, 255, 0.4) !important;
}

.invoice-root.invoice-root .text-white {
  color: #ffffff !important;
}

.invoice-root.invoice-root .text-slate-300 {
  color: #cbd5e1 !important;
}

.invoice-root.invoice-root .text-slate-400 {
  color: #94a3b8 !important;
}

.invoice-root.invoice-root .text-slate-500 {
  color: #64748b !important;
}

.invoice-root.invoice-root .text-slate-600 {
  color: #475569 !important;
}

.invoice-root.invoice-root .text-slate-700 {
  color: #334155 !important;
}

.invoice-root.invoice-root .text-slate-800 {
  color: #1e293b !important;
}

.invoice-root.invoice-root .text-blue-700 {
  color: #1d4ed8 !important;
}

.invoice-root.invoice-root .text-blue-800 {
  color: #1e40af !important;
}

.invoice-root.invoice-root .text-blue-900 {
  color: #1e3a8a !important;
}

.invoice-root.invoice-root .text-emerald-700 {
  color: #047857 !important;
}

.invoice-root.invoice-root .text-emerald-800 {
  color: #065f46 !important;
}

.invoice-root.invoice-root .text-emerald-900 {
  color: #064e3b !important;
}

.invoice-root.invoice-root .text-amber-800 {
  color: #92400e !important;
}

.invoice-root.invoice-root .text-amber-900 {
  color: #78350f !important;
}

.invoice-root.invoice-root .text-rose-700 {
  color: #be123c !important;
}

.invoice-root.invoice-root .text-purple-800 {
  color: #6b21a8 !important;
}

.invoice-root.invoice-root strong {
  color: inherit;
}

.invoice-root.invoice-root .border-slate-100 {
  border-color: #f1f5f9 !important;
}

.invoice-root.invoice-root .border-slate-200,
.invoice-root.invoice-root .border-slate-200\\/80 {
  border-color: #e2e8f0 !important;
}

.invoice-root.invoice-root .border-slate-300 {
  border-color: #cbd5e1 !important;
}

.invoice-root.invoice-root .border-slate-400 {
  border-color: #94a3b8 !important;
}

.invoice-root.invoice-root .border-emerald-200 {
  border-color: #a7f3d0 !important;
}

.invoice-root.invoice-root .border-emerald-600 {
  border-color: #059669 !important;
}

.invoice-root.invoice-root .border-amber-300 {
  border-color: #fcd34d !important;
}

.invoice-root.invoice-root .border-rose-200 {
  border-color: #fecdd3 !important;
}

.invoice-root.invoice-root .divide-slate-100 > :not(:last-child) {
  border-color: #f1f5f9 !important;
}

.invoice-root.invoice-root img {
  filter: none !important;
  opacity: 1 !important;
}

@media print {
  .invoice-root,
  .invoice-root.invoice-root,
  .invoice-root.invoice-root .invoice-paper {
    background-color: #ffffff !important;
  }

  .invoice-root,
  .invoice-root * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

// ---------------------------------------------------------------------------
// HELPER NOMINAL
// ---------------------------------------------------------------------------

// Mengubah berbagai bentuk nominal menjadi angka rupiah.
// Contoh:
// 150000       -> 150000
// "150000"     -> 150000
// "Rp 150.000" -> 150000
// "Rp 150,000" -> 150000
// "150.000"    -> 150000
const parseRupiah = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  const text = String(value)
    .trim()
    .replace(/^Rp\s*/i, '')
    .replace(/\s/g, '');

  if (!text) {
    return 0;
  }

  const digitsOnly = text.replace(/[^\d]/g, '');

  if (!digitsOnly) {
    return 0;
  }

  const amount = Number(digitsOnly);

  return Number.isFinite(amount) ? amount : 0;
};

const formatRupiah = (value: unknown): string => {
  return parseRupiah(value).toLocaleString('id-ID');
};

export default function Invoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<ServiceInvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<
    'admin' | 'technician' | 'customer' | null
  >(null);

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return (
      new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
      })
        .format(date)
        .replace(/\./g, ':') + ' WIB'
    );
  };

  const formatDateOnly = (value?: string | null) => {
    if (!value) return '-';

    const date = new Date(
      value.includes('T') ? value : `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(date);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser
        ? JSON.parse(storedUser)
        : null;

      if (
        parsedUser?.role === 'admin' ||
        parsedUser?.role === 'technician' ||
        parsedUser?.role === 'customer'
      ) {
        setCurrentRole(parsedUser.role);
      }
    } catch {
      setCurrentRole(null);
    }

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
          throw new Error(
            'Data tagihan / pesanan servis tidak ditemukan'
          );
        }

        const data = await res.json();

        setInvoice(data);
      } catch (err: any) {
        console.error(
          'Gagal mengambil data invoice:',
          err
        );

        setErrorMessage(
          err.message ||
            'Gagal memuat rincian invoice.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  useEffect(() => {
    if (!invoice) return;

    const previousTitle = document.title;

    document.title = `Invoice-${invoice.request_code || invoice.id}`;

    return () => {
      document.title = previousTitle;
    };
  }, [invoice]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const hadDarkClassHtml =
      html.classList.contains('dark');

    const hadDarkClassBody =
      body.classList.contains('dark');

    const prevDataTheme =
      html.getAttribute('data-theme');

    const prevInlineScheme =
      html.style.colorScheme;

    html.classList.remove('dark');
    body.classList.remove('dark');

    if (prevDataTheme) {
      html.setAttribute('data-theme', 'light');
    }

    html.style.colorScheme = 'light';

    let meta = document.querySelector(
      'meta[name="color-scheme"]'
    ) as HTMLMetaElement | null;

    const createdMeta = !meta;

    const prevMeta =
      meta?.getAttribute('content') ?? null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', 'light');

    return () => {
      if (hadDarkClassHtml) {
        html.classList.add('dark');
      }

      if (hadDarkClassBody) {
        body.classList.add('dark');
      }

      if (prevDataTheme) {
        html.setAttribute(
          'data-theme',
          prevDataTheme
        );
      }

      html.style.colorScheme = prevInlineScheme;

      if (createdMeta) {
        meta?.remove();
      } else if (prevMeta !== null) {
        meta?.setAttribute(
          'content',
          prevMeta
        );
      }
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const openPaymentProof = (dataUrl: string) => {
    try {
      const [meta, b64] = dataUrl.split(',');

      const mime =
        /data:(.*?);base64/.exec(meta)?.[1] ||
        'image/jpeg';

      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);

      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }

      const blobUrl = URL.createObjectURL(
        new Blob([bytes], { type: mime })
      );

      window.open(
        blobUrl,
        '_blank',
        'noopener'
      );
    } catch {
      showAlert(
        'Gagal membuka gambar bukti transfer.'
      );
    }
  };

  if (isLoading) {
    return (
      <div
        className="invoice-root min-h-screen bg-slate-50 flex items-center justify-center p-4"
        style={{ colorScheme: 'light' }}
      >
        <style>{INVOICE_LIGHT_CSS}</style>

        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="text-sm font-semibold text-slate-600">
            Memuat rincian tagihan & status invoice...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !invoice) {
    return (
      <div
        className="invoice-root min-h-screen bg-slate-50 flex items-center justify-center p-4"
        style={{ colorScheme: 'light' }}
      >
        <style>{INVOICE_LIGHT_CSS}</style>

        <div
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Invoice Tidak Ditemukan
          </h2>

          <p className="text-sm text-slate-500">
            {errorMessage ||
              `Tagihan dengan kode atau ID "${id}" tidak terdaftar dalam sistem.`}
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

  // -------------------------------------------------------------------------
  // PERHITUNGAN KEUANGAN
  // -------------------------------------------------------------------------

  const basePrice = parseRupiah(
    invoice.service_price
  );

  const additionalCost = parseRupiah(
    invoice.additional_cost
  );

  // Jika backend sudah mengirim service_items,
  // gunakan masing-masing layanan.
  //
  // Jika service_items belum tersedia, coba membaca service
  // yang memiliki format:
  //
  // Service AC / Perbaikan (Rp 150,000),
  // Pengecekan AC (Rp 50,000)
  //
  // sehingga masing-masing layanan tetap menjadi baris sendiri.
  let serviceItems: Array<{
    service_id: number;
    name: string;
    price: number;
  }> = [];

  if (
    Array.isArray(invoice.service_items) &&
    invoice.service_items.length > 0
  ) {
    serviceItems = invoice.service_items.map(
      (item, index) => ({
        service_id:
          Number(item.service_id) || index,
        name: item.name,
        price: parseRupiah(item.price)
      })
    );
  } else {
    const serviceText = String(
      invoice.service || ''
    );

    const servicePattern =
      /(.+?)\s*\(\s*Rp\s*([\d.,]+)\s*\)/gi;

    let match: RegExpExecArray | null;
    let index = 0;

    while (
      (match = servicePattern.exec(serviceText)) !==
      null
    ) {
      const name = match[1].trim();
      const price = parseRupiah(match[2]);

      if (name) {
        serviceItems.push({
          service_id:
            invoice.service_id || index,
          name,
          price
        });
      }

      index++;
    }

    // Jika format service tidak mengandung harga,
    // tetap tampilkan satu layanan seperti data sebelumnya.
    if (serviceItems.length === 0) {
      serviceItems = [
        {
          service_id:
            invoice.service_id || 0,
          name:
            invoice.service ||
            'Layanan Servis AC',
          price: basePrice
        }
      ];
    }
  }

  // Subtotal HARUS dihitung dari harga masing-masing layanan.
  const serviceSubtotal =
    serviceItems.reduce(
      (total, item) =>
        total + parseRupiah(item.price),
      0
    );

  // Total invoice TIDAK mengambil payment_amount.
  // payment_amount adalah nominal pembayaran,
  // bukan sumber harga invoice.
  const totalAmount =
    serviceSubtotal + additionalCost;

  const isPaid =
    invoice.payment_status === 'Lunas';

  const isPendingVerification =
    invoice.payment_status ===
    'Menunggu Verifikasi';

  return (
    <div
      className="invoice-root min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-800 print:bg-white print:min-h-0 print:px-[14mm] print:py-[12mm]"
      style={{ colorScheme: 'light' }}
    >
      <style>{INVOICE_LIGHT_CSS}</style>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Navigation & Action Bar */}
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
        <div
          className="invoice-paper bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200/80 relative print:shadow-none print:border-none print:p-0 print:rounded-none"
          style={{
            backgroundColor: '#ffffff',
            colorScheme: 'light'
          }}
        >

          {/* Watermark Status LUNAS */}
          {isPaid && (
            <div className="absolute right-10 top-24 pointer-events-none select-none opacity-20 border-4 border-emerald-600 text-emerald-700 px-6 py-2 rounded-2xl rotate-[-12deg] font-black tracking-widest text-2xl uppercase print:opacity-30">
              LUNAS
            </div>
          )}

          {/* Header Tagihan */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-100 pb-8 gap-6">
            <div className="flex items-start gap-3.5">

              <div className="flex items-center justify-center w-14 h-14 shrink-0 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="LAKU AC"
                  className="h-14 w-auto object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-blue-900 tracking-tight">
                  {COMPANY_INFO.name}
                </h1>

                <p className="text-xs text-slate-500 font-medium">
                  {COMPANY_INFO.tagline}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  {COMPANY_INFO.address}
                </p>

                <p className="text-[11px] text-slate-400">
                  Telp/WA: {COMPANY_INFO.phone} | Email:{' '}
                  {COMPANY_INFO.email}
                </p>
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
                Tgl:{' '}
                {invoice.payment_date
                  ? formatDateTime(
                      invoice.payment_date
                    )
                  : formatDateOnly(invoice.date)}
              </p>
            </div>
          </div>

          {/* Informasi Pelanggan & Status Servis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 py-2">

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <User size={13} />
                Ditagihkan Kepada:
              </h3>

              <p className="font-bold text-slate-800 text-base">
                {invoice.customer}
              </p>

              {invoice.customer_phone && (
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <Phone
                    size={12}
                    className="text-slate-400"
                  />
                  {invoice.customer_phone}
                </p>
              )}

              {invoice.customer_address && (
                <p className="text-xs text-slate-600 mt-1 flex items-start gap-1">
                  <MapPin
                    size={12}
                    className="text-slate-400 shrink-0 mt-0.5"
                  />

                  <span>
                    {invoice.customer_address}
                  </span>
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
                <FileCheck2 size={13} />
                Detail Pengerjaan:
              </h3>

              <table className="text-xs w-full">
                <tbody className="divide-y divide-slate-100">

                  <tr>
                    <td className="py-1 text-slate-500">
                      Unit AC
                    </td>

                    <td className="py-1 font-semibold text-slate-800 text-right">
                      {invoice.ac_brand || 'AC'} (
                      {invoice.ac_type ||
                        'AC Split'}
                      )
                    </td>
                  </tr>

                  <tr>
                    <td className="py-1 text-slate-500">
                      Lokasi Unit
                    </td>

                    <td className="py-1 font-medium text-slate-700 text-right">
                      {invoice.ac_location ||
                        'Ruang Servis'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-1 text-slate-500">
                      Teknisi Bertugas
                    </td>

                    <td className="py-1 font-semibold text-slate-800 text-right">
                      {invoice.technician_name ||
                        'Belum ditugaskan'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-1 text-slate-500">
                      Jadwal Servis
                    </td>

                    <td className="py-1 font-medium text-slate-700 text-right">
                      {formatDateOnly(
                        invoice.date
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-1 text-slate-500">
                      Status Servis
                    </td>

                    <td className="py-1 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold inline-block ${
                          invoice.status ===
                          'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : invoice.status ===
                              'Diproses'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
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

                    <th className="py-3 px-4">
                      Deskripsi Layanan / Suku Cadang
                    </th>

                    <th className="py-3 px-4 text-center">
                      Qty
                    </th>

                    <th className="py-3 px-4 text-right">
                      Tarif Satuan
                    </th>

                    <th className="py-3 px-4 text-right">
                      Total
                    </th>

                  </tr>
                </thead>

                <tbody className="text-xs divide-y divide-slate-100">

                  {/* Setiap layanan menjadi baris sendiri */}
                  {serviceItems.map(
                    (item, index) => {

                      const itemPrice =
                        parseRupiah(
                          item.price
                        );

                      return (
                        <tr
                          key={`${item.service_id}-${index}`}
                        >
                          <td className="py-3.5 px-4">

                            <p className="font-bold text-slate-800 text-sm">
                              {item.name}
                            </p>

                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Layanan servis pada unit{' '}
                              {invoice.ac_brand ||
                                'AC'}{' '}
                              (
                              {invoice.ac_location ||
                                'Lokasi Terdaftar'}
                              )
                            </p>

                          </td>

                          <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                            1 unit
                          </td>

                          <td className="py-3.5 px-4 text-right text-slate-700">
                            Rp{' '}
                            {formatRupiah(
                              itemPrice
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                            Rp{' '}
                            {formatRupiah(
                              itemPrice
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}

                  {/* Item tambahan */}
                  {additionalCost > 0 && (
                    <tr className="bg-blue-50/20">

                      <td className="py-3.5 px-4">

                        <p className="font-bold text-slate-800">
                          {invoice.additional_cost_desc ||
                            'Suku Cadang / Penggantian Part / Tambah Freon'}
                        </p>

                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tindakan perbaikan tambahan oleh teknisi
                        </p>

                      </td>

                      <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                        1 paket
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-700">
                        Rp{' '}
                        {formatRupiah(
                          additionalCost
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        Rp{' '}
                        {formatRupiah(
                          additionalCost
                        )}
                      </td>

                    </tr>
                  )}

                </tbody>

                <tfoot className="bg-slate-50/50 text-xs border-t-2 border-slate-200">

                  <tr>
                    <td
                      colSpan={3}
                      className="py-2.5 px-4 text-right font-semibold text-slate-600"
                    >
                      Subtotal
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                      Rp{' '}
                      {formatRupiah(
                        serviceSubtotal +
                          additionalCost
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={3}
                      className="py-2.5 px-4 text-right font-semibold text-slate-600"
                    >
                      Biaya Transportasi Teknisi
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold text-emerald-700">
                      Gratis (Termasuk)
                    </td>
                  </tr>

                  <tr className="border-t border-slate-300 bg-blue-50/40">

                    <td
                      colSpan={3}
                      className="py-3.5 px-4 text-right font-black text-sm text-slate-800 uppercase tracking-wide"
                    >
                      TOTAL TAGIHAN
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-base text-blue-700">
                      Rp{' '}
                      {formatRupiah(
                        totalAmount
                      )}
                    </td>

                  </tr>

                </tfoot>

              </table>
            </div>
          </div>

          {/* Kotak Status Pembayaran & Validasi */}
          <div className="border border-slate-200 rounded-2xl p-5 mb-8 bg-slate-50/60">

            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard size={15} />
              Status & Validasi Pembayaran
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
                      Metode:{' '}
                      <strong className="text-slate-800">
                        {invoice.payment_method ||
                          'Tunai (Cash)'}
                      </strong>
                    </p>

                    {invoice.payment_date && (
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Waktu Pembayaran:{' '}
                        {formatDateTime(
                          invoice.payment_date
                        )}
                      </p>
                    )}

                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200 w-full sm:w-auto">

                  <div className="flex items-center sm:justify-end gap-1 text-emerald-800 text-xs font-bold">
                    <ShieldCheck size={16} />
                    Terverifikasi
                  </div>

                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Oleh:{' '}
                    {invoice.verified_by_admin ||
                      'Admin Keuangan'}
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
                      Bukti transfer bank telah
                      diunggah oleh pelanggan.
                      Admin sedang memverifikasi
                      mutasi rekening.
                    </p>

                    {invoice.payment_notes && (
                      <p className="text-[11px] text-amber-800 mt-1 italic">
                        Catatan Pengirim: "
                        {invoice.payment_notes}"
                      </p>
                    )}

                  </div>
                </div>

                {invoice.payment_proof_url && (
                  <button
                    type="button"
                    onClick={() =>
                      openPaymentProof(
                        invoice.payment_proof_url!
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink size={13} />
                    Lihat Bukti Transfer
                  </button>
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
                      BELUM DIBAYAR 
                    </span>

                    <p className="text-xs text-slate-600 mt-1">
                      Tagihan dapat dibayarkan secara{' '}
                      <strong>Tunai (Cash)</strong>{' '}
                      kepada teknisi di lokasi
                      saat servis selesai, atau
                      melalui{' '}
                      <strong>Transfer Bank</strong>{' '}
                      dengan mengunggah bukti
                      bayar di Dashboard Pelanggan.
                    </p>

                  </div>
                </div>

                {currentRole === 'customer' && (
                  <Link
                    to="/pelanggan/dashboard"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap print:hidden"
                  >
                    Upload Bukti Pembayaran
                  </Link>
                )}

              </div>
            )}

          </div>

          {/* Dokumentasi Teknisi */}
          {(invoice.before_photo_url ||
            invoice.after_photo_url ||
            invoice.technician_notes) && (

            <div className="border-t border-slate-200 pt-6 mb-8 print:break-inside-avoid">

              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Dokumentasi Hasil Pengerjaan Teknisi
              </h4>

              {invoice.technician_notes && (
                <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <strong>Catatan Teknisi:</strong>{' '}
                  {invoice.technician_notes}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">

                {invoice.before_photo_url && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">
                      Foto Sebelum Servis:
                    </p>

                    <img
                      src={invoice.before_photo_url}
                      alt="Sebelum Servis"
                      className="h-32 w-full object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}

                {invoice.after_photo_url && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">
                      Foto Setelah Servis:
                    </p>

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

          {/* Kolom Tanda Tangan */}
          <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-8 mt-10 text-center text-xs text-slate-600 print:break-inside-avoid">

            <div>
              <p className="text-slate-400 font-medium mb-16">
                Penerima Jasa (Pelanggan)
              </p>

              <div className="w-36 border-b border-slate-400 mx-auto"></div>

              <p className="font-bold text-slate-800 mt-1">
                {invoice.customer}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-medium mb-16">
                Teknisi 
              </p>

              <div className="w-36 border-b border-slate-400 mx-auto"></div>

              <p className="font-bold text-slate-800 mt-1">
                {invoice.technician_name ||
                  'Teknisi AC'}
              </p>
            </div>

          </div>

          {/* Footer Invoice */}
          <div className="text-center text-slate-500 text-[11px] border-t border-slate-200 pt-6 mt-10 space-y-1">

            <p className="font-semibold text-slate-700">
              Terima kasih telah menggunakan layanan Laku AC.
            </p>

            <p>
              Invoice ini diterbitkan secara digital
              oleh Laku AC.
            </p>

            <p>
              Dokumen ini merupakan bukti
              tagihan/pembayaran sesuai status yang
              tercantum.
            </p>

            <p className="text-[10px] text-slate-400">
              {COMPANY_INFO.email} |{' '}
              {COMPANY_INFO.phone}
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

