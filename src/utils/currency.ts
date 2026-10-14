/**
 * Format rupiah tanpa desimal, pemisah ribuan titik. Contoh: 75000 / "75000.00" -> "Rp 75.000"
 */
export function formatRupiah(value: unknown): string {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  return `Rp ${Math.round(safe).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
}
