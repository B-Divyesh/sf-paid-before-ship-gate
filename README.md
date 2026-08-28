# Paid Before Ship Gate

Stop unpaid orders before packing with a local payment checkpoint.

This PWA is for small sellers who take orders on flexible terms. It imports order and payment CSV files, applies payment holds, records named overrides, and exports only ready orders as a pack list.

Live site: https://paid-before-ship-gate.sociobot.in

One-click demo: https://paid-before-ship-gate.sociobot.in/demo

## What it does

- Imports order CSV files. Only `order_number` and `total` are required.
- Matches payment amounts through `order_number`.
- Keeps held orders out of the pack list until paid or approved.
- Records the override name and reason in the exported pack list.
- Exports a CSV pack list and a full JSON backup.
- Works offline after the first online visit.
- Stores order and payment data in this browser.

The free board includes every payment check, override, backup, and export. The $39 one-time desk kit adds AES-GCM device encryption and reusable customer rules. Checkout and license verification use the Sociobot billing API.

It does not process payments, score customers, collect debts, reserve stock, or print shipping labels.

## CSV formats

Orders:

```csv
order_number,customer,total,currency,hold,date
SO-1048,Moss & Thread,186.00,USD,yes,2026-08-27
```

The `customer`, `currency`, `hold`, and `date` columns are optional. Omit customer details for a redacted import. Currency defaults to USD.

Payments:

```csv
order_number,amount
SO-1048,186.00
```

Extra columns are ignored. Multiple payment rows for one order are added together.

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

Real records use IndexedDB. Demo records use a separate memory-only workspace and are discarded when the demo ends. CSV processing happens on the device.

Paid vault encryption uses PBKDF2 and AES-GCM. The app does not store the passphrase. A lost passphrase cannot be recovered, so export backups before enabling encryption.

See `/privacy` and `/terms` in the app for the full policies.

## Deploy

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` provides the SPA fallback, 404 behavior, CSP, and security headers. The factory owns infrastructure, DNS, and billing registration.

After deployment, run `npm run test:live` to verify the public identity, checkout redirect, deep links, 404 status, and cache policy.

## License

MIT. See [LICENSE](LICENSE).
