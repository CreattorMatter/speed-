export type CacheEntry<T> = {
  v: string;
  updatedAt: number;
  expiresAt: number;
  fp?: string; // fingerprint por usuario (email|id)
  value: T;
};

export const RBAC_CACHE_VERSION = '3';

export function setCache<T>(key: string, value: T, ttlMs: number, fp?: string) {
  try {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      v: RBAC_CACHE_VERSION,
      updatedAt: now,
      expiresAt: now + Math.max(1000, ttlMs),
      fp,
      value,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    // ignore quota/JSON errors
    console.warn('cache:set error', e);
  }
}

export function getCache<T>(key: string, expectedFp?: string): { value: T | null; entry: CacheEntry<T> | null } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { value: null, entry: null };
    const entry = JSON.parse(raw) as CacheEntry<T>;
    const now = Date.now();
    if (!entry || typeof entry !== 'object') return { value: null, entry: null };
    if (entry.v !== RBAC_CACHE_VERSION) return { value: null, entry: null };
    if (expectedFp && entry.fp && entry.fp !== expectedFp) return { value: null, entry: null };
    if (entry.expiresAt && now > entry.expiresAt) return { value: null, entry: null };
    return { value: entry.value, entry };
  } catch (e) {
    console.warn('cache:get error', e);
    return { value: null, entry: null };
  }
}

export function clearCache(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function makeUserFingerprint(u?: { id?: string; email?: string | null }) {
  if (!u) return 'anon';
  return `${(u.email || '').toLowerCase()}|${u.id || ''}`;
}
