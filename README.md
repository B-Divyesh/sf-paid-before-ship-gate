# Paid Before Ship Gate

Stop unpaid orders before packing with a local payment checkpoint.

This installable web app is for small sellers who let customers pay later. It imports spreadsheet files (CSV), applies payment holds, records approvals, and exports ready orders as a pack list.

Live site: https://paid-before-ship-gate.sociobot.in

One-click demo: https://paid-before-ship-gate.sociobot.in/?demo=1

## What it does

- Imports order spreadsheets (CSV). New orders require only `order_number` and `total`.
- Preserves omitted details on re-import and asks you to review material changes.
- Matches confirmed payment amounts and currencies through `order_number`.
- Keeps held orders out of the pack list until paid or manually approved.
- Records the approval name and reason in the exported pack list.
- Exports and restores a complete backup file (JSON).
- Marks packed orders complete so they do not enter the next pack list.
- Works offline after the first online visit.
- Stores order and payment data in this browser.

The free board includes every payment check, approval, backup, and export. Paid features cost $39 once and add encrypted local storage and reusable customer hold rules.

Checkout opens a Dodo-hosted payment page. Returns follow the linked Dodo Buyer Terms.

It does not process payments, score customers, collect debts, reserve stock, or print shipping labels.

## Spreadsheet formats (CSV)

Orders:

```csv
order_number,customer,total,currency,hold,date
SO-1048,Moss & Thread,186.00,USD,yes,2026-08-27
```

The `customer`, `currency`, `hold`, and `date` columns are optional for new orders. Omit customer details for a redacted import. Currency defaults to USD.

On re-import, blank or missing optional values keep the existing values. Changes to totals, currencies, customers, or payment holds open a review before saving. An order with recorded payments cannot change currency.

Payments:

```csv
order_number,amount,currency,payment_status,reference
SO-1048,186.00,USD,settled,PAY-2048
```

Payment currency defaults to USD when omitted and must match the order currency. If a status column exists, only successful, confirmed, or settled rows are matched. Pending, failed, refunded, and reversed rows are rejected.

The extra columns `bank_memo` and `settlement_note` are ignored. Unique payment rows for one order are added together.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

The exact production build command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

Claim tests use Playwright 1.58.2. Each product claim and its sandbox test is listed in `.factory/claims.json`.

## Privacy and recovery

Records stay in this browser’s local database. Demo records use a separate memory-only workspace and are discarded when the demo ends. Spreadsheet and backup processing happen on the device.

With paid features, your passphrase encrypts records on this device. The app does not store the passphrase, so you enter it again after reloading.

A valid license token stays in this browser until you choose **Remove saved license**. Rejected tokens are not saved. Sociobot is contacted only to verify a saved, returned, or entered license.

See `/privacy` and `/terms` in the app for the full policies.

## Deploy

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` provides single-page-app routing, the 404 response, the Content Security Policy, and other security headers. The factory owns infrastructure, DNS, and billing registration.

After deployment, run `npm run test:live` to verify the live title, product slug, checkout redirect, deep links, 404 status, and cache policy.

## License

MIT. See [LICENSE](LICENSE).
