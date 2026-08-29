# Review 3 handoff — FAIL

**Reviewed commit:** `79198aac6af0ee44131ef13da9eda9b8a22006ac`

**Live:** <https://paid-before-ship-gate.sociobot.in>

**Review:** `.factory/review-3.md`

## Completed

- Re-ran the cold first-read review at 390 × 844 and 1440 × 900.
- Audited every landing-page and README copy unit with word counts.
- Exercised the one-click demo, reset, real-data isolation, request boundary, and offline reload.
- Ran all 24 declared claim commands independently from a no-local clean clone.
- Rechecked every finding from reviews 1 and 2 against the live site and current code.
- Re-ran local and live browser suites, lint, typecheck, build, route metadata, 404, link crawl, keyboard, touch, zoom, and accessibility checks.

## Result

FAIL. Four blocking findings remain:

- F-1-1: a previously paid USD balance clears the same order after a GBP re-import.
- F-3-1: a minimal re-import without the optional hold column silently removes an existing payment hold.
- F-1-12: merchant-of-record and support-responsibility copy remains broader than the registered and tested paid claim.
- F-3-2: a payment row explicitly marked `failed` is counted and clears a held order.

Three major and three minor findings are also recorded in the review. No product code was changed.

## Verification

- Clean clone `/tmp/pbsg-review3-oC7MuB`: 24/24 exact claim commands passed.
- `npm test`: PASS, 34/34.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/` produced.
- Live Playwright suite: PASS, 34/34.
- `npm run test:live`: PASS.
- Factory URL verifier: PASS, 676 ms, zero product-route console errors.
- Playwright-Axe: zero serious/critical violations on every app route. Standalone Axe CLI could not pair its bundled ChromeDriver 152 with the worker’s preinstalled Chromium 145.

## Next steps

Repair the blocking re-import invariants first and add regression cases to the existing claim tests. Then align the paid/legal claim registry, license-token privacy controls, and copy/404 findings before requesting another review.
