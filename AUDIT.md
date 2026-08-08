# Event Craft — Security & Code Audit

Full-codebase audit (928 tracked files, 688 TS/TSX source files) covering correctness, security,
performance, architecture, code quality, reliability and DevOps. Every issue below was found by
reading the code and confirmed against the compiler, the linter, a production build, or a live
dev server. Fixed items say what changed and where.

**Verification status:** `tsc --noEmit` clean · `next build` exits 0 (all 38 routes) ·
dev server returns 200 on every page · credential-redaction unit-verified.

---

## Severity summary

| Severity | Found | Fixed | Remaining (documented below) |
|---|---|---|---|
| Critical | 7 | 7 | 0 |
| High | 12 | 12 | 0 |
| Medium | 15 | 13 | 2 |
| Low | 9 | 6 | 3 |

---

# CRITICAL

### C1. `creator_secret` leaked to every card viewer
**Category** Security (broken access control) · **Confidence** High
**Location** `app/c/[cardId]/page.tsx` (`CardPage`), `app/api/cards/[cardId]/route.ts` (`GET`)

Both paths redacted `password_hash` and `collab_password` but spread the rest of the row —
including `creator_secret`. That secret is the sole bearer credential for:
`/dashboard/[cardId]?secret=…` (analytics, full RSVP guest list, contributions),
`DELETE /api/cards/[cardId]?secret=…`, and contribution moderation.

**Impact** Anyone who opened a shared card link could read the secret out of the RSC payload (or
one API call) and then delete the card, read its analytics and guest list, or moderate it. Total
compromise of every card from a link that is meant to be freely shareable.

**Fix** Added `toPublicCard()` in `lib/db/cards.ts`, applied at every boundary that returns a card
row. It strips `creator_secret` and `creator_ip_hash` and reduces the password hashes to the
string `"protected"`. Verified: redaction unit test passes with no leak.

---

### C2. Passcode protection was cosmetic
**Category** Security (authentication bypass) · **Confidence** High
**Location** `app/c/[cardId]/page.tsx`, `app/api/cards/[cardId]/route.ts`, `verify-password/route.ts`

The full card `config` was serialised into the page for *every* visitor. `verify-password`
returned only `{success: boolean}`; the gate was a client-side `useState` phase. Viewing source —
or calling `GET /api/cards/<id>` — revealed the entire "protected" card. The OG image endpoint and
`generateMetadata` also rendered the title/recipient/sender of protected cards into public tags.

**Impact** The passcode feature provided no confidentiality at all.

**Fix** Server-enforced gate:
- `toLockedCard()` ships a content-free stub for protected cards (`app/c/[cardId]/page.tsx`).
- `GET /api/cards/[cardId]` returns the stub for protected cards.
- `verify-password` is now the **only** path that emits real content, and only after
  `bcrypt.compare` succeeds; wrong passcode returns `401` with no payload.
- `ViewerLayout` holds the card in state and swaps in the unlocked card on success.
- `generateMetadata` returns a neutral title + `robots: noindex` for protected cards; the OG image
  renders placeholder text.
- Contributions of a protected card are no longer fetched or served (`contributions/route.ts`).

---

### C3. Public anon key had full read/write on the `cards` table
**Category** Security (data exposure) · **Confidence** High
**Location** `supabase/migrations/001_initial.sql`, `002_permissions.sql`

`GRANT ALL PRIVILEGES ON public.cards TO anon` combined with `FOR SELECT USING (true)` and
`FOR UPDATE USING (true)`. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ships in the client bundle by
construction, so **this bypassed every API-level control in the app**: anyone could query
PostgREST directly and dump `creator_secret`, `password_hash`, `collab_password`,
`creator_ip_hash` and the private `config` of *every* card — and rewrite any card.

The same pattern affected `profiles` (world-readable, including email, plus an `UPDATE` grant to
`anon` on the `is_admin`/`is_pro` columns), `calendar_events`, `saved_themes`,
`theme_interactions` (anyone could delete anyone's likes) and `global_events`.

**Impact** Complete, unauthenticated compromise of all stored data, independent of application code.

**Fix** New migration `supabase/migrations/011_lockdown_rls.sql` revokes direct anon/authenticated
table access and drops the permissive policies. All access goes through route handlers using the
service-role key. One deliberate exception, documented in the migration: `contributions` keeps
`SELECT` for anon because Supabase Realtime evaluates RLS as the subscribing role — and that policy
is scoped to cards with `password_hash IS NULL`.

> **Action required:** this migration must be applied (`supabase db push`). The code fixes do not
> take effect for direct-PostgREST access until it runs.

---

### C4. Unauthenticated privilege escalation to admin
**Category** Security (authentication/authorization) · **Confidence** High
**Location** `app/api/auth/profile/route.ts` (`POST`)

Took `userId`, `is_admin`, `is_pro` straight from the request body with **no authentication of any
kind**. A single anonymous POST granted any account administrator rights.

Compounding it, `app/api/admin/global-events/route.ts` and the admin branch of
`DELETE /api/cards/[cardId]` decided "is this an admin?" by looking up `is_admin` for a user id
supplied in the **query string** — so merely knowing an admin's id was equivalent to being one.

**Impact** Full administrative takeover by an unauthenticated attacker.

**Fix** Added `lib/utils/auth.ts` (`getAuthenticatedUserId`, `isAdminRequest`) which validates a
Supabase access token server-side. Now: `is_admin` changes require an existing admin (no
self-escalation); `is_pro` is limited to your own verified account or an admin (this preserves the
in-app upgrade flow); global-events and admin card deletion require a verified admin token. Client
call sites use the new `authFetch()` helper (`lib/utils/authFetch.ts`) to attach the token.

---

### C5. Every page that renders the Navbar crashed
**Category** Bug (fatal) · **Confidence** High
**Location** `app/layout.tsx`, `components/layout/Navbar.tsx:33`

`Navbar` calls `useTheme()`, which **throws** (`"useTheme must be used within a ThemeProvider"`)
when no provider is above it. `<ThemeProvider>` was never rendered anywhere in the app — the root
layout was still the unmodified `create-next-app` template.

**Impact** `/`, `/explore`, `/projects`, `/settings`, `/schedule`, `/analytics`, `/collab`,
`/media`, `/ai` — every page with a Navbar — threw on render.

**Fix** Added `components/providers/AppProviders.tsx` (ErrorBoundary → ThemeProvider → children +
ToastQueue) and mounted it in `app/layout.tsx`. **Verified:** all nine pages now return 200 and the
SSR HTML contains the full Navbar and Footer link set.

---

### C6. Every toast in the app was invisible
**Category** Bug · **Confidence** High
**Location** `components/ui/ToastQueue.tsx`, `app/layout.tsx`

`useToast()` is used in 10+ files, but the `<ToastQueue />` renderer — the component that actually
draws the toasts — was never mounted. Toasts were pushed into the zustand store and silently
discarded.

**Impact** No success, error or validation feedback anywhere: failed uploads, failed card
creation and failed sign-in all appeared to do nothing.

**Fix** Mounted `<ToastQueue />` in `AppProviders`.

---

### C7. Production build was broken
**Category** DevOps · **Confidence** High
**Location** `next.config.ts`, `package.json`

`next build` failed: `@resvg/resvg-js` ships a native binding that Turbopack cannot place in an
ESM chunk (`non-ecmascript placeable asset`).

Separately — and worse for reproducibility — **27 runtime dependencies were imported but never
declared** in `package.json`, which listed only `next`, `react`, `react-dom`. Among them:
`framer-motion` (523 files), `lucide-react` (310), `clsx` (48), `@supabase/supabase-js`, `zod`,
`bcryptjs`, `nanoid`, `sharp`, `satori`, `zustand`, `howler`, `matter-js`. Two were also missing
from `package-lock.json`. A clean `npm ci` on CI or a new machine would fail outright.

**Fix** `serverExternalPackages: ["@resvg/resvg-js", "sharp", "music-metadata"]` plus
`turbopack.root` (a stray lockfile in `C:\Users\Justin` was making Next infer the wrong workspace
root). All 27 dependencies + 4 `@types` packages declared at their installed versions.
**Verified:** `next build` now exits 0 and compiles all 38 routes.

---

# HIGH

### H1. Rate limiter check-then-act race
**Location** `lib/utils/rate-limit.ts` · **Fixed**
Counted the window *then* inserted only if allowed — N concurrent requests all read the same
pre-insert count and all passed. Inverted to insert-then-count so every attempt is counted exactly
once. (Fail-open on DB error is retained deliberately and now commented.)

### H2. Rate limits trivially bypassed via `X-Forwarded-For`
**Location** all API routes · **Fixed**
Most routes did `req.headers.get("x-forwarded-for").split(",")[0]` — fully attacker-controlled, so
a fresh spoofed IP per request defeated every limit. Added `lib/utils/request.ts::getClientIp`,
which honours the header only behind a known proxy (`VERCEL=1` / `TRUSTED_PROXY=true`) and takes
the **last** hop (proxy-appended) rather than the first (client-supplied).

### H3. No brute-force protection on passcode verification
**Location** `verify-password/route.ts` · **Fixed**
The 5-attempt lockout lived entirely in React state; calling the endpoint directly had no limit at
all. Added a server-side limit (10 per 5 min) and a `429` branch in the UI.

### H4. Path traversal in upload/media storage keys
**Location** `upload/photo`, `upload/voice`, `api/media` · **Fixed**
`userId` came from a form field / query string and was interpolated straight into
`photos/${userId}/…`. A value like `../../voice` escaped the prefix and could overwrite another
user's objects; in `/api/media` it could enumerate the bucket. Added
`sanitizePathSegment()` in `lib/db/storage.ts` and applied it at all three sites.

### H5. Arbitrary file extension on voice upload (stored XSS)
**Location** `app/api/upload/voice/route.ts` · **Fixed**
The stored extension was `file.name.split(".").pop()`. Uploading `x.html` with an `audio/*` MIME
stored an `.html` object in a **public** bucket, which the storage origin would then serve as HTML.
Replaced with a strict MIME→extension allow-list; filenames are now `randomUUID()`-based.

### H6. Unvalidated audio uploads
**Location** `app/api/upload/voice/route.ts` · **Fixed**
A metadata parse failure was logged and the file uploaded anyway, making the duration cap (and the
"is this actually audio?" check) optional from the client's point of view. Unparseable files are
now rejected.

### H7. Card ownership could be assigned to another account
**Location** `app/api/cards/route.ts` (`POST`) · **Fixed**
`user_id` was read from the request body. Ownership now comes from the verified session; guests may
still own cards via their `anon_*` id, but a caller can no longer file a card under a registered
account.

### H8. `GET /api/cards` returned other users' cards
**Location** `app/api/cards/route.ts` (`GET`) · **Fixed**
`?userId=` was trusted outright. A signed-in caller is now pinned to their own id, and requesting a
non-`anon_` id without a session returns 401. Responses run through `toPublicCard`.

### H9. `CreateCardSchema` / `ContributionSchema` / `ReactionSchema` existed but were never used
**Location** `lib/db/schemas.ts` and three routes · **Fixed**
Only `config` was validated on card creation; `scheduledAt`, `maxContributors`, `password` and
`collabPassword` arrived unchecked. Contributions and reactions had *no* validation, *no* length
bounds and *no* rate limit — unbounded text could be posted to any card id. All three schemas are
now applied, with sanitisation, rate limits, and `getCard` checks that the card actually accepts
contributions/RSVPs.

### H10. `max_contributors` was stored but never enforced
**Location** `contributions/route.ts` · **Fixed**
Added `countContributions()` and a `409` when the creator's cap is reached.

### H11. RSVP guest list was world-readable
**Location** `app/api/cards/[cardId]/rsvps/route.ts` (`GET`) · **Fixed**
Guest names, party sizes and notes were readable by anyone with the card link. Now requires the
creator secret. (Confirmed no client code called this GET — the dashboard uses the analytics
endpoint — so no regression.)

### H12. Unauthenticated writes to any user's calendar
**Location** `app/api/cards/calendar/route.ts` (`POST`) · **Fixed**
`user_id` taken from the body with only a truthiness check. Added zod validation, a rate limit, and
session-pinned ownership.

---

# MEDIUM

### M1. PostgREST filter injection *(fixed)*
`.or(\`user_id.eq.${userId},…\`)` interpolated an unsanitised id into a PostgREST filter **string**
in 6 places (`cards`, `cards/analytics`, `cards/reactions`, `dashboard/summary`). A value containing
a comma or a dotted operator rewrites the filter. These were `NODE_ENV === "development"` branches,
which also meant dev quietly returned rows the production branch would not. Replaced with
parameterised `.eq()` everywhere and the dev/prod divergence removed.

### M2. Raw client IP stored in a column named `creator_ip_hash` *(fixed)*
`app/api/cards/route.ts` passed the plaintext IP. Now SHA-256 hashed before storage, and stripped
from all responses by `toPublicCard`.

### M3. Recurring-calendar date bugs *(fixed)*
Byte-identical logic was duplicated in `cards/calendar` and `dashboard/summary`, with two bugs:
(a) the stored date was read with **local** getters (`getMonth`, `getDate`) then rebuilt with
`Date.UTC(...)`, so a server west of UTC placed recurrences a day early; (b) `Date.UTC(y, m, 31)`
silently rolls forward, so a monthly event on the 31st appeared on Mar 3 in February. Extracted to
`lib/utils/recurrence.ts` with UTC-consistent reads and day clamping. Malformed global-holiday rows
now drop out instead of being pinned to January 1st.

### M4. OG font fetch could poison itself permanently *(fixed)*
`app/api/og/[cardId]/route.tsx` never checked `res.ok`, so a CDN error page was cached as "font
data" for the life of the process, breaking every subsequent OG image. Added status/empty-body
checks, a 5s timeout, promise-level caching (concurrent cold requests no longer each fetch), and
retry-on-failure.

### M5. `ensureBucketExists()` ran a `listBuckets()` round trip on every upload *(fixed)*
Memoised per bucket; a rejected probe is not cached.

### M6. Reaction totals fetched every row to call `.length` *(fixed)*
`dashboard/summary` and `cards/analytics` now use `count: "exact", head: true`. `cards/reactions`
gained the missing `limit`.

### M7. Unbounded client-side response cache *(fixed)*
`lib/hooks/useSupabaseData.ts` used a plain object that grew for the life of the tab and never
evicted expired entries. Replaced with a 50-entry LRU + `clearApiCache()`.

### M8. Editor history deep-cloned the whole config on every keystroke *(fixed)*
`JSON.parse(JSON.stringify(config))` per `updateField`, ×50 history entries. Switched to
`structuredClone` (also fixes silent `undefined`/`Date` mangling) in `lib/editor/store.ts`.

### M9. Unbounded SFX audio cache *(fixed)*
`lib/audio/manager.ts` kept one decoded `Howl` per path forever on a module singleton. Added a
24-entry cap with `unload()` on eviction.

### M10. `window.alert` monkey-patched and never restored *(fixed)*
`ToastQueue` replaced the global on mount with no cleanup, so unmount/Fast-Refresh left the page
permanently patched. Now restored on unmount.

### M11. `useUserId` race could revert a signed-in user to guest *(fixed)*
A slow `getUser()` could resolve after `onAuthStateChange` and overwrite the newer id. Added a
guard flag; also made `localStorage` access resilient to private mode.

### M12. Draft restore trusted `localStorage` blindly *(fixed)*
A corrupted draft installed a non-object as the editor config, and `saveDraft` could throw
`QuotaExceededError` straight out of autosave. Both guarded in `lib/editor/store.ts`.

### M13. Internal error messages returned to clients *(fixed)*
Many routes returned `error.message` (Postgres/Supabase internals) verbatim. Replaced with generic
messages; details go to `console.error`.

### M14. Root metadata was the `create-next-app` default *(fixed)*
`title: "Create Next App"`, no `metadataBase` (so relative OG image URLs could not resolve). Fixed
in `app/layout.tsx`; `SkipLink` is now actually rendered.

### M15. Share links derived from the `Host` header *(fixed)*
`POST /api/cards` built the returned card URL from the attacker-controlled `Host` header. Now
prefers `NEXT_PUBLIC_BASE_URL`.

---

# LOW

### L1. `sanitizeText` single-pass tag strip *(fixed)*
`<<a>script>` became `<script>` after one replacement. Now iterates to a fixed point and strips C0/C1
control characters (which corrupted analytics CSV export). Behaviour verified: hyphens, newlines,
tabs and Unicode (including emoji) are preserved.

### L2. Optional fields coerced to empty strings *(fixed)*
`sanitizeText(undefined)` returns `""`, so absent `subtitle`/`body` were persisted as empty strings.
Now only rewritten when present.

### L3. `maxContributors` default mismatch *(fixed)*
Schema default 10 vs route default 20, and `Number(x)` could produce `NaN`. Unified via the schema.

### L4. Gemini API key in the URL query string *(fixed)*
Moved to the `x-goog-api-key` header (query strings leak into proxy/access logs). Also added a
character allow-list for `model`, which is interpolated into the URL path.

### L5. Unchecked provider response shapes *(fixed)*
`data.choices[0].message.content` etc. threw a `TypeError` on any error envelope, surfacing as an
opaque 500. Added a `pickText()` helper and an explicit empty-response `502`.

### L6. Dead env vars in `.env.example` *(fixed)*
`RATE_LIMIT_CARDS_PER_HOUR`, `RATE_LIMIT_REACTIONS_PER_HOUR`, `MAX_PHOTO_SIZE_MB`,
`MAX_VOICE_SIZE_MB` were documented but never read (confirmed: the only env vars read anywhere are
the 7 now listed). Replaced with the real set, including the previously undocumented
`TRUSTED_PROXY`, and a warning that `SUPABASE_SERVICE_ROLE_KEY` is now required.

---

# Remaining / not fixed — needs your input

### R1. Footer links to `/terms` and `/privacy` return 404
`components/layout/Footer.tsx:14-15`. Confirmed 404 on the running server. **Not fixed
deliberately:** the correct fix is real legal content, and generating placeholder Terms of Service
or a Privacy Policy would be worse than a broken link — it risks being mistaken for a real
agreement. Either supply the content or remove the links. The social links (lines 21/30/39) also
point at `twitter.com` / `github.com` / `discord.com` homepages rather than real profiles.

### R2. Guest identity is not an authentication boundary
For anonymous users, `user_id` is a value the browser generates in `localStorage`
(`useUserId`). Nothing server-side can verify it. I closed the paths where this let a guest reach a
*registered* account's data, but guests can still, in principle, read or modify other **guests'**
calendar events by presenting another `anon_*` id. This is inherent to the anonymous-first design
and cannot be fixed at the RLS or API layer — it needs Supabase anonymous sign-in (which issues a
real JWT) to resolve properly. Documented inline in `011_lockdown_rls.sql` and `useUserId.ts`.

### R3. Residual lint findings
`npx eslint` reports ~1,900 problems repo-wide, the vast majority in the 500+
`components/themes/experiences/*` files (`no-explicit-any`, unused vars). In the core directories I
touched, `useSupabaseData.ts` went from 18 problems to 0; ~36 remain, of which ~20 are
`react-hooks/set-state-in-effect` firing on the idiomatic `setMounted(true)` SSR-hydration pattern —
correct code that the rule flags conservatively. I left those rather than churn working components.

### R4. No test suite
There is no test framework, no tests, and `tsconfig.json` excludes a file
(`api-ai-security.test.ts`) that does not exist. The security fixes above are verified by build,
typecheck, live HTTP probes and a redaction check, but there is no regression net. Highest-value
first tests: `toPublicCard`/`toLockedCard` redaction, the passcode gate, `getClientIp`,
`expandRecurrence` date handling, and `sanitizeText`.

---

---

# Second pass — reviewing the fixes themselves

After completing the fixes I re-audited the changed surface. Two of my own changes had introduced
regressions; both are fixed and verified.

### S1. Locked collaborative cards lost their contributions *(fixed)*
Making `GET /contributions` refuse passcode-protected cards (C2) meant `useRealtimeContributions`
polled that endpoint every 12s and got a 403 forever, so a protected group card showed an empty
wish list even *after* the correct passcode. Added an `enabled` flag to the hook; protected cards
skip polling/subscribing entirely and seed their list from the `/verify-password` response instead.
Trade-off, now explicit in a code comment: a protected group card's list is correct but not live,
because RLS deliberately excludes those rows from realtime.

### S2. Applying `CreateCardSchema` broke publishing cards without a passcode *(fixed)*
The editor initialises `password`, `collabPassword` and `scheduledAt` to `""` and sends them
verbatim. `password: z.string().min(4)` therefore rejected **every** card published without a
passcode. Added an `emptyToNull` preprocessor in `lib/db/schemas.ts`, and coerced `maxContributors`
(which arrives as a string from a number input).

Verified against the exact payload `EditorLayout.handlePublish()` sends:

| Case | Result |
|---|---|
| editor default (no passcode) | accepted, `password → null` |
| real passcode `"hunter2"` | accepted |
| short passcode `"ab"` | rejected |
| `maxContributors: "15"` (string) | accepted, coerced to `15` |
| `maxContributors: 500` | rejected |

### Also re-checked, no issues found
- **Every** path that reads the `cards` table now redacts (`toPublicCard`/`toLockedCard`) or selects
  only non-sensitive columns — re-verified by grep across `app/` and `lib/`.
- The collab page's gate still works: `toLockedCard` preserves `is_collaborative` and the
  `collab_password` "protected" marker it depends on.
- Contribution POST field names match the collab page's payload.
- No unused imports or new lint errors introduced by any of the changes.
- Swept all 500+ theme components for timers/listeners started without cleanup. The 10 candidates
  my first heuristic flagged were checked individually: 3 were false positives (they do clean up),
  and the rest are `requestAnimationFrame` loops that self-terminate within ~5s, so at worst they
  run a few no-op state updates after unmount. Not worth churning 500 files.

---

## Architectural recommendations

1. **Adopt Supabase anonymous auth.** Single highest-leverage change: it turns guest identity into
   a verifiable JWT, which collapses R2 and lets RLS express real per-user ownership instead of the
   service-role-for-everything pattern.
2. **Stop using the service-role key as the default client.** `lib/db/client.ts` picks service-role
   on the server for *all* queries, so RLS is bypassed everywhere and authorization lives entirely
   in hand-written route checks — exactly the class of bug behind C1/C2/C4. With real auth, use a
   request-scoped client and let RLS be the backstop.
3. **Rate limiting belongs in the edge/middleware layer.** The current DB-backed limiter costs two
   round trips per request and still fails open.
4. **Add `middleware.ts` for security headers** (CSP, `X-Content-Type-Options`, `Referrer-Policy`).
   There are currently none — relevant given a public storage bucket serves user uploads.
5. **Card ids.** Widened from `nanoid(8)` to `nanoid(12)`, and `creator_secret` from 16 to 32 chars.
   8 characters is ~47 bits — enumerable given cards were fully readable by id.
