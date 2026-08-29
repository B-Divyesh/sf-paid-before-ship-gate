# Polish 2 — cumulative review closure

Repaired candidate `673fc92c52441b8093344fc7ea599a6dc824183b` using every finding in reviews 1 and 2. The deployed repair is `f13cf708f203fc495e1f73716e526b8cc4dfd2e2`.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Payment imports read currency and reject a mismatch before changing an order. | `@claim:payment-currency` live PASS |
| F-1-2 | Ready orders can be marked packed, excluded from the next export, and returned. | `@claim:batch-packed` live PASS |
| F-1-3 | Demo uses memory-only sample state and the test preserves a pre-existing real order. | `@claim:demo-sandbox` live PASS |
| F-1-4 | Backup tests compare a complete object after a real-workspace restore and reload. | `@claim:json-backup` live PASS |
| F-1-5 | Landing enters isolated sample mode with five orders, three ready and two held. | `@claim:demo-entry` live PASS |
| F-1-6 | The declared no-score/no-contact/product-boundary copy has an action audit. | `@claim:scope-boundary` live PASS |
| F-1-7 | Free imports, payment checks, approvals, backups, and pack lists remain unlicensed. | `@claim:free-board` live PASS |
| F-1-8 | Omitted order currency becomes USD in board, backup, and export. | `@claim:default-currency` live PASS |
| F-1-9 | Extra harmless columns are ignored while payment currency remains a recognized field. | `@claim:extra-columns` live PASS |
| F-1-10 | Unique partial payments aggregate and duplicate payment rows do not. | `@claim:payment-aggregation` live PASS |
| F-1-11 | At-rest workspace plaintext and passphrase are absent; reload requires the passphrase. | `@claim:device-encryption`, `@claim:passphrase-not-stored` live PASS |
| F-1-12 | Replaced receipt wording with observable hosted-checkout wording; terms link Dodo Buyer Terms, and the claim queries catalog price/currency and checks the unpurchased redirect. | `@claim:purchase-terms` live PASS; <https://paid-before-ship-gate.sociobot.in/terms> |
| F-1-13 | Shared static 404 shell and metadata remain present; its copy is now plain. | live `/definitely-not-a-route` is HTTP 404; accessibility 404 metadata test PASS |
| F-1-14 | History state saves/restores scroll and moves focus without scrolling to it. | `restores scroll position and moves focus to the route heading on browser Back` live PASS |
| F-1-15 | Preview heading names ready orders. | `.factory/copy-audit.md` |
| F-1-16 | Boundary heading names payment approvals. | `.factory/copy-audit.md` |
| F-1-17 | Preview sentence names totals, payments, and holds. | `.factory/copy-audit.md` |
| F-1-18 | User exception copy consistently says approval. | `@claim:hold-gate` live PASS |
| F-1-19 | Reusable setting copy consistently says customer hold rule. | `@claim:saved-customer-hold-rules` live PASS |
| F-1-20 | Restore action now says Restore paid access. | `@claim:license-inactivity` live PASS |
| F-1-21 | README calls this an installable web app. | `README.md` |
| F-1-22 | README explains browser storage and passphrase outcome without algorithm jargon. | `README.md`; encryption claims live PASS |
| F-1-23 | README expands deployment terms. | `README.md` |
| F-1-24 | Route-wide no-tracking and explicit-license-only traffic are tested. | `@claim:no-tracking`, `@claim:license-network-only` live PASS |
| F-1-25 | Backup import uses a unique sentinel and records request bodies. | `@claim:backup-import-local` live PASS |
| F-2-1 | Added a compact ready-and-held sample-order preview directly below the demo banner before controls on phone layouts. | `@claim:demo-entry` at 390×844; [live screenshot](verification-artifacts/polish-2-live-demo-mobile.png); <https://paid-before-ship-gate.sociobot.in/?demo=1> |
| F-2-2 | Added a declared omitted-payment-currency claim: USD clears a USD order and cannot clear GBP. | `@claim:payment-default-currency` live PASS |
| F-2-3 | Replaced “Three passes” with “How it works.” | `.factory/copy-audit.md` |
| F-2-4 | Replaced “A narrow guardrail” with “Payment exceptions and limits.” | `.factory/copy-audit.md` |
| F-2-5 | Replaced desk-kit/vault product language with paid features, encrypted local storage, and Restore paid access. | `.factory/copy-audit.md`; live `/terms` |
| F-2-6 | Renamed the backup section “Export or restore a workspace backup.” | live `/demo` |
| F-2-7 | Renamed the terms h1 “Terms for using the order board.” | live `/terms` |
| F-2-8 | Replaced 404 metaphors with Page not found, direct explanation, and Return home. | live `/definitely-not-a-route` |
| F-2-9 | First user-facing imports say spreadsheet files (CSV); backups say backup file (JSON). | live `/demo`; `README.md` |
| F-2-10 | README expands single-page-app routing and Content Security Policy. | `README.md` |

## Verification summary

- Fresh clone `/tmp/pbsg-clean-0glHxj`: `npm ci`, then every one of the 24 exact commands in `.factory/claims.json` passed independently.
- Local: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed; browser suite: 34/34.
- Live: `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test` passed 34/34; `npm run test:live` passed; `/opt/fleet/lib/verify-url.sh` passed with zero errors.
- Live cold demo at 390×844 has ready card y=207–289 and held card y=299–381, both in the initial viewport; no console or page errors.
