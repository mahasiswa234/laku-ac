import type { OfficeLocation } from '../config/companyInfo.js';

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Jarak garis lurus (km) antara dua titik koordinat — rumus Haversine. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export interface OfficeDistance {
  office: OfficeLocation;
  distanceKm: number;
}

/** Urutkan semua kantor dari yang terdekat ke posisi pengguna. */
export function rankOffices(lat: number, lng: number, offices: OfficeLocation[]): OfficeDistance[] {
  return offices
    .map(office => ({ office, distanceKm: haversineKm(lat, lng, office.lat, office.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`;
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsDirectionsUrl(destination: string, origin?: { lat: number; lng: number }): string {
  const base = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  return origin ? `${base}&origin=${origin.lat},${origin.lng}` : base;
}
