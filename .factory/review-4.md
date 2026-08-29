# Adversarial first-read review 4

**Product:** Paid Before Ship Gate  
**Reviewed:** 29 August 2026  
**Live URL:** <https://paid-before-ship-gate.sociobot.in>  
**Verdict:** **PASS**

No blocking or minor findings remain. This was a full review, not a diff-only
check. The evidence below was collected from a fresh Chromium context at 390 ×
844 and 1440 × 900, a fresh local clone, the deployed site, and the current
source.

## 1. Cold first screen

Before scrolling, on both viewports, the page communicates:

- **What it does:** prevents a seller from packing an unpaid order.
- **Who it is for:** small sellers who allow customers to pay later.
- **What to click first:** **Try it with sample data**.

The 390 px first screen contains the headline, audience sentence, one primary
action, its outcome (five orders, three ready and two held), and the three
plain facts. The action is a link to `/?demo=1`; no account or setup is
required. This is not a blocking first-read failure.

## 2. Copy audit

Counts use whitespace-separated words. The landing-page audit includes
headings, buttons, facts, alt text, and footer prose because each can be read
by a visitor. Sample order values and status rows are product data, not prose.
No unit is over 22 words. No jargon, marketing adjective, unexplained
metaphor, inconsistent term, or non-result naming button was found. `How it
works` is a standard structural section label and its following headline names
the actual workflow.

### Landing page

| Copy unit | Words | Result |
|---|---:|---|
| Skip to content | 3 | Pass |
| Paid Before Ship Gate | 4 | Pass |
| Demo | 1 | Pass |
| Order board | 2 | Pass |
| Privacy | 1 | Pass |
| A payment checkpoint for packing | 5 | Pass |
| Stop unpaid orders before packing | 5 | Pass |
| For small sellers who let customers pay later and need a clear check before packing. | 15 | Pass |
| Try it with sample data | 5 | Pass |
| Open five sample orders: three ready and two on hold. | 10 | Pass |
| Works offline after the first visit | 6 | Pass |
| Order data stays in this browser | 6 | Pass |
| $39 once for encryption and customer hold rules | 8 | Pass |
| A printed collage of parcels waiting at a payment checkpoint. | 10 | Pass |
| The order board | 3 | Pass |
| See which orders are ready to pack | 7 | Pass |
| See each order’s total, payments, and hold status on one board. | 11 | Pass |
| Current pack list | 3 | Pass |
| How it works | 3 | Pass |
| Turn an order spreadsheet into a pack list | 8 | Pass |
| Import order spreadsheets (CSV) | 4 | Pass |
| Use an order number and total. | 6 | Pass |
| Optional details are preserved when a returning order omits them. | 10 | Pass |
| Match payments | 2 | Pass |
| Successful or settled payments in the order currency make held orders ready. | 12 | Pass |
| Export the pack list | 4 | Pass |
| Only paid or manually approved orders are exported. | 8 | Pass |
| Payment exceptions and limits | 4 | Pass |
| You approve every payment exception | 5 | Pass |
| This tool does not score customers, collect debts, reserve stock, contact anyone, process payments, or print shipping labels. | 18 | Pass |
| New orders need only an order number and total. | 9 | Pass |
| Material changes to returning orders require your review. | 8 | Pass |
| One time | 2 | Pass |
| Paid features | 2 | Pass |
| Encrypt records and save customer hold rules | 7 | Pass |
| The free board includes imports, payment checks, approvals, backups, and pack lists. | 12 | Pass |
| Pay once to add encrypted local storage and customer hold rules. | 11 | Pass |
| Buy encryption and hold rules | 5 | Pass |
| Restore paid access / Manage paid access | 3 / 3 | Pass |
| Checkout opens a Dodo-hosted payment page. | 6 | Pass |
| Returns follow the linked Dodo Buyer Terms. | 7 | Pass |
| Check payment before an order is packed. | 7 | Pass |
| Built by Param Factory | 4 | Pass |
| Hero art was generated for this product. | 7 | Pass |

### README

| Sentence or heading | Words | Result |
|---|---:|---|
| Paid Before Ship Gate | 4 | Pass |
| Stop unpaid orders before packing with a local payment checkpoint. | 10 | Pass |
| This installable web app is for small sellers who let customers pay later. | 13 | Pass |
| It imports spreadsheet files (CSV), applies payment holds, records approvals, and exports ready orders as a pack list. | 18 | Pass |
| What it does | 4 | Pass |
| Imports order spreadsheets (CSV). | 4 | Pass |
| New orders require only `order_number` and `total`. | 7 | Pass |
| Preserves omitted details on re-import and asks you to review material changes. | 12 | Pass |
| Matches confirmed payment amounts and currencies through `order_number`. | 8 | Pass |
| Keeps held orders out of the pack list until paid or manually approved. | 13 | Pass |
| Records the approval name and reason in the exported pack list. | 11 | Pass |
| Exports and restores a complete backup file (JSON). | 8 | Pass |
| Marks packed orders complete so they do not enter the next pack list. | 13 | Pass |
| Works offline after the first online visit. | 7 | Pass |
| Stores order and payment data in this browser. | 8 | Pass |
| The free board includes every payment check, approval, backup, and export. | 11 | Pass |
| Paid features cost $39 once and add encrypted local storage and reusable customer hold rules. | 15 | Pass |
| Checkout opens a Dodo-hosted payment page. | 6 | Pass |
| Returns follow the linked Dodo Buyer Terms. | 7 | Pass |
| It does not process payments, score customers, collect debts, reserve stock, or print shipping labels. | 15 | Pass |
| Spreadsheet formats (CSV) | 3 | Pass |
| Orders | 1 | Pass |
| The `customer`, `currency`, `hold`, and `date` columns are optional for new orders. | 12 | Pass |
| Omit customer details for a redacted import. | 7 | Pass |
| Currency defaults to USD. | 4 | Pass |
| On re-import, blank or missing optional values keep the existing values. | 11 | Pass |
| Changes to totals, currencies, customers, or payment holds open a review before saving. | 13 | Pass |
| An order with recorded payments cannot change currency. | 8 | Pass |
| Payments | 1 | Pass |
| Payment currency defaults to USD when omitted and must match the order currency. | 13 | Pass |
| If a status column exists, only successful, confirmed, or settled rows are matched. | 13 | Pass |
| Pending, failed, refunded, and reversed rows are rejected. | 8 | Pass |
| The extra columns `bank_memo` and `settlement_note` are ignored. | 8 | Pass |
| Unique payment rows for one order are added together. | 9 | Pass |
| Develop and verify | 3 | Pass |
| Requires Node.js 20 or newer. | 5 | Pass |
| The exact production build command is `npm run build`. | 9 | Pass |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | Pass |
| Claim tests use Playwright 1.58.2. | 5 | Pass |
| Each product claim and its sandbox test is listed in `.factory/claims.json`. | 11 | Pass |
| Privacy and recovery | 3 | Pass |
| Records stay in this browser’s local database. | 7 | Pass |
| Demo records use a separate memory-only workspace and are discarded when the demo ends. | 14 | Pass |
| Spreadsheet and backup processing happen on the device. | 8 | Pass |
| With paid features, your passphrase encrypts records on this device. | 10 | Pass |
| The app does not store the passphrase, so you enter it again after reloading. | 14 | Pass |
| A valid license token stays in this browser until you choose Remove saved license. | 14 | Pass |
| Rejected tokens are not saved. | 5 | Pass |
| Sociobot is contacted only to verify a saved, returned, or entered license. | 12 | Pass |
| See `/privacy` and `/terms` in the app for the full policies. | 11 | Pass |
| Deploy | 1 | Pass |
| Deploy the contents of `dist/` as a static site. | 9 | Pass |
| `staticwebapp.config.json` provides single-page-app routing, the 404 response, the Content Security Policy, and other security headers. | 15 | Pass |
| The factory owns infrastructure, DNS, and billing registration. | 8 | Pass |
| After deployment, run `npm run test:live` to verify the live title, product slug, checkout redirect, deep links, 404 status, and cache policy. | 22 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |

Every visitor-facing product claim in these two surfaces maps to a registered
claim: sample entry, import/re-import, payment currency/status/aggregation,
hold gate, packed batch, export/backup, saved rules/free board, scope boundary,
local file storage, encryption/passphrase, offline, price/checkout, license
storage/network use, and original art. The operational build and deployment
instructions were separately executed below. No unlisted claim was found.

## 3. One-click demo and sandbox

The landing action reached `/?demo=1` in one click. At 390 × 844, the first
screen after that click showed the persistent **Demo — sample data, nothing is
saved** banner, **Reset demo**, **Start for real**, and these realistic sample
records before the board controls:

- `SO-1048 · Moss & Thread · $186.00 · Ready · paid`
- `SO-1049 · Brighton Pantry · $94.50 · Hold · $94.50 due`

The route contains five sample orders with three ready and two held. Reset
returned the sample workspace to five seeded orders. Source confirmation:
`start()` selects `sampleData()` for demo, `persist()` does not call IndexedDB
when `demo` is true, backup import similarly skips `saveData`, and leaving demo
calls `loadRealData()`. The clean-clone `@claim:demo-sandbox` test additionally
seeded a real `REAL-9001` record, changed/reset demo, left demo, and confirmed
the real record survived while sample records did not. It also confirms a demo
license query neither persists nor makes a license request.

The live demo request log contained only the product origin (HTML, JS, CSS,
self-hosted fonts, and image); it made no external request. This confirms the
privacy/offline path is not a decorative demo.

## 4. Claims gate

Fresh clone used: `/tmp/paid-before-ship-gate-review4-huZR8g`.
`npm ci` completed with no vulnerabilities. Each of the 29 exact commands in
`.factory/claims.json` was run independently from that clone. Every command
passed:

`demo-sandbox`, `demo-entry`, `csv-order-import`, `order-reimport-safety`,
`payment-currency`, `payment-default-currency`, `payment-aggregation`,
`hold-gate`, `batch-packed`, `csv-export`, `json-backup`,
`saved-customer-hold-rules`, `free-board`, `default-currency`, `extra-columns`,
`payment-status`, `scope-boundary`, `local-only`, `backup-import-local`,
`device-encryption`, `passphrase-not-stored`, `offline-reload`,
`installable-pwa`, `purchase-terms`, `license-inactivity`,
`license-storage-control`, `no-tracking`, `license-network-only`, and
`original-art`.

The registry has 29 entries and `tests/claims.spec.ts` has each
`@claim:<id>` tag exactly once. The live release verification also passed: it
confirmed HTTP 200 for the documented routes, HTTP 404 for an unknown route,
immutable hashed assets, a revalidating service worker, catalog price USD 39,
and the Dodo checkout redirect.

## 5. Earlier finding audit

All earlier review and polish files were read. The table records actual live
and source/test confirmation, rather than accepting a polish document’s status
label.

| Earlier ID | Confirmation |
|---|---|
| F-1-1 | Fixed: live demo rejects a changed currency after recorded payment; `csv.ts` guards it; `payment-currency` passed. |
| F-1-2 | Fixed: live board marks ready orders packed, excludes them from export, filters them, and restores them; `batch-packed` passed. |
| F-1-3 | Fixed: memory-only demo and real-board return were observed; `demo-sandbox` passed. |
| F-1-4 | Fixed: complete backup restore/reload equality is exercised by `json-backup`. |
| F-1-5 | Fixed: live one-click demo visibly has five records, 3 ready/2 held; `demo-entry` passed. |
| F-1-6 | Fixed: live boundary copy is present and no excluded action is offered; `scope-boundary` passed. |
| F-1-7 | Fixed: live unlicensed board exposes imports, checks, approvals, backups, and pack list; `free-board` passed. |
| F-1-8 | Fixed: omitted order currency becomes USD in visible board/backup/export; `default-currency` passed. |
| F-1-9 | Fixed: only named note columns are ignored and payment currency is read; `extra-columns` passed. |
| F-1-10 | Fixed: duplicate references do not re-add partial payments; `payment-aggregation` passed. |
| F-1-11 | Fixed: live paid flow and IndexedDB assertion prove encrypted storage and no plaintext/passphrase; encryption claims passed. |
| F-1-12 | Fixed: live copy makes only the tested hosted-checkout/Buyer-Terms statement; `purchase-terms` passed. |
| F-1-13 | Fixed: live unknown path is a styled HTTP 404 with header, footer, metadata, and legal links. |
| F-1-14 | Fixed: History API source stores scroll state and focuses the destination h1; route/history test passed. |
| F-1-15 | Fixed: live preview heading is “See which orders are ready to pack.” |
| F-1-16 | Fixed: live boundary heading is “You approve every payment exception.” |
| F-1-17 | Fixed: live preview names total, payments, and hold status. |
| F-1-18 | Fixed: live user copy uses “approval” for manual payment exceptions; `hold-gate` passed. |
| F-1-19 | Fixed: live reusable setting is consistently “customer hold rule”; saved-rule claim passed. |
| F-1-20 | Fixed: live action is “Restore paid access” or “Manage paid access,” both result naming. |
| F-1-21 | Fixed: README calls it an installable web app and installability is tested. |
| F-1-22 | Fixed: README states the user outcome without implementation jargon; passphrase claims passed. |
| F-1-23 | Fixed: README expands deployment terms and `test:live` was executed successfully. |
| F-1-24 | Fixed: live request capture and route-wide `no-tracking`/license-network tests passed. |
| F-1-25 | Fixed: backup sentinel remains absent from request bodies; `backup-import-local` passed. |
| F-2-1 | Fixed: two sample cards are in the initial 390 px viewport (y=207–289 and y=299–381). |
| F-2-2 | Fixed: omitted payment currency is USD-only and cannot clear GBP; claim passed. |
| F-2-3 | Fixed: live label is “How it works.” |
| F-2-4 | Fixed: live label is “Payment exceptions and limits.” |
| F-2-5 | Fixed: no desk-kit/vault lore remains in live purchase copy. |
| F-2-6 | Fixed: live board heading names exporting/restoring a workspace backup. |
| F-2-7 | Fixed: live terms h1 names terms and the order board. |
| F-2-8 | Fixed: live 404 says “Page not found,” explains the error, and links home. |
| F-2-9 | Fixed: first user-facing references expand spreadsheet (CSV) and backup (JSON). |
| F-2-10 | Fixed: README expands single-page-app routing and Content Security Policy. |
| F-3-1 | Fixed: omitted optional re-import values are retained and material changes open a visible review; `order-reimport-safety` passed. |
| F-3-2 | Fixed: pending, failed, refunded, and reversed payments are refused; successful/confirmed/settled are accepted; claim passed. |
| F-3-3 | Fixed: source saves only accepted tokens and exposes removal; storage-control and demo-license tests passed. |
| F-3-4 | Fixed: live privacy copy says the passphrase is not stored and must be re-entered after reload; claim passed. |
| F-3-5 | Fixed: terms accurately says the user chooses payment files, reviews matches, and decides holds/approvals. |
| F-3-6 | Fixed: live workflow heading is “Turn an order spreadsheet into a pack list.” |
| F-3-7 | Fixed: live metadata uses “Import spreadsheets,” not unexplained CSV. |
| F-3-8 | Fixed: static 404 footer marks the factory link as external for screen readers. |

## 6. Structure, accessibility, routing, and identity

- The deployed home has title **Paid Before Ship Gate — check payment before
  packing**, `lang=en`, one h1, one main landmark, plain meta description,
  canonical, Open Graph/Twitter metadata, SVG favicon, 180 px Apple icon, and
  a 1200 × 630 product-specific social card.
- `/`, `/demo`, `/board`, `/privacy`, and `/terms` return 200 as deep links.
  `/definitely-not-a-route` returns 404 with the same designed skeleton. The
  sitemap and robots files list the public routes.
- Every first-party link crawled to its expected response. The documented
  external links returned 200 or, for checkout, redirected to Dodo as declared.
- Source and Playwright checks confirm pushState navigation, Back scroll
  restoration, h1 focus, live route announcement, skip links, dialogs, 44 px
  touch targets, 390 px reflow, 200% text, and no serious/critical Axe issues.
- The deployed CSP is delivered as a response header and includes
  `frame-ancestors 'none'`; it permits only self assets plus the declared
  Sociobot API connection. Fresh home and demo loads had no console errors.
- The tactile risograph dispatch-desk system is distinct from a generic SaaS
  template: cream paper, teal/coral/mustard ink, clipped paper, stamp status
  marks, self-hosted Atkinson Hyperlegible, and original collage art match the
  documented visual thesis. It retains a clear operational hierarchy on phone.

## 7. Missed leverage

No missing high-value step was found. The brief requires imports, payment
matching, hold/approval control, a pack-list export, backup, privacy, and
offline use; all are present. AI would not improve this deterministic safety
checkpoint and no decorative AI feature or embedded provider key exists.

## What would make this perfect

No product change is required from this review. Continue to run the existing
claim suite and `npm run test:live` after future changes, especially changes to
CSV matching, demo isolation, payment copy, static routing, or checkout text.
