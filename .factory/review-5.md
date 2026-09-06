# Paid Before Ship Gate — independent review 5

**Job reviewed:** stop unpaid orders before packing.  
**Reviewed:** 6 September 2026  
**Live URL:** https://paid-before-ship-gate.sociobot.in  
**Implementation candidate:** 5d0557d0cd42c355549b79b2d4c9d84b99a17ecd  
**Documentation revision:** ad3c928e707fb7e9f4f20bb3fe0724166294b04d  
**Verdict:** **PASS**  
**Findings:** 0 (blocking 0, major 0, minor 0)  
**Untested public claims:** 0

The implementation candidate is 5d0557d. The two later commits are review and
handoff documentation only. The live JavaScript and CSS bundles matched a
fresh build from this checkout byte-for-byte by SHA-256.

## First screen

Fresh, separate Chromium contexts at 1440 × 900 and 390 × 844 opened the live
home page at scroll position zero. Before scrolling, both said:

- **Job:** stop unpaid orders before packing.
- **Audience:** small sellers who let customers pay later.
- **First action:** Try it with sample data.

The action says what happens next: five sample orders open, with three ready
and two on hold. Both contexts had the correct title, one h1, one main
landmark, and no console errors.

## Demo, real-data separation, and product paths

In a fresh phone context I added the temporary real order SAFE-R5-equivalent
data, entered the one-click demo, approved a sample order, reset the demo,
then chose Start for real. The demo showed five realistic orders and the
persistent banner “Demo — sample data, nothing is saved,” with Reset demo and
Start for real. Its first two visible sample cards were the ready Moss & Thread
order and the held Brighton Pantry order. Reset restored the held sample state.
Returning to the board restored the real order and no sample order was present.
The complete flow made no external request and generated no console error.

Normal paths, invalid paths, boundaries, and recovery were exercised by the
claim suite and the live suite. Direct live invalid-backup recovery also
passed: a backup with currency NOT-A-CURRENCY was rejected with a useful
message; the existing order remained present before and after reload, the board
kept its h1, and no page error occurred. The live tests additionally cover
missing required order data, invalid totals and currencies, re-import review,
failed and pending payment statuses, wrong payment currencies, duplicate
payments, named approval, packed-order recovery, license rejection/removal,
offline reload, and encrypted-workspace recovery.

This is a static local-first PWA, not a multi-tenant backend. Tenant, backend
restart, and health endpoints therefore do not apply. Its equivalent state
checks passed: real browser data persisted over reload and the demo stayed
memory-only. The live paid-license endpoint allowed 30 invalid requests and
returned HTTP 429 on request 31 with Retry-After: 4; there were no unexpected
statuses.

## Claims

The checkout began clean, then npm ci installed the documented prerequisites
without vulnerabilities. The registry has 29 entries and tests/claims.spec.ts
has exactly one matching @claim tag for each entry, with no missing or extra
tags. Every exact command in .factory/claims.json was run independently:

| Claim commands | Result |
|---|---|
| demo-sandbox; demo-entry; csv-order-import; order-reimport-safety; payment-currency; payment-default-currency; payment-aggregation | Pass |
| hold-gate; batch-packed; csv-export; json-backup; saved-customer-hold-rules; free-board; default-currency | Pass |
| extra-columns; payment-status; scope-boundary; local-only; backup-import-local; device-encryption; passphrase-not-stored | Pass |
| offline-reload; installable-pwa; purchase-terms; license-inactivity; license-storage-control; no-tracking; license-network-only; original-art | Pass |

The final original-art command was run separately after the loop because the
review loop's JSON stream had no trailing newline. It passed. This is a review
harness detail, not a product failure; all 29 declared commands were actually
executed. The landing page, legal pages, and README were cross-checked against
the registry and copy audit. No unlisted visitor-facing claim was found.

## Quality, accessibility, privacy, and PWA

- npm run lint passed.
- npm run typecheck passed.
- npm test passed: 41/41.
- npm run build passed and produced dist/index.html. Initial JavaScript was
  13.33 KB gzip and CSS 4.99 KB gzip.
- PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright
  test passed: 41/41, including the pinned Playwright–Axe scans on /, /demo,
  /board, /privacy, and /terms. There were zero serious or critical Axe issues.
- The factory verify-url.sh check passed: 200, title, lang=en, one h1, main,
  image alt text, named buttons, and no console/page errors.
- The standalone Axe CLI was attempted. Its bundled ChromeDriver only supports
  Chrome 152 while the supplied Playwright Chromium is 145, so it could not
  start. This is a test-tool version mismatch, not a product error; the
  repository's matching Playwright–Axe integration passed locally and live.
- Phone keyboard, focus return from dialogs, skip link, 44 px controls, 200%
  text reflow, reduced-motion styling, route focus and back-scroll restoration
  passed in the local and live suites.
- Local-only request capture passed. The live demo flow sent only same-origin
  requests. The privacy and terms routes are present and have route-specific
  titles.
- After first load, the live demo passed the offline-reload claim. The live
  manifest, themed and maskable icons, service worker, cache policy, and
  update-handling source path (skipWaiting, clientsClaim, update toast) were
  present.

## Routes, links, and metadata

The routes /, /?demo=1, /board, /privacy, and /terms each returned 200 with a
route-specific title, exactly one h1, one main, and lang=en. All discovered
same-origin navigation links returned 200. The hosted checkout returned its
expected 303 to Dodo, and the Buyer Terms and factory links returned 200. The
unknown route deliberately returned the designed page with HTTP 404, the right
title, h1 “Page not found,” header/footer, legal links, and a way home. That is
expected behavior, not a finding. Live headers include a self-restricted CSP,
HSTS, nosniff, strict-origin referrer policy, and restrictive permissions.

## Earlier findings

All review, verification, and polish reports were read. Current disposition
was established from the live browser, direct recovery exercise, source, and
the passing claim and accessibility suites:

| Earlier IDs | Current disposition and evidence |
|---|---|
| F-1-1 | Fixed: wrong-currency payment and paid-order currency re-import are rejected; payment-currency passes. |
| F-1-2 | Fixed: ready orders can be marked packed, excluded, and returned; batch-packed passes. |
| F-1-3 through F-1-5 | Fixed: real/demo separation, complete backup round-trip, and five-order demo are proved by demo-sandbox, json-backup, and demo-entry. |
| F-1-6 through F-1-10 | Fixed: scope boundary, free board, USD defaults, named ignored columns, and idempotent partial payments each have passing claims. |
| F-1-11 through F-1-12 | Fixed: encryption/passphrase storage is proved; unproved merchant and support statements remain absent. |
| F-1-13 through F-1-14 | Fixed: the live 404 is designed and HTTP 404; route focus and back-scroll restoration pass. |
| F-1-15 through F-1-23 | Fixed: each former minor copy, naming, terminology, README, and deployment-wording issue remains closed by the current copy audit and route/live checks. |
| F-1-24 through F-1-25 | Fixed: route-wide no-tracking and local backup-import request capture pass. |
| F-2-1 through F-2-2 | Fixed: phone demo preview shows ready and held orders; omitted payment currency is USD-only. |
| F-2-3 through F-2-10 | Fixed: plain section labels, concrete paid copy, backup/terms/404 wording, expanded file names, and expanded deployment terms remain in the live copy. |
| F-3-1 through F-3-2 | Fixed: omitted optional values are retained/reviewed and only valid payment statuses match. |
| F-3-3 through F-3-5 | Fixed: license storage/removal, passphrase wording, and terms decision wording pass the relevant claims and route checks. |
| F-3-6 through F-3-8 | Fixed: workflow metadata wording and the external-link announcement on the static 404 remain correct. |
| Verification 1 | Fixed: missing total is rejected; real 404 and prior release checks now pass. |
| Verification 2 | Fixed: invalid backup preserves existing data through reload; phone targets/reflow and claims completeness pass. |
| Verification 3 and review 4 | No unresolved finding was recorded; this review independently rechecked their stated pass conditions. |

## Conclusion

**PASS.** There are zero findings of every severity and zero untested public
claims. No product code was changed in this review.
