/**
 * Utilitas format tanggal.
 */

const DATE_ONLY_PARTS = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

function toJakartaYMD(date: Date): string {
  const parts = DATE_ONLY_PARTS.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Menampilkan tanggal dengan format YYYY-MM-DD, contoh: 2026-10-06.
 *
 * Menerima:
 *   - '2026-10-06'                      -> '2026-10-06' (apa adanya)
 *   - '2026-10-05T17:00:00.000Z'        -> '2026-10-06' (dikonversi ke zona waktu WIB)
 *   - '2026-10-06T00:00:00' (tanpa zona) -> '2026-10-06'
 *   - objek Date                         -> 'YYYY-MM-DD' (WIB)
 *   - kosong / null                      -> '-'
 *   - teks lain (mis. 'Hari ini')        -> dikembalikan apa adanya
 */
export function formatDateYMD(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '-' : toJakartaYMD(value);
  }

  const text = String(value).trim();
  const match = text.match(
    /^(\d{4}-\d{2}-\d{2})(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/
  );
  if (!match) return text;

  // Tanpa penanda zona waktu: tanggalnya sudah benar, cukup ambil bagian tanggalnya.
  if (!match[2]) return match[1];

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? match[1] : toJakartaYMD(parsed);
}
