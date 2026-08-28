# Independent QA handoff

## Release outcome — FAIL (2026-08-28)

Candidate `4f09b7d898d8bc4654c3182658190d9706f5060d` at <https://paid-before-ship-gate.sociobot.in> is **not approved for release**.

The deployed JS and CSS are byte-for-byte identical to this candidate. Local and live automated suites pass, all 11 declared claim commands pass after `npm ci`, checkout works, rate limiting works, and the core order-to-pack-list workflow succeeds. Independent boundary testing nevertheless found a High release blocker: a backup with arrays but an invalid order currency is persisted before validation, then `/board` becomes completely blank on reload with an uncaught `Invalid currency code` error. The prior workspace has already been overwritten.

Additional release findings:

- mobile touch targets below the required 44 px minimum, including Reset demo (36 px), Start for real (20 px), and Record override (40 px);
- `/demo` grows from 390 to 430 px and clips `On hold 2` at 200% text size;
- `$39 one-time`/refund claims are absent from `.factory/claims.json`, and the `local-only` claim test does not exercise CSV or payment imports.

Full commands, evidence, SHA-256 deployment identity, Lighthouse results, request/header checks, screenshots, rate-limit threshold, and remediation are in [verification-2.md](verification-2.md). Evidence files are under `.factory/verification-artifacts/`.

## Verification summary

- `npm ci`: PASS (108 packages, 0 vulnerabilities)
- all 11 exact claim commands: PASS after install
- `npm test`: PASS (16/16)
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- `npm run test:live`: PASS
- full Playwright suite against production: PASS (16/16)
- axe serious/critical on five live routes: 0
- valid mobile Lighthouse: 96 performance, 100 accessibility, 100 best practices, 100 SEO
- billing verification rate limit: first 429 on request 31, `Retry-After: 4`
- PWA real-data offline reload: PASS; active cache `pbsg-v2`
- malformed backup persistence/reload: **FAIL, release-blocking**
- 44 px touch targets: **FAIL**
- 200% text reflow on `/demo`: **FAIL**

No product source was changed during verification.

## Reproduce the blocker

1. Open `/board` in a fresh browser and add any order.
2. Import a JSON backup whose `orders` and `rules` are arrays but whose order has `currency: "NOT-A-CURRENCY"`.
3. Observe the currency error, then reload.
4. The app root is blank and the prior workspace has been replaced.

The importer must fully validate into a temporary value before committing to IndexedDB.
