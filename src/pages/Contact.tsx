import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-slate-800">Hubungi Kami</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Tim layanan pelanggan kami siap membantu Anda. Jangan ragu untuk menghubungi Laku AC untuk konsultasi, pemesanan, atau pertanyaan lainnya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Telepon & WhatsApp</h3>
              <p className="text-slate-600 mb-2">Respon cepat untuk pemesanan dan keadaan darurat.</p>
              <a href="#" className="text-blue-600 font-bold text-lg hover:underline">+62 812-3456-7890</a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Email</h3>
              <p className="text-slate-600 mb-2">Kirimkan pertanyaan detail atau penawaran kerja sama.</p>
              <a href="mailto:info@lakuac.com" className="text-blue-600 font-bold hover:underline">info@lakuac.com</a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Kantor Pusat</h3>
              <p className="text-slate-600 leading-relaxed">
                Jl. Sudirman No. 123, Kel. Senayan, Kec. Kebayoran Baru<br />
                Jakarta Selatan, 12190
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Jam Operasional</h3>
              <p className="text-slate-600">
                Senin - Minggu<br />
                09.00 - 21.00 WIB
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Kirim Pesan</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan nama Anda" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">No. Handphone / WhatsApp</label>
              <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 08123..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subjek</label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>Pertanyaan Umum</option>
                <option>Komplain Layanan</option>
                <option>Kerja Sama (B2B)</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pesan Anda</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tuliskan detail pesan Anda di sini..."></textarea>
            </div>
            <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-4">
              Kirim Pesan Sekarang
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
