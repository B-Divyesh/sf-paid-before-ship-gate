# Polish 1 handoff — ready to deploy

Repair commit: `a6147d02e6ba1bce67208044d2bbb9c32aaa5163` (final documentation/deploy evidence is added with the deployment commit).

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

## Known gaps

None. Deployment and cold live verification are the remaining work-order steps and are recorded after they complete.
