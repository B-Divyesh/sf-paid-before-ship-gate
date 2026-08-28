const SLUG = 'paid-before-ship-gate';
const KEY = `sb_license:${SLUG}`;
const CACHE = `${KEY}:verdict`;
const API = 'https://api.sociobot.in/api/v1';

type Verdict = { valid: boolean; checkedAt: number };

export function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(KEY, token);
  localStorage.removeItem(CACHE);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function hasPaidAccess(): boolean {
  const verdict = JSON.parse(localStorage.getItem(CACHE) ?? 'null') as Verdict | null;
  return Boolean(localStorage.getItem(KEY) && verdict?.valid);
}

export function saveLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.setItem(CACHE, JSON.stringify({ valid: true, checkedAt: 0 }));
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  const cached = JSON.parse(localStorage.getItem(CACHE) ?? 'null') as Verdict | null;
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verify failed');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(CACHE, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return result.valid;
  } catch {
    return cached?.valid ?? false;
  }
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;
