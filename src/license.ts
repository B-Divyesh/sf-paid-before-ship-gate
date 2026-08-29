const SLUG = 'paid-before-ship-gate';
const KEY = `sb_license:${SLUG}`;
const CACHE = `${KEY}:verdict`;
const API = 'https://api.sociobot.in/api/v1';

type Verdict = { valid: boolean; checkedAt: number };

export function captureLicense(): string | null {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return null;
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return token.trim() || null;
}

export function hasPaidAccess(): boolean {
  const verdict = JSON.parse(localStorage.getItem(CACHE) ?? 'null') as Verdict | null;
  return Boolean(localStorage.getItem(KEY) && verdict?.valid);
}

function saveLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.setItem(CACHE, JSON.stringify({ valid: true, checkedAt: Date.now() }));
}

export function hasSavedLicense(): boolean { return Boolean(localStorage.getItem(KEY)); }

export function removeLicense(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(CACHE);
}

async function checkToken(token: string): Promise<boolean> {
  const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('verify failed');
  const result = await response.json() as { valid: boolean };
  return result.valid;
}

export async function verifyAndSaveLicense(token: string): Promise<boolean> {
  const candidate = token.trim();
  if (!candidate) return false;
  try {
    const valid = await checkToken(candidate);
    if (valid) saveLicense(candidate);
    return valid;
  } catch {
    return false;
  }
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  const cached = JSON.parse(localStorage.getItem(CACHE) ?? 'null') as Verdict | null;
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  try {
    const valid = await checkToken(token);
    localStorage.setItem(CACHE, JSON.stringify({ valid, checkedAt: Date.now() }));
    return valid;
  } catch {
    return cached?.valid ?? false;
  }
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;
