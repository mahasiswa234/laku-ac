import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { COMPANY_INFO } from '../config/companyInfo';
import OfficeMap from '../components/OfficeMap';
import { WhatsAppIcon } from '../components/BrandIcons';

const SUBJECT_OPTIONS = ['Pertanyaan Umum', 'Komplain Layanan', 'Kerja Sama (B2B)', 'Lainnya'];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: SUBJECT_OPTIONS[0],
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsapp}`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const phoneDigits = formData.phone.replace(/\D/g, '');

    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'No. WhatsApp wajib diisi';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      newErrors.phone = 'No. WhatsApp harus berupa angka (10-15 digit)';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Pesan wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kirim pesan = buka WhatsApp admin dengan isi pesan yang sudah terisi otomatis.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const text = [
      `Halo ${COMPANY_INFO.name}, saya ingin mengirim pesan.`,
      '',
      `Nama: ${formData.name.trim()}`,
      `No. HP / WhatsApp: ${formData.phone.trim()}`,
      `Subjek: ${formData.subject}`,
      '',
      'Pesan:',
      formData.message.trim()
    ].join('\n');

    const url = `${whatsappUrl}?text=${encodeURIComponent(text)}`;
    const opened = window.open(url, '_blank');
    if (opened) {
      opened.opener = null;
    } else {
      // Pop-up diblokir browser -> buka di tab yang sama
      window.location.href = url;
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field]
        ? 'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30'
        : 'border-slate-200 dark:border-white/10'
    }`;

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">Hubungi Kami</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Tim layanan pelanggan kami siap membantu Anda. Jangan ragu untuk menghubungi Laku AC untuk konsultasi, pemesanan, atau pertanyaan lainnya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 flex items-start gap-4">
            <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Telepon & WhatsApp</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">Respon cepat untuk pemesanan dan keadaan darurat.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-bold text-lg hover:underline"
              >
                {COMPANY_INFO.phone}
              </a>
              <div className="mt-1">
                <a
                  href={`tel:+${COMPANY_INFO.whatsapp}`}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                >
                  <Phone size={14} aria-hidden="true" />
                  Telepon langsung
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Email</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">Kirimkan pertanyaan detail atau penawaran kerja sama.</p>
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">{COMPANY_INFO.email}</a>
            </div>
          </div>

          <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Kantor Pusat</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {COMPANY_INFO.address}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Jam Operasional</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Senin - Minggu<br />
                09.00 - 21.00 WIB
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Kirim Pesan</h2>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass('name')} placeholder="Masukkan nama Anda" />
              {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Handphone / WhatsApp</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass('phone')} placeholder="Contoh: 08123..." />
              {errors.phone && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subjek</label>
              <select name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black">
                {SUBJECT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Pesan Anda</label>
              <textarea rows={4} name="message" value={formData.message} onChange={handleChange} className={inputClass('message')} placeholder="Tuliskan detail pesan Anda di sini..."></textarea>
              {errors.message && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.message}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-4 flex items-center justify-center gap-2">
              <WhatsAppIcon size={20} />
              Kirim Pesan Sekarang
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Anda akan diarahkan ke WhatsApp {COMPANY_INFO.name} dengan pesan yang sudah terisi otomatis.
            </p>
          </form>
        </div>
      </div>

      {/* Peta Lokasi Kantor */}
      <div className="mt-12">
        <OfficeMap heightClass="h-80 sm:h-96" />
      </div>
    </div>
  );
}
