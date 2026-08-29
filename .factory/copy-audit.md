# Copy audit

Audited 29 August 2026 after polish round 3. Counts use whitespace-separated words. Sample order values, code samples, and decorative status stamps are data rather than prose. No sentence exceeds 22 words, and no banned marketing word appears.

## Landing page

| Copy unit | Words | Flag |
|---|---:|---|
| Skip to content | 3 | — |
| Paid Before Ship Gate | 4 | — |
| Demo | 1 | — |
| Order board | 2 | — |
| Privacy | 1 | — |
| A payment checkpoint for packing | 5 | — |
| Stop unpaid orders before packing | 5 | — |
| For small sellers who let customers pay later and need a clear check before packing. | 15 | — |
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
| How it works | 3 | — |
| Turn an order spreadsheet into a pack list | 8 | — |
| Import order spreadsheets (CSV) | 4 | — |
| Use an order number and total. | 6 | — |
| Optional details are preserved when a returning order omits them. | 10 | — |
| Match payments | 2 | — |
| Successful or settled payments in the order currency make held orders ready. | 12 | — |
| Export the pack list | 4 | — |
| Only paid or manually approved orders are exported. | 8 | — |
| Payment exceptions and limits | 4 | — |
| You approve every payment exception | 5 | — |
| This tool does not score customers, collect debts, reserve stock, contact anyone, process payments, or print shipping labels. | 18 | — |
| New orders need only an order number and total. | 9 | — |
| Material changes to returning orders require your review. | 8 | — |
| One time | 2 | — |
| Paid features | 2 | — |
| Encrypt records and save customer hold rules | 7 | — |
| The free board includes imports, payment checks, approvals, backups, and pack lists. | 12 | — |
| Pay once to add encrypted local storage and customer hold rules. | 11 | — |
| Buy encryption and hold rules | 5 | — |
| Restore paid access / Manage paid access | 3 / 3 | — |
| Checkout opens a Dodo-hosted payment page. | 6 | — |
| Returns follow the linked Dodo Buyer Terms. | 7 | — |
| Check payment before an order is packed. | 7 | — |
| Built by Param Factory | 4 | — |
| Hero art was generated for this product. | 7 | — |

## README

| Sentence | Words | Flag |
|---|---:|---|
| Stop unpaid orders before packing with a local payment checkpoint. | 10 | — |
| This installable web app is for small sellers who let customers pay later. | 13 | — |
| It imports spreadsheet files (CSV), applies payment holds, records approvals, and exports ready orders as a pack list. | 18 | — |
| New orders require only order_number and total. | 7 | — |
| Preserves omitted details on re-import and asks you to review material changes. | 12 | — |
| Matches confirmed payment amounts and currencies through order_number. | 8 | — |
| Keeps held orders out of the pack list until paid or manually approved. | 13 | — |
| Records the approval name and reason in the exported pack list. | 11 | — |
| Exports and restores a complete backup file (JSON). | 8 | — |
| Marks packed orders complete so they do not enter the next pack list. | 13 | — |
| Works offline after the first online visit. | 7 | — |
| Stores order and payment data in this browser. | 8 | — |
| The free board includes every payment check, approval, backup, and export. | 11 | — |
| Paid features cost $39 once and add encrypted local storage and reusable customer hold rules. | 15 | — |
| Checkout opens a Dodo-hosted payment page. | 6 | — |
| Returns follow the linked Dodo Buyer Terms. | 7 | — |
| It does not process payments, score customers, collect debts, reserve stock, or print shipping labels. | 15 | — |
| The customer, currency, hold, and date columns are optional for new orders. | 12 | — |
| Omit customer details for a redacted import. | 7 | — |
| Currency defaults to USD. | 4 | — |
| On re-import, blank or missing optional values keep the existing values. | 11 | — |
| Changes to totals, currencies, customers, or payment holds open a review before saving. | 13 | — |
| An order with recorded payments cannot change currency. | 8 | — |
| Payment currency defaults to USD when omitted and must match the order currency. | 13 | — |
| If a status column exists, only successful, confirmed, or settled rows are matched. | 13 | — |
| Pending, failed, refunded, and reversed rows are rejected. | 8 | — |
| The extra columns bank_memo and settlement_note are ignored. | 8 | — |
| Unique payment rows for one order are added together. | 9 | — |
| Requires Node.js 20 or newer. | 5 | — |
| The exact production build command is npm run build. | 9 | — |
| Static output lands in dist, with dist/index.html at its root. | 10 | — |
| Claim tests use Playwright 1.58.2. | 5 | — |
| Each product claim and its sandbox test is listed in .factory/claims.json. | 11 | — |
| Records stay in this browser’s local database. | 7 | — |
| Demo records use a separate memory-only workspace and are discarded when the demo ends. | 14 | — |
| Spreadsheet and backup processing happen on the device. | 8 | — |
| With paid features, your passphrase encrypts records on this device. | 10 | — |
| The app does not store the passphrase, so you enter it again after reloading. | 14 | — |
| A valid license token stays in this browser until you choose Remove saved license. | 14 | — |
| Rejected tokens are not saved. | 5 | — |
| Sociobot is contacted only to verify a saved, returned, or entered license. | 12 | — |
| See /privacy and /terms in the app for the full policies. | 11 | — |
| Deploy the contents of dist as a static site. | 9 | — |
| staticwebapp.config.json provides single-page-app routing, the 404 response, the Content Security Policy, and other security headers. | 15 | — |
| The factory owns infrastructure, DNS, and billing registration. | 8 | — |
| After deployment, run npm run test:live to verify the live title, product slug, checkout redirect, deep links, 404 status, and cache policy. | 22 | — |

## First-screen read-aloud check

“Stop unpaid orders before packing. For small sellers who let customers pay later and need a clear check before packing. Try it with sample data.”

The job, audience, and first action fit in one breath.

## Terminology

| Concept | One term |
|---|---|
| imported sale | order |
| payment restriction | payment hold |
| working view | order board |
| dispatch export | pack list |
| manual exception | approval |
| reusable customer setting | customer hold rule |
| encrypted browser store | encrypted local storage |
| paid add-on | paid features |
