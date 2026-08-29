import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

for (const route of ['/', '/demo', '/board', '/privacy', '/terms']) {
  test(`has no serious accessibility issues on ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('supports a 390px mobile viewport and keyboard path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Stop unpaid orders before packing' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.demo-first-look article').nth(1)).toContainText('SO-1049');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('restores scroll position and moves focus to the route heading on browser Back', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { name: 'Your records stay under your control' })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Stop unpaid orders before packing' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
});

test('ships a complete shared 404 shell and metadata', async () => {
  const page404 = await readFile('dist/404.html', 'utf8');
  for (const text of ['<header>', '<footer>', 'name="description"', 'rel="canonical"', 'property="og:title"', 'property="og:url"', 'name="twitter:card"', 'apple-touch-icon', 'Skip to content', 'Privacy', 'Terms', 'Built by Param Factory <span class="sr-only">(external)</span>']) expect(page404).toContain(text);
  expect(page404).toContain('<h1 tabindex="-1">Page not found</h1>');
});

test('sets route titles, descriptions, canonicals, legal links, and focus', async ({ page }) => {
  const routes = [
    ['/', 'Paid Before Ship Gate — check payment before packing', 'https://paid-before-ship-gate.sociobot.in/'],
    ['/?demo=1', 'Demo — Paid Before Ship Gate', 'https://paid-before-ship-gate.sociobot.in/demo'],
    ['/board', 'Order board — Paid Before Ship Gate', 'https://paid-before-ship-gate.sociobot.in/board'],
    ['/privacy', 'Privacy — Paid Before Ship Gate', 'https://paid-before-ship-gate.sociobot.in/privacy'],
    ['/terms', 'Terms — Paid Before Ship Gate', 'https://paid-before-ship-gate.sociobot.in/terms']
  ] as const;
  for (const [route, title, canonical] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    await expect(page.locator('footer').getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  }
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.getByRole('heading', { name: 'Your records stay under your control' })).toBeFocused();
});

test('moves focus into dialogs and returns it to the trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Restore paid access' });
  await trigger.click();
  await expect(page.getByLabel('License token')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('keeps mobile touch targets usable and reflows filters at 200% text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  for (const locator of [
    page.getByRole('link', { name: 'Paid Before Ship Gate home' }),
    page.getByRole('button', { name: 'Reset demo' }),
    page.getByRole('link', { name: 'Start for real' }),
    page.locator('[data-order-id="sample-2"]').getByRole('button', { name: 'Record approval' }),
    page.locator('footer').getByRole('link', { name: 'Privacy' }),
    page.locator('footer').getByRole('link', { name: 'Terms' })
  ]) {
    const box = await locator.boundingBox();
    expect(box, 'interactive control should have a box').not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('link', { name: 'Skip to content' }).focus();
  const skipBox = await page.getByRole('link', { name: 'Skip to content' }).boundingBox();
  expect(skipBox!.width).toBeGreaterThanOrEqual(44);
  expect(skipBox!.height).toBeGreaterThanOrEqual(44);
  await page.goto('/');
  const termsBox = await page.locator('.legal-note').getByRole('link', { name: 'terms' }).boundingBox();
  expect(termsBox!.width).toBeGreaterThanOrEqual(44);
  expect(termsBox!.height).toBeGreaterThanOrEqual(44);
  await page.goto('/demo');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(page.getByRole('button', { name: /On hold 2/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const button of await page.locator('.filter-bar button').all()) {
    const box = await button.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  }
});

test('configures known SPA routes, real 404 responses, and safe cache policies', async () => {
  const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as {
    navigationFallback?: unknown;
    responseOverrides: Record<string, { rewrite: string; statusCode?: number }>;
    routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
  };

  expect(config.navigationFallback).toBeUndefined();
  for (const route of ['/demo', '/board', '/privacy', '/terms']) {
    expect(config.routes).toContainEqual(expect.objectContaining({ route, rewrite: '/index.html' }));
  }
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  expect(config.routes).toContainEqual(expect.objectContaining({
    route: '/assets/*.{js,css,woff,woff2}',
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
  }));
  expect(config.routes).toContainEqual(expect.objectContaining({
    route: '/sw.js',
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
  }));

  const worker = await readFile('dist/sw.js', 'utf8');
  expect(worker).toContain("const VERSION = 'pbsg-v5'");
  expect(worker).toContain('self.skipWaiting()');
  expect(worker).toContain('self.clients.claim()');
});
