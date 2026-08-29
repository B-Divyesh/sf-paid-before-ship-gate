# Polish 3 — cumulative finding closure

Candidate `79198aac6af0ee44131ef13da9eda9b8a22006ac` was repaired from review commit `4ce59d15a2d5863c481fe4ec80411609d938a050`. The deployed application build is from `5d0557d` and Azure Static Web Apps deployment `561d4986-9b12-410d-a46d-6821f3a5632b`.

## Review 1 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Payment currency is validated, and an order with recorded payments cannot be re-imported in another currency. | `@claim:payment-currency`; live 41-test run; `/?demo=1` safety flow |
| F-1-2 | Ready orders can be marked packed, excluded from later exports, filtered, and returned. | `@claim:batch-packed`; live `/demo` |
| F-1-3 | Demo state remains in memory, preserves a seeded real order, ignores a demo license query, and never writes the real database. | `@claim:demo-sandbox`; [live mobile demo](verification-artifacts/polish-3-live-demo-mobile.png) |
| F-1-4 | Backup verification compares the complete workspace after restore and reload, including rules, history, approvals, and payment keys. | `@claim:json-backup` |
| F-1-5 | The first action opens five orders with three ready, two held, and the persistent banner in one click. | `@claim:demo-entry`; [live mobile demo](verification-artifacts/polish-3-live-demo-mobile.png) |
| F-1-6 | Scope-boundary copy names every excluded action and the action audit confirms none is offered. | `@claim:scope-boundary`; live home |
| F-1-7 | Imports, checks, approvals, backups, and pack lists remain available without a license. | `@claim:free-board`; live `/board` |
| F-1-8 | Missing order currency becomes USD in the board, backup, and export. | `@claim:default-currency` |
| F-1-9 | Copy now names only `bank_memo` and `settlement_note` as ignored; currency and payment status are interpreted. | `@claim:extra-columns`, `@claim:payment-status` |
| F-1-10 | Split payments aggregate, exact repeats and edited rows with the same payment reference do not. | `@claim:payment-aggregation` |
| F-1-11 | Copy promises the user-visible encryption outcome; the test proves workspace plaintext and the passphrase are absent at rest. | `@claim:device-encryption`, `@claim:passphrase-not-stored` |
| F-1-12 | Unproved merchant and support roles were removed. Copy now promises only the observed Dodo-hosted redirect and linked Buyer Terms. | `@claim:purchase-terms`; live catalog USD 39; live checkout HTTP 303 to `checkout.dodopayments.com`; live `/terms` |
| F-1-13 | The static 404 retains its complete metadata, navigation, footer, legal links, art direction, and HTTP 404 response. | `ships a complete shared 404 shell and metadata`; live `/definitely-not-a-route` returned 404 |
| F-1-14 | History entries retain scroll coordinates; Back restores the prior position while focus moves without scrolling the heading. | `restores scroll position and moves focus to the route heading on browser Back` |
| F-1-15 | Heading remains the direct “See which orders are ready to pack.” | `.factory/copy-audit.md`; live home |
| F-1-16 | Heading remains the direct “You approve every payment exception.” | `.factory/copy-audit.md`; live home |
| F-1-17 | Preview names each order’s total, payments, and hold status. | `.factory/copy-audit.md`; live home |
| F-1-18 | Manual exceptions consistently use “approval.” | `@claim:hold-gate`; `.factory/copy-audit.md` |
| F-1-19 | Reusable paid settings consistently use “customer hold rule.” | `@claim:saved-customer-hold-rules`; `.factory/copy-audit.md` |
| F-1-20 | The action is “Restore paid access,” or “Manage paid access” when a token is saved. | `@claim:license-storage-control`; live home |
| F-1-21 | README says “installable web app” and proves the install manifest. | `@claim:installable-pwa`; `README.md` |
| F-1-22 | README explains browser storage and passphrase behavior in practical language. | `@claim:device-encryption`, `@claim:passphrase-not-stored`; `README.md` |
| F-1-23 | Deployment documentation names title, slug, checkout, deep links, 404, and cache checks. | `README.md`; `npm run test:live` |
| F-1-24 | Route-wide requests prove there is no analytics or advertising traffic; license traffic occurs only in declared cases. | `@claim:no-tracking`, `@claim:license-network-only` |
| F-1-25 | A unique backup sentinel is restored while remaining absent from every request body. | `@claim:backup-import-local` |

## Review 2 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-2-1 | One ready and one held sample card appear directly below the banner before controls at 390 × 844. | `@claim:demo-entry`; [live mobile demo](verification-artifacts/polish-3-live-demo-mobile.png) |
| F-2-2 | Missing payment currency is explicitly treated as USD and cannot clear GBP. | `@claim:payment-default-currency` |
| F-2-3 | The section label remains “How it works.” | `.factory/copy-audit.md`; live home |
| F-2-4 | The section label remains “Payment exceptions and limits.” | `.factory/copy-audit.md`; live home |
| F-2-5 | Paid copy uses concrete encryption, customer hold rule, and paid-access terms. | `.factory/copy-audit.md`; live home and `/terms` |
| F-2-6 | The board heading remains “Export or restore a workspace backup.” | live `/demo`; accessibility heading audit |
| F-2-7 | The legal heading remains “Terms for using the order board.” | live `/terms`; route accessibility test |
| F-2-8 | The 404 says “Page not found,” explains the error, and offers “Return home.” | live `/definitely-not-a-route`; 404 shell test |
| F-2-9 | First references expand spreadsheet files (CSV) and backup file (JSON). | `.factory/copy-audit.md`; live home and `/demo` |
| F-2-10 | README expands single-page-app routing and Content Security Policy. | `README.md` |

## Review 3 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Re-importing paid `SO-1048` from USD to GBP is rejected, leaving its USD balance and status unchanged. | `@claim:payment-currency` passed clean and live |
| F-3-1 | Missing optional fields preserve customer, currency, date, and payment hold. Total, currency, customer, or explicit hold changes open a review dialog before saving. | `@claim:order-reimport-safety`; live `/demo` |
| F-1-12 | Merchant-of-record and order-support statements were removed everywhere. | `@claim:purchase-terms`; live home, README, and `/terms` copy checks |
| F-3-2 | Common payment-status columns are recognized. Pending, failed, refunded, and reversed rows are rejected; successful, confirmed, and settled rows are accepted. | `@claim:payment-status` passed clean and live |
| F-3-3 | Rejected and demo-return tokens are not stored. Accepted tokens are stored only after verification, with disclosure, recheck, and removal controls. | `@claim:license-storage-control`, `@claim:license-inactivity`, `@claim:demo-sandbox` |
| F-3-4 | Unprovable recovery wording was removed. Copy now says the passphrase is not stored and must be re-entered after reload. | `@claim:passphrase-not-stored`; live `/privacy` and encryption dialog |
| F-3-5 | Terms now say users choose a payment file and review automatic matches, while deciding holds and approvals. | live `/terms`; `.factory/copy-audit.md` |
| F-3-6 | The workflow heading is “Turn an order spreadsheet into a pack list.” | `.factory/copy-audit.md`; live home |
| F-3-7 | Home, Open Graph, and Twitter descriptions say “Import spreadsheets,” with no unexplained CSV abbreviation. | `sets route titles, descriptions, canonicals, legal links, and focus`; live page source |
| F-3-8 | The static 404 footer now announces “(external)” with the same screen-reader treatment as app routes. | `ships a complete shared 404 shell and metadata`; live 404 body check |

## Verification evidence

- Clean no-local clone `/tmp/pbsg-polish3-final-wGnbFy`: `npm ci`, then all 29 exact `.factory/claims.json` commands independently — 29/29 passed.
- Local: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed; Playwright 41/41.
- Build: JS 41.77 KB raw / 13.33 KB gzip; CSS 19.54 KB raw / 4.99 KB gzip; `dist/index.html` present.
- Local Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.8 s, CLS 0.001, TBT 10 ms. Report: `verification-artifacts/polish-3-lighthouse-mobile.json`.
- Live: `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test` passed 41/41, including Playwright-Axe on every route, offline reload, privacy request capture, mobile, keyboard, focus, and 200% text.
- Live contract: `npm run test:live` passed. `/opt/fleet/lib/verify-url.sh` reported 864 ms, zero console errors, `lang=en`, one `h1`, one `main`, complete alt text, and named buttons.
- Live cold screenshots: [home mobile](verification-artifacts/polish-3-live-home-mobile.png), [demo mobile](verification-artifacts/polish-3-live-demo-mobile.png), [demo desktop](verification-artifacts/polish-3-live-demo-desktop.png).
- Live URL: <https://paid-before-ship-gate.sociobot.in>; demo: <https://paid-before-ship-gate.sociobot.in/?demo=1>.

Every finding in reviews 1–3 is closed. No deferred minor items or known review gaps remain.
