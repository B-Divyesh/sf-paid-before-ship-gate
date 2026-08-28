import { expect, test } from '@playwright/test';

const csv = (name: string, content: string) => ({ name, mimeType: 'text/csv', buffer: Buffer.from(content) });
const json = (name: string, content: unknown) => ({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(content)) });

async function downloadedText(page: import('@playwright/test').Page, button: string): Promise<string> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: button }).click();
  const stream = await (await pending).createReadStream();
  return Buffer.concat(await stream!.toArray()).toString();
}

test('@claim:demo-sandbox keeps an existing real record isolated from sample changes', async ({ page }) => {
  await page.goto('/board');
  await page.getByRole('button', { name: 'Add one order' }).click();
  await page.getByLabel('Order number').fill('REAL-9001');
  await page.getByLabel('Order total').fill('91');
  await page.getByRole('button', { name: 'Add order' }).click();
  await page.getByRole('link', { name: 'Demo' }).click();
  await page.getByRole('button', { name: 'Add one order' }).click();
  await page.getByLabel('Order number').fill('DEMO-99');
  await page.getByLabel('Order total').fill('10');
  await page.getByRole('button', { name: 'Add order' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('DEMO-99', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('REAL-9001', { exact: true })).toBeVisible();
  await expect(page.getByText('SO-1048', { exact: true })).toHaveCount(0);
});

test('@claim:demo-entry opens five sample orders with a persistent resettable banner', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('[data-order-id]')).toHaveCount(5);
  await expect(page.locator('.batch-count')).toContainText('3');
  await expect(page.getByRole('button', { name: /On hold 2/ })).toBeVisible();
});

test('@claim:csv-order-import imports redacted order CSV files with the required fields', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#orders-file').setInputFiles(csv('orders.csv', 'order_number,customer\nNO-TOTAL,Redacted'));
  await expect(page.locator('#notice')).toHaveText('No total column was found. Rename it total.');
  await page.locator('#orders-file').setInputFiles(csv('orders.csv', 'order_number,total,hold\nRED-7,72.50,yes'));
  await expect(page.getByText('RED-7', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Redacted customer' })).toBeVisible();
});

test('@claim:payment-currency rejects a mismatched payment currency and accepts a matching one', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#orders-file').setInputFiles(csv('gbp.csv', 'order_number,total,currency,hold\nFX-1,100,GBP,yes'));
  await page.locator('#payments-file').setInputFiles(csv('usd.csv', 'order_number,amount,currency\nFX-1,100,USD'));
  await expect(page.locator('#notice')).toHaveText('Payment for FX-1 is USD, but the order is GBP. It was not matched.');
  await expect(page.locator('[data-order-id]').filter({ hasText: 'FX-1' })).toContainText('Hold · £100.00 due');
  await page.locator('#payments-file').setInputFiles(csv('gbp-payment.csv', 'order_number,amount,currency\nFX-1,100,GBP'));
  await expect(page.locator('[data-order-id]').filter({ hasText: 'FX-1' })).toContainText('Ready · paid');
});

test('@claim:payment-aggregation adds unique partial payments before clearing an order', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#payments-file').setInputFiles(csv('payments.csv', 'order_number,amount,currency,reference\nSO-1049,40,USD,A\nSO-1049,54.50,USD,B'));
  await expect(page.locator('[data-order-id="sample-2"]')).toContainText('Ready · paid');
  await page.locator('#payments-file').setInputFiles(csv('payments-again.csv', 'order_number,amount,currency,reference\nSO-1049,40,USD,A\nSO-1049,54.50,USD,B'));
  await expect(page.locator('#notice')).toHaveText('No new payments matched. Check order numbers or add a unique reference column.');
});

test('@claim:hold-gate excludes held orders until a named approval is recorded', async ({ page }) => {
  await page.goto('/?demo=1');
  expect(await downloadedText(page, 'Export pack list')).not.toContain('SO-1049');
  await page.locator('[data-order-id="sample-2"]').getByRole('button', { name: 'Record approval' }).click();
  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Reason').fill('Approved purchase order on file');
  await page.getByRole('dialog').getByRole('button', { name: 'Record approval' }).click();
  const exported = await downloadedText(page, 'Export pack list');
  expect(exported).toContain('SO-1049');
  expect(exported).toContain('Sam Rivera');
});

test('@claim:batch-packed removes completed orders from the next pack list and allows recovery', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Mark ready orders packed' }).click();
  await expect(page.locator('.batch-count')).toContainText('0');
  await expect(page.getByRole('button', { name: 'Export pack list' })).toBeDisabled();
  await page.getByRole('button', { name: /Packed 3/ }).click();
  await page.locator('[data-order-id="sample-1"]').getByRole('button', { name: 'Return to active board' }).click();
  expect(await downloadedText(page, 'Export pack list')).toContain('SO-1048');
});

test('@claim:csv-export exports every active ready order as a CSV pack list', async ({ page }) => {
  await page.goto('/?demo=1');
  const text = await downloadedText(page, 'Export pack list');
  expect(text.trim().split('\n')).toHaveLength(4);
  expect(text).toContain('order_number,customer,total,currency,clearance');
});

test('@claim:json-backup exports and restores the complete workspace', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#payments-file').setInputFiles(csv('payment.csv', 'order_number,amount,currency,reference\nSO-1049,1,USD,BACKUP-KEY'));
  await page.locator('[data-order-id="sample-2"]').getByRole('button', { name: 'Record approval' }).click();
  await page.getByLabel('Your name').fill('Backup tester'); await page.getByLabel('Reason').fill('Recorded for backup coverage');
  await page.getByRole('dialog').getByRole('button', { name: 'Record approval' }).click();
  const backup = JSON.parse(await downloadedText(page, 'Export backup'));
  expect(backup).toMatchObject({ orders: expect.any(Array), rules: expect.any(Array), history: expect.any(Array), paymentKeys: expect.any(Array) });
  expect(backup.orders).toHaveLength(5);
  expect(backup.orders.find((order: { orderNumber: string }) => order.orderNumber === 'SO-1049').override).toMatchObject({ name: 'Backup tester' });
  expect(backup.paymentKeys).toHaveLength(1);
  await page.goto('/board');
  await page.locator('#backup-file').setInputFiles(json('complete.json', backup));
  await page.reload();
  const restored = JSON.parse(await downloadedText(page, 'Export backup'));
  expect(restored).toEqual(backup);
});

test('@claim:saved-customer-hold-rules apply a saved customer hold rule to later imports', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('[data-order-id="sample-1"]').getByRole('button', { name: 'Save customer hold rule for Moss & Thread' }).click();
  await page.locator('#orders-file').setInputFiles(csv('orders.csv', 'order_number,customer,total\nSO-2000,Moss & Thread,30'));
  await expect(page.locator('[data-order-id]').filter({ hasText: 'SO-2000' })).toContainText('Hold · $30.00 due');
});

test('@claim:free-board keeps payment checks, approvals, backups, and pack lists available without a license', async ({ page }) => {
  await page.goto('/board');
  for (const name of ['Import order CSV', 'Import payments', 'Add one order', 'Export backup', 'Import backup']) await expect(page.getByRole('button', { name }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Get encryption and customer hold rules for \$39/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Encrypt this device' })).toHaveCount(0);
});

test('@claim:default-currency uses USD when an order CSV omits currency', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#orders-file').setInputFiles(csv('orders.csv', 'order_number,total,hold\nUSD-1,12,yes'));
  await expect(page.locator('[data-order-id]').filter({ hasText: 'USD-1' })).toContainText('$12.00');
  const backup = JSON.parse(await downloadedText(page, 'Export backup'));
  expect(backup.orders.find((order: { orderNumber: string }) => order.orderNumber === 'USD-1').currency).toBe('USD');
  const pack = await downloadedText(page, 'Export pack list');
  expect(pack).toContain('"USD"');
});

test('@claim:extra-columns ignores harmless columns while recognizing payment currency', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('#orders-file').setInputFiles(csv('orders.csv', 'order_number,total,hold,bank_memo\nEXTRA-1,11,yes,private note'));
  await page.locator('#payments-file').setInputFiles(csv('payments.csv', 'order_number,amount,currency,settlement_note\nEXTRA-1,11,USD,private note'));
  await expect(page.locator('[data-order-id]').filter({ hasText: 'EXTRA-1' })).toContainText('Ready · paid');
});

test('@claim:scope-boundary contains no customer scoring, collection, stock, contact, payment processing, or label actions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('This tool does not score customers, collect debts, reserve stock, contact anyone, process payments, or print shipping labels.')).toBeVisible();
  await expect(page.locator('button, a').filter({ hasText: /score|debt|stock|contact|process payment|shipping label/i })).toHaveCount(0);
});

test('@claim:local-only keeps order and payment CSV data on this device', async ({ page }) => {
  const requests: string[] = []; page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1');
  await page.locator('#orders-file').setInputFiles(csv('orders.csv', 'order_number,total,hold\nPRIVATE-1,20,yes'));
  await page.locator('#payments-file').setInputFiles(csv('payments.csv', 'order_number,amount,currency\nPRIVATE-1,20,USD'));
  expect(requests.filter((url) => new URL(url).origin !== new URL(page.url()).origin)).toEqual([]);
});

test('@claim:backup-import-local keeps backup contents on this device', async ({ page }) => {
  const sentinel = 'BACKUP-SENTINEL-ONLY-ON-DEVICE'; const requests: { url: string; body: string | null }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), body: request.postData() }));
  await page.goto('/board');
  const backup = { orders: [{ id: 'sentinel', orderNumber: sentinel, customer: 'Private', total: 1, paid: 0, currency: 'USD', hold: true, createdAt: '2026-08-28' }], rules: [], history: ['Private backup'] };
  await page.locator('#backup-file').setInputFiles(json('private.json', backup));
  await expect(page.getByText(sentinel, { exact: true })).toBeVisible();
  expect(JSON.stringify(requests)).not.toContain(sentinel);
});

test('@claim:device-encryption encrypts the local workspace without plaintext at rest', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('sb_license:paid-before-ship-gate', 'test-license'); localStorage.setItem('sb_license:paid-before-ship-gate:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  await page.goto('/board');
  await page.getByRole('button', { name: 'Add one order' }).click();
  await page.getByLabel('Order number').fill('LOCK-1'); await page.getByLabel('Order total').fill('50'); await page.getByRole('button', { name: 'Add order' }).click();
  await page.getByRole('button', { name: 'Encrypt this device' }).click();
  await page.getByLabel('New passphrase').fill('dispatch-passphrase'); await page.getByLabel('Repeat passphrase').fill('dispatch-passphrase');
  await page.getByRole('dialog').getByRole('button', { name: 'Encrypt this device' }).click();
  await expect(page.getByRole('button', { name: 'Turn off encryption' })).toBeVisible();
  const stored = await page.evaluate(async () => { const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('paid-before-ship-gate'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); return new Promise<string>((resolve, reject) => { const request = database.transaction('workspace').objectStore('workspace').get('data'); request.onsuccess = () => resolve(JSON.stringify(request.result)); request.onerror = () => reject(request.error); }); });
  expect(stored).toContain('"encrypted":true'); expect(stored).not.toContain('LOCK-1'); expect(stored).not.toContain('dispatch-passphrase');
});

test('@claim:passphrase-not-stored requires the passphrase again after reload', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('sb_license:paid-before-ship-gate', 'test-license'); localStorage.setItem('sb_license:paid-before-ship-gate:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  await page.goto('/board'); await page.getByRole('button', { name: 'Encrypt this device' }).click();
  await page.getByLabel('New passphrase').fill('dispatch-passphrase'); await page.getByLabel('Repeat passphrase').fill('dispatch-passphrase'); await page.getByRole('dialog').getByRole('button', { name: 'Encrypt this device' }).click();
  await expect(page.getByRole('button', { name: 'Turn off encryption' })).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('dispatch-passphrase');
  await page.reload(); await expect(page.getByRole('heading', { name: 'Open the order vault' })).toBeVisible();
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/?demo=1'); await page.evaluate(() => navigator.serviceWorker.ready); await page.reload(); await context.setOffline(true); await page.reload();
  await expect(page.getByRole('heading', { name: 'Choose today’s pack list' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:purchase-terms shows the $39 one-time desk kit and checkout disclosure', async ({ page }) => {
  await page.goto('/'); await expect(page.getByText('$39 once for encryption and customer hold rules')).toBeVisible();
  await expect(page.getByText('Sociobot provides checkout. Dodo processes payment and handles the receipt.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy the desk kit/ })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/paid-before-ship-gate/checkout');
});

test('@claim:license-inactivity locks paid features when verification returns inactive', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('sb_license:paid-before-ship-gate', 'test-license'); localStorage.setItem('sb_license:paid-before-ship-gate:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  await page.route('https://api.sociobot.in/api/v1/products/paid-before-ship-gate/verify?license=test-license', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false }) }));
  await page.goto('/'); await page.getByRole('button', { name: 'Restore desk kit' }).click(); await page.getByLabel('License token').fill('test-license'); await page.getByRole('dialog').getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByRole('dialog')).toContainText('The license was not accepted. Check the token and try again.');
});

test('@claim:no-tracking makes no analytics or advertising requests across app routes', async ({ page }) => {
  const requests: string[] = []; page.on('request', (request) => requests.push(request.url()));
  for (const route of ['/', '/?demo=1', '/board', '/privacy', '/terms']) await page.goto(route);
  expect(requests.filter((url) => new URL(url).origin !== new URL(page.url()).origin)).toEqual([]);
});

test('@claim:license-network-only contacts Sociobot only when a license is present for verification', async ({ page }) => {
  const sociobot: string[] = []; page.on('request', (request) => { if (new URL(request.url()).origin === 'https://api.sociobot.in') sociobot.push(request.url()); });
  await page.goto('/privacy'); expect(sociobot).toEqual([]);
  await page.addInitScript(() => localStorage.setItem('sb_license:paid-before-ship-gate', 'test-license'));
  await page.route('https://api.sociobot.in/api/v1/products/paid-before-ship-gate/verify?license=test-license', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false }) }));
  await page.goto('/privacy'); await expect.poll(() => sociobot.length).toBe(1); expect(sociobot[0]).toContain('/verify?license=test-license');
});
