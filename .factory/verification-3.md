# Independent verification 3 — PASS

**Candidate:** `2135c341fb16147304c15af73d6d4493531f719c` (`main`)

**Live URL:** <https://paid-before-ship-gate.sociobot.in>

**Verified:** 2026-08-28 UTC from a clean checkout. Product source was not modified.

## Release decision

**PASS.** The fresh local production build and deployed PWA are the same candidate, all declared claim tests pass from the demo sandbox, and no release-blocking defect was found. The earlier deployment-only checkout/404 and mobile/backup defects are repaired in this candidate.

## Required first checks

`.factory/claims.json` exists with 13 claim IDs. After `npm ci` (108 packages; zero reported vulnerabilities), I ran every declared command individually:

| Claim | Result |
| --- | --- |
| demo-sandbox | PASS |
| csv-order-import | PASS |
| payment-match | PASS |
| hold-gate | PASS |
| csv-export | PASS |
| json-backup | PASS |
| saved-rules | PASS |
| local-only | PASS |
| device-encryption | PASS |
| passphrase-not-stored | PASS |
| offline-reload | PASS |
| purchase-terms | PASS |
| license-inactivity | PASS |

The two encryption IDs deliberately select the one browser test carrying both tags. A subsequent full local run passed 21/21 tests.

### Cold first-read test

**PASS.** A fresh live browser displayed “Stop unpaid orders before packing”; it says this is for small sellers who need a payment check before packing; and the first primary action is **Try it with sample data**, with “See five orders sorted in one click.” Clicking it opened `/demo`, displayed realistic sample order `SO-1049`, and showed the persistent “Demo — sample data, nothing is saved” banner. The cold flow had no console or page errors.

## Build, functional, and accessibility evidence

- `npm run lint`, `npm run typecheck`, and `npm run build`: PASS. `dist/` was produced.
- `npm test`: PASS, 21/21. This includes CSV normal/error/recovery paths, payment matching, named overrides, export/backup, corrupt-backup preservation and legacy-record recovery, encryption/passphrase recovery, 390 px/mobile keyboard flow, 200% text reflow, and reduced-motion/accessibility checks.
- `npm run test:live`: PASS. This verifies public checkout/catalog identity, known deep links, true 404, service-worker and immutable-asset cache policy.
- `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: PASS, 21/21 against production.
- The Playwright Axe integration found zero serious or critical issues on `/`, `/demo`, `/board`, `/privacy`, and `/terms`. The independent URL check recorded title, `lang=en`, exactly one `h1`, one `main`, no missing image alt text/unlabelled buttons, and no console/page errors (792 ms cold load).
- Mobile regression covers 390 × 844, skip-link keyboard entry and Enter activation, 44 × 44 px affected controls, no horizontal overflow, and 200% root-text reflow.

## Privacy, network, billing, and response policy

The `local-only` claim imports both an order and payment CSV while observing the complete request stream; it passed with only same-origin traffic. No sign-in exists, so the Entra tenant condition is not applicable. Live headers include HSTS, `nosniff`, strict-origin referrer policy, a restrictive permissions policy, and a CSP limited to self plus `https://api.sociobot.in` for billing verification. No third-party fonts or scripts load.

Live billing is correctly registered at $39 USD: the catalog check passes and checkout returns 303 to the hosted Dodo session. A fresh burst of 40 invalid verification requests returned 200 for requests 1–30 and 429 for request 31 onward; the first 429 included `Retry-After: 4`. This satisfies the required API rate-limit check.

## PWA, deployment parity, and performance

The live worker is controlled at scope `/`, uses cache `pbsg-v3`, responds to `registration.update()`, and contains `skipWaiting` plus `clients.claim`. After the first `/demo` visit and worker activation, an offline reload still rendered “Choose today’s pack list” and the demo banner without errors. The manifest has standalone display, versioned `/board?v=3` start URL, themed icons, and a maskable icon.

The deployed HTML references `index-DimtHGY_.js` and `index-D23lr1fn.css`, exactly the current build assets. SHA-256 parity:

- JS: `e57966fe345931361d69ee25dd82868e4e9688de09d80c500a0ad99454485aca`
- CSS: `4c15b8c4ed3afa8328f596fe4b75328f1225cd25522c61e5e82b716a991abc35`

Assets are immutable for one year and `sw.js` is revalidated. The production JS is 32.75 KB raw / 11.04 KB gzip; CSS is 18.02 KB raw / 4.69 KB gzip, within the static budget. The fresh mobile Lighthouse JSON reported Performance 96, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s and CLS 0.029.

## Defects by severity

None found.

## Verification notes

There is no product backend beyond Sociobot billing calls and no library/CLI consumer surface. The standalone `@axe-core/cli` launcher could not locate a system Chrome in this container; the repository’s Playwright Axe integration was used instead and passed on all required live routes.
