# Polish 1 handoff — ready to deploy

Repair source commit: `4e7d78841caf9b2e9717787bc2a42b105485c34d` (verification handoff is committed immediately after this update).

## What changed

- Closed every F-1-1 through F-1-25 finding in `.factory/review-1.md`; the exact mapping is in `.factory/polish-1.md`.
- Payment imports now require the payment currency to match the order currency before a held order can clear.
- Completed pack batches can be marked packed, stay out of later exports, appear in a Packed view, and be returned to the active board.
- `?demo=1` is the first-screen, one-click isolated demo, with a persistent banner, reset, and real-workspace exit.
- Completed the claims registry with 23 observable, tagged browser tests, including full backup round trip, privacy boundaries, license networking, and offline reload.
- Rewrote first-screen, README, and legal copy in plain language; standardized **approval** and **customer hold rule**.
- Added per-route metadata updates, scroll restoration with focused route headings, and a complete static 404 shell.

## Verification

Local final source:

```sh
npm test                 # 33/33 Playwright tests passed
npm run lint             # passed
npm run typecheck        # passed
npm run build            # passed; dist/index.html exists
```

The 33-test browser suite includes Axe serious/critical checks on `/`, `/?demo=1`, `/board`, `/privacy`, and `/terms`; mobile 390 px, 200% text, keyboard, route focus/scroll restoration, static 404 metadata, privacy, and offline reload coverage.

Fresh-clone claim evidence:

```sh
git clone --no-local /work/repo <temporary-clean-clone>
npm ci
# each exact command listed in .factory/claims.json, independently
npm test -- --grep @claim:<id>
```

All 23 declared claim tags passed independently after the fresh install. The bundle is 36.09 KB raw / 11.81 KB gzip JavaScript and 18.29 KB raw / 4.76 KB gzip CSS.

## Run and deploy

```sh
npm ci
npm run dev
npm test
npm run build
/opt/fleet/lib/deploy-static.sh paid-before-ship-gate dist
```

After deployment, run `npm run test:live`, `/opt/fleet/lib/verify-url.sh`, and an Axe scan against `https://paid-before-ship-gate.sociobot.in`.

## Deployment and live verification

Static production deployment `a09ce064-539e-472f-bdbd-92e0a35e956a` completed through `/opt/fleet/lib/deploy-static.sh`.

- `https://paid-before-ship-gate.sociobot.in/` cold-loaded the deployed `index-BtXDFl-1.js` bundle with HTTP 200.
- `https://paid-before-ship-gate.sociobot.in/definitely-not-a-route` returned HTTP 404 and the complete 404 shell.
- `PLAYWRIGHT_BASE_URL=https://paid-before-ship-gate.sociobot.in npx playwright test`: 33/33 passed.
- `npm run test:live`: passed.
- `/opt/fleet/lib/verify-url.sh`: passed: 643 ms, correct title/lang/h1/main, no missing image alt text, no unnamed buttons, and no console errors.
- Live screenshots are `.factory/verification-artifacts/polish-1-live-home.png` and `.factory/verification-artifacts/polish-1-live-demo-mobile.png`.
- The standalone Axe CLI could not locate a Selenium Chrome binary. The already-installed `@axe-core/playwright` integration ran in the full live suite on every app route with zero serious/critical violations.

## Known gaps

None.
