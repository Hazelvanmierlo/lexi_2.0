# Lexi.kids — Phase 1 Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Next.js 14 App Router project at `C:\Users\thoma\lexi_2.0` with the Lexi.kids OKLCH design tokens, three brand fonts, env-var template, Prisma init, VS Code workspace config, and the design-handoff bundle copied in — ready for `git init`, VS Code, and Vercel deploy.

**Architecture:** Single Next.js app at the project root. Bootstrap with `create-next-app` to inherit Vercel-native defaults, then layer Lexi-specific config on top. No feature code, no installed Clerk/Stripe/PostHog SDKs, no real Prisma models — just the structure and tokens needed so future feature sub-projects can plug in cleanly.

**Tech Stack:** Next.js 14+ App Router, TypeScript, Tailwind CSS, `next/font/google` (Bricolage Grotesque + Geist + JetBrains Mono), Prisma CLI, npm.

**Spec:** `docs/superpowers/specs/2026-05-08-lexi-scaffold-design.md`

**Notes for the executor:**
- **All shell commands assume the current working directory is `C:\Users\thoma\lexi_2.0`.** The harness already sets it. If you're running these manually from a different shell, `cd` there first.
- The project root already contains `docs/superpowers/specs/2026-05-08-lexi-scaffold-design.md` and `docs/superpowers/plans/2026-05-08-lexi-scaffold.md` (this file). `create-next-app` refuses to scaffold into a non-empty directory, so Task 1 moves `docs/` aside and back.
- The user wants to connect git/Vercel manually later. **Do not run `git init` or any `git` command in this plan.** Stop after the verification task and hand back to the user.
- Tailwind 4 is assumed (current default for `create-next-app` in 2026). If Task 1 reveals Tailwind 3 in `package.json`, swap Task 2's globals.css for the alternative shown at the bottom of Task 2 and add a `tailwind.config.ts` (also shown).

---

### Task 1: Bootstrap Next.js into the project root

**Files:**
- Move temporarily: `C:\Users\thoma\lexi_2.0\docs` → `C:\Users\thoma\lexi_2.0_docs_tmp`
- Create (via `create-next-app`): all standard Next.js files in `C:\Users\thoma\lexi_2.0`

- [ ] **Step 1: Move `docs/` out so create-next-app sees an empty directory**

```bash
mv "C:\Users\thoma\lexi_2.0\docs" "C:\Users\thoma\lexi_2.0_docs_tmp"
```

Expected: command exits 0. `C:\Users\thoma\lexi_2.0` is now empty.

- [ ] **Step 2: Verify the project root is empty**

```bash
ls -la "C:\Users\thoma\lexi_2.0"
```

Expected: only `.` and `..` entries (or no entries). If anything else appears, stop and ask the user before proceeding.

- [ ] **Step 3: Run `create-next-app` non-interactively**

```bash
npx --yes create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --use-npm
```

Expected: install completes; messages end with "Success! Created lexi_2.0 at ...". Created files include `package.json`, `tsconfig.json`, `next.config.ts` (or `.mjs`), `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `public/`, `.gitignore`, `node_modules/`. (`tailwind.config.ts` is created only on Tailwind 3; on Tailwind 4 there is no config file.)

- [ ] **Step 4: Move `docs/` back into the project**

```bash
mv "C:\Users\thoma\lexi_2.0_docs_tmp" "C:\Users\thoma\lexi_2.0\docs"
```

Expected: `C:\Users\thoma\lexi_2.0\docs\superpowers\specs\2026-05-08-lexi-scaffold-design.md` and `...\plans\2026-05-08-lexi-scaffold.md` exist again.

- [ ] **Step 5: Confirm Tailwind major version**

Read `C:\Users\thoma\lexi_2.0\package.json` and look at the `tailwindcss` line under `devDependencies`. Note the major version (3 or 4). The rest of this plan assumes **Tailwind 4**. If you see `^3.x.x`, follow the Tailwind 3 alternative at the bottom of Task 2.

- [ ] **Step 6: Verify the dev server starts**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000 and prints "Ready in Xs" within ~10s. Stop the server with Ctrl+C (or by sending SIGINT to the background process). Do NOT leave it running across tasks.

---

### Task 2: Wire OKLCH design tokens via Tailwind

**Files:**
- Modify: `C:\Users\thoma\lexi_2.0\src\app\globals.css` (overwrite)

**Why:** Replaces create-next-app's default Tailwind import + dark-mode block with the full Lexi token system from `design_handoff/README.md` §6, exposed as Tailwind utility classes (`bg-bg`, `text-ink`, `bg-primary`, `rounded-lexi`, etc.) via Tailwind 4's `@theme` directive.

- [ ] **Step 1: Overwrite `src/app/globals.css` with the Lexi token block**

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-bg: oklch(98% 0.012 85);
  --color-bg-2: oklch(96% 0.018 85);
  --color-card: #ffffff;

  /* Ink (text) */
  --color-ink: oklch(22% 0.025 260);
  --color-ink-2: oklch(40% 0.02 260);
  --color-ink-3: oklch(60% 0.015 260);

  /* Lines */
  --color-line: oklch(90% 0.012 260);
  --color-line-2: oklch(94% 0.01 260);

  /* Brand — coral (default; swap accent variant by editing these three) */
  --color-primary: oklch(66% 0.17 35);
  --color-primary-ink: oklch(38% 0.15 35);
  --color-primary-soft: oklch(94% 0.04 35);

  /* Subject palette */
  --color-teal: oklch(68% 0.12 185);
  --color-teal-soft: oklch(94% 0.035 185);
  --color-sun: oklch(85% 0.15 95);
  --color-sun-soft: oklch(96% 0.05 95);
  --color-plum: oklch(55% 0.14 305);
  --color-plum-soft: oklch(95% 0.03 305);
  --color-ok: oklch(60% 0.14 155);
  --color-ok-soft: oklch(94% 0.04 155);

  /* Geometry */
  --radius-lexi: 14px;
  --radius-lexi-lg: 22px;

  /* Shadows — warm undertone */
  --shadow-lexi-sm: 0 1px 2px rgba(20,20,40,0.04), 0 1px 1px rgba(20,20,40,0.03);
  --shadow-lexi: 0 8px 28px -12px rgba(40,20,10,0.12), 0 2px 6px rgba(40,20,10,0.04);
  --shadow-lexi-lg: 0 30px 60px -30px rgba(40,20,10,0.22), 0 12px 20px -12px rgba(40,20,10,0.08);

  /* Fonts (variables set in layout.tsx) */
  --font-display: var(--font-display-google), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-sans-google), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono-google), ui-monospace, SFMono-Regular, monospace;
}

/* Accent variants documented for the future Tweaks panel — not wired yet.
   To swap the default coral, replace --color-primary, --color-primary-ink,
   --color-primary-soft above with one of these triples:

   coral (default): oklch(66% 0.17 35) / oklch(38% 0.15 35) / oklch(94% 0.04 35)
   teal           : oklch(62% 0.15 185) / oklch(34% 0.12 185) / oklch(94% 0.035 185)
   plum           : oklch(55% 0.18 305) / oklch(35% 0.14 305) / oklch(95% 0.03 305)
   forest         : oklch(55% 0.14 145) / oklch(32% 0.12 145) / oklch(94% 0.04 145)
*/

body {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Verify dev server still compiles**

```bash
npm run dev
```

Expected: starts cleanly, no Tailwind compile error in the terminal. Stop with Ctrl+C.

**Tailwind 3 fallback (only if Step 5 of Task 1 showed Tailwind 3):**

Skip the `@theme` block above. Instead, write `globals.css` as:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: oklch(98% 0.012 85);
  --bg-2: oklch(96% 0.018 85);
  --card: #ffffff;
  --ink: oklch(22% 0.025 260);
  --ink-2: oklch(40% 0.02 260);
  --ink-3: oklch(60% 0.015 260);
  --line: oklch(90% 0.012 260);
  --line-2: oklch(94% 0.01 260);
  --primary: oklch(66% 0.17 35);
  --primary-ink: oklch(38% 0.15 35);
  --primary-soft: oklch(94% 0.04 35);
  --teal: oklch(68% 0.12 185); --teal-soft: oklch(94% 0.035 185);
  --sun: oklch(85% 0.15 95);   --sun-soft:  oklch(96% 0.05 95);
  --plum: oklch(55% 0.14 305); --plum-soft: oklch(95% 0.03 305);
  --ok: oklch(60% 0.14 155);   --ok-soft:   oklch(94% 0.04 155);
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

And overwrite `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        card: "var(--card)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        primary: "var(--primary)",
        "primary-ink": "var(--primary-ink)",
        "primary-soft": "var(--primary-soft)",
        teal: "var(--teal)",
        "teal-soft": "var(--teal-soft)",
        sun: "var(--sun)",
        "sun-soft": "var(--sun-soft)",
        plum: "var(--plum)",
        "plum-soft": "var(--plum-soft)",
        ok: "var(--ok)",
        "ok-soft": "var(--ok-soft)",
      },
      borderRadius: { lexi: "14px", "lexi-lg": "22px" },
      boxShadow: {
        "lexi-sm": "0 1px 2px rgba(20,20,40,0.04), 0 1px 1px rgba(20,20,40,0.03)",
        lexi: "0 8px 28px -12px rgba(40,20,10,0.12), 0 2px 6px rgba(40,20,10,0.04)",
        "lexi-lg": "0 30px 60px -30px rgba(40,20,10,0.22), 0 12px 20px -12px rgba(40,20,10,0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Task 3: Wire brand fonts and Dutch HTML

**Files:**
- Modify: `C:\Users\thoma\lexi_2.0\src\app\layout.tsx` (overwrite)

**Why:** Replaces create-next-app's default Inter import with the three brand fonts from `design_handoff/README.md` §6, sets `<html lang="nl">` per `CLAUDE.md` §House rules, and exposes the fonts as CSS variables that the `@theme` block in `globals.css` references.

- [ ] **Step 1: Overwrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-google",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans-google",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-google",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lexi.kids",
  description: "Slim oefenen voor groep 1 t/m 8.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="nl"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify dev server still compiles and fonts load**

```bash
npm run dev
```

Expected: starts cleanly. In the browser at http://localhost:3000, view source and confirm `<html lang="nl" class="__variable_... __variable_... __variable_...">`. Stop with Ctrl+C.

---

### Task 4: Replace the placeholder landing page

**Files:**
- Modify: `C:\Users\thoma\lexi_2.0\src\app\page.tsx` (overwrite)

**Why:** create-next-app ships a Vercel-branded placeholder. Replace with a minimal Lexi.kids "coming soon" so the dev server visibly confirms the brand cream background, Bricolage Grotesque heading, and Geist body.

- [ ] **Step 1: Overwrite `src/app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-5xl font-bold tracking-tight text-ink md:text-7xl">
        Lexi.kids
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink-2 md:text-xl">
        Slim oefenen voor groep 1 t/m 8.
      </p>
      <p className="mt-12 text-sm text-ink-3">
        In aanbouw — terugkomen binnenkort.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Visual verification in browser**

```bash
npm run dev
```

Open http://localhost:3000. Expected:
- Cream/warm-off-white background (the `--color-bg` value).
- "Lexi.kids" heading in Bricolage Grotesque, near-black ink.
- Subtitle in Geist, slightly lighter ink.
- "In aanbouw" line in muted gray.

Stop the server. **If colors render as default white/black, the Tailwind tokens didn't take effect — re-check Task 2.**

---

### Task 5: Initialize Prisma scaffold

**Files:**
- Create (via `prisma init`): `C:\Users\thoma\lexi_2.0\prisma\schema.prisma`

**Why:** Per spec, Prisma is "init only" at this phase — schema scaffold present, no models yet. The full schema from `design_handoff/README.md` §10 lands in a later auth/DB sub-project.

- [ ] **Step 1: Install Prisma CLI as a dev dependency**

```bash
npm install --save-dev prisma
```

Expected: `prisma` appears in `package.json` `devDependencies`. No errors.

- [ ] **Step 2: Run `prisma init` with Postgres datasource**

```bash
npx prisma init --datasource-provider postgresql
```

Expected output mentions creating `prisma/schema.prisma` and updating `.env`. **Note:** `prisma init` writes a `DATABASE_URL=...` line to `.env` (not `.env.local`). Task 6 will move that to `.env.example` and clean up `.env`.

- [ ] **Step 3: Verify `prisma/schema.prisma` exists and contains the boilerplate**

Read `C:\Users\thoma\lexi_2.0\prisma\schema.prisma`. Expected contents include `generator client {` block and `datasource db { provider = "postgresql" url = env("DATABASE_URL") }`. Leave it as-is. **Do not add models** — that's a later sub-project.

---

### Task 6: Project root config — env files + extended gitignore

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\.env.example`
- Create: `C:\Users\thoma\lexi_2.0\.env.local`
- Delete: `C:\Users\thoma\lexi_2.0\.env` (the placeholder Prisma created)
- Modify: `C:\Users\thoma\lexi_2.0\.gitignore` (append entries)

**Why:** `prisma init` writes a stub `.env` with `DATABASE_URL=`. We replace that with a committed `.env.example` (template, all keys empty) and an empty gitignored `.env.local` (where the user fills in real values). The default `.gitignore` from create-next-app already handles most things; we extend it for Prisma and Vercel artifacts and ensure `.env*` is fully covered.

- [ ] **Step 1: Write `.env.example` with all placeholder keys**

```bash
# (Use the Write tool; content shown below.)
```

File: `C:\Users\thoma\lexi_2.0\.env.example`

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

- [ ] **Step 2: Create an empty `.env.local`**

File: `C:\Users\thoma\lexi_2.0\.env.local` (zero bytes — write an empty string).

- [ ] **Step 3: Delete the `.env` Prisma generated**

```bash
rm "C:\Users\thoma\lexi_2.0\.env"
```

Expected: command exits 0. The reason: `.env` is read by Next.js for ALL environments by default. We use `.env.local` (gitignored, dev-only) instead, plus `.env.example` (committed template). A tracked `.env` would leak into git or confuse Vercel later.

- [ ] **Step 4: Append Lexi-specific entries to `.gitignore`**

Open `C:\Users\thoma\lexi_2.0\.gitignore` and append the following block at the end (preserve everything create-next-app wrote):

```
# lexi: env files (we only ship .env.example)
.env
.env.local
.env*.local

# lexi: prisma local sqlite (never used in prod, sometimes used for quick experiments)
prisma/*.db
prisma/*.db-journal

# lexi: vercel CLI cache
.vercel
```

(create-next-app's default `.gitignore` already has `.env*`-style coverage in many versions, but explicit lines here are harmless and self-documenting.)

---

### Task 7: VS Code workspace config

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\.vscode\extensions.json`
- Create: `C:\Users\thoma\lexi_2.0\.vscode\settings.json`

**Why:** When the user opens the folder in VS Code, they get a prompt to install the four extensions Lexi development depends on, and format-on-save with Prettier is wired by default. Per spec §7.

- [ ] **Step 1: Create `.vscode/extensions.json`**

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

- [ ] **Step 2: Create `.vscode/settings.json`**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

### Task 8: Import the design handoff bundle

**Files:**
- Copy: `C:\Users\thoma\Downloads\website Lexi 2.0\design_handoff_lexi_kids\` → `C:\Users\thoma\lexi_2.0\design_handoff\`
- Create: `C:\Users\thoma\lexi_2.0\CLAUDE.md` (copy of `design_handoff/CLAUDE.md` with paths rewritten)

**Why:** Per spec §10–§11, the entire handoff bundle lands in the repo so future Claude sessions and human contributors share one source of truth. The bundle's own `CLAUDE.md` instructs us to drop a copy at the repo root; we do that and rewrite the few internal references that point to the original `design_handoff_lexi_kids/` folder name.

- [ ] **Step 1: Copy the entire handoff bundle into the repo**

```bash
cp -r "C:\Users\thoma\Downloads\website Lexi 2.0\design_handoff_lexi_kids" "C:\Users\thoma\lexi_2.0\design_handoff"
```

Expected: `C:\Users\thoma\lexi_2.0\design_handoff\README.md`, `...\CLAUDE.md`, `...\PROMPTS.md`, `...\QUICKSTART.md`, and `...\design\Lexi.kids v3.html` plus `...\design\src\` all exist.

- [ ] **Step 2: Verify the HTML prototype is in place**

```bash
ls "C:\Users\thoma\lexi_2.0\design_handoff\design"
```

Expected: shows `Lexi.kids v3.html` and `src/` directory.

- [ ] **Step 3: Copy `design_handoff/CLAUDE.md` to the repo root**

```bash
cp "C:\Users\thoma\lexi_2.0\design_handoff\CLAUDE.md" "C:\Users\thoma\lexi_2.0\CLAUDE.md"
```

- [ ] **Step 4: Rewrite paths in the root `CLAUDE.md`**

Open `C:\Users\thoma\lexi_2.0\CLAUDE.md`. Replace every occurrence of the string `design_handoff_lexi_kids/` with `design_handoff/` (this is the bundle's old folder name; in our repo it lives under `design_handoff/`). Use a single replace-all.

After the edit, search the file for `design_handoff_lexi_kids` — there should be **zero** matches.

---

### Task 9: Project README and src/lib placeholder

**Files:**
- Modify: `C:\Users\thoma\lexi_2.0\README.md` (overwrite create-next-app's default)
- Create: `C:\Users\thoma\lexi_2.0\src\lib\.gitkeep`

**Why:** create-next-app's default README is a generic Next.js explainer. Replace with a Lexi-specific one that points at the real source-of-truth docs (`CLAUDE.md` and `design_handoff/README.md`). The empty `src/lib/.gitkeep` exists so git tracks the directory ahead of the first lib file — small ergonomic win.

- [ ] **Step 1: Overwrite `README.md`**

File: `C:\Users\thoma\lexi_2.0\README.md`

```markdown
# Lexi.kids

A Dutch/Belgian adaptive learning platform for children in groep 1 t/m 8 (NL) / leerjaar 1 t/m 6 (BE).

## Source of truth

- **`CLAUDE.md`** — standing instructions for any Claude Code session in this repo.
- **`design_handoff/README.md`** — full product spec: design tokens, routes, data model, analytics events, acceptance criteria.
- **`design_handoff/design/Lexi.kids v3.html`** — interactive design prototype. Open in a browser.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in real values as you sign up for each service
npm run dev
```

The dev server runs at http://localhost:3000.

## Stack

Next.js 14 App Router + TypeScript, Tailwind CSS with OKLCH design tokens, Prisma (Postgres), Clerk auth, Stripe payments, next-intl for nl-NL / nl-BE, PostHog analytics, Vercel hosting. See `CLAUDE.md` for the full list.

## Status

Phase 1 (scaffold) complete. Feature work tracked in `docs/superpowers/plans/`.
```

- [ ] **Step 2: Create `src/lib/.gitkeep`**

```bash
mkdir -p "C:\Users\thoma\lexi_2.0\src\lib"
```

Then create an empty file at `C:\Users\thoma\lexi_2.0\src\lib\.gitkeep` (zero bytes).

---

### Task 10: Final acceptance verification

**Files:** none modified. Read-only checks.

**Why:** Confirms every spec acceptance criterion is met before handing back to the user for `git init` / VS Code / Vercel hookup.

- [ ] **Step 1: `npm install` is clean**

```bash
npm install
```

Expected: exits 0. No "vulnerabilities" warnings above moderate severity.

- [ ] **Step 2: `npm run build` succeeds**

```bash
npm run build
```

Expected: build finishes with a "Compiled successfully" message and a route table listing `○ /` as a static page. No TypeScript errors. No Tailwind unknown-utility errors.

- [ ] **Step 3: `npm run dev` renders the placeholder correctly**

```bash
npm run dev
```

Open http://localhost:3000. Confirm:
- Cream off-white background.
- "Lexi.kids" heading in Bricolage Grotesque (rounded display sans).
- Body text in Geist (geometric sans).
- No console errors in the browser dev tools.

Stop the server with Ctrl+C.

- [ ] **Step 4: Final tree matches the spec**

```bash
ls -la "C:\Users\thoma\lexi_2.0"
```

Expected entries (order may vary): `.env.example`, `.env.local`, `.gitignore`, `.next/` (build cache, optional), `.vscode/`, `CLAUDE.md`, `README.md`, `design_handoff/`, `docs/`, `next.config.ts` (or `.mjs`), `node_modules/`, `package-lock.json`, `package.json`, `postcss.config.mjs`, `prisma/`, `public/`, `src/`, `tsconfig.json`. (Plus `tailwind.config.ts` if Tailwind 3.) **No `.env` (we deleted it).**

- [ ] **Step 5: Tell the user the scaffold is ready**

Post a short message:
> Phase 1 scaffold complete. To connect it up:
>
> 1. `git init && git add . && git commit -m "feat: initial Lexi.kids scaffold"`
> 2. Open `C:\Users\thoma\lexi_2.0` in VS Code — it'll prompt you to install the four recommended extensions; accept.
> 3. Push to a new GitHub repo, then "Import Project" from that repo on vercel.com — the build will pass with no extra config.
> 4. As you sign up for Clerk / Stripe / Neon / PostHog, paste each key into `.env.local`.
>
> Next sub-project from the handoff roadmap is the marketing landing page (`/`). Say the word and I'll start brainstorming that one.

- [ ] **Step 6: STOP**

Do not run `git init`, do not commit, do not push. The user wants to do that step manually. Hand control back.

---

## Self-review notes (executor can ignore — author's checks)

- **Spec coverage:** Tasks 1-9 cover every "Components" subsection of the spec. Task 10 maps 1:1 to the spec's "Testing" acceptance criteria (npm install, dev, build, gitignore). The spec's "Open questions" section is informational and intentionally has no implementing task.
- **No placeholders:** All file contents shown in full. All commands shown verbatim. The Tailwind 3 fallback in Task 2 is a complete alternative, not a placeholder.
- **Type / name consistency:** Font CSS variables — layout.tsx uses `--font-display-google`, `--font-sans-google`, `--font-mono-google`; globals.css `@theme` block references those exact names via `var(--font-display-google)` etc. inside `--font-display: var(--font-display-google), ...`. Tailwind class names `font-display`, `font-sans`, `font-mono` resolve through the `@theme` font tokens. Verified.
- **Path / repo-name consistency:** Spec refers to `design_handoff/` (renamed from `design_handoff_lexi_kids/`). Task 8 renames during copy and rewrites paths inside the root `CLAUDE.md`. Verified.
