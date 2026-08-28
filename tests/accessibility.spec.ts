import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

for (const route of ['/', '/demo', '/privacy', '/terms']) {
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
  await expect(page.getByText('SO-1049')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
  expect(worker).toContain("const VERSION = 'pbsg-v2'");
  expect(worker).toContain('self.skipWaiting()');
  expect(worker).toContain('self.clients.claim()');
});
