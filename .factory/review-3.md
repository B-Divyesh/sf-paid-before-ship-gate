# Adversarial first-read review 3 — FAIL

**Product:** Paid Before Ship Gate

**Live URL:** <https://paid-before-ship-gate.sociobot.in>

**Reviewed:** 29 August 2026 UTC

**Candidate:** `79198aac6af0ee44131ef13da9eda9b8a22006ac`

**Verdict:** **FAIL** — 4 blocking, 3 major, and 3 minor findings remain.

The deployed JavaScript and CSS hashes match a local production build of the candidate. This review therefore treats live and repository evidence as the same release.

## 1. Cold first screen

Fresh Chromium contexts opened the live home page at 390 × 844 and 1440 × 900. Storage was not shared, and neither page was scrolled before these answers were recorded.

| Question | Mobile answer | Desktop answer |
|---|---|---|
| What does this do? | It stops unpaid orders before they are packed. | It checks payment before orders enter packing. |
| For whom? | Small sellers preparing packing batches. | Small sellers who let customers pay later. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

The first screen passes. The exact text that answers the three questions is “Stop unpaid orders before packing,” “For small sellers who need a payment check before each packing batch,” and “Try it with sample data.” The adjacent result text says “Open five sample orders: three ready and two on hold.” On mobile, the three short offline, storage, and price facts are also visible before scrolling.

## 2. Findings

### Blocking

#### F-1-1 — An old payment clears an order after its currency changes

- **Quote/location:** landing, “Import amounts and currencies. Fully paid orders become ready”; `.factory/claims.json`, “Only payments in the order currency can clear a payment hold.”
- **Evidence:** in a fresh live demo, `SO-1048` began as a USD 186 order with USD 186 paid. Importing `order_number,total,currency,hold\nSO-1048,186,GBP,yes` changed the display to “£186.00,” “£186.00 paid,” and “Ready · paid.” No GBP payment was imported. In `src/csv.ts:50-56`, the new currency is accepted while `previous.paid` is copied as an untyped number. The passing `@claim:payment-currency` test starts with an unpaid GBP order and never changes the currency of an order with payment history.
- **Why this fails:** the app can ship a GBP order using a payment recorded in USD. This is the same safety failure as round-one F-1-1 through a re-import path, so it is blocking again.
- **Concrete fix:** never carry a paid balance across a currency change. Reject a currency change when an order has payments, or store payment rows with their currencies and recalculate the balance. Extend `@claim:payment-currency` with this re-import case and assert that the order remains held.

#### F-3-1 — A minimal re-import silently removes an existing payment hold

- **Quote/location:** README, “Only `order_number` and `total` are required”; live demo order `SO-1049`; `src/csv.ts:49-57`.
- **Evidence:** `SO-1049` began as “Hold · $94.50 due.” Importing the documented minimal row `order_number,total\nSO-1049,94.50` changed it to “Ready · no payment hold.” The missing optional hold cell becomes an empty string, and the merge writes `hold: false` instead of preserving the existing order-level hold.
- **Why this fails:** a routine re-import using the advertised minimum columns can remove the gate without payment or a named approval. The brief’s central requirement is that no held order reaches dispatch without one of those two records.
- **Concrete fix:** preserve an existing hold when the import has no hold column. Clear it only on an explicit value such as `no` or through the visible **Remove payment hold** action. Add a claim test that sets a hold, re-imports the minimal row, and confirms the order stays out of the pack list.

#### F-1-12 — The paid-party disclosure is still broader than its registered claim

- **Quote/location:** landing and README, “Dodo is the merchant of record and handles returns under its Buyer Terms”; `/terms`, “Dodo is the merchant of record. Dodo handles order questions and returns under its Buyer Terms.”
- **Evidence:** `purchase-terms` registers the price, hosted checkout, and that returns follow Dodo Buyer Terms. It does not register “merchant of record” or “handles order questions.” Its test checks the Sociobot catalog, a redirect to `checkout.dodopayments.com`, and the Buyer Terms link target; none establishes either extra statement.
- **Why this fails:** these are legal and support-responsibility claims a buyer may rely on. This is the same paid-party disclosure problem raised in round one and only partly closed in round two, so it remains blocking under the original ID.
- **Concrete fix:** remove the unregistered roles and say only “Checkout opens a Dodo-hosted payment page. Returns follow the linked Dodo Buyer Terms,” or add those exact claims plus authoritative tests that establish the merchant and support party.

#### F-3-2 — A row explicitly marked as a failed payment clears an order

- **Quote/location:** README, “Harmless extra columns are ignored”; `extra-columns` claim and test; `src/csv.ts:74-91`.
- **Evidence:** in a fresh live demo, importing `order_number,amount,currency,payment_status,reference\nSO-1049,94.50,USD,failed,FAILED-1` changed the unpaid held order to “$94.50 paid” and “Ready · paid.” The parser ignores every unrecognized column. The claim test supplies only `bank_memo` and `settlement_note`; it does not determine whether an ignored column is harmless.
- **Why this fails:** a normal payment export can contain pending, failed, refunded, or reversed rows. Ignoring an explicit failed status can put an unpaid order on the pack list, defeating the product’s central gate. The adjective “harmless” also implies validation that does not exist.
- **Concrete fix:** detect common status columns and accept only confirmed/settled values, or block the import with a clear mapping step. Rewrite the claim to name the exact ignored columns and add tests for pending, failed, refunded, and successful rows.

### Major

#### F-3-3 — License tokens are retained without disclosure or a removal control

- **Quote/location:** `/privacy`, “It contacts Sociobot only to verify a saved or newly entered paid license”; **Restore paid access** dialog; `src/license.ts:8-25`.
- **Evidence:** submitting a rejected token stores it at `localStorage['sb_license:paid-before-ship-gate']` before verification. A live test with a routed rejection left `review-invalid-token` stored. No page or dialog states that the token will be stored, how long it remains, or how to remove it, and no removal action exists.
- **Why this fails:** a license token is an access credential. Retaining even an invalid token indefinitely without an explicit notice or deletion path is not complete privacy disclosure or user control.
- **Concrete fix:** store a token only after successful verification, disclose browser storage and retention before submission, and add **Remove saved license**. Test rejection, successful save, removal, and storage state.

#### F-3-4 — Passphrase recovery is an unlisted claim

- **Quote/location:** README, “A lost passphrase cannot be recovered”; `/privacy`, “The passphrase is not stored or recoverable”; encryption dialog, “The passphrase cannot be recovered.”
- **Evidence:** `passphrase-not-stored` registers only “The workspace passphrase is not stored.” Its test checks local storage and that reload asks for the passphrase. No claim entry covers the separate promise that recovery is impossible.
- **Why this fails:** users may make backup decisions based on the stronger recovery statement. The claims gate requires that promise to be registered and tested or removed.
- **Concrete fix:** register the exact recovery behavior and test that no recovery/reset path decrypts the workspace without the passphrase, or use the narrower tested wording: “You must enter the passphrase again after reloading.”

#### F-3-5 — The terms say users decide automatic payment matches

- **Quote/location:** `/terms`, “You decide each payment hold, payment match, and approval.”
- **Evidence:** `importPayments` automatically matches every accepted row by `order_number`; there is no per-match confirmation step. The user selects a file but does not decide each match.
- **Why this fails:** the terms assign a manual decision that the interface does not offer, obscuring where the user must review automated results.
- **Concrete rewrite:** “You choose which payment file to import and review its matches. You decide each payment hold and approval.” Add a test for any confirmation step if one is introduced.

### Minor

#### F-3-6 — “Order exports” is inconsistent input terminology

- **Quote/location:** landing heading, “Turn order exports into a pack list.” Elsewhere the same input is an “order spreadsheet (CSV).”
- **Why this fails:** “export” can mean the file coming from another system or the pack list leaving this product. The heading makes the workflow ambiguous out of context.
- **Concrete rewrite:** “Turn an order spreadsheet into a pack list.”

#### F-3-7 — The search description reintroduces unexplained CSV jargon

- **Quote/location:** home meta description, “Check payment before packing orders. Import CSV files, record approvals, and export a clear pack list.”
- **Why this fails:** this may be the visitor’s first text in search or a link preview, where “CSV” has not been introduced as a spreadsheet file.
- **Concrete rewrite:** “Check payment before packing orders. Import spreadsheets, record approvals, and export a pack list.”

#### F-3-8 — The static 404 does not identify its external footer link

- **Quote/location:** `public/404.html`, “Built by Param Factory.”
- **Evidence:** app routes add a screen-reader-only “(external)” label to this link; the static 404 has only `rel="external"`, which does not announce or display the destination type.
- **Why this fails:** the shared footer is inconsistent, and a visitor is not told that the link leaves the site.
- **Concrete fix:** use the same accessible external-link text or icon treatment as every app route and add it to the 404 shell test.

## 3. Copy audit

Counts use whitespace-separated words; the `·` separator is not counted. Data rows and decorative stamps are excluded. Headings, navigation, actions, alt text, facts, and footer text are included because they are part of the first-read and button checks. No unit exceeds 22 words, and no banned marketing word appears.

### Landing page

| Copy unit | Words | Flag |
|---|---:|---|
| Skip to content | 3 | — |
| Paid Before Ship Gate | 4 | — |
| Demo | 1 | — |
| Order board | 2 | — |
| Privacy | 1 | — |
| A payment checkpoint for packing | 5 | — |
| Stop unpaid orders before packing | 5 | — |
| For small sellers who need a payment check before each packing batch. | 12 | — |
| Try it with sample data | 5 | — |
| Open five sample orders: three ready and two on hold. | 10 | — |
| Works offline after the first visit | 6 | — |
| Order data stays in this browser | 6 | — |
| $39 once for encryption and customer hold rules | 8 | — |
| A printed collage of parcels waiting at a payment checkpoint. | 10 | — |
| The order board | 3 | — |
| See which orders are ready to pack | 7 | — |
| See each order’s total, payments, and hold status on one board. | 11 | — |
| Current pack list | 3 | — |
| 2 ready · 2 held | 4 | — |
| How it works | 3 | — |
| Turn order exports into a pack list | 7 | F-3-6 |
| Import order spreadsheets (CSV) | 4 | — |
| Use an order number, total, and optional customer or payment hold columns. | 12 | — |
| Match payments | 2 | — |
| Import amounts and currencies. | 4 | — |
| Fully paid orders become ready. | 5 | F-1-1 |
| Export the pack list | 4 | — |
| Only paid or manually approved orders are exported. | 8 | — |
| Payment exceptions and limits | 4 | — |
| You approve every payment exception | 5 | — |
| This tool does not score customers, collect debts, reserve stock, contact anyone, process payments, or print shipping labels. | 18 | — |
| Imports may omit names, references, and dates. | 7 | F-3-1 |
| Only order numbers and amounts are required. | 7 | F-3-1 |
| $39 | 1 | — |
| One time | 2 | — |
| Paid features | 2 | — |
| Encrypt records and save customer hold rules | 7 | — |
| The free board includes imports, payment checks, approvals, backups, and pack lists. | 12 | — |
| Pay once to add encrypted local storage and customer hold rules. | 11 | — |
| Buy encryption and hold rules | 5 | — |
| Restore paid access | 3 | — |
| Checkout opens a Dodo-hosted payment page. | 6 | — |
| Dodo is the merchant of record and handles returns under its Buyer Terms. | 13 | F-1-12 |
| Paid Before Ship Gate | 4 | — |
| Check payment before an order is packed. | 7 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v1.0.1 | 1 | — |
| Hero art was generated for this product. | 7 | — |

All landing-page action buttons use result-naming verbs. The navigation links are destination names rather than actions.

### README

Code blocks are sample data or commands and are excluded. Inline code is counted as ordinary words.

| Sentence or heading | Words | Flag |
|---|---:|---|
| Paid Before Ship Gate | 4 | — |
| Stop unpaid orders before packing with a local payment checkpoint. | 10 | — |
| This installable web app is for small sellers who let customers pay later. | 13 | — |
| It imports order and payment spreadsheet files (CSV), applies payment holds, records approvals, and exports ready orders as a pack list. | 21 | — |
| Live site: https://paid-before-ship-gate.sociobot.in | 3 | — |
| One-click demo: https://paid-before-ship-gate.sociobot.in/?demo=1 | 3 | — |
| What it does | 3 | — |
| Imports order spreadsheet files (CSV). | 5 | — |
| Only `order_number` and `total` are required. | 6 | F-3-1 |
| Matches payment amounts and currencies through `order_number`. | 7 | F-1-1 |
| Keeps held orders out of the pack list until paid or manually approved. | 13 | F-3-1 |
| Records the approval name and reason in the exported pack list. | 11 | — |
| Exports and restores a complete backup file (JSON). | 8 | — |
| Marks packed orders complete so they do not enter the next pack list. | 13 | — |
| Works offline after the first online visit. | 7 | — |
| Stores order and payment data in this browser. | 8 | — |
| The free board includes every payment check, approval, backup, and export. | 11 | — |
| Paid features cost $39 once and add encrypted local storage and reusable customer hold rules. | 15 | — |
| Checkout opens a Dodo-hosted payment page. | 6 | — |
| Dodo is the merchant of record and handles returns under its Buyer Terms. | 13 | F-1-12 |
| It does not process payments, score customers, collect debts, reserve stock, or print shipping labels. | 15 | — |
| Spreadsheet formats (CSV) | 3 | — |
| Orders | 1 | — |
| The `customer`, `currency`, `hold`, and `date` columns are optional. | 9 | F-3-1 |
| Omit customer details for a redacted import. | 7 | — |
| Currency defaults to USD. | 4 | — |
| Payments | 1 | — |
| Payment currency defaults to USD when omitted and must match the order currency. | 13 | F-1-1 |
| Harmless extra columns are ignored. | 5 | F-3-2 |
| Unique payment rows for one order are added together. | 9 | — |
| Develop and verify | 3 | — |
| Requires Node.js 20 or newer. | 5 | — |
| The exact production build command is `npm run build`. | 9 | — |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | — |
| Claim tests use Playwright 1.58.2. | 5 | — |
| Each product claim and its sandbox test is listed in `.factory/claims.json`. | 11 | F-1-12, F-3-4 |
| Privacy and recovery | 3 | — |
| Records stay in this browser’s local database. | 7 | — |
| Demo records use a separate memory-only workspace and are discarded when the demo ends. | 14 | — |
| Spreadsheet and backup processing happen on the device. | 8 | — |
| With paid features, your passphrase encrypts records on this device. | 10 | — |
| The app does not store the passphrase. | 7 | — |
| A lost passphrase cannot be recovered, so export backups before enabling encryption. | 12 | F-3-4 |
| See `/privacy` and `/terms` in the app for the full policies. | 11 | — |
| Deploy | 1 | — |
| Deploy the contents of `dist/` as a static site. | 9 | — |
| `staticwebapp.config.json` provides single-page-app routing, the 404 response, the Content Security Policy, and other security headers. | 15 | — |
| The factory owns infrastructure, DNS, and billing registration. | 8 | — |
| After deployment, run `npm run test:live` to verify the live title, product slug, checkout redirect, deep links, 404 status, and cache policy. | 22 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

## 4. Demo and sandbox

| Check | Result | Evidence |
|---|---|---|
| One click from landing | PASS | The first-screen action opens `/?demo=1`. |
| Realistic first screen, mobile | PASS | At 390 × 844, `SO-1048 · Moss & Thread · $186.00 · Ready · paid` occupies y=207–289 and the held `SO-1049` occupies y=299–381. |
| Realistic first screen, desktop | PASS | The same ready and held cards occupy y=199–285 in a 1440 × 900 viewport. |
| Persistent demo banner | PASS | “Demo — sample data, nothing is saved,” **Reset demo**, and **Start for real** remain present. |
| Reset | PASS | Adding `DEMO-99` and choosing **Reset demo** removes it and restores five orders, three ready and two held. |
| Real-workspace isolation | PASS | The clean claim test seeds `REAL-9001`, mutates and resets demo data, then confirms the real order remains and sample rows never enter the real board. |
| Demo requests | PASS | The fresh-context landing and complete demo entry produced no off-origin requests. |
| Offline reload | PASS | The service-worker claim test reloads the sample while offline and retains the demo banner and board. |

The sandbox mechanics pass. The blocking re-import failures above occur entirely inside the isolated demo and therefore do not contaminate real data while being reproduced.

## 5. Claims registry

A no-local clone was created at `/tmp/pbsg-review3-oC7MuB`; `npm ci` was run there, followed by every exact command in `.factory/claims.json` independently.

| Claim | Exact command result |
|---|---|
| `demo-sandbox` | PASS |
| `demo-entry` | PASS |
| `csv-order-import` | PASS |
| `payment-currency` | PASS, but incomplete; F-1-1 reproduces outside its narrow setup |
| `payment-default-currency` | PASS |
| `payment-aggregation` | PASS |
| `hold-gate` | PASS, but no re-import coverage; F-3-1 |
| `batch-packed` | PASS |
| `csv-export` | PASS |
| `json-backup` | PASS |
| `saved-customer-hold-rules` | PASS |
| `free-board` | PASS |
| `default-currency` | PASS |
| `extra-columns` | PASS, but “harmless” is not determined; F-3-2 |
| `scope-boundary` | PASS |
| `local-only` | PASS |
| `backup-import-local` | PASS |
| `device-encryption` | PASS |
| `passphrase-not-stored` | PASS; recovery claim remains unlisted, F-3-4 |
| `offline-reload` | PASS |
| `purchase-terms` | PASS; merchant/support claims remain unlisted, F-1-12 |
| `license-inactivity` | PASS |
| `no-tracking` | PASS |
| `license-network-only` | PASS |

All 24 commands returned zero and every registered ID appears exactly once in `tests/claims.spec.ts`. The passing matrix does not override false or broader live claims; F-1-1, F-1-12, F-3-1, F-3-2, and F-3-4 identify those gaps.

## 6. Earlier finding audit

Every earlier finding was checked against the live site and current source/tests.

| Earlier ID | Round-3 status | Current evidence |
|---|---|---|
| F-1-1 | **Regressed; blocking again** | Direct mismatched payment import is rejected, but an existing USD paid balance is retained after a GBP order re-import. |
| F-1-2 | Fixed | Packed orders leave the next export and can be returned; claim passes live and locally. |
| F-1-3 | Fixed | A seeded real order survives demo mutation, reset, and exit. |
| F-1-4 | Fixed | Complete backup round-trip and equality assertion pass. |
| F-1-5 | Fixed | Five orders, three ready, two held, banner, and first-viewport cards are tested. |
| F-1-6 | Fixed | Scope-boundary copy and action audit remain registered. |
| F-1-7 | Fixed | Free imports, checks, approvals, backups, and pack-list controls are present. |
| F-1-8 | Fixed | Omitted order currency defaults to USD across board, backup, and export. |
| F-1-9 | Fixed as scoped | The test ignores known benign note columns; the undefined “harmless” wording is new F-3-2. |
| F-1-10 | Fixed | Unique partial rows aggregate and exact duplicate rows do not. |
| F-1-11 | Fixed | Plaintext and passphrase are absent at rest; reload locks the workspace. |
| F-1-12 | **Still half-fixed; blocking again** | Price, redirect, and Buyer Terms link are tested; merchant-of-record and order-support statements are not registered or established. |
| F-1-13 | Fixed | Unknown routes return a designed HTTP 404 with metadata, header, footer, and legal links. |
| F-1-14 | Fixed | Live Back restores scroll and focuses the destination `h1`. |
| F-1-15 | Fixed | Heading remains “See which orders are ready to pack.” |
| F-1-16 | Fixed | Heading remains “You approve every payment exception.” |
| F-1-17 | Fixed | Preview names totals, payments, and hold status. |
| F-1-18 | Fixed | Exception language consistently uses “approval.” |
| F-1-19 | Fixed | Reusable settings consistently use “customer hold rule.” |
| F-1-20 | Fixed | Action is “Restore paid access.” |
| F-1-21 | Fixed | README says “installable web app.” |
| F-1-22 | Fixed | README avoids cryptographic implementation jargon. |
| F-1-23 | Fixed | Deployment checks are named. |
| F-1-24 | Fixed | Route-wide no-tracking and license-only request tests pass. |
| F-1-25 | Fixed | Backup sentinel remains absent from all request bodies. |
| F-2-1 | Fixed | Two realistic sample cards are visible before controls at 390 × 844. |
| F-2-2 | Fixed | Omitted payment currency has its own USD-only claim and test. |
| F-2-3 | Fixed | Label is “How it works.” |
| F-2-4 | Fixed | Label is “Payment exceptions and limits.” |
| F-2-5 | Fixed | Paid copy uses concrete encryption, hold-rule, and access terms. |
| F-2-6 | Fixed | Backup heading names export, restore, workspace, and backup. |
| F-2-7 | Fixed | Terms `h1` names the terms and order board. |
| F-2-8 | Fixed | 404 copy says “Page not found” and “Return home.” |
| F-2-9 | Fixed | First user-facing file references expand CSV and JSON. |
| F-2-10 | Fixed | README expands single-page-app routing and Content Security Policy. |

## 7. Structure, routes, accessibility, and identity

| Check | Result |
|---|---|
| Titles | PASS: `/`, demo, board, privacy, terms, and 404 follow the route/product pattern and stay below 60 characters. |
| One `h1`, one `main`, heading order | PASS on all application routes and the static 404. |
| Metadata | PASS for description, canonical, Open Graph, Twitter card, favicon, apple-touch icon, language, and theme color; home description has the plain-word issue F-3-7. |
| Social image | PASS: the live product-specific image is 1200 × 630. |
| Deep links and 404 | PASS: `/demo`, `/board`, `/privacy`, and `/terms` return 200; an unknown route returns the designed page with HTTP 404. |
| Back, focus, and announcement | PASS in the live browser suite: history restores scroll and focus moves to the route heading. |
| Link crawl | PASS: every internal route/asset, Sociobot, and Dodo Buyer Terms returned 200; checkout returned the expected 303 to `checkout.dodopayments.com`. |
| Header and footer | PASS on app routes; static 404 external-link disclosure differs, F-3-8. |
| Console | PASS on all product routes. The only 404 console entry is Chromium’s expected failed-main-resource message for the intentional HTTP 404. |
| Keyboard, touch, zoom, and Axe | PASS: the live 34-test Playwright suite reports no serious/critical Axe violations and passes keyboard, 44 px target, and 200% text checks. Standalone Axe CLI could not pair its ChromeDriver 152 with the preinstalled Chromium 145; the equivalent Playwright-Axe route coverage completed. |
| Reduced motion | PASS: motion and smooth scrolling are disabled under `prefers-reduced-motion`. |
| Visual identity | PASS: the cream-paper risograph desk, offset ink, stamps, clipped sheets, and generated packing art are product-specific rather than a generic SaaS template. |
| Bundle and build | PASS: `npm run build` creates `dist/`; first-load JS is 37.07 KB raw / 11.99 KB gzip and CSS is 19.08 KB raw / 4.89 KB gzip. |
| Security headers and PWA files | PASS: CSP is delivered as a response header, and manifest, service worker, robots, sitemap, and cache rules are present. |

## 8. Missed leverage

No AI feature is justified. A payment release gate should remain deterministic and auditable. The product already provides the obvious import, export, backup/restore, local encryption, saved rule, and batch-completion extensions. Sync is not implied strongly enough to outweigh the local-first privacy model.

The missing leverage is safer re-import reconciliation, covered by F-1-1 and F-3-1: returning orders need a visible change review when currency, hold, total, or prior clearance state conflicts.

## 9. Verification summary

- Clean clone: all 24 exact claim commands passed independently.
- Local: `npm test` passed 34/34; `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Live: `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test` passed 34/34.
- Live contract: `npm run test:live` passed, including catalog price, checkout redirect, deep links, 404, cache policy, and service worker.
- Factory URL check: passed in 676 ms with `lang=en`, one `h1`, one `main`, alt text, named buttons, and zero product-route console errors.
- Request audit: no off-origin request occurred in a fresh landing/demo flow; license verification is the only conditional Sociobot request observed by the registered test.

## What would make this perfect

Make re-imports preserve safety state: never reuse a paid amount across currencies, never remove a hold because an optional column is absent, and show a review step for material changes. Reject payment rows marked pending, failed, refunded, or reversed. Remove or prove the extra Dodo and passphrase claims. Store license tokens only after successful verification, disclose their retention, and let users remove them. Replace the ambiguous copy and align the static 404 footer. Then rerun the complete clean-clone claim matrix with the new import cases. Until those changes land, there is not “nothing left to do.”
