import { validateBackup } from './backup';
import type { AppData } from './types';

const DB_NAME = 'paid-before-ship-gate';
const STORE = 'workspace';
const EMPTY: AppData = { orders: [], rules: [], history: [] };
type EncryptedRecord = { encrypted: true; salt: string; iv: string; data: string };
let activeKey: CryptoKey | null = null;
let activeSalt: Uint8Array<ArrayBuffer> | null = null;

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250_000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadData(): Promise<AppData> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE).objectStore(STORE).get('data');
    request.onsuccess = () => {
      const value = request.result as AppData | EncryptedRecord | undefined;
      if (value && 'encrypted' in value) reject(new Error('VAULT_LOCKED'));
      else {
        try { resolve(value ? validateBackup(value) : structuredClone(EMPTY)); }
        catch { reject(new Error('WORKSPACE_CORRUPT')); }
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveData(data: AppData): Promise<void> {
  const database = await db();
  let stored: AppData | EncryptedRecord = data;
  if (activeKey && activeSalt) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, activeKey, new TextEncoder().encode(JSON.stringify(data)));
    stored = { encrypted: true, salt: bytesToBase64(activeSalt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(encrypted)) };
  }
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(stored, 'data');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function readRaw(): Promise<AppData | EncryptedRecord | undefined> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE).objectStore(STORE).get('data');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function unlockVault(password: string): Promise<AppData> {
  const stored = await readRaw();
  if (!stored || !('encrypted' in stored)) return structuredClone(EMPTY);
  try {
    const salt = base64ToBytes(stored.salt);
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(stored.iv) }, key, base64ToBytes(stored.data));
    activeKey = key; activeSalt = salt;
    return validateBackup(JSON.parse(new TextDecoder().decode(decrypted)));
  } catch {
    throw new Error('That passphrase did not open this vault. Check it and try again.');
  }
}

export async function enableVault(password: string, data: AppData): Promise<void> {
  if (password.length < 10) throw new Error('Use at least 10 characters for the passphrase.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  activeKey = await deriveKey(password, salt); activeSalt = salt;
  await saveData(data);
}

export async function disableVault(data: AppData): Promise<void> {
  activeKey = null; activeSalt = null;
  await saveData(data);
}

export const vaultIsOpen = () => Boolean(activeKey);

export async function clearData(): Promise<void> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete('data');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
