# Independent verification 1 — FAIL

**Candidate:** `3d535a64baa5c071405375ec0b23efba33c44f39` (`main`)

**Live URL:** <https://paid-before-ship-gate.sociobot.in>

**Verified:** 2026-08-28 (UTC), from a clean `npm ci` checkout. No product source was changed.

## Release decision

**FAIL.** The local product and its declared claims work, and the deployment is byte-for-byte aligned for the application JS and CSS. It must not ship as this candidate because:

1. **Critical — paid checkout is unavailable in production.** The visible “Buy the desk kit” link targets `https://api.sociobot.in/api/v1/products/paid-before-ship-gate/checkout`; a fresh `GET` on 2026-08-28 returned **404**. This prevents the advertised one-time purchase and therefore encryption/saved-rule purchase flow. This confirms the previously reported deployment-only concern from fresh evidence.
2. **High — an order import may silently turn a required total into $0.00.** The contract says `order_number` and `total` are required. Importing `order_number,customer\nNO-TOTAL,Redacted` was accepted, showed the order at `$0.00`, and marked it “Ready · no hold”. A missing total header or blank total must reject the file/row, not create an exportable zero-value order. The relevant implementation is `src/csv.ts` (no total-column presence check; `Number('')` becomes `0`).

## Mandatory first checks

### Claims (all run individually from the clean checkout)

`.factory/claims.json` is present and declares 11 claims. Each listed command completed successfully against the Playwright demo entry point; the complete suite also passed.

| Claim ID | Command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `csv-order-import` | `npm test -- --grep @claim:csv-order-import` | PASS |
| `payment-match` | `npm test -- --grep @claim:payment-match` | PASS |
| `hold-gate` | `npm test -- --grep @claim:hold-gate` | PASS |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS |
| `json-backup` | `npm test -- --grep @claim:json-backup` | PASS |
| `saved-rules` | `npm test -- --grep @claim:saved-rules` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `device-encryption` | `npm test -- --grep @claim:device-encryption` | PASS |
| `passphrase-not-stored` | `npm test -- --grep @claim:passphrase-not-stored` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |

The encryption and passphrase claims intentionally share one test tagged with both IDs. The full test run reported 15 passing tests (11 claim tags plus accessibility/mobile tests).

### Cold first read of the live site

**PASS.** A fresh desktop browser loaded with no console/page errors. The first screen says: “Stop unpaid orders before packing”; it says it is “For small sellers who need a clear payment check before each packing batch”; and its adjacent primary action is “Try it with sample data” with “See five orders sorted in one click.” The action is one click and opens the isolated sample board.

## Local build and automated quality evidence

- `npm ci`: PASS; audit reported 0 vulnerabilities.
- `npm run build`: PASS (`tsc --noEmit && vite build`); `dist/` is produced.
- `npm test`: PASS; 15/15 Playwright tests pass.
- No lint script is defined in `package.json`.
- Production bundle: JS 30.01 KB / **10.24 KB gzip**; CSS 17.57 KB / **4.66 KB gzip**. Both meet the static budgets.
- Mobile Lighthouse against the production preview (second clean run): Performance **98**, Accessibility **100**, Best Practices **100**, SEO **100**; LCP 1.9 s, TBT 150 ms, CLS 0.009. An initial Lighthouse run was invalidated by a Chromium tab crash and was not used for this result.

## Product and recovery exercise

Normal end-to-end flows pass through the demo: redacted orders import, payment records clear a held order, a named override makes a held order exportable with its name/reason, ready-only CSV and full JSON backup download, saved hold rules apply, and encrypted real data reloads only after the passphrase.

Boundary and recovery evidence:

- Negative total produced `Order BAD-1 has an invalid total. Fix that row and try again.`; importing a valid file afterwards worked.
- An unmatched payment produced `No new payments matched. Check order numbers or add a unique reference column.`; a matching payment then cleared the held order.
- A duplicate manual order produced `That order number already exists. Use a different number.`
- The missing-total case above is the High defect.

## Live deployment, privacy, PWA, and platform checks

- **Deployment parity:** live `/assets/index-M1rWRxrA.js` SHA-256 is `f14db950a229260710314b53e59307c62abc9fc58d3c5c92994c7708627b2394`, equal to `dist`; live CSS SHA-256 is `269fbeff9f001d1357b0c40f91d06555b0a59e11c1dc63db54551b923e6c83b2`, equal to `dist`.
- **Privacy/outbound traffic:** a live demo add-order flow made five requests, all to `https://paid-before-ship-gate.sociobot.in`; no analytics or third-party request appeared. The declared local-only claim also passed.
- **PWA/offline:** live browser registration has active worker `/sw.js`; declared offline-reload test passes by visiting `/demo`, waiting for the worker, then reloading offline with sample data. Source inspection confirms `skipWaiting`, `clients.claim`, versioned cache cleanup, and an update toast. A true update transition cannot be induced without a second deployment, so the update behavior itself was not runtime-proven.
- **Security response policy:** live HTML provides HTTPS/HSTS, CSP restricted to self plus the Sociobot billing API, `nosniff`, strict-origin referrer policy, frame protection through CSP, and a restrictive permissions policy. No console/CSP errors appeared on the tested pages.
- **API rate limiting:** 30 rapid invalid-license verification calls returned 200; a subsequent 120-call burst returned 2×200 and 118×429. The first observed 429 had `Retry-After: 4`, so limiting started at approximately the 33rd request in the rate window. This requirement passes.
- **Accessibility:** live `/`, `/demo`, `/privacy`, and `/terms` each have one `h1` and one `main`; axe reported zero serious/critical violations on each at 390×844; no horizontal overflow or console/page errors. Keyboard test covers skip link and Enter activation of the demo action. Reduced-motion context reports `scroll-behavior: auto`.

## Additional defects

3. **Medium — static assets are not cached as immutable long-lived assets.** Live hashed JS, CSS, service worker, and manifest responses all use `Cache-Control: public, must-revalidate, max-age=30`; the PWA performance contract requires long-lived immutable caching for hashed assets. This is a deployment/configuration defect, not a local-build mismatch.
4. **Medium — unknown deep links return HTTP 200.** `https://paid-before-ship-gate.sociobot.in/definitely-not-a-route` returned the SPA shell with HTTP 200. The client renders an in-app 404, but the site-structure requirement calls for a real 404 response route. Adjust navigation fallback/response overrides so missing routes retain a 404 status while known SPA routes continue to work.

## Required remediation before a new verification

1. Register/configure the product with Sociobot billing and prove the checkout endpoint redirects to hosted checkout rather than 404.
2. Reject order CSVs with no recognized total column and rows with blank totals; add an observable demo claim test for both rejection and recovery.
3. Set immutable, long-lived cache headers for content-hashed JS/CSS/assets and appropriate shorter caching for HTML/service-worker/manifest.
4. Deliver an actual 404 status for unknown routes.
5. Rerun all declared claim commands, full tests, production build, and deployed verification after the changes.
