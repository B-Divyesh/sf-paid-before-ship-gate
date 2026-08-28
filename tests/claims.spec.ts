import { expect, test } from '@playwright/test';

test('@claim:demo-sandbox sample mode resets without touching real records', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Add one order' }).click();
  await page.getByLabel('Order number').fill('DEMO-99');
  await page.getByLabel('Order total').fill('10');
  await page.getByRole('button', { name: 'Add order' }).click();
  await expect(page.getByText('DEMO-99', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('DEMO-99', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'No orders are waiting' })).toBeVisible();
});

test('@claim:csv-order-import imports order CSV with redacted optional columns', async ({ page }) => {
  await page.goto('/demo');

  await page.locator('#orders-file').setInputFiles({ name: 'orders.csv', mimeType: 'text/csv', buffer: Buffer.from('order_number,customer\nNO-TOTAL,Redacted') });
  await expect(page.locator('#notice')).toHaveText('No total column was found. Rename it total.');
  await expect(page.getByText('NO-TOTAL', { exact: true })).toHaveCount(0);

  await page.locator('#orders-file').setInputFiles({ name: 'orders.csv', mimeType: 'text/csv', buffer: Buffer.from('order_number,customer,total\nBLANK-TOTAL,Redacted,') });
  await expect(page.locator('#notice')).toHaveText('Order BLANK-TOTAL has no total. Add a total and try again.');
  await expect(page.getByText('BLANK-TOTAL', { exact: true })).toHaveCount(0);

  await page.locator('#orders-file').setInputFiles({ name: 'orders.csv', mimeType: 'text/csv', buffer: Buffer.from('order_number,total,hold\nRED-7,72.50,yes') });
  await expect(page.locator('#notice')).toHaveText('1 order imported.');
  await expect(page.getByText('RED-7')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Redacted customer' })).toBeVisible();
  await expect(page.getByText('Hold · $72.50 due')).toBeVisible();
});

test('@claim:payment-match matches imported payment amounts', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Hold · $94.50 due')).toBeVisible();
  await page.locator('#payments-file').setInputFiles({ name: 'payments.csv', mimeType: 'text/csv', buffer: Buffer.from('order_number,amount\nSO-1049,94.50') });
  await expect(page.locator('.batch-count')).toContainText('4');
  await expect(page.locator('[data-order-id="sample-2"]')).toContainText('Ready · paid');
});

test('@claim:hold-gate excludes held orders until a named override', async ({ page }) => {
  await page.goto('/demo');
  const firstDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export pack list' }).click();
  const first = await firstDownload;
  const firstText = await (await first.createReadStream()).toArray().then((parts) => Buffer.concat(parts).toString());
  expect(firstText).not.toContain('SO-1049');
  await page.locator('[data-order-id="sample-2"]').getByRole('button', { name: 'Record override' }).click();
  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Reason').fill('Approved purchase order on file');
  await page.getByRole('dialog').getByRole('button', { name: 'Record override' }).click();
  const secondDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export pack list' }).click();
  const second = await secondDownload;
  const secondText = await (await second.createReadStream()).toArray().then((parts) => Buffer.concat(parts).toString());
  expect(secondText).toContain('SO-1049');
  expect(secondText).toContain('Sam Rivera');
  expect(secondText).toContain('Approved purchase order on file');
});

test('@claim:csv-export exports one row for every ready order', async ({ page }) => {
  await page.goto('/demo');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export pack list' }).click();
  const download = await downloadEvent;
  const text = await (await download.createReadStream()).toArray().then((parts) => Buffer.concat(parts).toString());
  expect(text.trim().split('\n')).toHaveLength(4);
  expect(text).toContain('order_number,customer,total,currency,clearance');
});

test('@claim:json-backup exports a complete local workspace', async ({ page }) => {
  await page.goto('/demo');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const download = await downloadEvent;
  const data = JSON.parse(await (await download.createReadStream()).toArray().then((parts) => Buffer.concat(parts).toString()));
  expect(data.orders).toHaveLength(5);
  expect(data.rules[0].customer).toBe('Moss & Thread');
});

test('@claim:saved-rules applies a customer hold to later imports', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('[data-order-id="sample-1"]').getByRole('button', { name: /Apply this hold/ }).click();
  await page.locator('#orders-file').setInputFiles({ name: 'orders.csv', mimeType: 'text/csv', buffer: Buffer.from('order_number,customer,total\nSO-2000,Moss & Thread,30') });
  await expect(page.getByText('SO-2000')).toBeVisible();
  await expect(page.locator('[data-order-id]').filter({ hasText: 'SO-2000' })).toContainText('Hold · $30.00 due');
});

test('@claim:local-only demo flow sends no data off origin', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add one order' }).click();
  await page.getByLabel('Order number').fill('PRIVATE-1');
  await page.getByLabel('Order total').fill('20');
  await page.getByRole('button', { name: 'Add order' }).click();
  expect(external).toEqual([]);
});

test('@claim:device-encryption @claim:passphrase-not-stored locks and unlocks local records', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:paid-before-ship-gate', 'test-license');
    localStorage.setItem('sb_license:paid-before-ship-gate:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto('/board');
  await page.getByRole('button', { name: 'Add one order' }).click();
  await page.getByLabel('Order number').fill('LOCK-1');
  await page.getByLabel('Order total').fill('50');
  await page.getByRole('button', { name: 'Add order' }).click();
  await page.getByRole('button', { name: 'Encrypt this device' }).click();
  await page.getByLabel('New passphrase').fill('dispatch-passphrase');
  await page.getByLabel('Repeat passphrase').fill('dispatch-passphrase');
  await page.getByRole('dialog').getByRole('button', { name: 'Encrypt this device' }).click();
  await expect(page.getByRole('button', { name: 'Turn off encryption' })).toBeVisible();
  const storedText = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('paid-before-ship-gate'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    return new Promise<string>((resolve, reject) => { const request = database.transaction('workspace').objectStore('workspace').get('data'); request.onsuccess = () => resolve(JSON.stringify(request.result)); request.onerror = () => reject(request.error); });
  });
  expect(JSON.parse(storedText).encrypted).toBe(true);
  expect(storedText).not.toContain('dispatch-passphrase');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('dispatch-passphrase');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Open the order vault' })).toBeVisible();
  await page.getByLabel('Vault passphrase').fill('dispatch-passphrase');
  await page.getByRole('button', { name: 'Open the order vault' }).click();
  await expect(page.getByText('LOCK-1')).toBeVisible();
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Choose today’s pack list' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});
