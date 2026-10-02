import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { COMPANY_INFO } from '../config/companyInfo.js';
import { mapsDirectionsUrl, mapsSearchUrl } from '../utils/geo.js';

/**
 * Peta lokasi kantor (Google Maps embed — tanpa API key).
 * Titik pin ditentukan Google dari alamat COMPANY_INFO.mapQuery.
 */
export default function OfficeMap({ heightClass = 'h-72 sm:h-80', showHeader = true }: { heightClass?: string; showHeader?: boolean }) {
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(COMPANY_INFO.mapQuery)}&z=16&output=embed`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {showHeader && (
        <div className="p-5 flex items-start gap-3 border-b border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white">Lokasi {COMPANY_INFO.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{COMPANY_INFO.address}</p>
          </div>
        </div>
      )}

      <iframe
        title={`Peta lokasi ${COMPANY_INFO.name}`}
        src={embedUrl}
        className={`w-full ${heightClass} border-0 block bg-slate-100 dark:bg-slate-800`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />

      <div className="p-4 flex flex-col sm:flex-row gap-2.5 border-t border-slate-200 dark:border-slate-700">
        <a
          href={mapsDirectionsUrl(COMPANY_INFO.mapQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
        >
          <Navigation size={16} /> Petunjuk Arah
        </a>
        <a
          href={mapsSearchUrl(COMPANY_INFO.mapQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
        >
          <ExternalLink size={16} /> Buka di Google Maps
        </a>
      </div>
    </div>
  );
}
