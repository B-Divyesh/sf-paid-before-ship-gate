# Adversarial first-read review 1 — FAIL

**Product:** Paid Before Ship Gate  
**Live URL:** <https://paid-before-ship-gate.sociobot.in>  
**Reviewed:** 28 August 2026 UTC  
**Candidate:** `40c3832c96067d0d91741eedf18e39c239ad5c60`  
**Verdict:** **FAIL** — 3 blocking, 11 major, 2 medium, and 9 minor findings remain.

## 1. Cold first screen

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 with no shared storage. Neither context was scrolled before this interpretation was recorded.

| Question | Mobile answer | Desktop answer |
|---|---|---|
| What does this do? | It stops unpaid orders from entering a packing batch. | It checks payment before orders are packed. |
| For whom? | Small sellers preparing packing batches. | Small sellers taking orders on flexible payment terms. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

The first screen passes. The exact text doing the work is “Stop unpaid orders before packing,” “For small sellers who need a clear payment check before each packing batch,” and “Try it with sample data.” The adjacent result text is “See five orders sorted in one click.”

## 2. Findings

### Blocking

#### F-1-1 — A payment in the wrong currency clears a held order

- **Quote/location:** landing, “The board clears fully paid orders”; README, “Matches payment amounts through `order_number`.”
- **Evidence:** on the live `/board`, an imported `FX-1` order for GBP 100 was held. A payment CSV row `FX-1,100,USD` changed it to “£100.00 paid” and “Ready · paid.” `src/csv.ts` reads no payment currency and ignores the supplied `currency` column.
- **Why this fails:** the app offers six order currencies, yet a numerically equal payment in another currency can release a parcel. That defeats the paid-before-ship gate.
- **Concrete fix:** accept a payment currency and reject a mismatch, or require an explicit per-import currency confirmation before matching. Add `@claim:payment-currency` covering mismatch rejection and same-currency success.

#### F-1-2 — There is no safe daily-batch completion path

- **Quote/location:** live board, “Choose today’s pack list”; landing preview, “Today’s packing batch.”
- **Evidence:** importing a ready `BATCH-OLD` order and exporting produced one row. Importing a later `BATCH-NEW` file and exporting again produced both `BATCH-OLD` and `BATCH-NEW`. The only row actions are hold changes and overrides; there is no remove, archive, packed, or new-batch action.
- **Why this fails:** yesterday’s ready orders remain in every later pack list and can be packed twice. Clearing browser data is not an acceptable daily workflow.
- **Concrete fix:** add a reversible **Mark batch packed** or **Archive packed orders** action, an archive view, and a test proving completed orders do not enter the next export.

#### F-1-3 — The demo isolation claim test does not protect existing real data

- **Quote/location:** `.factory/claims.json`, “Demo changes use sample data and never enter the real workspace.”
- **Evidence:** `@claim:demo-sandbox` starts with an empty real board, changes and resets demo data, then checks that the real board is empty. A demo implementation that erased a pre-existing real workspace would still pass. The live behavior was manually checked and currently preserves a seeded `REAL-9001`, but the declared test does not prove the claim.
- **Why this fails:** demo isolation is a mandatory gate and must protect actual existing records, not only an empty state.
- **Concrete fix:** seed a real marker first, mutate and reset `/demo`, return to `/board`, and assert the marker remains and sample rows never entered IndexedDB.

### Major

#### F-1-4 — “Full JSON backup” is not fully asserted

- **Quote/location:** README, “Exports a CSV pack list and a full JSON backup”; board, “Download a full JSON backup whenever you need one.”
- **Evidence:** `@claim:json-backup` checks five orders and the first rule only. It does not assert history, payment de-duplication keys, every order field, or an import round trip.
- **Why this fails:** an incomplete backup could pass while losing data needed after restoration.
- **Concrete fix:** assert the complete exported object and restore it in a new real workspace, including history and payment keys.

#### F-1-5 — The one-click five-order result is an unlisted claim

- **Quote/location:** landing, “See five orders sorted in one click.”
- **Evidence:** no `.factory/claims.json` entry states this outcome, and `@claim:demo-sandbox` does not assert the initial five-order, 3-ready, 2-held state.
- **Why this fails:** this quantitative first-click promise is not protected from regression.
- **Concrete fix:** add a demo-entry claim and assert five realistic rows, three ready, two held, and the banner immediately after the landing CTA.

#### F-1-6 — The non-action boundary is an unlisted claim

- **Quote/location:** landing, “This tool does not score customers, collect debts, reserve stock, or contact anyone”; README adds “It does not process payments … or print shipping labels.”
- **Evidence:** no claim entry covers these negative capabilities.
- **Why this fails:** visitors may rely on these privacy and operational boundaries.
- **Concrete fix:** add one scope-boundary claim with a static/network test, or remove claims that cannot be verified.

#### F-1-7 — The advertised free-tier feature set is unlisted

- **Quote/location:** landing, “The free board handles imports, payment checks, overrides, backups, and pack lists”; README, “The free board includes every payment check, override, backup, and export.”
- **Evidence:** no claim entry verifies those controls remain available in a fresh, unlicensed real workspace.
- **Why this fails:** a buyer can rely on the free-versus-paid division when deciding whether to use the product.
- **Concrete fix:** add `free-board` coverage on `/board` without entitlement and assert every listed free action plus the absence of paid encryption/rule controls.

#### F-1-8 — The default-currency behavior is an unlisted claim

- **Quote/location:** README, “Currency defaults to USD.”
- **Evidence:** no claim entry or tagged test asserts the default.
- **Why this fails:** currency changes the meaning of every payment amount.
- **Concrete fix:** add a claim test importing an order without currency and assert USD throughout the board, backup, and export.

#### F-1-9 — Ignoring extra columns is an unlisted claim

- **Quote/location:** README, “Extra columns are ignored.”
- **Evidence:** no claim entry or tagged test covers this behavior.
- **Why this fails:** sellers may import bank exports based on this compatibility promise.
- **Concrete fix:** add a claim test with harmless extra columns and assert the correct order/payment result; also reject meaningful conflicting fields such as currency rather than silently ignoring them.

#### F-1-10 — Multiple-payment aggregation is an unlisted claim

- **Quote/location:** README, “Multiple payment rows for one order are added together.”
- **Evidence:** `@claim:payment-match` imports only one payment row.
- **Why this fails:** split payments are a distinct behavior and can change whether an order ships.
- **Concrete fix:** add `payment-aggregation` with two partial rows, duplicate protection, and the final ready state.

#### F-1-11 — PBKDF2 is unlisted and the encryption assertion is too weak

- **Quote/location:** README, “Paid vault encryption uses PBKDF2 and AES-GCM.”
- **Evidence:** the registry mentions AES-GCM only. The tagged test checks an `encrypted: true` marker, passphrase absence, and round-trip unlock, but never asserts that order plaintext is absent or that PBKDF2 is used.
- **Why this fails:** the named security construction is more specific than the tested outcome.
- **Concrete fix:** either state only the user-visible outcome (“Encrypts local records with your passphrase”) or expand the claim/test to assert no order plaintext at rest and statically verify PBKDF2 → AES-GCM parameters.

#### F-1-12 — The merchant-of-record statement is unlisted and inconsistent

- **Quote/location:** landing, “Sociobot is the merchant of record”; `/terms`, “Sociobot and Dodo are the merchant of record.”
- **Evidence:** no claim entry covers merchant identity, and the two statements cannot both describe a single merchant consistently.
- **Why this fails:** the customer cannot tell who charges them or handles refunds.
- **Concrete fix:** confirm the legal party, use the same sentence everywhere, and test the checkout disclosure. For example, if accurate: “Sociobot provides checkout; Dodo processes the payment and handles the receipt.”

#### F-1-24 — The no-analytics/network-boundary statement is unlisted

- **Quote/location:** `/privacy`, “The app makes no analytics or advertising requests. It contacts Sociobot only when you verify a paid license.”
- **Evidence:** `local-only` covers off-origin requests during a demo import. It does not register or prove the broader no-analytics promise or the only-on-license condition.
- **Why this fails:** this is a privacy guarantee visitors can rely on.
- **Concrete fix:** add `no-tracking` coverage across all routes and a `license-network-only` test that proves Sociobot is contacted only after explicit verification.

#### F-1-25 — Backup-file privacy is unlisted and untested

- **Quote/location:** `/privacy`, “CSV and backup files are read on this device. The app does not upload their contents.”
- **Evidence:** `local-only` imports order and payment CSVs only; it never imports a backup or asserts that file contents are absent from all request bodies.
- **Why this fails:** backups contain the complete workspace and are more sensitive than the CSV examples.
- **Concrete fix:** add a backup-import privacy claim that intercepts all requests, uses a unique sentinel in the backup, and proves the sentinel never leaves the browser.

### Medium

#### F-1-13 — The real 404 drops the shared skeleton and metadata

- **Quote/location:** direct unknown URL such as `/definitely-not-a-route`; `public/404.html`.
- **Evidence:** HTTP 404 and the designed “This page missed the pack list” screen work, but the page has no shared header or footer, meta description, canonical URL, Open Graph/Twitter metadata, apple-touch icon, or theme color.
- **Why this fails:** the required consistent navigation/legal shell disappears on an error route and shared links cannot be reached.
- **Concrete fix:** give the static 404 the same wordmark/nav/footer and full metadata set as the app routes while retaining the 404 status.

#### F-1-14 — Back navigation loses the previous scroll position

- **Quote/location:** SPA navigation in `src/main.ts`; live `/privacy` → browser Back → `/`.
- **Evidence:** the landing page was at scroll Y 3341 before following the footer Privacy link. Browser Back returned it to Y 0 and focused the landing `h1`.
- **Why this fails:** a visitor reading low on the page loses their place, contrary to the required back/forward restoration.
- **Concrete fix:** store scroll positions by history entry, restore them on `popstate`, and focus/announce the route without forcing the restored document back to its heading.

### Minor copy findings

#### F-1-15 — A heading depends on the packing-bench metaphor

- **Quote/location:** landing `h2`, “Know what can reach the bench.”
- **Why this fails:** outside the surrounding art it does not name orders or readiness.
- **Concrete rewrite:** “See which orders are ready to pack.”

#### F-1-16 — A heading is vague out of context

- **Quote/location:** landing `h2`, “Your decision stays yours.”
- **Why this fails:** a heading list does not reveal that this section describes manual approvals and product limits.
- **Concrete rewrite:** “You approve every payment exception.”

#### F-1-17 — The live-preview sentence uses jargon and a marketing adjective

- **Quote/location:** landing, “Payment evidence and hold rules meet in one compact order board.”
- **Why this fails:** “payment evidence,” “hold rules,” and “compact” make the result less concrete.
- **Concrete rewrite:** “See each order’s total, payments, and hold status on one board.”

#### F-1-18 — The same exception is called three things

- **Quote/location:** “approved orders,” “a named person records a reason,” and “overrides.”
- **Why this fails:** the visitor must infer that all three mean releasing a held order without full payment.
- **Concrete fix:** use **approval** throughout: “Only paid or manually approved orders are exported,” “Approve without full payment,” and “records named approvals.”

#### F-1-19 — Saved hold settings use inconsistent terms

- **Quote/location:** “hold rules,” “saved rules,” “customer rules,” and the button “Apply this hold to Moss & Thread.”
- **Why this fails:** the paid feature is not named consistently.
- **Concrete fix:** use **customer hold rule** everywhere and label the action “Save hold rule for Moss & Thread.”

#### F-1-20 — “Paste a license” does not name the result

- **Quote/location:** landing paid-tier button, “Paste a license.”
- **Why this fails:** clicking opens a restore/verification dialog; pasting is only an intermediate input action.
- **Concrete rewrite:** “Restore desk kit.”

#### F-1-21 — README opens with unexplained “PWA” jargon

- **Quote/location:** README, “This PWA is for small sellers who take orders on flexible terms.”
- **Why this fails:** the intended seller should not need to know the implementation category.
- **Concrete rewrite:** “This installable web app is for small sellers who let customers pay later.”

#### F-1-22 — README security/storage terms are not explained

- **Quote/location:** “Real records use IndexedDB” and “Paid vault encryption uses PBKDF2 and AES-GCM.”
- **Why this fails:** these names do not explain the practical privacy outcome on first read.
- **Concrete rewrite:** “Records stay in this browser’s local database. With the desk kit, your passphrase encrypts those records on this device.” Put algorithm names in a separate technical note.

#### F-1-23 — README uses the vague phrase “public identity”

- **Quote/location:** README deploy section, “verify the public identity, checkout redirect, deep links, 404 status, and cache policy.”
- **Why this fails:** a deployer cannot tell what “public identity” means.
- **Concrete rewrite:** “verify the live title, product slug, checkout redirect, deep links, 404 status, and cache headers.”

No sentence exceeds 22 words. No banned marketing word appears. The copy flags above are jargon, inconsistent terms, context-dependent headings, one subjective adjective, and one non-result-naming button.

## 3. Copy audit

Counts use whitespace-separated words; numbers and contractions count as one, while the `·` separator does not. Sample order values/statuses and README code blocks are data rather than sentences and are excluded. Headings, navigation labels, facts, and actions are included so the context and button checks are reproducible.

### Landing page

| Copy unit | Words | Flag |
|---|---:|---|
| Skip to content | 3 | — |
| Paid Before Ship Gate | 4 | — |
| Demo | 1 | — |
| Order board | 2 | — |
| Privacy | 1 | — |
| A checkpoint for the packing bench | 6 | — |
| Stop unpaid orders before packing | 5 | — |
| For small sellers who need a clear payment check before each packing batch. | 13 | — |
| Try it with sample data | 5 | — |
| See five orders sorted in one click. | 7 | F-1-5 |
| Works offline after the first visit | 6 | — |
| Order data stays in this browser | 6 | — |
| $39 once for encryption and saved rules | 7 | F-1-19 |
| HOLD | 1 | — |
| The checkpoint | 2 | — |
| Know what can reach the bench | 6 | F-1-15 |
| Payment evidence and hold rules meet in one compact order board. | 11 | F-1-17, F-1-19 |
| Today’s packing batch | 3 | F-1-2 |
| 2 ready · 2 held | 4 | — |
| Three passes | 2 | — |
| Move from exports to a pack list | 7 | — |
| Import orders | 2 | — |
| Use order number, total, and optional customer or hold columns. | 10 | — |
| Match payments | 2 | — |
| Import payment amounts. | 3 | — |
| The board clears fully paid orders. | 6 | F-1-1 |
| Export the pack list | 4 | — |
| Held orders stay out unless a named person records a reason. | 11 | F-1-18 |
| A narrow guardrail | 3 | — |
| Your decision stays yours | 4 | F-1-16 |
| This tool does not score customers, collect debts, reserve stock, or contact anyone. | 13 | F-1-6 |
| Imports may omit names, references, and dates. | 7 | — |
| Only order numbers and amounts are required. | 7 | — |
| $39 | 1 | — |
| One time | 2 | — |
| Paid desk kit | 3 | — |
| Encrypt records and reuse hold rules | 6 | F-1-19 |
| The free board handles imports, payment checks, overrides, backups, and pack lists. | 12 | F-1-7, F-1-18 |
| Pay once to add an encrypted vault and saved customer rules. | 11 | F-1-19 |
| Buy the desk kit | 4 | — |
| (external checkout) | 2 | — |
| Paste a license | 3 | F-1-20 |
| Sociobot is the merchant of record. | 6 | F-1-12 |
| See the terms for refunds. | 5 | — |
| Check payment before an order reaches the packing bench. | 9 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| (external) | 1 | — |
| v1.0.0 | 1 | — |
| Hero art was generated for this product. | 7 | — |

### README

| Copy unit | Words | Flag |
|---|---:|---|
| Paid Before Ship Gate | 4 | — |
| Stop unpaid orders before packing with a local payment checkpoint. | 10 | — |
| This PWA is for small sellers who take orders on flexible terms. | 12 | F-1-21 |
| It imports order and payment CSV files, applies payment holds, records named overrides, and exports only ready orders as a pack list. | 22 | F-1-18 |
| Live site: https://paid-before-ship-gate.sociobot.in | 3 | — |
| One-click demo: https://paid-before-ship-gate.sociobot.in/demo | 3 | — |
| What it does | 3 | — |
| Imports order CSV files. | 4 | — |
| Only `order_number` and `total` are required. | 6 | — |
| Matches payment amounts through `order_number`. | 5 | F-1-1 |
| Keeps held orders out of the pack list until paid or approved. | 12 | F-1-18 |
| Records the override name and reason in the exported pack list. | 11 | F-1-18 |
| Exports a CSV pack list and a full JSON backup. | 10 | F-1-4 |
| Works offline after the first online visit. | 7 | — |
| Stores order and payment data in this browser. | 8 | — |
| The free board includes every payment check, override, backup, and export. | 11 | F-1-7, F-1-18 |
| The $39 one-time desk kit adds AES-GCM device encryption and reusable customer rules. | 13 | F-1-19 |
| Checkout and license verification use the Sociobot billing API. | 9 | — |
| It does not process payments, score customers, collect debts, reserve stock, or print shipping labels. | 15 | F-1-6 |
| CSV formats | 2 | — |
| Orders | 1 | — |
| The `customer`, `currency`, `hold`, and `date` columns are optional. | 9 | — |
| Omit customer details for a redacted import. | 7 | — |
| Currency defaults to USD. | 4 | F-1-8 |
| Payments | 1 | — |
| Extra columns are ignored. | 4 | F-1-9 |
| Multiple payment rows for one order are added together. | 9 | F-1-10 |
| Develop and verify | 3 | — |
| Requires Node.js 20 or newer. | 5 | — |
| The exact production build command is `npm run build`. | 9 | — |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | — |
| Claim tests use Playwright 1.58.2. | 5 | — |
| Each product claim and its sandbox test is listed in `.factory/claims.json`. | 11 | — |
| Privacy and recovery | 3 | — |
| Real records use IndexedDB. | 4 | F-1-22 |
| Demo records use a separate memory-only workspace and are discarded when the demo ends. | 14 | F-1-3 |
| CSV processing happens on the device. | 6 | — |
| Paid vault encryption uses PBKDF2 and AES-GCM. | 7 | F-1-11, F-1-22 |
| The app does not store the passphrase. | 7 | — |
| A lost passphrase cannot be recovered, so export backups before enabling encryption. | 12 | — |
| See `/privacy` and `/terms` in the app for the full policies. | 11 | — |
| Deploy | 1 | — |
| Deploy the contents of `dist/` as a static site. | 9 | — |
| `staticwebapp.config.json` provides the SPA fallback, 404 behavior, CSP, and security headers. | 11 | — |
| The factory owns infrastructure, DNS, and billing registration. | 8 | — |
| After deployment, run `npm run test:live` to verify the public identity, checkout redirect, deep links, 404 status, and cache policy. | 20 | F-1-23 |
| License | 1 | — |
| MIT. | 1 | — |
| See [LICENSE](LICENSE). | 2 | — |

## 4. Demo and sandbox result

- One-click entry: **PASS**. The landing CTA opens `/demo` directly.
- Immediate realistic use: **PASS**. Five named orders appear with totals, partial payments, three ready, and two held.
- Banner: **PASS**. “Demo — sample data, nothing is saved,” Reset, and Start for real remain visible.
- Reset: **PASS**. Removing SO-1049’s hold changed Ready 3 → Ready 4; Reset restored the hold and Ready 3.
- Real-data isolation in live behavior: **PASS**. A seeded real `REAL-9001` survived demo mutation/reset and sample SO-1049 did not leak into `/board`.
- Declared isolation regression test: **FAIL**, as F-1-3 explains.
- Offline and network behavior: **PASS**. The live claim suite reloaded `/demo` offline after service-worker activation. The complete order/payment import flow observed only same-origin requests.

## 5. Claims gate

Every exact command in `.factory/claims.json` was run independently after `npm ci`.

| Claim ID | Result | Review note |
|---|---|---|
| `demo-sandbox` | Command PASS | Test scope fails F-1-3 |
| `csv-order-import` | PASS | — |
| `payment-match` | PASS | Cross-currency boundary missing; F-1-1 |
| `hold-gate` | PASS | — |
| `csv-export` | PASS | — |
| `json-backup` | Command PASS | Test scope fails F-1-4 |
| `saved-rules` | PASS | — |
| `local-only` | PASS | Live network interception also passed |
| `device-encryption` | Command PASS | Specific security wording fails F-1-11 |
| `passphrase-not-stored` | PASS | — |
| `offline-reload` | PASS | Live offline run also passed |
| `purchase-terms` | PASS | $39 catalog and Dodo redirect confirmed |
| `license-inactivity` | PASS | — |

Unlisted claim findings are F-1-5 through F-1-12 plus F-1-24 and F-1-25. No declared command exited non-zero, but the registry is not complete and three listed claims need stronger coverage.

## 6. History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. The historical findings recorded in `.factory/handoff.md` and the referenced verification reports were rechecked:

| Earlier finding | Live and code result |
|---|---|
| Checkout returned 404 | Fixed: product checkout returns 303 to hosted Dodo checkout; catalog is $39 USD. |
| Missing/blank order total became $0 | Fixed: both cases reject and the claim test passes. |
| Hashed assets lacked immutable caching | Fixed: live release check passes immutable assets and no-store worker policy. |
| Unknown routes returned 200 | Fixed: unknown URL returns an actual HTTP 404. |
| Malformed backup overwrote real data | Fixed: live regression rejects invalid currency, preserves the old record after reload, and recovers from corrupt legacy storage. |
| Mobile targets below 44 px | Fixed: live 390 px suite measures the affected controls at ≥44 px. |
| 200% text clipped filters | Fixed: live suite reports no horizontal overflow and all filters remain visible. |
| Purchase/license claims absent | Fixed for price and inactive-license behavior; both new claim commands pass. |
| Local-only test omitted CSV imports | Fixed: the tagged test imports order and payment CSVs while observing all requests. |

None of those exact historical defects regressed. The findings in this review are additional gaps.

## 7. Structure, accessibility, links, and identity

| Check | Result |
|---|---|
| Route titles | PASS: landing, Demo, Order board, Privacy, Terms all use route-appropriate titles under 60 characters. |
| One `h1`, `main`, `lang=en` | PASS on `/`, `/demo`, `/board`, `/privacy`, `/terms`; also present on the 404. |
| Meta description, canonical, OG/Twitter, favicon | PASS on app routes; FAIL on the real 404 (F-1-13). |
| Designed HTTP 404 | Partial: correct status and product-specific art/copy, but missing shared skeleton/metadata (F-1-13). |
| Deep links | PASS: every known route opens directly with HTTP 200. |
| Focus on SPA route change | PASS: the new `h1` receives focus. |
| Back/forward | FAIL: scroll position is discarded (F-1-14). |
| Dead-link crawl | PASS: internal routes 200, Sociobot 200, checkout 303; hash targets exist. |
| Header/footer with Privacy/Terms | PASS on app routes; FAIL on 404 (F-1-13). |
| Accessibility | PASS automated baseline: live 21/21 suite, zero Axe serious/critical findings on five app routes, visible focus, mobile targets, text resize, reduced motion, and no console errors. |
| Performance | PASS: application JS is 32.75 KB raw / 11.04 KB gzip. |
| Visual identity | PASS: the asymmetric risograph dispatch-desk system is product-specific and does not resemble a generic SaaS hero/card template. |

`/opt/fleet/lib/verify-url.sh` passed the landing page in 662 ms with one `h1`, one `main`, `lang=en`, no missing alt text, no unnamed buttons, and no console/page errors. The full local and live Playwright suites each passed 21/21.

## 8. Missed leverage

F-1-2 is the obvious missing product step: a seller needs to finish one packing batch before starting the next. An AI feature would not improve this deterministic checkpoint and is not warranted. Import, export, backup, and local persistence exist; remote sync is not required for the brief’s local-first scope.

## What would make this perfect

Resolve every finding above: make payment matching currency-safe, add a reversible completed-batch lifecycle, strengthen and complete the claims registry, unify the legal/payment language, restore browser history scroll, bring the real 404 into the site skeleton, and apply the proposed plain-word rewrites. Then rerun every claim command, both 21-test suites, the cold mobile/desktop read, cross-currency rejection, consecutive-batch export, and the full link/metadata crawl. A subsequent review can pass only with zero remaining findings.
