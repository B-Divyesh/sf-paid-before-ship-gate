# Independent verification 2 — FAIL

**Candidate:** `4f09b7d898d8bc4654c3182658190d9706f5060d` (`main`)

**Live URL:** <https://paid-before-ship-gate.sociobot.in>

**Verified:** 2026-08-28 UTC from an initially clean checkout. Product code was not modified.

## Release decision

**FAIL.** The deployed candidate matches the local production bundles, the declared claim commands pass after the required install, checkout is live, and the core demo works. It must not ship because malformed backup input can overwrite a good workspace and make the board render completely blank after reload. The candidate also misses the contract's mobile target-size and 200% text-resize requirements, and its claim registry does not cover all live/README claims.

## Release-blocking defects

### High — a malformed backup can overwrite and brick the local workspace

The backup importer checks only that `orders` and `rules` are arrays. I imported this otherwise malformed file in a fresh live browser:

```json
{"orders":[{"id":"bad","orderNumber":"BAD-BACKUP","customer":"Broken","total":10,"paid":0,"currency":"NOT-A-CURRENCY","hold":true,"createdAt":"2026-08-28"}],"rules":[],"history":[]}
```

The app persisted it before rendering. The initial import displayed `Invalid currency code : NOT-A-CURRENCY`, but reloading `/board` produced an empty `#app` and the uncaught page error `Invalid currency code : NOT-A-CURRENCY`. There is then no in-product reset or restore path. Existing local records have already been replaced; recovery requires browser-storage tools and can lose the previous workspace.

Evidence: `verification-artifacts/live-invalid-backup.log`. Validate every imported field and the full backup schema before changing IndexedDB, preserve the previous workspace on any error, and add rejection/recovery coverage.

### Medium — required 44 px mobile touch targets are not met

At 390 × 844, computed live bounding boxes include:

- wordmark/home: 36 × 36 px;
- **Reset demo:** 110 × 36 px;
- **Start for real:** 97 × 20 px;
- **Record override:** 147 × 40 px;
- footer Privacy/Terms links: 18 px high.

These include primary demo and safety-override actions, not only incidental text. The attached accessibility and design contracts require every touch target to be at least 44 × 44 CSS px.

Evidence: `verification-artifacts/live-accessibility-mobile.log` and `live-demo-mobile.png`.

### Medium — 200% text resize clips the demo controls

With a 390 px viewport and the root text size increased to 200%, `/demo` grows to 430 px wide and clips the `On hold 2` filter. The other tested routes remained at 390 px. This fails the required “text resizes to 200% without loss” baseline.

Evidence: `verification-artifacts/live-text-resize.log`.

### Medium — the claim registry is incomplete and one privacy test is underscoped

The landing page, terms, and README claim a **$39 one-time** purchase and describe refund/license-revocation behavior, but `.factory/claims.json` has no checkout/price/refund claim. `scripts/verify-live.mjs` happens to check the catalog price and checkout redirect, but it is not a declared claim test and does not cover refund revocation.

The `local-only` claim says order **and payment** data stays in the browser, while its declared test only adds a manual order. It does not import an order CSV or a payment CSV as the claim and privacy page promise. My broader manual flow observed same-origin traffic only, so this is a claim-contract/test-scope failure rather than evidence that data currently leaves the browser.

The claims contract explicitly says unlisted claims and tests that do not prove the promised outcome fail review.

## Mandatory first checks

### Claims gate

`.factory/claims.json` exists and contains 11 entries. A literal pre-install invocation was attempted first and all commands exited 127 because a clean clone has no `tsc`. After the required `npm ci` (108 packages, 0 vulnerabilities), every exact command was rerun and passed:

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | `verification-artifacts/claim-logs/demo-sandbox.log` |
| `csv-order-import` | PASS | `verification-artifacts/claim-logs/csv-order-import.log` |
| `payment-match` | PASS | `verification-artifacts/claim-logs/payment-match.log` |
| `hold-gate` | PASS | `verification-artifacts/claim-logs/hold-gate.log` |
| `csv-export` | PASS | `verification-artifacts/claim-logs/csv-export.log` |
| `json-backup` | PASS | `verification-artifacts/claim-logs/json-backup.log` |
| `saved-rules` | PASS | `verification-artifacts/claim-logs/saved-rules.log` |
| `local-only` | PASS, scope gap above | `verification-artifacts/claim-logs/local-only.log` |
| `device-encryption` | PASS | `verification-artifacts/claim-logs/device-encryption.log` |
| `passphrase-not-stored` | PASS | `verification-artifacts/claim-logs/passphrase-not-stored.log` |
| `offline-reload` | PASS | `verification-artifacts/claim-logs/offline-reload.log` |

The encryption and passphrase IDs intentionally select the same test, which carries both tags.

### Cold first-read test

**PASS.** In a fresh desktop context, the first screen says “Stop unpaid orders before packing,” names “small sellers” who need a payment check, and presents **Try it with sample data** beside “See five orders sorted in one click.” One click opens five realistic orders and a persistent “Demo — sample data, nothing is saved” banner.

The live cold load returned HTTP 200 with no console/page errors.

## Build and automated gates

- `npm ci`: PASS; 108 packages installed, 0 vulnerabilities.
- `npm test`: PASS; 16/16 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm run test:live`: PASS.
- `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: PASS; 16/16.
- `/opt/fleet/lib/verify-url.sh`: PASS; 703 ms load, correct title/lang/main/h1, no missing alt text, unlabeled buttons, console errors, or page errors.

Evidence: `verification-artifacts/npm-test.log`, `typecheck.log`, `lint.log`, `build.log`, `test-live.log`, `playwright-live.log`, and `verify-url/verify.json`.

## End-to-end product exercise

Against the live demo, I independently verified:

- five seeded orders, three ready and two held;
- negative totals and invalid currencies reject, followed by successful quoted CSV recovery;
- an order with only required fields imports as a redacted held order;
- unmatched payments reject, partial payment leaves the balance held, an exact duplicate is ignored, and the remainder clears it;
- a blank override reason cannot submit; a named reason makes the order ready;
- the pack-list CSV contains paid/overridden orders and excludes a still-held order;
- malformed top-level backup JSON rejects; a valid empty backup restores; Reset demo restores all samples;
- the real workspace persists through reload and case-insensitive duplicate order numbers reject;
- encryption mismatch and wrong-passphrase paths recover, while the correct passphrase restores the order.

Evidence: `verification-artifacts/manual-live-e2e.log` and `live-vault-recovery.log`. The separate malformed-schema backup case is the High defect above.

## Accessibility and responsive checks

- Live axe scans on `/`, `/demo`, `/board`, `/privacy`, and `/terms`: zero serious/critical findings.
- Each tested route has `lang=en`, one `h1`, one `main`, no 390 px horizontal overflow at normal text size, and no console/page errors.
- Keyboard Tab traversal reaches skip navigation, demo controls, filters, import/export actions, order actions, and backup controls. Focus uses a visible 4 px mustard outline. Native dialogs receive initial focus, close on Escape, and return focus to the opener.
- `prefers-reduced-motion: reduce` matches, smooth scrolling becomes `auto`, and no element has a running animation.
- Mobile screenshots were visually reviewed; normal-size content has no clipping or overlap.

The sub-44 px targets and 200% resize failure remain release findings.

Evidence: `verification-artifacts/live-accessibility-mobile.log`, `live-keyboard.log`, `live-text-resize.log`, `live-home-mobile.png`, and `live-demo-mobile.png`.

## Privacy, security, links, and billing

- The complete live demo flow (order/payment imports, override, exports, backup recovery) made five page requests, all same-origin; no analytics, remote fonts/scripts, console errors, or page errors appeared.
- Live HTML sends HSTS, a self-restricted CSP with only `api.sociobot.in` in `connect-src`, `nosniff`, strict-origin referrer policy, frame blocking, and restrictive camera/microphone/geolocation permissions.
- All crawled site links return 200; checkout returns 303 to `checkout.dodopayments.com`; `sociobot.in` returns 200.
- Checkout catalog/redirect is live at $39 USD.
- Fresh rapid invalid-license verification requests returned 30 × 200, then the **31st request returned 429** with `Retry-After: 4`.
- Sign-in is not required, so the Entra tenant requirement is not applicable. There is no product backend beyond the factory billing calls.

Evidence: `verification-artifacts/manual-live-e2e.log`, `live-http-parity-rate.log`, and `live-link-crawl.log`.

## PWA, deployment identity, and performance

- Registered worker: live `/sw.js`, activated and controlling, scope `/`, cache `pbsg-v2`.
- `registration.update()` completes; source contains versioned cleanup, `skipWaiting`, `clients.claim`, and the in-app update notice. No newer deployed worker existed to force an actual two-version transition.
- A saved real order reloads successfully offline and the visible offline notice appears.
- Unknown routes return the styled HTTP 404; known deep links return 200.
- Hashed JS/CSS cache for one year with `immutable`; `/sw.js` is `no-cache, no-store, must-revalidate`.
- Live JS `/assets/index-IkTkiBZ2.js` SHA-256 `d50aa05589614daab4849ea4a8074d793fc609251d6cddc22792095f986f0593` exactly matches `dist`.
- Live CSS `/assets/index-4-oJbEaV.css` SHA-256 `269fbeff9f001d1357b0c40f91d06555b0a59e11c1dc63db54551b923e6c83b2` exactly matches `dist`.
- Bundle budgets pass: JS 30.25 KB raw / 10.28 KB gzip; CSS 17.57 KB raw / 4.66 KB gzip; loaded Latin WOFF2 files total 34.73 KB; mobile AVIF hero 19.89 KB.
- Valid second mobile Lighthouse run: Performance 96, Accessibility 100, Best Practices 100, SEO 100; FCP 1.12 s, LCP 1.49 s, TBT 211 ms, CLS 0.009. Lab INP was not available. The first run was discarded because Chromium reported a tab crash.

Evidence: `verification-artifacts/live-pwa.log`, `live-http-parity-rate.log`, `lighthouse-mobile-2.json`, and `lighthouse-2.log`.

## Required remediation

1. Validate and normalize the complete backup schema before persistence; never replace current IndexedDB data until the import is safe and renderable. Add corrupt-field and recovery tests.
2. Increase every mobile interactive target to at least 44 × 44 CSS px, including banner, override, wordmark, and footer actions.
3. Make `/demo` reflow without clipping or horizontal scroll at 200% text size and add a regression test.
4. Add claim entries/tests for purchase price/one-time terms and any refund-revocation promise. Expand `local-only` to import both order and payment CSV data while monitoring the full request stream.
5. Rerun every claim command, full local/live suites, invalid-backup recovery, accessibility, PWA, rate-limit, and deployment-parity checks.
