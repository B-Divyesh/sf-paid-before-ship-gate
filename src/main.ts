import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './styles.css';
import { importOrders, importPayments, isReady, packListCsv } from './csv';
import { captureLicense, hasPaidAccess, saveLicense, verifyLicense } from './license';
import { sampleData } from './sample';
import { clearData, disableVault, enableVault, loadData, saveData, unlockVault, vaultIsOpen } from './storage';
import type { AppData, Filter, Order } from './types';
import { board, dialogShell, escapeHtml, footer, header, home, legalPage, notFound } from './ui';

const root = document.querySelector<HTMLDivElement>('#app')!;
let data: AppData = { orders: [], rules: [], history: [] };
let filter: Filter = 'all';
let demo = false;
let paid = false;
let locked = false;

function currentPath(): string { return location.pathname.replace(/\/+$/, '') || '/'; }

const titles: Record<string, string> = {
  '/': 'Paid Before Ship Gate — stop unpaid orders',
  '/demo': 'Demo — Paid Before Ship Gate',
  '/board': 'Order board — Paid Before Ship Gate',
  '/privacy': 'Privacy — Paid Before Ship Gate',
  '/terms': 'Terms — Paid Before Ship Gate'
};

function setMetadata(path: string): void {
  document.title = titles[path] ?? 'Page not found — Paid Before Ship Gate';
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `https://paid-before-ship-gate.sociobot.in${path}`;
}

async function persist(): Promise<void> {
  if (!demo) await saveData(data);
}

function render(focusHeading = false): void {
  const path = currentPath();
  demo = path === '/demo';
  setMetadata(path);
  document.body.dataset.vaultOpen = String(vaultIsOpen());
  if (path === '/') root.innerHTML = home();
  else if (path === '/demo') root.innerHTML = board(data, true, filter, true);
  else if (path === '/board') root.innerHTML = locked ? lockedPage() : board(data, false, filter, paid);
  else if (path === '/privacy') root.innerHTML = legalPage('privacy');
  else if (path === '/terms') root.innerHTML = legalPage('terms');
  else root.innerHTML = notFound();
  if (focusHeading) requestAnimationFrame(() => root.querySelector<HTMLElement>('h1')?.focus());
}

function lockedPage(): string {
  return `${header('board')}<main id="main" class="locked-page"><div class="lock-mark" aria-hidden="true">▰</div><p class="eyebrow">Encrypted on this device</p><h1 tabindex="-1">Open the order vault</h1><p>Enter the passphrase used when this workspace was encrypted.</p><form id="unlock-form" class="stack-form"><label for="unlock-password">Vault passphrase</label><input id="unlock-password" name="password" type="password" minlength="10" autocomplete="current-password" required><button class="button primary">Open the order vault</button><p id="unlock-error" class="field-error" aria-live="assertive"></p></form></main>${footer()}`;
}

async function navigate(path: string): Promise<void> {
  history.pushState({}, '', path);
  filter = 'all';
  if (path === '/demo') data = sampleData();
  if (path === '/board' && demo) await loadRealData();
  render(true); window.scrollTo(0, 0);
}

async function loadRealData(): Promise<void> {
  try { data = await loadData(); locked = false; }
  catch (error) { if ((error as Error).message === 'VAULT_LOCKED') locked = true; else throw error; }
}

function notice(message: string, error = false): void {
  const node = document.querySelector<HTMLElement>('#notice');
  if (!node) return;
  node.textContent = message; node.classList.toggle('error', error);
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvHelp(kind: 'orders' | 'payments'): string {
  return kind === 'orders'
    ? `<h2>Import order CSV</h2><p>Required columns: <code>order_number,total</code>. Optional: <code>customer,hold,date</code>.</p><p>You may omit customer names and other sensitive columns.</p>`
    : `<h2>Import payment CSV</h2><p>Required columns: <code>order_number,amount</code>. Extra columns are ignored.</p><p>Each amount is added to the matching order.</p>`;
}

async function readFile(input: HTMLInputElement, kind: 'orders' | 'payments' | 'backup'): Promise<void> {
  const file = input.files?.[0]; if (!file) return;
  try {
    const text = await file.text();
    if (kind === 'orders') { const result = importOrders(text, data); data = result.data; await persist(); render(); notice(`${result.count} orders imported.`); }
    else if (kind === 'payments') { const result = importPayments(text, data); data = result.data; await persist(); render(); notice(`${result.count} payments matched. Check the ready list.`); }
    else {
      const parsed = JSON.parse(text) as AppData;
      if (!Array.isArray(parsed.orders) || !Array.isArray(parsed.rules)) throw new Error('This backup does not contain an order workspace. Choose a backup exported by this app.');
      data = parsed; await persist(); render(); notice(`${data.orders.length} orders restored from backup.`);
    }
  } catch (error) { notice((error as Error).message, true); }
  input.value = '';
}

function orderDialog(): void {
  const dialog = dialogShell(`<form method="dialog" class="dialog-form" id="order-form"><div class="dialog-head"><h2>Add one order</h2><button class="icon-button" type="button" data-close aria-label="Close dialog">×</button></div><label>Order number<input name="orderNumber" required autocomplete="off"></label><label>Customer name <span>(optional)</span><input name="customer" autocomplete="organization"></label><label>Order total<input name="total" type="number" min="0" step="0.01" required inputmode="decimal"></label><label class="check-label"><input name="hold" type="checkbox" checked> Hold until fully paid</label><button class="button primary" value="default">Add order</button><p class="field-error" aria-live="assertive"></p></form>`);
  dialog.querySelector<HTMLInputElement>('input')?.focus();
  dialog.querySelector('form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement);
    const orderNumber = String(form.get('orderNumber') ?? '').trim(); const total = Number(form.get('total'));
    if (data.orders.some((order) => order.orderNumber.toLowerCase() === orderNumber.toLowerCase())) { dialog.querySelector('.field-error')!.textContent = 'That order number already exists. Use a different number.'; return; }
    const order: Order = { id: crypto.randomUUID(), orderNumber, customer: String(form.get('customer') ?? '').trim() || 'Redacted customer', total, paid: 0, hold: form.has('hold'), createdAt: new Date().toISOString().slice(0, 10) };
    data.orders.push(order); data.history.unshift(`Added ${orderNumber}`); await persist(); dialog.close(); dialog.remove(); render(); notice(`${orderNumber} added to the board.`);
  });
  dialog.addEventListener('close', () => dialog.remove());
}

function overrideDialog(order: Order): void {
  const dialog = dialogShell(`<form method="dialog" class="dialog-form" id="override-form"><div class="dialog-head"><h2>Clear ${escapeHtml(order.orderNumber)} with an override</h2><button class="icon-button" type="button" data-close aria-label="Close dialog">×</button></div><p>This puts the order on the pack list without full payment.</p><label>Your name<input name="name" required autocomplete="name"></label><label>Reason<textarea name="reason" required minlength="4" rows="3"></textarea></label><button class="button danger" value="default">Record override</button></form>`);
  dialog.querySelector<HTMLInputElement>('input')?.focus();
  dialog.querySelector('form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); order.override = { name: String(form.get('name')), reason: String(form.get('reason')), at: new Date().toISOString() }; data.history.unshift(`Override for ${order.orderNumber} by ${order.override.name}`); await persist(); dialog.close(); dialog.remove(); render(); notice(`${order.orderNumber} is ready with a named override.`); });
  dialog.addEventListener('close', () => dialog.remove());
}

function licenseDialog(): void {
  const dialog = dialogShell(`<form method="dialog" class="dialog-form"><div class="dialog-head"><h2>Restore the desk kit</h2><button class="icon-button" type="button" data-close aria-label="Close dialog">×</button></div><label>License token<input name="license" required autocomplete="off"></label><button class="button primary" value="default">Verify license</button><p class="field-error" aria-live="polite">Verification needs an internet connection.</p></form>`);
  dialog.querySelector<HTMLInputElement>('input')?.focus();
  dialog.querySelector('form')?.addEventListener('submit', async (event) => { event.preventDefault(); const token = String(new FormData(event.currentTarget as HTMLFormElement).get('license') ?? ''); saveLicense(token); paid = await verifyLicense(true); if (paid) { dialog.close(); dialog.remove(); render(); } else dialog.querySelector('.field-error')!.textContent = 'The license was not accepted. Check the token and try again.'; });
  dialog.addEventListener('close', () => dialog.remove());
}

function vaultDialog(): void {
  if (vaultIsOpen()) {
    const dialog = dialogShell(`<form method="dialog" class="dialog-form"><div class="dialog-head"><h2>Turn off device encryption?</h2><button class="icon-button" type="button" data-close aria-label="Close dialog">×</button></div><p>Your records will remain on this device without passphrase protection.</p><button class="button danger" value="default">Turn off encryption</button></form>`);
    dialog.querySelector('form')?.addEventListener('submit', async (event) => { event.preventDefault(); await disableVault(data); dialog.close(); dialog.remove(); document.body.dataset.vaultOpen = 'false'; render(); notice('Device encryption is off.'); });
    return;
  }
  const dialog = dialogShell(`<form method="dialog" class="dialog-form"><div class="dialog-head"><h2>Encrypt this workspace</h2><button class="icon-button" type="button" data-close aria-label="Close dialog">×</button></div><p>The passphrase cannot be recovered. Export a backup first.</p><label>New passphrase<input name="password" type="password" minlength="10" required autocomplete="new-password"></label><label>Repeat passphrase<input name="confirm" type="password" minlength="10" required autocomplete="new-password"></label><button class="button primary" value="default">Encrypt this device</button><p class="field-error" aria-live="assertive"></p></form>`);
  dialog.querySelector('form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const password = String(form.get('password')); if (password !== String(form.get('confirm'))) { dialog.querySelector('.field-error')!.textContent = 'The passphrases do not match. Enter them again.'; return; } try { await enableVault(password, data); dialog.close(); dialog.remove(); document.body.dataset.vaultOpen = 'true'; render(); notice('This workspace is encrypted on this device.'); } catch (error) { dialog.querySelector('.field-error')!.textContent = (error as Error).message; } });
}

root.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement;
  const link = target.closest<HTMLAnchorElement>('a[data-link]');
  if (link && link.origin === location.origin) { event.preventDefault(); await navigate(link.pathname + link.search + link.hash); return; }
  const button = target.closest<HTMLElement>('[data-action]'); if (!button) return;
  const action = button.dataset.action;
  if (action === 'show-license') licenseDialog();
  if (action === 'reset-demo') { data = sampleData(); filter = 'all'; render(); notice('Sample data reset.'); }
  if (action === 'leave-demo') { event.preventDefault(); await navigate('/board'); }
  if (action === 'import-orders') { document.querySelector<HTMLInputElement>('#orders-file')?.click(); }
  if (action === 'import-payments') { document.querySelector<HTMLInputElement>('#payments-file')?.click(); }
  if (action === 'add-order') orderDialog();
  if (action === 'export-pack') { const csv = packListCsv(data.orders); download(`pack-list-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv'); notice(`${data.orders.filter(isReady).length} ready orders exported.`); }
  if (action === 'export-backup') { download('paid-before-ship-gate-backup.json', JSON.stringify(data, null, 2), 'application/json'); notice('Workspace backup downloaded.'); }
  if (action === 'import-backup') document.querySelector<HTMLInputElement>('#backup-file')?.click();
  if (action === 'vault') vaultDialog();
  const row = button.closest<HTMLElement>('[data-order-id]'); const order = row ? data.orders.find((item) => item.id === row.dataset.orderId) : undefined;
  if (action === 'toggle-hold' && order) { order.hold = !order.hold; if (!order.hold) order.override = undefined; await persist(); render(); notice(`${order.orderNumber} ${order.hold ? 'now requires payment' : 'no longer has a payment hold'}.`); }
  if (action === 'override' && order) overrideDialog(order);
  if (action === 'save-rule' && order) { data.rules = data.rules.filter((rule) => rule.customer.toLowerCase() !== order.customer.toLowerCase()); data.rules.push({ customer: order.customer, hold: order.hold }); await persist(); notice(`Future ${order.customer} imports will ${order.hold ? 'require payment' : 'skip the payment hold'}.`); }
});

root.addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id === 'orders-file') await readFile(input, 'orders');
  if (input.id === 'payments-file') await readFile(input, 'payments');
  if (input.id === 'backup-file') await readFile(input, 'backup');
});

root.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
  if (!button) return; filter = button.dataset.filter as Filter; render();
});

root.addEventListener('submit', async (event) => {
  if ((event.target as HTMLFormElement).id !== 'unlock-form') return;
  event.preventDefault(); const form = new FormData(event.target as HTMLFormElement);
  try { data = await unlockVault(String(form.get('password'))); locked = false; render(true); }
  catch (error) { document.querySelector('#unlock-error')!.textContent = (error as Error).message; }
});

window.addEventListener('popstate', async () => { const path = currentPath(); if (path === '/demo') data = sampleData(); else if (path === '/board') await loadRealData(); render(true); });

function networkNotice(): void {
  let node = document.querySelector<HTMLElement>('.offline-note');
  if (!navigator.onLine && !node) { node = document.createElement('div'); node.className = 'offline-note'; node.textContent = 'Offline — saved work still works on this device'; document.body.append(node); }
  if (navigator.onLine) node?.remove();
}
window.addEventListener('online', networkNotice); window.addEventListener('offline', networkNotice);

async function start(): Promise<void> {
  captureLicense(); paid = hasPaidAccess(); void verifyLicense().then((valid) => { if (valid !== paid) { paid = valid; render(); } });
  demo = currentPath() === '/demo'; data = demo ? sampleData() : { orders: [], rules: [], history: [] };
  if (currentPath() === '/board') await loadRealData();
  render(); networkNotice();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { const toast = document.createElement('div'); toast.className = 'update-toast'; toast.innerHTML = '<span>An app update is ready.</span><button>Use update</button>'; toast.querySelector('button')?.addEventListener('click', () => location.reload()); document.body.append(toast); } }); });
  }).catch(() => undefined);
}

void start();
