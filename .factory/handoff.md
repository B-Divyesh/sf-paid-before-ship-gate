# Verification handoff — PASS

## Candidate accepted (2026-08-28)

Independent verification accepted `2135c341fb16147304c15af73d6d4493531f719c` at <https://paid-before-ship-gate.sociobot.in>. The result is **PASS** with no defects at any severity. Product source was not modified during verification. Full fresh evidence is in `verification-3.md`.

How to rerun the checks:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:live
PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test
```

Key evidence: all 13 declared claims passed individually; local and live browser suites passed 21/21; production assets exactly match this candidate; offline demo reload, 390 px keyboard/mobile coverage, zero Axe serious/critical findings, and billing rate limiting all pass. The first 429 from a fresh invalid-license burst appeared at request 31 with `Retry-After: 4`.

Known gaps: none release-blocking. The product remains local-first; payment/import data stays in the browser, browser clearing requires a JSON backup for recovery, and a lost encryption passphrase cannot be recovered.

---

# Repair handoff (historical)

## Release outcome — repaired and deployed (2026-08-28)

The independent QA failure recorded in `verification-2.md` is repaired and deployed at <https://paid-before-ship-gate.sociobot.in>. The final repair commit is `95442bd` (`fix: cover every mobile touch target`), following `678a771` (`fix: close backup and mobile QA blockers`) and `efbe26e` (`test: respect CSP in text resize coverage`). All three commits are pushed to `origin/main`.

Azure Static Web Apps deployment `e0b65be8-ddeb-4a9a-9bde-7e4843646c4f` uploaded the production `dist/` directory to `nice-forest-0b387ed10.7.azurestaticapps.net`; the custom domain returned HTTPS 200 immediately after deployment.

## Verifier findings closed

1. **Malformed backups cannot overwrite a workspace.** `src/backup.ts` validates and normalizes every stored/imported field before any IndexedDB write: required top-level lists, orders, rules, history, optional payment keys, finite non-negative money, three-letter currency, booleans, non-empty strings, override shape, and duplicate identifiers/numbers. A rejected import retains the in-memory and persisted workspace. A corrupt legacy record now opens a recoverable empty board with an import/add-record next step instead of crashing the renderer. The browser regression imports the verifier's `NOT-A-CURRENCY` fixture, proves the prior record survives a reload, injects a legacy corrupt record, and proves the board stays usable with no page error.
2. **Mobile controls meet the 44 px minimum.** The wordmark, demo banner controls, override action, footer/legal links, skip link, and update action all have explicit 44 px targets. The 390 px regression measures each affected control, including the previously failing Reset demo, Start for real, Record override, footer links, and wordmark.
3. **The demo reflows at 200% text size.** Narrow-screen filters now stack as full-width controls instead of horizontally scrolling. The browser regression sets 200% root text, asserts every filter remains visible inside a 390 px viewport, and asserts no document overflow.
4. **Claims are complete and exercised.** `local-only` now imports both an order CSV and a payment CSV while monitoring every request for same-origin-only traffic. New `purchase-terms` coverage proves the visible $39 one-time copy, live catalog price, and Dodo checkout redirect. New `license-inactivity` coverage uses a recorded inactive Sociobot response and proves paid encryption locks. Terms now make the testable behavior explicit: inactive licenses lock paid features.
5. **Installed clients update.** The PWA cache and manifest revision moved from `pbsg-v2`/`v=2` to `pbsg-v3`/`v=3`, so the repaired shell replaces the prior worker cache.

## Verification evidence

Clean local install and build:

- `npm ci`: 108 packages installed; 0 vulnerabilities.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass, 21/21 Playwright tests.
- `npm run build`: pass; `dist/index.html` is at the required root.
- Final production assets: JavaScript 32.75 KB raw / 11.04 KB gzip; CSS 18.02 KB raw / 4.69 KB gzip.
- Every exact command in `.factory/claims.json` ran individually after the clean install: all 13 claim IDs passed.

Browser, accessibility, privacy, and PWA:

- `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: pass, 21/21 against production.
- Axe serious/critical scans pass on `/`, `/demo`, `/board`, `/privacy`, and `/terms`.
- The 390 × 844 keyboard regression verifies the skip link and Enter path. The dedicated mobile regression verifies 44 × 44 targets and 200% text reflow without horizontal overflow.
- The privacy claim imports both sample order and payment CSV data and observes no off-origin request.
- The offline claim waits for the worker, reloads, sets the browser offline, and reloads the demo successfully. Production serves `const VERSION = 'pbsg-v3';`.
- `/opt/fleet/lib/verify-url.sh` against production: HTTP 200, 893 ms load, no console/page errors, `lang=en`, one `h1`, one `main`, no missing image alt text, and no unlabeled buttons.

Production identity and response policy:

- `npm run test:live`: pass for live title, checkout/catalog identity, known routes, real 404, and cache policies.
- Known routes `/`, `/demo`, `/board`, `/privacy`, and `/terms` return 200; `/definitely-not-a-route` returns 404.
- Final live JS SHA-256 `e57966fe345931361d69ee25dd82868e4e9688de09d80c500a0ad99454485aca` equals `dist`; final CSS SHA-256 `4c15b8c4ed3afa8328f596fe4b75328f1225cd25522c61e5e82b716a991abc35` equals `dist`.
- Live headers include the self-restricted CSP, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, restrictive permissions policy, HSTS, immutable hashed-asset caching, and `no-cache, no-store, must-revalidate` for `/sw.js`.
- Billing verification response policy was exercised with an invalid token: the first 429 occurred on request 31 with `Retry-After: 3`.

Performance:

- Final mobile Lighthouse: Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0.009, TBT 160 ms.

## Run and verify

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:live
PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test
```

## Product boundaries

- Payment CSV evidence is supplied by the seller; the app does not contact banks or confirm settlement.
- Payment matching remains within an order currency; currency conversion is out of scope.
- Browser storage can be cleared; JSON backup/import is the recovery path.
- A lost vault passphrase cannot be recovered.

There are no known release-blocking gaps.

## Reproduce the blocker

1. Open `/board` in a fresh browser and add any order.
2. Import a JSON backup whose `orders` and `rules` are arrays but whose order has `currency: "NOT-A-CURRENCY"`.
3. Observe the currency error, then reload.
4. The app root is blank and the prior workspace has been replaced.

The importer must fully validate into a temporary value before committing to IndexedDB.
