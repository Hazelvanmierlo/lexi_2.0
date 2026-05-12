# Lexi.kids — Auth & Child-Friendly Profile System

**Date:** 2026-05-12
**Status:** Approved design, ready for implementation plan
**Supersedes:** the demo-auth shortcuts currently in `src/app/admin/quizzen/actions.ts` and `src/app/kind/page.tsx`

---

## Context

The current Lexi codebase has no working authentication. Clerk is referenced in `CLAUDE.md` as the chosen auth provider but is not installed. `/admin/quizzen` is gated only by a hardcoded `DEMO_ADMIN_ID = "seed-parent-demo"`; `/kind` always loads the seeded demo kid (`DEMO_KID_ID = "seed-kid-sara"`). `/signup` is a four-step wizard whose Submit currently writes nothing.

Before any per-kid feature (engagement, mastery, recommendations) can be meaningful in production, there must be a real way to know *which kid* is playing. This spec lands that foundation.

---

## §1 — Goals & scope

### Shipping

1. Clerk wired into Next.js App Router as the parent auth provider.
2. Real `/signup` that creates Clerk user + DB rows (`Household` + `Parent` + first `Kid` + `KidConsent`) and starts a 14-day Stripe trial (no card required).
3. Real `/login` (parent email+password via Clerk).
4. Middleware protecting `/kind`, `/ouder`, `/admin/*` — anonymous → `/login?next=...`.
5. Kid profile picker on `/kind` for households with ≥2 kids; auto-skip to the only kid in single-kid households.
6. Real admin gate on `/admin/*` — `Parent.role === "ADMIN"` required, else redirect to `/ouder`.
7. "Wissel kind" switch button in `/kind` header that returns to the picker.
8. Parent logout from `/ouder`.

### Definition of done (functional)

| # | Statement |
|---|---|
| 1 | Hitting `/kind` while not logged in redirects to `/login?next=/kind`. |
| 2 | A fresh signup creates a Clerk user **and** a `Household` + `Parent` + `Kid` + `KidConsent` row inside a single DB transaction; the Stripe customer is created in `TRIALING` status. |
| 3 | A parent with one kid lands directly on the kid home on `/kind`; a parent with two kids lands on `/kind/picker`. |
| 4 | Tapping a kid tile sets a signed cookie and loads that kid's `/kind` home. |
| 5 | A `PARENT`-role user who guesses `/admin/quizzen` is redirected to `/ouder`. An `ADMIN`-role user gets through. |
| 6 | `/kind` resolves to **the picked kid**, not the hardcoded demo kid — so downstream features (engagement, recommendations) have a real `kidId`. |
| 7 | `/kind/*` ships **zero Clerk client-side script** (kid-product safety rule from `CLAUDE.md`). |
| 8 | Existing seed data continues to work in dev: `seed-parent-demo` is marked `ADMIN`, `seed-kid-sara` is selectable. |

### Out of scope (deferred to separate specs)

- Per-kid 4-digit PIN — default is no PIN.
- Social login (Google / Apple).
- Polished password-reset UI — use Clerk's hosted page.
- Stripe webhook handling for subscription state changes.
- Data export / "delete my kid" endpoints.
- `/admin/users` UI for role management.

---

## §2 — Architecture

### Three identity layers

```
┌──────────────────────────────────────────────────────────────────┐
│ Clerk (external)            — owns Parent identity               │
│   clerkUserId, email, password, sessions, email verification     │
└──────────────────┬───────────────────────────────────────────────┘
                   │  webhook (user.created/updated/deleted) →
                   │  reconcile Parent row
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│ Postgres (our DB)           — owns Household + Parent + Kid      │
│   Household.id              ← household session anchor           │
│   Parent.clerkUserId UNIQUE ← join key to Clerk session          │
│   Parent.role ∈ {PARENT, ADMIN}                                  │
│   Kid.householdId           ← FK; rendered on profile picker     │
└──────────────────┬───────────────────────────────────────────────┘
                   │  pickedKidId cookie (signed, httpOnly,
                   │  sliding 8h, scoped to /kind/*)
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│ Kid profile (our cookie)    — owns "which kid is playing"        │
│   pickedKidId               ← set on tile tap                    │
└──────────────────────────────────────────────────────────────────┘
```

Rationale for this layering:

- **Clerk owns only adult credentials.** We don't push it into kid territory; kids never see a Clerk widget.
- **Kid identity isn't an auth concern.** It's profile-within-session. A signed cookie is the right primitive — cheap, reversible, no Clerk pollution on `/kind/*`.
- **`Parent.clerkUserId` already exists in the schema.** We just start using it instead of demo constants.

### New plumbing (file inventory)

| File | Purpose |
|---|---|
| `src/middleware.ts` | Clerk middleware; redirects unauthenticated `/kind`, `/ouder`, `/admin/*` → `/login?next=...`. |
| `src/lib/auth.ts` | Server helpers: `currentParent()`, `currentHousehold()`, `currentKid()`, `requireAdmin()`. |
| `src/lib/kid-cookie.ts` | Signed-cookie helpers (set / read / clear `pickedKidId`). |
| `src/app/api/clerk-webhook/route.ts` | Verifies signature; reconciles `Parent` rows on `user.{created,updated,deleted}`. Idempotent via `ProcessedEvent`. |
| `src/app/login/page.tsx` | Hosts Clerk's `<SignIn />` inside the Lexi shell (no Nav). |
| `src/app/(auth)/layout.tsx` | Auth-only layout for `/login` and the signup welcome step. |
| `src/app/kind/picker/page.tsx` | Server-rendered profile picker (no Clerk JS). |
| `src/app/kind/picker/actions.ts` | `pickKid(kidId)` server action: validates household membership, sets cookie, redirects. |
| `src/components/kind-picker/*` | Avatar tiles + "Wissel kind" button. |
| `src/app/api/kind/switch/route.ts` | Clears `pickedKidId` cookie and redirects to picker. |

### Middleware routing table

| Path | Logged out | Logged in (parent) | Logged in (admin) |
|---|---|---|---|
| `/`, `/probeer`, `/shop` | pass | pass | pass |
| `/login`, `/signup` | pass | redirect → `/ouder` | redirect → `/admin/quizzen` |
| `/ouder` | redirect → `/login?next=/ouder` | pass | pass |
| `/kind`, `/kind/*` | redirect → `/login?next=/kind` | pass; `/kind` may redirect to picker | pass |
| `/admin/*` | redirect → `/login?next=/admin/quizzen` | redirect → `/ouder` | pass |

The role check happens **inside the page** (not middleware), because role lives in our DB and middleware should stay edge-fast. Defence in depth: middleware blocks anonymous, page rechecks role.

### Auto-skip-for-single-kid logic on `/kind`

`/kind` is a thin server component:

1. If `pickedKidId` cookie is set and that kid still belongs to the current household → render kid home (existing `/kind/page.tsx` logic, but reading `kidId` from `currentKid()`).
2. Else if household has exactly one kid → set cookie, render kid home.
3. Else → redirect to `/kind/picker`.

---

## §3 — User journeys

### 3.1 Signup (parent creates account)

Current wizard collects: email, password, kid name, kid groep, kid subjects, subscription tier. After this spec, `Submit` does the following in order:

```
1. clerkClient.users.createUser({ emailAddress: [email], password })
   → returns clerkUserId

2. stripe.customers.create({ email, metadata: { clerkUserId } })
   → returns stripeCustomerId
   stripe.subscriptions.create({ customer, items, trial_period_days: 14 })
   → starts trial; no card required

3. db.$transaction([
     Household.create({
       ownerEmail: email,
       region,                          // NL or BE from locale
       stripeCustomerId,
       subscriptionTier: tier,
       subscriptionStatus: "TRIALING",
       trialEndsAt: now + 14d,
     }),
     Parent.create({
       householdId, clerkUserId, email,
       role: "PARENT",
     }),
     Kid.create({
       householdId, name, groep, avatar,
     }),
     KidConsent.create({
       kidId,
       parentEmail: email,
       ipAddress: x-forwarded-for ?? req.ip,
       userAgent: headers["user-agent"],
     }),
   ])

4. setKidCookie(kid.id)         // sliding 8h
5. clerkClient.signIn(...)      // Clerk already signed-in after createUser
6. redirect → /kind             // single-kid household, auto-skips picker
```

**Failure handling:**

- If step 2 (Stripe) fails: delete the Clerk user via `clerkClient.users.deleteUser`, surface friendly error in the wizard.
- If step 3 (DB transaction) fails: delete Clerk user **and** Stripe customer, surface friendly error.
- Never leave a half-created user.

### 3.2 Login (returning parent)

`/login` route renders Clerk's `<SignIn />` embedded in the Lexi shell. On success, Clerk redirects to `?next=...` if present, else `/ouder`. Middleware then lets the request through.

No server work on our side — Clerk handles email/password, password reset link, "remember me".

### 3.3 Profile picker (kid chooses self)

```
GET /kind
  middleware: parent authed? if no → /login?next=/kind
  page logic (server, no JS to client):
    parent     = await currentParent()
    household  = await currentHousehold()
    if cookie.pickedKidId valid && kid ∈ household.kids → render kid home
    else if household.kids.length === 1 → setKidCookie(only kid), render
    else → redirect /kind/picker

GET /kind/picker
  Renders one large tile per kid: avatar image, name, groep label.
  Tile is a <form action={pickKid}> with hidden kidId input.

POST /kind/picker (server action: pickKid)
  - verify kidId belongs to currentHousehold()
  - setKidCookie(kidId) — signed, httpOnly, 8h sliding, sameSite=Lax, Secure in prod
  - redirect → /kind
```

**Constraints for the picker UI (implementation detail; design via `frontend-design` skill):**

- ≥ 120px square tap targets.
- Avatar sourced from `/public/avatars/{set}/{age}-*.png`.
- Age-band styling: `klein` (`groep` 1-4, ages 4-8) gets larger tiles with more colour saturation; `groot` (`groep` 5-8, ages 9-12) gets a tighter grid with less mascot styling. The band primitive (`ageBandFor(groep: number)`) lives in `src/lib/engagement.ts` and is shared with the engagement spec.
- No keyboard interaction required to pick — pointer / tap only.
- Keyboard navigation supported for accessibility (Tab + Enter).

### 3.4 Wissel kind (switch profile)

Kid header gains a small "Wissel" button (Lucide `Users` icon + label). Click posts to `/api/kind/switch`, which clears the cookie and redirects to `/kind/picker`. Parent session stays intact.

### 3.5 Logout (parent ends session)

`/ouder` header gains a "Uitloggen" link. Click invokes Clerk's `signOut()` server action, then redirects to `/`.

### 3.6 Clerk webhook (reconciliation, not primary path)

`POST /api/clerk-webhook` handles edge cases:

- Parent created via Clerk dashboard, bypassing signup → upsert minimal `Parent` row (no `Household`; surface a "complete your signup" banner in `/ouder`).
- Parent changes email in Clerk → sync `Parent.email`.
- Parent deleted in Clerk → soft-delete (`Parent.deletedAt = now`); preserves `AuditLog` FK integrity.

Idempotency: insert into `ProcessedEvent` keyed on the Clerk event id; bail early if already seen.

---

## §4 — Admin gate

### Defence in depth — checks happen twice

**Middleware (edge-fast, anonymous blocker):**

```ts
// src/middleware.ts
if (path.startsWith("/admin")) {
  const session = await auth();
  if (!session?.userId) return redirect(`/login?next=${path}`);
  // role check happens in the page (DB read; not edge-appropriate)
}
```

**Page/action (DB-backed role check):**

```ts
// src/lib/auth.ts
export async function requireAdmin(): Promise<{ parent: Parent }> {
  const parent = await currentParent();
  if (!parent || parent.role !== "ADMIN") redirect("/ouder");
  return { parent };
}
```

Every `/admin/*` page and every admin server action calls `await requireAdmin()` first. The current `DEMO_ADMIN_ID` constant in `src/app/admin/quizzen/actions.ts` is deleted.

### Audit log becomes real

`AuditLog` already exists. Today's writes use the fake demo `clerkUserId`. After this spec they use the real Clerk session id. No schema change.

### Role assignment is never self-service

- All new signups get `role: "PARENT"`.
- Promotion to `ADMIN` is operational only:
  - Via Supabase SQL editor: `UPDATE "Parent" SET role = 'ADMIN' WHERE email = '...'`
  - Or via a future `/admin/users` UI (out of scope here).

---

## §5 — GDPR, consent, email verification, testing, rollout

### 5.1 KidConsent — captured at signup

`KidConsent` is already in the schema (`KidConsent { kidId, parentEmail, consentedAt, ipAddress, userAgent }`). After this spec it gets written, once per kid, at the moment the kid is created in signup.

The signup wizard's final step shows consent text covering:

- Lexi will store the kid's name, groep, mastery score, session history.
- For kids under 16 (Dutch GDPR threshold) parental consent is the legal basis.
- Link to the privacy policy.
- One required, unchecked-by-default checkbox to enable Submit.

### 5.2 Email verification

- **During trial (first 14 days): play allowed without email verification.** Removing friction matters more than perfect verification — the trial period itself is the gate.
- **First paid Stripe charge requires verified email.** Stripe webhook (separate spec) checks before allowing the upgrade.
- `/ouder` shows a soft banner while unverified: "Bevestig je e-mailadres om je proefperiode niet te verliezen."

### 5.3 Testing strategy

**Unit (Vitest):**

| File | Coverage |
|---|---|
| `src/lib/kid-cookie.test.ts` | Sign/verify round-trip; tampered cookie rejected; expired cookie rejected. |
| `src/lib/auth.test.ts` | `currentKid()` returns null when no cookie, wrong household, expired cookie. `requireAdmin()` redirects PARENT, returns ADMIN. |

**Integration (Vitest + test DB schema):**

| Test | Coverage |
|---|---|
| Signup happy path | Stub Clerk + Stripe; assert `Household` + `Parent` + `Kid` + `KidConsent` rows created with correct FKs and field values. |
| Signup Stripe failure | Stripe stub throws; assert Clerk user is deleted and no DB rows exist. |
| Signup DB failure | Force transaction error; assert Clerk user and Stripe customer are both cleaned up. |
| Clerk webhook idempotency | Same event id delivered twice; only one DB write occurs. |

**E2E (Playwright):**

| Test | Coverage |
|---|---|
| Anonymous → `/kind` → `/login` | Redirect with correct `next` param. |
| Single-kid household → `/kind` → home | Cookie auto-set, no picker. |
| Two-kid household → `/kind` → picker → tile-tap → home | Cookie set after tap. |
| `PARENT` → `/admin/quizzen` → `/ouder` | Forbidden, redirected. |
| `ADMIN` → `/admin/quizzen` → admin home | Allowed. |

Tests run against a seeded test schema; CI runs `prisma migrate deploy` before tests.

### 5.4 Rollout / migration plan

The seeded data (`seed-parent-demo`, `seed-kid-sara`) must keep working through the cutover.

**Pre-deploy (in branches, behind a flag):**

1. Install `@clerk/nextjs`; add middleware + auth helpers; gate all behaviour behind `NEXT_PUBLIC_AUTH_ENABLED` env flag, default `false`. Demo hardcodes remain when the flag is off. (CLAUDE.md normally forbids backwards-compat shims; this is an explicit, time-limited exception for a live-cutover of auth. Flag is removed in a follow-up PR within one release cycle.)
2. Wire signup, picker, admin gate — all gated by the flag.
3. Verify in dev with `NEXT_PUBLIC_AUTH_ENABLED=true`.

### 5.5 Local development setup — operator runbook

These are the non-code steps an operator must do before the auth flow can be exercised end-to-end on their machine. They are not part of the implementation plan because they touch external services (Clerk dashboard) or generate per-machine secrets.

1. **Create a Clerk application** at https://dashboard.clerk.com. Enable Email + Password sign-in. Disable phone/social for v1 (keeps the surface small).

2. **Paste Clerk keys into `.env.local`** (treat as secrets — never commit):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...`
   - `CLERK_SECRET_KEY=sk_test_...`
   - `CLERK_WEBHOOK_SIGNING_SECRET=whsec_...` (optional locally — only needed when actually receiving webhooks)

3. **Generate `COOKIE_SECRET`** (32 bytes base64) — used by `src/lib/kid-cookie.ts` to sign the `pickedKidId` cookie:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Paste into `.env.local` as `COOKIE_SECRET="..."`. Rotate at will in dev; rotating invalidates any currently-issued kid cookies.

4. **Set the cutover flag** in `.env.local`: `NEXT_PUBLIC_AUTH_ENABLED="true"`.

5. **Link the seeded demo parent to Clerk:** `npm run db:link-admin`. Creates Clerk user `demo@lexi.kids` / password `Lexi-demo-1234!` and sets `Parent.clerkUserId` on the seed row with `role=ADMIN`. Idempotent.

6. **Disable "New device verification"** on the dev Clerk instance (only the dev instance — keep it on for prod):

   Clerk has a default security feature that sends an email code on every sign-in from an unrecognised browser/IP. For local dev this is noise — the demo email doesn't exist, so the code can't be received normally (you'd have to read it from Clerk dashboard → Logs). For a one-off bypass: copy the code from **Clerk dashboard → Logs → most recent email event**. To turn the feature off entirely on the dev instance: **Configure → Attack protection** (or **Restrictions / Security**, depending on Clerk dashboard version) → toggle **"New device verification"** off.

   This is a dev-only choice. The production Clerk instance keeps device verification on as a real security feature.

7. **Restart the dev server** after any change to `.env.local` — Next.js reads env at server start, not per-request.

8. **Smoke-test sign-in:** http://localhost:3000/login → `demo@lexi.kids` / `Lexi-demo-1234!` → lands on `/ouder`. From there, `/kind` should auto-skip to the seeded Sara, `/admin/quizzen` should work (ADMIN role).

**Deploy:**

4. Run a one-off script (`scripts/seed-admin-clerk.ts`) that creates a Clerk user for the seed parent's email and sets `Parent.clerkUserId` to the new id. Mark them `ADMIN`. (Idempotent: skips if user exists.)
5. Set `NEXT_PUBLIC_AUTH_ENABLED=true` in Vercel production env vars.
6. Smoke test all six routes (`/`, `/login`, `/signup`, `/ouder`, `/kind`, `/admin/quizzen`).

**Rollback:**

- Flip flag back to `false`; middleware becomes a no-op, demo hardcodes are back in play.
- Remove the flag and demo branches in a follow-up PR within one release cycle.

---

## Open items / known tensions

These are flagged explicitly rather than buried:

1. **`NEXT_PUBLIC_AUTH_ENABLED` flag conflicts with CLAUDE.md's "no backwards-compat shims" rule.** Included because cutting over auth on a live product needs a rollback path. Removed within one release cycle.

2. **Email-verification policy** is "play during trial, verify before charge." Some products require verification before any play. The chosen policy favours conversion; revisit if signup abuse becomes a problem.

3. **Stripe trial start lives in the signup transaction.** If Stripe API is down, signup fails. Alternative is to create the Clerk user + DB rows synchronously and the Stripe customer asynchronously in the Clerk webhook — less brittle but creates a brief window where a kid could play without a Stripe customer attached. The chosen "fail fast" approach trades availability for correctness of state; revisit if Stripe reliability becomes an operational pain point.

4. **`/kind/*` Clerk-free guarantee is enforced by file convention, not by tooling.** A future spec should add a Vitest/ESLint check that fails CI if anything under `src/app/kind/*` imports `@clerk/*`.

---

## What ships next after this

Once auth is in place, the following queue back up:

1. **Engagement + analytics spec** (drafted in the same conversation, paused on §3) — depends on a real `kidId` from auth. Plug-and-play once this spec ships.
2. **Stripe webhook spec** — subscription state transitions, email verification gate before first charge.
3. **Item difficulty calibration + spaced repetition** — depends on `QuestionStat` aggregates from the engagement spec.

Each gets its own design doc.
