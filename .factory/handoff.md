# Polish 2 handoff — PASS

**Repair commit:** `f13cf708f203fc495e1f73716e526b8cc4dfd2e2`
**Base reviewed:** `673fc92c52441b8093344fc7ea599a6dc824183b`
**Live:** <https://paid-before-ship-gate.sociobot.in>

## Completed

- Closed every finding in `.factory/review-1.md` and `.factory/review-2.md`; the per-ID mapping is in `.factory/polish-2.md`.
- Added a genuine first-viewport mobile demo preview with a ready and held realistic order, while keeping demo state memory-only and resettable.
- Added and tested omitted-payment-currency behavior, bringing `.factory/claims.json` to 24 claims with one tagged observable test per claim.
- Rewrote all remaining metaphorical/opaque product copy, expanded first uses of CSV/JSON and deployment abbreviations, and refreshed `.factory/copy-audit.md`.
- Replaced the self-referential purchase assertion with live catalog price/currency and hosted-checkout redirect checks. The terms page links Dodo Buyer Terms for returns.
- Updated 404 copy while retaining its complete static metadata, shared shell, and HTTP 404 behavior.
- Updated the catalog description: “Stop unpaid orders before packing with a payment checkpoint that stays in your browser.”

## Verification

- Clean clone: `git clone --no-local /work/repo /tmp/pbsg-clean-0glHxj`, `npm ci`, then all 24 exact commands declared in `.factory/claims.json`: PASS.
- Local: `npm run lint`: PASS; `npm run typecheck`: PASS; `npm test`: PASS (34/34 Playwright tests); `npm run build`: PASS, producing `dist/`.
- Build budget: JS 37.07 KB raw / 11.99 KB gzip; CSS 19.08 KB raw / 4.89 KB gzip.
- Live: deployed with `/opt/fleet/lib/deploy-static.sh paid-before-ship-gate dist`; live home serves `assets/index-bDUKcCLg.js`.
- Live: `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: PASS (34/34), including Axe serious/critical checks across `/`, `/demo`, `/board`, `/privacy`, and `/terms`.
- Live: `npm run test:live`: PASS (catalog USD 39, Dodo checkout redirect, known routes, HTTP 404, cache policy, service worker).
- Live: `/opt/fleet/lib/verify-url.sh https://paid-before-ship-gate.sociobot.in .factory/verification-artifacts/polish-2-live-url`: PASS; 615 ms cold load, `lang=en`, one h1, main, alt text, named buttons, and zero console/page errors.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.50 s and CLS 0.001. JSON: `.factory/verification-artifacts/polish-2-lighthouse-mobile.json`.
- Cold live mobile demo: both sample cards are visible at 390×844 (ready y=207–289; held y=299–381). Screenshot: `.factory/verification-artifacts/polish-2-live-demo-mobile.png`.

## Run and deploy

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Deploy `dist/` with the factory static work-order script.

## Known gaps

None. The product remains a static local-first PWA; paid license verification is the only optional Sociobot network request.
