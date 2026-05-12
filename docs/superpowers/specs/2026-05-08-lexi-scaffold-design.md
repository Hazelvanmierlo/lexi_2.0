# Lexi.kids — Phase 1 Scaffold Design

**Date:** 2026-05-08
**Scope:** Phase 1 of the Lexi.kids build (per `CLAUDE.md` §"First prompt to the user"). Tooling skeleton only. No feature work.
**Source of truth for the broader product:** `design_handoff/README.md` and `design_handoff/CLAUDE.md` (copied into the repo).

## Goal

Stand up an empty-but-correctly-shaped Next.js project at `C:\Users\thoma\lexi_2.0` so the user can:

1. Run `npm run dev` and see a placeholder page in the brand fonts on the brand cream background.
2. `git init`, push to GitHub.
3. Open the folder in VS Code with sensible defaults already configured.
4. Connect the GitHub repo to Vercel via "Import Project" with no extra configuration.

The Lexi-specific config (OKLCH design tokens, three brand fonts, env-var template, Prisma init, design-handoff bundle) is layered on top of the `create-next-app` baseline so that future feature work doesn't re-do this groundwork.

## Non-goals (deferred to later sub-projects)

- No Clerk, Stripe, PostHog, or `next-intl` packages installed.
- No real Prisma models or migrations — `schema.prisma` is the `prisma init` boilerplate only.
- No routes beyond `/`. The full route map from `design_handoff/README.md` §5 is implemented surface-by-surface in later sub-projects.
- No port of the v3 JSX prototype components.
- No real auth, database, payments, or analytics wiring.

## Architecture

The scaffold is a single Next.js 14 App Router app at the working-directory root. Bootstrap with `create-next-app` to inherit Vercel-native defaults, then apply Lexi-specific overrides as discrete edits.

### Bootstrap command

```
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

Run from `C:\Users\thoma\lexi_2.0` (already empty).

### Final tree

```
lexi_2.0/
├── .env.example
├── .env.local               # gitignored, empty
├── .gitignore
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── CLAUDE.md                # copied from design_handoff/
├── README.md                # short, points at design_handoff/
├── design_handoff/          # full bundle copied in, tracked in git
│   ├── CLAUDE.md
│   ├── PROMPTS.md
│   ├── QUICKSTART.md
│   ├── README.md
│   └── design/
│       ├── Lexi.kids v3.html
│       └── src/...
├── docs/
│   └── superpowers/specs/
│       └── 2026-05-08-lexi-scaffold-design.md
├── prisma/
│   └── schema.prisma        # `prisma init` default
├── public/                  # create-next-app defaults
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── .gitkeep         # empty placeholder for later code
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Components

### 1. `.env.example` (committed)

Placeholder keys only — no real values. Mirrors the services named in `design_handoff/CLAUDE.md` §Stack so future sub-projects can drop in real values without restructuring.

```
# Database (Postgres on Neon or Supabase)
DATABASE_URL=

# Auth — Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Payments — Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Analytics — PostHog (EU host because Dutch/Belgian users)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`.env.local` is created as an empty file and gitignored. The user fills it in as they sign up for each service.

### 2. `tailwind.config.ts` — design tokens

`theme.extend` is populated from `design_handoff/README.md` §6. Every OKLCH value lands as a Tailwind class. Source values live as CSS variables in `globals.css` so the accent can swap at runtime (per the Tweaks panel concept) without a Tailwind rebuild.

Token map:

| Tailwind class                    | CSS var          |
|-----------------------------------|------------------|
| `bg-bg`, `text-bg`                | `--bg`           |
| `bg-bg-2`                         | `--bg-2`         |
| `bg-card`                         | `--card`         |
| `text-ink`                        | `--ink`          |
| `text-ink-2`                      | `--ink-2`        |
| `text-ink-3`                      | `--ink-3`        |
| `border-line`                     | `--line`         |
| `border-line-2`                   | `--line-2`       |
| `bg-primary`, `text-primary-ink`, `bg-primary-soft` | `--primary`, `--primary-ink`, `--primary-soft` |
| `bg-teal`, `bg-teal-soft`         | `--teal`, `--teal-soft`     |
| `bg-sun`, `bg-sun-soft`           | `--sun`, `--sun-soft`       |
| `bg-plum`, `bg-plum-soft`         | `--plum`, `--plum-soft`     |
| `bg-ok`, `bg-ok-soft`             | `--ok`, `--ok-soft`         |
| `rounded-lexi`                    | 14px             |
| `rounded-lexi-lg`                 | 22px             |
| `shadow-lexi-sm`, `shadow-lexi`, `shadow-lexi-lg` | per README §6 |

Font families:

- `font-display` → `var(--font-display)` (Bricolage Grotesque)
- `font-sans` → `var(--font-sans)` (Geist) — default
- `font-mono` → `var(--font-mono)` (JetBrains Mono)

### 3. `src/app/globals.css`

Contains:
- `@tailwind base / components / utilities` directives
- `:root { ... }` block with every CSS variable from README §6 (surfaces, ink, lines, brand, subject palette, geometry, shadows)
- `body { background: var(--bg); color: var(--ink); font-family: var(--font-sans); }`

The four accent variants (coral / teal / plum / forest) from README §6 are documented as comments but not yet wired to a theme switcher — that comes with the Tweaks panel decision in a later sub-project.

### 4. `src/app/layout.tsx`

Loads the three brand fonts via `next/font/google`:

```tsx
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});
```

`<html lang="nl">` (per `CLAUDE.md` §House rules — Dutch-only). `<body>` gets all three font variable classes.

### 5. `src/app/page.tsx`

Placeholder landing. One `<h1 className="font-display">Lexi.kids</h1>` and a small subhead, centered on the cream background. Exists only so `npm run dev` renders something visibly branded.

### 6. `prisma/schema.prisma`

Output of `npx prisma init --datasource-provider postgresql`. The default `User` model template is left in so the file is valid; the real schema from `design_handoff/README.md` §10 is migrated in during the auth/db sub-project.

### 7. `.vscode/`

- **`extensions.json`** recommends: `bradlc.vscode-tailwindcss`, `prisma.prisma`, `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`.
- **`settings.json`** sets: `editor.formatOnSave: true`, `editor.defaultFormatter: "esbenp.prettier-vscode"`, `editor.codeActionsOnSave: { "source.fixAll.eslint": "explicit" }`, and Tailwind class regex hints for any custom utilities.

### 8. `.gitignore`

`create-next-app` default, extended with:
```
.env.local
.env*.local
prisma/*.db
prisma/*.db-journal
.vercel
```

### 9. `README.md` (project root)

Short. Points at `CLAUDE.md` and `design_handoff/README.md` as the real docs. Lists `npm install` / `npm run dev` and a one-liner about Vercel deploy.

### 10. `design_handoff/`

The entire `C:\Users\thoma\Downloads\website Lexi 2.0\design_handoff_lexi_kids` folder is copied into the repo at `design_handoff/`. Tracked in git so:
- Future Claude sessions can read it without reaching outside the repo.
- The HTML prototype is openable from the repo root.
- Anyone who clones gets the same source of truth.

### 11. `CLAUDE.md` (project root)

Copied from `design_handoff/CLAUDE.md` to the repo root, per the bundle's own §15 instructions. The path it references inside (`design_handoff_lexi_kids/...`) is updated to `design_handoff/...` to match the in-repo location.

## Data flow

Static files only at this stage. No runtime data flow exists until later sub-projects add Clerk, Prisma, and Stripe.

## Error handling

Out of scope for a scaffold. The placeholder `/` page has no failure modes.

## Testing

No test runner installed yet. Vitest + Playwright (per `CLAUDE.md` §Stack) come in with the first feature that needs them. Manual acceptance test for this scaffold:

1. `npm install` succeeds.
2. `npm run dev` succeeds and serves `http://localhost:3000`.
3. The placeholder page renders in Bricolage Grotesque on the `--bg` cream background — visually confirmable.
4. `npm run build` succeeds.
5. `git init && git add . && git status` shows `.env.local` ignored and everything else tracked.
6. Opening the folder in VS Code prompts the user to install the four recommended extensions.

## Open questions for later sub-projects (not blocking this scaffold)

- Geist family — `next/font/google` exposes Geist; if a weight is missing, switch to the `geist` npm package. Decide when fonts are first stress-tested on the real landing page.
- Whether to use npm, pnpm, or bun. Defaulting to npm here (matches `--use-npm` flag and the user's likely starting point); revisit if install times become a friction point.
- Whether to keep `design_handoff/` in the same repo long-term or move it to a separate docs repo once content stabilizes.
