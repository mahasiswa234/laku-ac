import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crosshair, Loader2, MapPin, Navigation, CheckCircle2, AlertCircle, PhoneCall, ArrowRight, LocateOff } from 'lucide-react';
import { OFFICES } from '../config/companyInfo.js';
import { formatDistance, mapsDirectionsUrl, rankOffices, OfficeDistance } from '../utils/geo';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; lat: number; lng: number; accuracy: number; ranked: OfficeDistance[] }
  | { status: 'error'; message: string; canRetry: boolean };

function geoErrorMessage(err: GeolocationPositionError): { message: string; canRetry: boolean } {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return {
        message:
          'Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini (ikon gembok/pengaturan di kolom alamat browser), lalu coba lagi.',
        canRetry: true,
      };
    case err.POSITION_UNAVAILABLE:
      return { message: 'Posisi Anda tidak dapat ditentukan. Pastikan GPS/Layanan Lokasi perangkat aktif, lalu coba lagi.', canRetry: true };
    case err.TIMEOUT:
      return { message: 'Pencarian lokasi terlalu lama. Pindah ke tempat terbuka atau periksa sinyal, lalu coba lagi.', canRetry: true };
    default:
      return { message: 'Terjadi kesalahan saat membaca lokasi Anda.', canRetry: true };
  }
}

/**
 * Cek kantor terdekat memakai GPS perangkat (navigator.geolocation).
 * Posisi hanya dipakai di browser untuk menghitung jarak — tidak dikirim atau disimpan di server.
 * Dirancang untuk latar gelap (dipasang di kotak biru pada halaman Area Layanan).
 */
export default function NearestOfficeFinder({ onOrder }: { onOrder?: () => void }) {
  const [state, setState] = useState<State>({ status: 'idle' });

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', message: 'Browser Anda tidak mendukung fitur lokasi (GPS).', canRetry: false });
      return;
    }
    if (!window.isSecureContext) {
      setState({
        status: 'error',
        message: 'Fitur GPS hanya berjalan di alamat https:// atau localhost. Buka situs lewat alamat yang aman.',
        canRetry: false,
      });
      return;
    }

    setState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        setState({
          status: 'success',
          lat: latitude,
          lng: longitude,
          accuracy,
          ranked: rankOffices(latitude, longitude, OFFICES),
        });
      },
      err => setState({ status: 'error', ...geoErrorMessage(err) }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const nearest = state.status === 'success' ? state.ranked[0] : null;
  const withinRadius = nearest ? nearest.distanceKm <= nearest.office.serviceRadiusKm : false;

  return (
    <div className="text-left">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={locate}
          disabled={state.status === 'loading'}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          {state.status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
          {state.status === 'loading' ? 'Mencari lokasi Anda...' : state.status === 'success' ? 'Perbarui Lokasi Saya' : 'Gunakan Lokasi Saya (GPS)'}
        </button>
        <p className="text-[11px] text-blue-100 max-w-xs text-center sm:text-left">
          Browser akan meminta izin lokasi. Posisi Anda hanya dipakai untuk menghitung jarak dan tidak disimpan.
        </p>
      </div>

      {state.status === 'error' && (
        <div role="alert" className="mt-4 bg-rose-500/25 border border-rose-300/50 rounded-2xl p-4 flex items-start gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
            <LocateOff size={20} />
          </div>
          <div className="flex-1">
            <strong className="block text-rose-100 text-sm">Lokasi tidak dapat digunakan</strong>
            <p className="text-xs text-blue-50 mt-1 leading-relaxed">{state.message}</p>
            {state.canRetry && (
              <button onClick={locate} className="mt-2 text-xs font-bold text-white underline underline-offset-2 hover:text-blue-100">
                Coba lagi
              </button>
            )}
          </div>
        </div>
      )}

      {state.status === 'success' && nearest && (
        <div className="mt-4 space-y-3 toast-in" aria-live="polite">
          <div
            className={`rounded-2xl p-4 text-white border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              withinRadius ? 'bg-emerald-500/25 border-emerald-300/50' : 'bg-amber-500/25 border-amber-300/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${withinRadius ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {withinRadius ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-100">Kantor terdekat</span>
                <strong className={`block text-base font-bold ${withinRadius ? 'text-emerald-100' : 'text-amber-100'}`}>
                  {nearest.office.name}
                </strong>
                <p className="text-xs text-blue-50 mt-0.5">{nearest.office.address}</p>
                <p className="text-sm mt-2 font-semibold text-white inline-flex items-center gap-1.5">
                  <MapPin size={15} />
                  ± {formatDistance(nearest.distanceKm)} dari lokasi Anda
                  <span className="text-[11px] font-normal text-blue-100">(garis lurus)</span>
                </p>
                <p className="text-xs text-blue-50 mt-1.5 leading-relaxed">
                  {withinRadius
                    ? `Lokasi Anda berada dalam radius layanan reguler (${nearest.office.serviceRadiusKm} km) dari kantor ini.`
                    : `Lokasi Anda di luar radius layanan reguler (${nearest.office.serviceRadiusKm} km). Hubungi customer service untuk penjadwalan teknisi khusus.`}
                </p>
                {nearest.office.approximate && (
                  <p className="text-[11px] text-blue-100 mt-1">Jarak dihitung dari titik perkiraan area kantor.</p>
                )}
                {state.accuracy > 1500 && (
                  <p className="text-[11px] text-amber-100 mt-1">
                    Akurasi GPS rendah (± {formatDistance(state.accuracy / 1000)}). Aktifkan GPS atau pindah ke tempat terbuka untuk hasil lebih tepat.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
              <a
                href={mapsDirectionsUrl(nearest.office.address, { lat: state.lat, lng: state.lng })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-md transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Navigation size={14} /> Petunjuk Arah
              </a>
              {withinRadius ? (
                onOrder && (
                  <button
                    type="button"
                    onClick={onOrder}
                    className="px-5 py-2.5 rounded-xl bg-emerald-300 hover:bg-emerald-200 text-emerald-950 font-bold text-xs shadow-md transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    Pesan Teknisi Sekarang <ArrowRight size={14} />
                  </button>
                )
              ) : (
                <Link
                  to="/kontak"
                  className="px-5 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-amber-950 font-bold text-xs shadow-md transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <PhoneCall size={14} /> Hubungi Customer Service
                </Link>
              )}
            </div>
          </div>

          {state.ranked.length > 1 && (
            <ul className="bg-white/10 rounded-2xl divide-y divide-white/10 text-xs text-blue-50">
              {state.ranked.slice(1).map(r => (
                <li key={r.office.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{r.office.name}</span>
                  <span>± {formatDistance(r.distanceKm)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
