# Polish round 3 handoff — complete

Paid Before Ship Gate is deployed at <https://paid-before-ship-gate.sociobot.in>. The one-click isolated sample workspace is <https://paid-before-ship-gate.sociobot.in/?demo=1>.

## What changed

- Made re-imports safe: omitted optional fields are preserved, recorded payments block currency changes, and material changes require confirmation.
- Validated common payment-status columns and rejected pending, failed, refunded, and reversed rows.
- Made payment references idempotent even when a later export changes note columns.
- Stored license tokens only after successful verification; added retention disclosure, recheck, and removal controls.
- Removed unproved merchant/support and passphrase-recovery claims; aligned terms and privacy copy with tested behavior.
- Rewrote the first screen, workflow heading, metadata, README, catalog sentence, and static 404 footer in plain language.
- Added route metadata/focus tests plus claim coverage for re-import safety, payment status, license storage, installability, and art provenance.
- Preserved the tactile dispatch-desk risograph identity and the static offline PWA deployment class.

Every finding from `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` is mapped in `.factory/polish-3.md`.

## Verification

- Clean clone: `/tmp/pbsg-polish3-final-wGnbFy`; `npm ci`; every exact command in `.factory/claims.json` passed independently, 29/29.
- Local aggregate: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed. Playwright: 41/41.
- Browser coverage: one-click demo, real-data isolation, reset, import/re-import, payment status, exports, backup round trip, encryption, license lifecycle, routing, history focus, keyboard, 390 px layout, 200% text, privacy request capture, and offline reload.
- Accessibility: Playwright-Axe found zero serious or critical violations on `/`, `/demo`, `/board`, `/privacy`, and `/terms`.
- Build output: `dist/index.html`; JS 41.77 KB raw / 13.33 KB gzip; CSS 19.54 KB raw / 4.99 KB gzip.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.8 s, CLS 0.001, TBT 10 ms.
- Deployment: Azure Static Web Apps production deployment `561d4986-9b12-410d-a46d-6821f3a5632b`, from application commit `5d0557d`.
- Live aggregate: `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test` passed 41/41.
- Live contract: `npm run test:live` passed, including catalog price, checkout redirect, deep links, 404, service worker, and cache policy.
- Factory URL check: HTTP 200, 864 ms, zero console errors, correct title and language, one `h1`, one `main`, all images with alt text, and all buttons named.
- Live unknown route: HTTP 404 with the shared header/footer, legal links, external-link label, complete metadata, and response-header CSP.

Evidence:

- `.factory/verification-artifacts/polish-3-lighthouse-mobile.json`
- `.factory/verification-artifacts/polish-3-live-home-mobile.png`
- `.factory/verification-artifacts/polish-3-live-demo-mobile.png`
- `.factory/verification-artifacts/polish-3-live-demo-desktop.png`
- `.factory/verification-artifacts/polish-3-live-url/verify.json`

## Run and deploy

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

Deploy `dist/` as a static site. The work order used:

```sh
/opt/fleet/lib/deploy-static.sh paid-before-ship-gate dist
```

## Known gaps and next steps

No known product, review, accessibility, privacy, offline, routing, or deployment gaps remain in this work order. No follow-up is required before release.
