# Adversarial first-read review 2 — FAIL

**Product:** Paid Before Ship Gate  
**Live URL:** <https://paid-before-ship-gate.sociobot.in>  
**Reviewed:** 29 August 2026 UTC  
**Candidate:** `673fc92c52441b8093344fc7ea599a6dc824183b`  
**Verdict:** **FAIL** — 2 blocking, 1 major, and 8 minor findings remain.

## 1. Cold first screen

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900. Storage was not shared and neither page was scrolled before this interpretation was recorded.

| Question | Mobile answer | Desktop answer |
|---|---|---|
| What does this do? | It stops unpaid orders before they are packed. | It checks whether orders are paid before packing. |
| For whom? | Small sellers preparing a packing batch. | Small sellers who need a payment check for each packing batch. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

The first screen passes. The exact text doing the work is “Stop unpaid orders before packing,” “For small sellers who need a payment check before each packing batch,” and “Try it with sample data.” The adjacent result text says “Open five sample orders: three ready and two on hold.”

## 2. Findings

### Blocking

#### F-2-1 — The mobile demo does not show sample records on its first screen

- **Quote/location:** live `/?demo=1` at 390 × 844; the first screen shows “Choose today’s pack list,” five import/export controls, and the start of the filters.
- **Evidence:** the demo banner occupies y=80–162, the tools y=534–690, the filters y=742–958, and the first realistic order starts at y=972. No order number, customer, amount, or payment status appears before scrolling. At 1440 × 900, the first order starts at y=649 and is visible.
- **Why this fails:** the required one-click demo must immediately show the product being used with realistic sample data. A phone visitor sees controls and summary counts, not the promised five sample orders. This is a weak demo and therefore blocking.
- **Concrete fix:** on mobile, place a compact two-order sample preview directly below the demo banner or heading, before the import controls and full filter stack. Show at least one ready and one held order in the initial 844 px viewport. Add a 390 × 844 test using `toBeInViewport()` for a customer, amount, and held/ready status after the landing action.

#### F-1-12 — Purchase and refund disclosure remains half-fixed

- **Quote/location:** landing and README, “Sociobot provides checkout. Dodo processes payment and handles the receipt.” Landing, “See the terms for refunds.” Terms, “Refunds follow the checkout terms.”
- **Evidence:** `@claim:purchase-terms` only asserts that the product’s own `$39` copy is visible and that the button has a Sociobot URL. It does not verify the catalog price, one-time billing, Dodo’s handling of receipts, or any refund rule. `npm run test:live` independently confirms a $39 catalog entry and a redirect to a Dodo-hosted URL, but still does not prove the receipt statement. The terms page neither states a refund window/eligibility rule nor links to the “checkout terms” it invokes.
- **Why this fails:** a buyer still cannot determine the applicable refund policy or responsible party. A static-copy assertion can pass when billing configuration or legal handling disagrees. This is the same legal-identity/checkout problem raised in round 1, only partly repaired, so it is blocking again under the same ID.
- **Concrete fix:** replace the unprovable receipt wording with the observable result, for example, “Checkout opens a Dodo-hosted payment page.” State the actual refund owner, eligibility, and time window on `/terms`, or link the exact applicable policy. Extend `@claim:purchase-terms` to query the Sociobot catalog and verify price/currency, follow the checkout redirect without paying, and assert any remaining observable disclosure. Remove any claim that cannot be tested.

### Major

#### F-2-2 — Payment-currency default is an unlisted claim

- **Quote/location:** README, “Payment currency defaults to USD when omitted and must match the order currency.”
- **Evidence:** `default-currency` covers only an **order** CSV without currency. `payment-currency` imports both USD and GBP payment files with explicit currency values. No claim entry or tagged test imports a payment with the currency omitted.
- **Why this fails:** the default changes the meaning of money and can decide whether an order clears. The behavior may currently work, but the published promise is not protected by the claims gate.
- **Concrete fix:** add a `payment-default-currency` claim and test that an omitted payment currency becomes USD, clears a USD order, and does not clear a non-USD order; or require currency and delete the sentence.

### Minor copy and structure findings

#### F-2-3 — “Three passes” is a decorative label

- **Quote/location:** landing section label, “Three passes.”
- **Why this fails:** it does not identify the section when read alone and adds no information beyond the numbered steps.
- **Concrete rewrite:** delete it, or use “How it works.”

#### F-2-4 — “A narrow guardrail” is a metaphor label

- **Quote/location:** landing section label, “A narrow guardrail.”
- **Why this fails:** it does not say that the section defines manual approvals and product limits.
- **Concrete rewrite:** “Payment exceptions and limits.”

#### F-2-5 — “Desk kit” and “vault” are invented product lore

- **Quote/location:** landing/README/terms/buttons, including “Paid desk kit,” “Buy the desk kit,” “Restore desk kit,” and “encrypted vault.”
- **Why this fails:** these terms make visitors decode a metaphor before learning that this is paid access to encryption and reusable hold rules. “Restore desk kit” also fails to name the result of restoring paid access.
- **Concrete rewrite:** use “Paid features,” “Buy encryption and hold rules,” “Restore paid access,” and “encrypted local storage.”

#### F-2-6 — The backup heading does not name backups

- **Quote/location:** board/demo `h2`, “Keep control of the file.”
- **Why this fails:** “the file” has no antecedent in a heading list and does not identify the export/import backup section.
- **Concrete rewrite:** “Export or restore a workspace backup.”

#### F-2-7 — The terms headline is metaphorical and vague

- **Quote/location:** `/terms` `h1`, “Use the gate as a checklist.”
- **Why this fails:** it does not identify terms, purchases, responsibilities, or limitations; “the gate” depends on brand metaphor.
- **Concrete rewrite:** “Terms for using the order board.”

#### F-2-8 — The 404 relies on dispatch metaphors

- **Quote/location:** live 404, “404 · wrong dispatch lane,” “This page missed the pack list,” and “Return to the checkpoint.”
- **Why this fails:** the route works, but none of these phrases states the error or destination directly. The plain-words rule explicitly excludes brand-lore and metaphor headings.
- **Concrete rewrite:** “Page not found,” “This page does not exist,” and “Return home.”

#### F-2-9 — User-facing file formats are introduced as unexplained abbreviations

- **Quote/location:** README, “It imports order and payment CSV files” and “Exports and restores a complete JSON backup.” Landing/button, “Import order CSV.”
- **Why this fails:** a small seller may not know CSV or JSON before using the first import or deciding whether their export is compatible.
- **Concrete rewrite:** first use: “Import spreadsheet files (CSV) for orders and payments.” Backup: “Export and restore a complete backup file (JSON).” Keep the shorter labels after that explanation.

#### F-2-10 — Deployment abbreviations are not expanded

- **Quote/location:** README, “`staticwebapp.config.json` provides the SPA fallback, 404 behavior, CSP, and security headers.”
- **Why this fails:** “SPA” and “CSP” are unexplained even though this sentence is supposed to tell a deployer what the file does.
- **Concrete rewrite:** “`staticwebapp.config.json` provides single-page-app routing, the 404 response, the Content Security Policy, and other security headers.”

No sentence on the landing page or README exceeds 22 words. No banned marketing adjective appears. The remaining copy defects are the non-informative/metaphorical labels, opaque paid-tier vocabulary, and unexplained abbreviations listed above.

## 3. Landing-page copy audit

Counts use whitespace-separated words; the `·` separator is not counted. Preview order values and the decorative HOLD stamp are data/art rather than sentences and are excluded. The image alt text is included.

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
| Three passes | 2 | F-2-3 |
| Turn order exports into a pack list | 8 | — |
| Import orders | 2 | — |
| Use an order number, total, and optional customer or payment hold columns. | 12 | — |
| Match payments | 2 | — |
| Import amounts and currencies. | 4 | — |
| Fully paid orders become ready. | 5 | — |
| Export the pack list | 4 | — |
| Only paid or manually approved orders are exported. | 8 | — |
| A narrow guardrail | 3 | F-2-4 |
| You approve every payment exception | 5 | — |
| This tool does not score customers, collect debts, reserve stock, contact anyone, process payments, or print shipping labels. | 18 | — |
| Imports may omit names, references, and dates. | 7 | — |
| Only order numbers and amounts are required. | 7 | — |
| $39 | 1 | — |
| One time | 2 | — |
| Paid desk kit | 3 | F-2-5 |
| Encrypt records and save customer hold rules | 7 | — |
| The free board includes imports, payment checks, approvals, backups, and pack lists. | 12 | — |
| Pay once to add an encrypted vault and customer hold rules. | 11 | F-2-5 |
| Buy the desk kit | 4 | F-2-5 |
| Restore desk kit | 3 | F-2-5 |
| Sociobot provides checkout. | 3 | F-1-12 |
| Dodo processes payment and handles the receipt. | 7 | F-1-12 |
| See the terms for refunds. | 5 | F-1-12 |
| Paid Before Ship Gate | 4 | — |
| Check payment before an order is packed. | 7 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v1.0.1 | 1 | — |
| Hero art was generated for this product. | 7 | — |

## 4. README copy audit

Code blocks are sample data/commands and are excluded. Inline code is counted as ordinary words.

| Sentence or heading | Words | Flag |
|---|---:|---|
| Paid Before Ship Gate | 4 | — |
| Stop unpaid orders before packing with a local payment checkpoint. | 10 | — |
| This installable web app is for small sellers who let customers pay later. | 13 | — |
| It imports order and payment CSV files, applies payment holds, records named approvals, and exports only ready orders as a pack list. | 22 | F-2-9 |
| Live site: https://paid-before-ship-gate.sociobot.in | 3 | — |
| One-click demo: https://paid-before-ship-gate.sociobot.in/?demo=1 | 3 | — |
| What it does | 3 | — |
| Imports order CSV files. | 4 | F-2-9 |
| Only `order_number` and `total` are required. | 6 | — |
| Matches payment amounts and currencies through `order_number`. | 7 | — |
| Keeps held orders out of the pack list until paid or manually approved. | 13 | — |
| Records the approval name and reason in the exported pack list. | 11 | — |
| Exports and restores a complete JSON backup. | 7 | F-2-9 |
| Marks packed orders complete so they do not enter the next pack list. | 13 | — |
| Works offline after the first online visit. | 7 | — |
| Stores order and payment data in this browser. | 8 | — |
| The free board includes every payment check, approval, backup, and export. | 11 | — |
| The $39 one-time desk kit adds local passphrase encryption and reusable customer hold rules. | 14 | F-2-5 |
| Sociobot provides checkout. | 3 | F-1-12 |
| Dodo processes payment and handles the receipt. | 7 | F-1-12 |
| It does not process payments, score customers, collect debts, reserve stock, or print shipping labels. | 15 | — |
| CSV formats | 2 | F-2-9 |
| Orders | 1 | — |
| The `customer`, `currency`, `hold`, and `date` columns are optional. | 9 | — |
| Omit customer details for a redacted import. | 7 | — |
| Currency defaults to USD. | 4 | — |
| Payments | 1 | — |
| Payment currency defaults to USD when omitted and must match the order currency. | 13 | F-2-2 |
| Harmless extra columns are ignored. | 5 | — |
| Unique payment rows for one order are added together. | 9 | — |
| Develop and verify | 3 | — |
| Requires Node.js 20 or newer. | 5 | — |
| The exact production build command is `npm run build`. | 9 | — |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | — |
| Claim tests use Playwright 1.58.2. | 5 | — |
| Each product claim and its sandbox test is listed in `.factory/claims.json`. | 11 | F-2-2, F-1-12 |
| Privacy and recovery | 3 | — |
| Records stay in this browser’s local database. | 7 | — |
| Demo records use a separate memory-only workspace and are discarded when the demo ends. | 14 | — |
| CSV and backup processing happen on the device. | 8 | F-2-9 |
| With the desk kit, your passphrase encrypts records on this device. | 11 | F-2-5 |
| The app does not store the passphrase. | 7 | — |
| A lost passphrase cannot be recovered, so export backups before enabling encryption. | 12 | — |
| See `/privacy` and `/terms` in the app for the full policies. | 11 | — |
| Deploy | 1 | — |
| Deploy the contents of `dist/` as a static site. | 9 | — |
| `staticwebapp.config.json` provides the SPA fallback, 404 behavior, CSP, and security headers. | 11 | F-2-10 |
| The factory owns infrastructure, DNS, and billing registration. | 8 | — |
| After deployment, run `npm run test:live` to verify the live title, product slug, checkout redirect, deep links, 404 status, and cache policy. | 22 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

## 5. Demo and sandbox results

| Check | Result | Evidence |
|---|---|---|
| One click from landing | PASS | CTA opens `/?demo=1`. |
| Realistic seeded state | PASS | Five named orders; three ready and two held. |
| First demo screen, desktop | PASS | First order is visible at y=649 in a 900 px viewport. |
| First demo screen, mobile | **FAIL** | First order begins at y=972 in an 844 px viewport; F-2-1. |
| Persistent banner | PASS | “Demo — sample data, nothing is saved,” Reset, and Start for real remain present. |
| Reset | PASS | A changed sample state returns to five orders, 3 ready/2 held. |
| Real-data isolation | PASS | Seeded `REAL-R2-9001` survived demo entry/reset/exit; no `SO-1048` entered the real board. |
| Off-origin requests | PASS | None during the complete demo flow. |
| Offline demo | PASS | After service-worker activation, offline reload showed all five sample orders and the offline notice. |

## 6. Claims registry

Every exact command in `.factory/claims.json` was run independently after `git clone --no-local /work/repo /tmp/pbsg-review2-7lOen3` and `npm ci`.

| Claim | Result |
|---|---|
| `demo-sandbox` | PASS |
| `demo-entry` | PASS |
| `csv-order-import` | PASS |
| `payment-currency` | PASS |
| `payment-aggregation` | PASS |
| `hold-gate` | PASS |
| `batch-packed` | PASS |
| `csv-export` | PASS |
| `json-backup` | PASS |
| `saved-customer-hold-rules` | PASS |
| `free-board` | PASS |
| `default-currency` | PASS |
| `extra-columns` | PASS |
| `scope-boundary` | PASS |
| `local-only` | PASS |
| `backup-import-local` | PASS |
| `device-encryption` | PASS |
| `passphrase-not-stored` | PASS |
| `offline-reload` | PASS |
| `purchase-terms` | PASS, but insufficient assertion; F-1-12 |
| `license-inactivity` | PASS |
| `no-tracking` | PASS |
| `license-network-only` | PASS |

The live catalog currently reports USD 39.00 and `npm run test:live` confirms the checkout endpoint redirects to Dodo. Those checks are not part of the exact test declared for `purchase-terms`. The payment-default sentence has no registry entry (F-2-2).

## 7. Earlier finding audit

Each round-1 finding was checked against the live product and the current code/tests, not only against `.factory/polish-1.md`.

| Earlier ID | Status in round 2 | Evidence |
|---|---|---|
| F-1-1 | Fixed | Mismatched currency rejection and matching-currency success pass in `payment-currency`. |
| F-1-2 | Fixed | Mark packed, exclusion from the next export, Packed filter, and restore pass in `batch-packed`. |
| F-1-3 | Fixed | `demo-sandbox` seeds and preserves `REAL-9001`; manual live isolation also passed. |
| F-1-4 | Fixed | Full backup object, history/payment keys, real-workspace restore, reload, and equality pass. |
| F-1-5 | Fixed | Landing action and five-order 3-ready/2-held state are listed and tested. Mobile presentation is a new blocker, F-2-1. |
| F-1-6 | Fixed | Boundary copy and available-action audit pass. |
| F-1-7 | Fixed | All named free controls are present without an entitlement. |
| F-1-8 | Fixed | Omitted **order** currency is tested across board, backup, and export. The payment default is a separate new gap, F-2-2. |
| F-1-9 | Fixed | Extra order/payment columns pass while currency is read. |
| F-1-10 | Fixed | Two unique partial payments aggregate and duplicate source rows do not. |
| F-1-11 | Fixed | Plaintext and passphrase are absent at rest; reload requires the passphrase. |
| F-1-12 | **Half-fixed; blocking again** | Wording is consistent, but the claim test is self-referential and refund terms remain unspecified/unlinked. |
| F-1-13 | Fixed | Live unknown route returns 404 with full metadata, header, footer, and legal links. Its metaphor copy is a new F-2-8 issue. |
| F-1-14 | Fixed | Live Back restores scroll and focuses the destination `h1`; the live Playwright test passes. |
| F-1-15 | Fixed | Heading is now “See which orders are ready to pack.” |
| F-1-16 | Fixed | Heading is now “You approve every payment exception.” |
| F-1-17 | Fixed | Preview says “See each order’s total, payments, and hold status on one board.” |
| F-1-18 | Fixed | User-facing exception language consistently uses “approval.” |
| F-1-19 | Fixed | Reusable settings consistently use “customer hold rule.” |
| F-1-20 | Fixed literally | “Paste a license” became “Restore desk kit”; the opaque “desk kit” noun is a new F-2-5 issue. |
| F-1-21 | Fixed | README now says “installable web app,” not unexplained “PWA.” |
| F-1-22 | Fixed | README states the practical local-storage/encryption result; algorithm names are removed. |
| F-1-23 | Fixed | Deployment verification targets are named. |
| F-1-24 | Fixed | `no-tracking` covers all app routes and `license-network-only` covers the explicit license request. |
| F-1-25 | Fixed | Unique backup sentinel is absent from every recorded request body. |

## 8. Structure, routing, accessibility, and visual identity

| Check | Result |
|---|---|
| Route titles | PASS: product/job title on `/`; route/product titles on demo, board, privacy, terms, and 404; all under 60 characters. |
| One `h1`, one `main`, heading order | PASS on `/`, `/demo`, `/board`, `/privacy`, `/terms`, and 404. |
| Description, canonical, OG/Twitter, icons | PASS on all routes. Social image is 1200 × 630; apple icon is 180 × 180. |
| Deep links | PASS: `/demo`, `/board`, `/privacy`, and `/terms` return 200 directly. |
| Back/focus | PASS in the live 33-test suite: scroll restores and focus moves to the route heading. |
| 404 | PASS for HTTP status, shell, metadata, navigation, and visual design; FAIL for metaphor copy, F-2-8. |
| Link crawl | PASS: all internal links and `https://sociobot.in/` return 200; checkout returns the expected 303 Dodo redirect. |
| Header/footer | PASS and consistent across app and static 404 routes. |
| Console | PASS on product routes; the factory verifier recorded zero errors. Chromium reports the expected failed-resource line for the intentionally 404 main document only. |
| Accessibility | PASS: live Playwright-Axe found zero serious/critical issues across all app routes; mobile keyboard, 200% text, focus, names, and touch-target checks passed. The standalone Axe CLI could not start because its Selenium Chrome binary is absent in this worker. |
| Reduced motion | PASS in code: smooth scroll and animations/transitions are disabled under `prefers-reduced-motion`. |
| Visual identity | PASS: the cream-paper risograph dispatch desk, stamp shapes, ink palette, illustration, and clipped sheets are distinct rather than a generic SaaS template. |
| Bundle | PASS: initial JS is 36.09 KB raw / 11.81 KB gzip; CSS is 18.29 KB raw / 4.76 KB gzip. |

## 9. Missed leverage

No additional AI feature is justified. This is a deterministic financial safety gate; model-assisted matching could make the release decision less explainable. Import, export, full backup/restore, manual entry, reusable customer rules, and batch completion already cover the obvious local-first extensions. Sync is not implied strongly enough to outweigh the stated privacy direction.

## 10. Verification summary

- `npm test`: **33/33 passed** locally; build created `dist/`.
- `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: **33/33 passed** live.
- All 23 exact claim commands: **passed** from a clean clone.
- `npm run lint`: **passed**.
- `npm run test:live`: **passed**; live catalog price/currency, checkout redirect, routes, 404, and cache behavior confirmed.
- `/opt/fleet/lib/verify-url.sh`: **passed**; title/lang/h1/main/alt/button/console checks passed in 1,132 ms.
- Standalone `npx @axe-core/cli`: **not run successfully** because Selenium could not find Chrome; equivalent Playwright-Axe coverage passed live on every app route.

## What would make this perfect

Make actual sample orders visible without scrolling on a 390 × 844 demo entry, replace the self-referential paid claim test with billing/redirect evidence, publish an exact refund policy, register and test the omitted payment-currency default, and replace every remaining decorative/metaphorical label with the concrete rewrites above. Re-run the complete clean-clone claim matrix, live mobile screenshot check, link crawl, and accessibility suite. There is not yet “nothing left to do.”
