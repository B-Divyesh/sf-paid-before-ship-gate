# Handoff

## Shipped

- A complete local-first order board at `/board`.
- Order CSV import with optional redacted customer fields and currency codes.
- Payment CSV matching with duplicate-row protection.
- Order and customer-level payment holds.
- Named override reasons that appear in pack-list exports.
- Ready-only CSV pack lists and full JSON backup/import.
- IndexedDB persistence for real records.
- AES-GCM device encryption with PBKDF2 passphrase derivation.
- A one-time $39 desk kit through the Sociobot license contract.
- License return capture, daily verification cache, and paste-to-restore flow.
- An isolated `/demo` with five realistic orders, reset, and exit controls.
- Installable PWA manifest, icons, service worker, offline navigation, and update notice.
- Landing, demo, board, privacy, terms, SPA 404, robots, sitemap, and security headers.
- Original generated risograph art in responsive AVIF, WebP, and JPEG formats.

## Run and verify

```sh
npm install
npm test
npm run build
npm run preview
```

The production build command is exactly `npm run build`. It writes `dist/index.html` at the required root.

Verification completed on 28 August 2026:

- `npm test`: 15 passed.
- Claim coverage: 11 claims in `.factory/claims.json`; every claim tag passes from the sandbox.
- `npm audit`: 0 vulnerabilities.
- TypeScript: `tsc --noEmit` passes as part of the build.
- `verify-url.sh`: HTTP 200, no console errors, one `h1`, one `main`, `lang=en`, and no missing alt text.
- Playwright axe checks: no serious or critical findings on `/`, `/demo`, `/privacy`, or `/terms`.
- Mobile: 390 × 844 layout has no horizontal overflow; keyboard activation passes.
- Offline: `/demo` reloads with sample data after the browser goes offline.
- Lighthouse mobile production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse details: LCP 1.7 s, FCP 1.2 s, TBT 0 ms, CLS 0.009.
- Initial assets: JavaScript 10.24 KB gzip, CSS 4.66 KB gzip, desktop hero AVIF 62 KB, mobile hero AVIF 20 KB.

Local evidence was written under ignored `test-results/` during verification.

## Known gaps and next steps

- The factory must register the slug with the Sociobot billing service before checkout can complete.
- Payment files are evidence supplied by the seller. The app does not connect to a bank or confirm settlement.
- Payment amounts are matched to the order currency. Cross-currency conversion is intentionally out of scope.
- Browser storage can be cleared by the user or browser. The interface provides JSON backups for recovery.
- An encrypted vault cannot recover a lost passphrase. The product warns users before encryption.

No deployment, DNS, billing registration, analytics, or external customer contact was performed from this repository.
