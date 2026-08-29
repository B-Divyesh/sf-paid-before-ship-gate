import assert from 'node:assert/strict';

const site = process.env.LIVE_URL ?? 'https://paid-before-ship-gate.sociobot.in';
const api = 'https://api.sociobot.in/api/v1';

async function response(path, options = {}) {
  return fetch(`${site}${path}`, { redirect: 'manual', ...options });
}

const home = await response('/');
assert.equal(home.status, 200, 'home must return HTTP 200');
const html = await home.text();
assert.match(html, /<title>Paid Before Ship Gate — check payment before packing<\/title>/);

const scriptPath = html.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1];
const stylePath = html.match(/href="(\/assets\/index-[^"]+\.css)"/)?.[1];
assert.ok(scriptPath, 'home must reference a hashed JavaScript bundle');
assert.ok(stylePath, 'home must reference a hashed CSS bundle');

for (const path of [scriptPath, stylePath]) {
  const asset = await response(path);
  assert.equal(asset.status, 200, `${path} must return HTTP 200`);
  const cacheControl = asset.headers.get('cache-control') ?? '';
  assert.match(cacheControl, /max-age=31536000/i, `${path} must cache for one year`);
  assert.match(cacheControl, /immutable/i, `${path} must be immutable`);
}

const worker = await response('/sw.js');
assert.equal(worker.status, 200, 'service worker must return HTTP 200');
assert.match(worker.headers.get('cache-control') ?? '', /no-cache|no-store/i, 'service worker must revalidate');

for (const path of ['/demo', '/board', '/privacy', '/terms']) {
  assert.equal((await response(path)).status, 200, `${path} must remain a working deep link`);
}

const missing = await response('/definitely-not-a-route');
assert.equal(missing.status, 404, 'unknown routes must return HTTP 404');

const catalog = await fetch(`${api}/products`);
assert.equal(catalog.status, 200, 'product catalog must return HTTP 200');
const catalogBody = await catalog.json();
const product = catalogBody.data.find((entry) => entry.slug === 'paid-before-ship-gate');
assert.ok(product, 'billing catalog must contain paid-before-ship-gate');
assert.equal(product.price_minor, 3900, 'billing catalog price must be $39');
assert.equal(product.currency, 'USD', 'billing catalog currency must be USD');

const checkout = await fetch(`${api}/products/paid-before-ship-gate/checkout`, { redirect: 'manual' });
assert.equal(checkout.status, 303, 'checkout must redirect');
assert.match(checkout.headers.get('location') ?? '', /^https:\/\/checkout\.dodopayments\.com\/session\//, 'checkout must use Dodo hosted checkout');

console.log(`Live release checks passed for ${site}`);
