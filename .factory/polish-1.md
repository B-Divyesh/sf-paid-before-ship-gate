# Polish 1 — review finding closure

Candidate repaired from `2135c341fb16147304c15af73d6d4493531f719c` and review `d8aec7cbd5d15761adfd45ce318fa8d2f71ca32a`.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Payment CSV reads `currency`, defaults it to USD, and rejects a mismatch before changing any order. | `@claim:payment-currency` |
| F-1-2 | Added reversible **Mark ready orders packed**, a Packed filter, and per-order return control. Packed records are excluded from exports. | `@claim:batch-packed` |
| F-1-3 | Demo isolation test now seeds `REAL-9001`, changes and resets demo, then proves the real order remains. | `@claim:demo-sandbox` |
| F-1-4 | Backup test now includes approval history and a payment key, restores into real storage, reloads, and compares the complete object. | `@claim:json-backup` |
| F-1-5 | Landing action now enters `?demo=1`; its five-order, 3-ready, 2-held result and banner are declared and tested. | `@claim:demo-entry` |
| F-1-6 | Scope boundary is declared, has plain copy, and checks that no excluded operation is offered. | `@claim:scope-boundary` |
| F-1-7 | Free-board division is declared and tested without a license. | `@claim:free-board` |
| F-1-8 | USD fallback is declared and asserted in board, backup, and pack-list output. | `@claim:default-currency` |
| F-1-9 | Harmless extra columns are tested while currency remains a recognized payment field. | `@claim:extra-columns` |
| F-1-10 | Unique split payments aggregate; repeated source rows do not. | `@claim:payment-aggregation` |
| F-1-11 | User copy now promises local passphrase encryption, not implementation jargon; test proves plaintext and passphrase absence at rest. | `@claim:device-encryption`, `@claim:passphrase-not-stored` |
| F-1-12 | Replaced inconsistent merchant wording with consistent checkout disclosure: Sociobot provides checkout; Dodo processes payment and receipt. | `@claim:purchase-terms` |
| F-1-13 | Static 404 now has full metadata, skip link, header/nav, footer/legal links, and product styling. | `ships a complete shared 404 shell and metadata` |
| F-1-14 | History entries retain scroll coordinates; Back restores them while focus moves to the destination heading without scrolling. | `restores scroll position and moves focus to the route heading on browser Back` |
| F-1-15 | Rewrote preview heading to “See which orders are ready to pack.” | `.factory/copy-audit.md` |
| F-1-16 | Rewrote boundary heading to “You approve every payment exception.” | `.factory/copy-audit.md` |
| F-1-17 | Rewrote preview sentence with total, payments, and hold status. | `.factory/copy-audit.md` |
| F-1-18 | Standardized all user-facing exception copy on **approval**. | `@claim:hold-gate`; `.factory/copy-audit.md` |
| F-1-19 | Standardized paid setting copy on **customer hold rule**. | `@claim:saved-customer-hold-rules`; `.factory/copy-audit.md` |
| F-1-20 | Renamed the restore action to **Restore desk kit**. | `@claim:license-inactivity` |
| F-1-21 | Rewrote README opening in plain language. | `README.md`; `.factory/copy-audit.md` |
| F-1-22 | Rewrote storage/encryption README copy for the practical outcome. | `README.md`; `@claim:device-encryption` |
| F-1-23 | Rewrote deployment wording as “live title, product slug…” | `README.md` |
| F-1-24 | Added no-tracking and license-only network claim coverage across routes. | `@claim:no-tracking`, `@claim:license-network-only` |
| F-1-25 | Added sentinel backup-import privacy coverage. | `@claim:backup-import-local` |

## Local evidence

- `npm test`: 33/33 Playwright tests passed, including all 23 declared claim tags, axe serious/critical checks, mobile and offline paths.
- A fresh clone at `/tmp/pbsg-clean-imUOWJ` ran `npm ci` and every exact `.factory/claims.json` command independently: 23/23 passed.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Build output: initial JS 36.09 KB raw / 11.81 KB gzip; CSS 18.29 KB raw / 4.76 KB gzip.

## Deployed evidence

- Deployment: Azure Static Web Apps production deployment `a09ce064-539e-472f-bdbd-92e0a35e956a`.
- Cold checks: <https://paid-before-ship-gate.sociobot.in/> returned 200 and references `index-BtXDFl-1.js`; <https://paid-before-ship-gate.sociobot.in/definitely-not-a-route> returned 404 with the complete shell.
- `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: 33/33 passed, including every mapped claim and live Axe Playwright checks.
- `npm run test:live`: passed. `verify-url.sh`: passed (title, lang, one h1/main, alt text, button names, zero console errors; 643 ms).
- Screenshots: `.factory/verification-artifacts/polish-1-live-home.png` and `.factory/verification-artifacts/polish-1-live-demo-mobile.png`.
- `@axe-core/cli` could not start because its Selenium Chrome binary is absent in this worker. The full live Playwright suite uses `@axe-core/playwright` and passed all serious/critical checks on every app route.
