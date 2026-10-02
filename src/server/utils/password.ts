import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const PREFIX = 'scrypt$';

/**
 * Hash password memakai scrypt bawaan Node.js (tanpa dependency tambahan).
 * Format tersimpan: scrypt$<salt hex>$<hash hex>  (muat di kolom VARCHAR(255)).
 */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `${PREFIX}${salt.toString('hex')}$${hash.toString('hex')}`;
}

/**
 * Verifikasi password. Kompatibel dengan data lama:
 * - nilai berawalan "scrypt$"  -> dibandingkan sebagai hash
 * - selain itu (data lama)     -> dibandingkan sebagai teks biasa
 */
export function verifyPassword(plain: string, stored: string | null | undefined): boolean {
  if (!stored) return false;

  if (stored.startsWith(PREFIX)) {
    const parts = stored.split('$');
    if (parts.length !== 3) return false;
    try {
      const salt = Buffer.from(parts[1], 'hex');
      const expected = Buffer.from(parts[2], 'hex');
      const actual = scryptSync(plain, salt, expected.length);
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
      return false;
    }
  }

  return stored === plain;
}
