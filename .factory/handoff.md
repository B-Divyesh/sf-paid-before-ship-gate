# Repair handoff

## Release outcome — repaired and deployed (2026-08-28)

The four release blockers in `verification-1.md` are repaired. The production site at <https://paid-before-ship-gate.sociobot.in> is live from Azure Static Web Apps deployment `a59e708b-93c5-4df7-b0de-3ba0d0a06e03`.

### Verifier findings closed

1. **Paid checkout:** registered the $39 USD one-time desk kit in live Dodo and the Sociobot factory-product registry. `GET https://api.sociobot.in/api/v1/products/paid-before-ship-gate/checkout` now returns HTTP 303 to `https://checkout.dodopayments.com/session/...`. The public catalog reports `price_minor: 3900`, `currency: USD`, and the correct product URL. Two unused products created while reconstructing the missing factory helper were archived; Dodo supports restoring them, and only the registry-bound product remains active.
2. **Required totals:** order import now rejects a missing recognized total column before reading rows. It also rejects a blank row total before numeric conversion, so `Number('')` can no longer create a ready `$0.00` order. The `@claim:csv-order-import` browser test proves missing-header rejection, blank-cell rejection, no inserted bad order, and recovery with a valid import.
3. **Cache policy:** hashed JS, CSS, WOFF, and WOFF2 assets now return `Cache-Control: public, max-age=31536000, immutable`. `/sw.js` returns `no-cache, no-store, must-revalidate`; the manifest has a one-hour revalidation window; HTML revalidates.
4. **Real 404:** only `/demo`, `/board`, `/privacy`, and `/terms` rewrite to the SPA. Unknown paths now return the styled `404.html` with HTTP 404. This was proven in the SWA emulator and on the custom production domain.

## Exact verification evidence

Clean/local gate:

- `npm ci`: 108 packages installed; 0 vulnerabilities.
- `npm run lint`: pass with ESLint 10.9.1.
- `npm run typecheck`: pass with TypeScript 5.9.2.
- `npm test`: 16/16 Playwright tests pass.
- Every command in `.factory/claims.json` was also run individually: all 11 claim IDs pass.
- `npm run build`: pass; `dist/index.html` exists at the required root.
- Production bundle: JS 30.25 KB / 10.28 KB gzip; CSS 17.57 KB / 4.66 KB gzip.
- The SWA emulator returned 200 for every known deep link, 404 for `/definitely-not-a-route`, immutable one-year caching for hashed bundles/fonts, and no-store for `/sw.js`.

Production browser and accessibility:

- `npm run test:live`: pass for live identity, checkout, known deep links, 404 status, and response caching.
- `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: 16/16 pass against production.
- Live axe scans on `/`, `/demo`, `/privacy`, and `/terms`: zero serious or critical violations.
- 390 × 844 browser check: no horizontal overflow; skip link and Enter activation work.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 607 ms load, no console/page errors, `lang=en`, one `h1`, one `main`, no missing alt text, and no unlabeled buttons.
- Desktop and 390 px screenshots were reviewed at `test-results/live-verify/`; no clipping, overlap, or missing content was found.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 30 ms, CLS 0.009.

Privacy, PWA, and response policy:

- The complete demo add-order flow issued same-origin requests only.
- The installed worker is active and controls the page. The active cache is `pbsg-v2`; `/demo` reloads with sample data after the browser is taken offline.
- Worker update primitives remain present and regression-checked: `skipWaiting`, `clients.claim`, versioned cache cleanup, and the in-app update notice. The manifest start URL is versioned with `v=2`.
- Live HTML and assets return HSTS, self-restricted CSP with only the Sociobot billing connection allowed, `nosniff`, strict-origin referrer policy, frame blocking, and restrictive camera/microphone/geolocation permissions.
- An invalid license returns HTTP 200 with `{valid:false, reason:"invalid"}`. The prior independent verification already proved rate limiting with HTTP 429 and `Retry-After`; the repair did not change that API.

Deployment identity:

- Live JS: `/assets/index-IkTkiBZ2.js`, SHA-256 `d50aa05589614daab4849ea4a8074d793fc609251d6cddc22792095f986f0593`, equal to `dist`.
- Live CSS: `/assets/index-4-oJbEaV.css`, SHA-256 `269fbeff9f001d1357b0c40f91d06555b0a59e11c1dc63db54551b923e6c83b2`, equal to `dist`.

## Run and verify

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
npm run test:live
```

To run the full browser suite against production:

```sh
PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test
```

## Known product boundaries

- Payment CSV files are evidence supplied by the seller. The app does not connect to a bank or confirm settlement.
- Payment amounts match within the order currency. Currency conversion remains out of scope.
- Browser storage can be cleared; JSON backup/import remains the recovery path.
- A lost vault passphrase cannot be recovered. The app warns before encryption.

There are no known release-blocking gaps.
