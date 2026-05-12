# Lexi.kids — Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the v3 marketing prototype landing page to a server-rendered Next.js route at `/`, with cookie-based `nl-NL` ↔ `nl-BE` switching, all 12 sections, plus the test infrastructure (Vitest + Playwright + Lighthouse CI) used by every later phase.

**Architecture:** Server-rendered route. Locale is a cookie (`lexi-locale`); next-intl reads it in `request.ts` and provides messages to server components. Two client islands: `<RegionPicker>` (writes cookie via server action + `revalidatePath('/')`) and `<Faq>` (Radix accordion). Pure CSS keyframes for the only animated sections (ProductLoop, RewardLoop). `prefers-reduced-motion: reduce` disables motion.

**Tech Stack additions in this phase:** `next-intl`, `lucide-react`, `@radix-ui/react-accordion` (runtime); `vitest` + `@testing-library/react` + `jsdom`, `@playwright/test`, `@lhci/cli` (dev/test).

**Spec:** `docs/superpowers/specs/2026-05-08-lexi-landing-design.md`

**Reference files (already in repo at `design_handoff/`):**
- `design_handoff/design/Lexi.kids v3.html` — open in browser to see the live design
- `design_handoff/design/src/v3/Landing.v3.jsx` — canonical landing component (1370 lines)
- `design_handoff/design/src/v3/Nav.v3.jsx` — nav + region picker
- `design_handoff/README.md` §6 — design tokens (already wired into Tailwind in Phase 1)

---

## Notes for the executor

- **Working directory:** `C:\Users\thoma\lexi_2.0`. All commands assume this CWD.
- **No git commits.** The user manages git manually. After each task, verify the dev server compiles or tests pass — don't `git commit` unless explicitly told.
- **Tailwind 4 with `@theme` tokens already wired.** Use classes like `bg-bg`, `text-ink`, `text-ink-2`, `text-ink-3`, `bg-card`, `border-line`, `bg-primary`, `bg-primary-soft`, `text-primary-ink`, `bg-teal`, `bg-teal-soft`, `bg-sun`, `bg-plum`, `bg-ok`, `rounded-lexi`, `rounded-lexi-lg`, `shadow-lexi`, `shadow-lexi-sm`, `shadow-lexi-lg`, `font-display`, `font-sans`, `font-mono`. They're defined in `src/app/globals.css`.
- **Translating inline styles to Tailwind:** the v3 prototype uses `style={{...}}` everywhere. For every section component, lift the *structure and copy* from the prototype, then translate inline styles to Tailwind classes. Common mappings:
  - `padding: '64px 20px'` → `px-5 py-16` (verify with the spacing scale; Tailwind 4's default scale is 4px-based)
  - `padding: '40px 16px'` → `px-4 py-10`
  - `gap: '16px'` → `gap-4`
  - `borderRadius: 14` → `rounded-lexi`
  - `borderRadius: 22` → `rounded-lexi-lg`
  - `border: '1px solid var(--line)'` → `border border-line`
  - `background: 'var(--card)'` → `bg-card`
  - `background: 'var(--bg-2)'` → `bg-bg-2`
  - `color: 'var(--ink-2)'` → `text-ink-2`
  - `boxShadow: 'var(--shadow)'` → `shadow-lexi`
  - `letterSpacing: '-0.02em'` → `tracking-tight`
  - `letterSpacing: '-0.03em'` → `tracking-tighter`
  - `fontFamily: 'Bricolage Grotesque, ...'` → `font-display`
  - Custom `style={{ animationDelay: '0.4s' }}` keeps an inline `style` attribute (it's a runtime computed value).
- **Replace emoji with Lucide icons.** The prototype uses 🌍, 📚, ⚡, 💰, 🎯 etc. as placeholders. Lucide equivalents to prefer: `Globe`, `BookOpen`, `Zap`, `Coins`, `Target`. Each task notes the specific icons it needs.
- **Region-conditional copy** must come from message files (`src/messages/<locale>.json`), not from `region === 'BE'` ternaries in components. Server components call `useTranslations('hero')` (or `getTranslations` in async components) and read keys.
- **Client components** must declare `"use client"` at the top. Two only: `region-picker.tsx`, `faq.tsx`.

---

### Task 1: Install dependencies and configure test runners

**Files:**
- Modify: `C:\Users\thoma\lexi_2.0\package.json` (scripts added by tools below; verify after)
- Create: `C:\Users\thoma\lexi_2.0\vitest.config.ts`
- Create: `C:\Users\thoma\lexi_2.0\vitest.setup.ts`
- Create: `C:\Users\thoma\lexi_2.0\playwright.config.ts`
- Create: `C:\Users\thoma\lexi_2.0\.lighthouserc.cjs`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install next-intl lucide-react @radix-ui/react-accordion
```

Expected: exits 0; `package.json` `dependencies` now lists all three.

- [ ] **Step 2: Install dev/test dependencies**

```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/dom jsdom @playwright/test @lhci/cli
```

Expected: exits 0; entries appear under `devDependencies`.

- [ ] **Step 3: Install Playwright browsers**

```bash
npx playwright install chromium
```

Expected: Chromium browser downloads (~150MB) and installs.

- [ ] **Step 4: Add npm scripts**

Open `package.json`, replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "lighthouse": "lhci autorun"
}
```

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 6: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7: Create `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
```

- [ ] **Step 8: Create `.lighthouserc.cjs`**

```js
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/"],
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
      },
    },
  },
};
```

- [ ] **Step 9: Verify the build still succeeds**

```bash
npm run build
```

Expected: "Compiled successfully" + same route table as before. No new errors.

---

### Task 2: i18n locale-cookie helpers (TDD)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\i18n\locale-cookie.test.ts`
- Create: `C:\Users\thoma\lexi_2.0\src\i18n\locale-cookie.ts`

**Why:** Single source of truth for reading/writing the `lexi-locale` cookie. Server-side helpers used by `request.ts` and the `setLocale` action.

- [ ] **Step 1: Write failing test**

File: `src/i18n/locale-cookie.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { isValidLocale, DEFAULT_LOCALE, LOCALES } from "./locale-cookie";

describe("locale-cookie", () => {
  it("DEFAULT_LOCALE is nl-NL", () => {
    expect(DEFAULT_LOCALE).toBe("nl-NL");
  });

  it("LOCALES contains nl-NL and nl-BE", () => {
    expect(LOCALES).toEqual(["nl-NL", "nl-BE"]);
  });

  it("isValidLocale accepts nl-NL and nl-BE", () => {
    expect(isValidLocale("nl-NL")).toBe(true);
    expect(isValidLocale("nl-BE")).toBe(true);
  });

  it("isValidLocale rejects other strings", () => {
    expect(isValidLocale("en")).toBe(false);
    expect(isValidLocale("nl")).toBe(false);
    expect(isValidLocale("")).toBe(false);
    expect(isValidLocale(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm test -- src/i18n/locale-cookie.test.ts
```

Expected: FAIL with "Cannot find module './locale-cookie'".

- [ ] **Step 3: Implement `locale-cookie.ts`**

File: `src/i18n/locale-cookie.ts`

```ts
import { cookies } from "next/headers";

export const LOCALES = ["nl-NL", "nl-BE"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl-NL";
export const COOKIE_NAME = "lexi-locale";

export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export async function readLocaleCookie(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  return isValidLocale(raw) ? raw : DEFAULT_LOCALE;
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- src/i18n/locale-cookie.test.ts
```

Expected: PASS, 4 assertions green. (`readLocaleCookie` isn't unit-tested — it touches Next's `cookies()` which requires a request context. Covered by the Playwright E2E.)

---

### Task 3: i18n request config + empty message files

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\i18n\request.ts`
- Create: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json`
- Create: `C:\Users\thoma\lexi_2.0\src\messages\nl-BE.json`
- Create: `C:\Users\thoma\lexi_2.0\next.config.ts` (overwrite to add next-intl plugin)

**Why:** Wires next-intl to read the locale cookie and load the right message bundle. Empty `{}` message files now; section tasks will fill them.

- [ ] **Step 1: Create `src/i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { readLocaleCookie } from "./locale-cookie";

export default getRequestConfig(async () => {
  const locale = await readLocaleCookie();
  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
```

- [ ] **Step 2: Create empty message files**

`src/messages/nl-NL.json`:
```json
{}
```

`src/messages/nl-BE.json`:
```json
{}
```

- [ ] **Step 3: Read current `next.config.ts`**

```bash
cat "C:\Users\thoma\lexi_2.0\next.config.ts"
```

(Use the Read tool on `C:\Users\thoma\lexi_2.0\next.config.ts` first if needed.)

- [ ] **Step 4: Overwrite `next.config.ts` to wrap with next-intl plugin**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Verify build still succeeds**

```bash
npm run build
```

Expected: compiles without "missing locale" or "missing messages" warnings. Empty messages are valid JSON; next-intl will warn about missing keys at runtime, not build time.

---

### Task 4: setLocale server action (TDD)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\lib\set-locale-action.test.ts`
- Create: `C:\Users\thoma\lexi_2.0\src\lib\set-locale-action.ts`

**Why:** Form-action target for the RegionPicker. Validates input, writes the cookie, triggers `revalidatePath('/')`. Needs unit coverage because it's defense-in-depth against malformed input from the form.

- [ ] **Step 1: Write failing test**

File: `src/lib/set-locale-action.test.ts`

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";

const cookieSet = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: cookieSet }),
}));
vi.mock("next/cache", () => ({
  revalidatePath,
}));

import { setLocale } from "./set-locale-action";

describe("setLocale", () => {
  beforeEach(() => {
    cookieSet.mockReset();
    revalidatePath.mockReset();
  });

  it("writes the cookie and revalidates for nl-NL", async () => {
    await setLocale("nl-NL");
    expect(cookieSet).toHaveBeenCalledWith(
      "lexi-locale",
      "nl-NL",
      expect.objectContaining({ path: "/" }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("writes the cookie and revalidates for nl-BE", async () => {
    await setLocale("nl-BE");
    expect(cookieSet).toHaveBeenCalledWith(
      "lexi-locale",
      "nl-BE",
      expect.objectContaining({ path: "/" }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("ignores invalid locales (no cookie write, no revalidate)", async () => {
    await setLocale("en");
    await setLocale("");
    await setLocale("nl-FR");
    expect(cookieSet).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm test -- src/lib/set-locale-action.test.ts
```

Expected: FAIL with "Cannot find module './set-locale-action'".

- [ ] **Step 3: Implement `set-locale-action.ts`**

```ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidLocale, COOKIE_NAME } from "@/i18n/locale-cookie";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocale(locale: string) {
  if (!isValidLocale(locale)) return;
  const store = await cookies();
  store.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
  revalidatePath("/");
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- src/lib/set-locale-action.test.ts
```

Expected: PASS, 3 assertions green.

---

### Task 5: Update layout.tsx with NextIntlClientProvider

**Files:**
- Modify: `C:\Users\thoma\lexi_2.0\src\app\layout.tsx` (overwrite)

**Why:** Server components get translations via next-intl's request context, but client islands (`region-picker.tsx`, `faq.tsx`) need messages on the client. The provider hands them down. Also sets `<html lang>` from the active locale instead of hardcoded `nl`.

- [ ] **Step 1: Overwrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build succeeds**

```bash
npm run build
```

Expected: compiles, `/` route still listed.

---

### Task 6: UI atom — `<Btn>` (TDD)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\ui\btn.test.tsx`
- Create: `C:\Users\thoma\lexi_2.0\src\components\ui\btn.tsx`

**Why:** Translates the prototype's `btnV3` inline-style object (`Landing.v3.jsx:227–238`) into a typed React component. Used by Hero, Pricing, FinalCTA. Renders `<a>` if `href` is given, otherwise `<button>`.

- [ ] **Step 1: Write failing test**

File: `src/components/ui/btn.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Btn } from "./btn";

describe("Btn", () => {
  it("renders an <a> when href is provided", () => {
    render(<Btn href="/signup">Start</Btn>);
    const el = screen.getByRole("link", { name: "Start" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/signup");
  });

  it("renders a <button> when no href", () => {
    render(<Btn>Click</Btn>);
    expect(screen.getByRole("button", { name: "Click" }).tagName).toBe("BUTTON");
  });

  it("primary variant applies primary classes", () => {
    render(<Btn variant="primary">P</Btn>);
    expect(screen.getByText("P").className).toMatch(/bg-primary/);
  });

  it("ghost variant applies ghost classes", () => {
    render(<Btn variant="ghost">G</Btn>);
    expect(screen.getByText("G").className).toMatch(/border-line/);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm test -- src/components/ui/btn.test.tsx
```

Expected: FAIL with module not found.

- [ ] **Step 3: Implement `btn.tsx`**

```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lexi font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white px-[18px] py-3 hover:opacity-90 shadow-lexi-sm",
  ghost: "bg-card text-ink border border-line px-[14px] py-[10px] hover:bg-bg-2",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type AnchorProps = CommonProps & ComponentPropsWithoutRef<"a"> & { href: string };
type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };

export function Btn(props: AnchorProps | ButtonProps) {
  const { children, variant = "primary", className = "", ...rest } = props;
  const cls = `${base} ${variants[variant]} ${className}`.trim();
  if ("href" in props && props.href) {
    return (
      <a {...(rest as ComponentPropsWithoutRef<"a">)} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button {...(rest as ComponentPropsWithoutRef<"button">)} className={cls}>
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- src/components/ui/btn.test.tsx
```

Expected: PASS, 4 assertions green.

---

### Task 7: UI atom — `<SectionIntro>` (TDD)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\ui\section-intro.test.tsx`
- Create: `C:\Users\thoma\lexi_2.0\src\components\ui\section-intro.tsx`

**Why:** Eyebrow + h2 + lead pattern repeated by SectionsIntroV3 (Landing.v3.jsx:835). Used by 6+ sections.

- [ ] **Step 1: Write failing test**

File: `src/components/ui/section-intro.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionIntro } from "./section-intro";

describe("SectionIntro", () => {
  it("renders eyebrow, title, and lead", () => {
    render(<SectionIntro eyebrow="Voor ouders" title="Hoe het werkt" lead="Drie stappen." />);
    expect(screen.getByText("Voor ouders")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Hoe het werkt" })).toBeInTheDocument();
    expect(screen.getByText("Drie stappen.")).toBeInTheDocument();
  });

  it("center prop adds text-center class on the wrapper", () => {
    const { container } = render(
      <SectionIntro eyebrow="A" title="B" lead="C" center />,
    );
    expect(container.firstChild).toHaveClass("text-center");
  });

  it("omits lead when not provided", () => {
    render(<SectionIntro eyebrow="A" title="B" />);
    expect(screen.queryByText(/^B$/)).toBeInTheDocument();
    // Only one paragraph element should be the eyebrow if lead is undefined
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm test -- src/components/ui/section-intro.test.tsx
```

Expected: FAIL with module not found.

- [ ] **Step 3: Implement `section-intro.tsx`**

```tsx
type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  center?: boolean;
};

export function SectionIntro({ eyebrow, title, lead, center = false }: Props) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="text-sm font-medium uppercase tracking-wider text-primary-ink">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-5xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg text-ink-2 md:text-xl">{lead}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- src/components/ui/section-intro.test.tsx
```

Expected: PASS, 3 assertions green.

---

### Task 8: Flag SVGs

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\nav\flag.tsx`

**Why:** Replaces the prototype's emoji `🇳🇱`/`🇧🇪`. Inline SVG (no asset request). Used by RegionPicker and Hero kicker.

- [ ] **Step 1: Implement `flag.tsx`**

Reference: `Nav.v3.jsx:140` shows a 3-band horizontal flag pattern.

```tsx
type Props = { className?: string; title?: string };

export function NlFlag({ className = "h-4 w-6", title = "Nederland" }: Props) {
  return (
    <svg className={className} viewBox="0 0 60 40" role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="60" height="13.33" y="0" fill="#AE1C28" />
      <rect width="60" height="13.34" y="13.33" fill="#FFFFFF" />
      <rect width="60" height="13.33" y="26.67" fill="#21468B" />
    </svg>
  );
}

export function BeFlag({ className = "h-4 w-6", title = "België" }: Props) {
  return (
    <svg className={className} viewBox="0 0 60 40" role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="20" height="40" x="0" fill="#000000" />
      <rect width="20" height="40" x="20" fill="#FAE042" />
      <rect width="20" height="40" x="40" fill="#ED2939" />
    </svg>
  );
}
```

- [ ] **Step 2: Verify build still succeeds**

```bash
npm run build
```

Expected: compiles. (No usage yet — flags are wired into RegionPicker in Task 9.)

---

### Task 9: RegionPicker (client component)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\nav\region-picker.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `nav` section)
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-BE.json` (add overrides if any — likely none)

**Why:** The single interactive control on the landing nav. Form-action submits to `setLocale`; on click of an option, the page revalidates and re-renders in the new locale. Reference: `Nav.v3.jsx:86–125` (RegionPicker / RegionOption).

- [ ] **Step 1: Add nav messages to `nl-NL.json`**

Replace the `{}` content of `src/messages/nl-NL.json` with:

```json
{
  "nav": {
    "selectRegion": "Kies regio",
    "netherlands": "Nederland",
    "belgium": "België"
  }
}
```

(`nl-BE.json` stays `{}` — these strings don't differ.)

- [ ] **Step 2: Implement `region-picker.tsx`**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { setLocale } from "@/lib/set-locale-action";
import { NlFlag, BeFlag } from "./flag";

type Locale = "nl-NL" | "nl-BE";

const OPTIONS: { value: Locale; flag: typeof NlFlag; labelKey: "netherlands" | "belgium" }[] = [
  { value: "nl-NL", flag: NlFlag, labelKey: "netherlands" },
  { value: "nl-BE", flag: BeFlag, labelKey: "belgium" },
];

export function RegionPicker() {
  const t = useTranslations("nav");
  const current = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const Active = current === "nl-NL" ? NlFlag : BeFlag;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("selectRegion")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lexi border border-line bg-card px-3 py-2 text-sm text-ink-2 hover:bg-bg-2"
      >
        <Active />
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lexi border border-line bg-card shadow-lexi"
        >
          {OPTIONS.map(({ value, flag: F, labelKey }) => (
            <li key={value}>
              <form action={setLocale.bind(null, value)}>
                <button
                  type="submit"
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-bg-2 ${
                    value === current ? "bg-primary-soft" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <F />
                  <span className="flex-1 text-ink">{t(labelKey)}</span>
                  {value === current && <Check className="h-4 w-4 text-primary-ink" />}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build still succeeds**

```bash
npm run build
```

Expected: compiles. (Live test in Task 24's Playwright spec.)

---

### Task 10: Nav

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\nav\nav.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add nav links)

**Why:** Top of the landing page. Brand mark, primary nav links, sign-in link, RegionPicker. Sticky on scroll. Reference: `Nav.v3.jsx:1–85`.

- [ ] **Step 1: Add nav-link messages to `nl-NL.json`**

Update `nav` section:

```json
{
  "nav": {
    "selectRegion": "Kies regio",
    "netherlands": "Nederland",
    "belgium": "België",
    "products": "Producten",
    "pricing": "Prijzen",
    "schools": "Voor scholen",
    "signIn": "Inloggen",
    "ctaTrial": "Start 14 dagen gratis"
  }
}
```

- [ ] **Step 2: Implement `nav.tsx`**

```tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { RegionPicker } from "./region-picker";

export function Nav() {
  const t = useTranslations("nav");
  return (
    <header className="sticky top-0 z-50 border-b border-line-2 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink">
          Lexi.kids
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-2 md:flex">
          <Link href="#producten" className="hover:text-ink">{t("products")}</Link>
          <Link href="#prijzen" className="hover:text-ink">{t("pricing")}</Link>
          <Link href="#voor-scholen" className="hover:text-ink">{t("schools")}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="hidden text-sm text-ink-2 hover:text-ink md:inline"
          >
            {t("signIn")}
          </Link>
          <RegionPicker />
          <Btn href="/signup" className="hidden md:inline-flex">
            {t("ctaTrial")}
          </Btn>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Verify build still succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 11: Footer

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\footer.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `footer`, `common.company`)
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-BE.json` (override `common.company`)

**Why:** Bottom of the page. Region-aware company line per `design_handoff/README.md` §9. Reference: `Landing.v3.jsx:797–833`.

- [ ] **Step 1: Add footer + common messages to `nl-NL.json`**

Append to `nl-NL.json`:

```json
"common": {
  "company": "Lexi.kids B.V. — Amsterdam"
},
"footer": {
  "products": "Producten",
  "forParents": "Voor ouders",
  "company": "Bedrijf",
  "legal": "Juridisch",
  "links": {
    "landing": "Lexi.kids",
    "shop": "Shop",
    "tryQuestion": "Probeer een vraag",
    "pricing": "Prijzen",
    "blog": "Blog",
    "about": "Over ons",
    "contact": "Contact",
    "terms": "Voorwaarden",
    "privacy": "Privacybeleid",
    "cookies": "Cookies"
  },
  "tagline": "Slim oefenen voor groep 1 t/m 8.",
  "copyright": "© 2026 Lexi.kids. Alle rechten voorbehouden."
}
```

- [ ] **Step 2: Add overrides to `nl-BE.json`**

`src/messages/nl-BE.json`:

```json
{
  "common": {
    "company": "Lexi.kids — Antwerpen"
  },
  "footer": {
    "tagline": "Slim oefenen voor leerjaar 1 t/m 6."
  }
}
```

- [ ] **Step 3: Implement `footer.tsx`**

```tsx
import Link from "next/link";
import { useTranslations } from "next-intl";

const COLUMNS: { titleKey: "products" | "forParents" | "company" | "legal"; links: { labelKey: string; href: string }[] }[] = [
  {
    titleKey: "products",
    links: [
      { labelKey: "landing", href: "/" },
      { labelKey: "shop", href: "/shop" },
      { labelKey: "tryQuestion", href: "/probeer" },
      { labelKey: "pricing", href: "#prijzen" },
    ],
  },
  {
    titleKey: "forParents",
    links: [
      { labelKey: "blog", href: "/blog" },
      { labelKey: "about", href: "/over-ons" },
      { labelKey: "contact", href: "/contact" },
    ],
  },
  {
    titleKey: "company",
    links: [
      { labelKey: "about", href: "/over-ons" },
      { labelKey: "contact", href: "/contact" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { labelKey: "terms", href: "/voorwaarden" },
      { labelKey: "privacy", href: "/privacy" },
      { labelKey: "cookies", href: "/cookies" },
    ],
  },
];

export function Footer() {
  const t = useTranslations("footer");
  const common = useTranslations("common");
  return (
    <footer className="border-t border-line-2 bg-bg-2 px-5 py-12 md:py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="font-display text-2xl font-bold text-ink">Lexi.kids</div>
            <p className="mt-2 max-w-xs text-sm text-ink-2">{t("tagline")}</p>
            <p className="mt-4 text-xs text-ink-3">{common("company")}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h3 className="text-sm font-semibold text-ink">{t(col.titleKey)}</h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-2">
                {col.links.map((l) => (
                  <li key={l.labelKey}>
                    <Link href={l.href} className="hover:text-ink">
                      {t(`links.${l.labelKey}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-xs text-ink-3">{t("copyright")}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify build still succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 12: Hero (with HeroProductFrame)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\hero.tsx`
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\hero-product-frame.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `hero`, `common.groep`, `common.groepRange`)
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-BE.json` (BE overrides)

**Why:** The most visible section. `samen` variant only. Reference: `HeroV3` at `Landing.v3.jsx:25–82`; `HeroProductFrame` at `Landing.v3.jsx:84–202`.

- [ ] **Step 1: Add hero messages to `nl-NL.json`**

Append:

```json
"hero": {
  "kicker": "Voor ouders in Nederland",
  "title": "Samen slim oefenen, in 15 minuten per dag",
  "subhead": "Lexi past elke vraag aan op het niveau van je kind. Jij ziet wat ze leren — en hoe je ze kunt helpen.",
  "ctaTrial": "Start 14 dagen gratis",
  "ctaTry": "Probeer een vraag",
  "price": "vanaf €11,95 / maand",
  "trust": {
    "noCard": "Geen creditcard",
    "monthly": "Per maand opzegbaar",
    "wholeFamily": "Hele gezin"
  },
  "frame": {
    "subject": "Rekenen, groep 5",
    "question": "Hoeveel is 7 × 8?",
    "options": ["54", "56", "58", "64"],
    "correctIdx": 1,
    "feedback": "Top! 7 × 8 = 56."
  }
},
"common": {
  "company": "Lexi.kids B.V. — Amsterdam",
  "groep": "groep",
  "groepRange": "1 t/m 8",
  "curriculum": "SEO leerlijn 2026"
}
```

(Replace the existing `common` block — don't duplicate.)

- [ ] **Step 2: Add overrides to `nl-BE.json`**

```json
{
  "common": {
    "company": "Lexi.kids — Antwerpen",
    "groep": "leerjaar",
    "groepRange": "1 t/m 6",
    "curriculum": "ZILL"
  },
  "footer": {
    "tagline": "Slim oefenen voor leerjaar 1 t/m 6."
  },
  "hero": {
    "kicker": "Voor ouders in België",
    "title": "Samen slim oefenen, in 15 minuten per dag",
    "subhead": "Lexi past elke vraag aan op het niveau van je kind. Jij ziet wat ze leren — en hoe je ze kunt helpen.",
    "frame": {
      "subject": "Rekenen, leerjaar 4"
    }
  }
}
```

- [ ] **Step 3: Implement `hero-product-frame.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function HeroProductFrame() {
  const t = useTranslations("hero.frame");
  const options = t.raw("options") as string[];
  const correctIdx = t("correctIdx");
  return (
    <div className="relative rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:p-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-ink">
        <Sparkles className="h-4 w-4" />
        {t("subject")}
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
        {t("question")}
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <li
            key={opt}
            className={`flex items-center justify-center rounded-lexi border px-4 py-3 text-lg font-medium ${
              i === Number(correctIdx)
                ? "border-primary bg-primary-soft text-primary-ink"
                : "border-line bg-bg-2 text-ink-2"
            }`}
          >
            {opt}
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-lexi bg-ok-soft px-4 py-3 text-sm font-medium text-ink">
        {t("feedback")}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Implement `hero.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { NlFlag, BeFlag } from "@/components/nav/flag";
import { HeroProductFrame } from "./hero-product-frame";
import { Check } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");
  const trust = useTranslations("hero.trust");
  const locale = useLocale();
  const Flag = locale === "nl-BE" ? BeFlag : NlFlag;
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm text-ink-2">
            <Flag className="h-3 w-5" />
            {t("kicker")}
          </span>
          <h1 className="mt-6 font-display text-[clamp(38px,5.6vw,64px)] font-bold leading-[1.02] tracking-tighter text-ink text-balance">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-2 md:text-xl">{t("subhead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn href="/signup">{t("ctaTrial")}</Btn>
            <Btn href="/probeer" variant="ghost">{t("ctaTry")}</Btn>
          </div>
          <p className="mt-4 text-sm text-ink-3">{t("price")}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("noCard")}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("monthly")}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("wholeFamily")}</li>
          </ul>
        </div>
        <HeroProductFrame />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Verify build succeeds**

```bash
npm run build
```

Expected: compiles. The `hero.frame.options` is read via `t.raw()` — verify next-intl returns the array correctly.

---

### Task 13: ProductLoop (with `_landing.css` keyframes)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\product-loop.tsx`
- Create: `C:\Users\thoma\lexi_2.0\src\app\_landing.css`
- Modify: `C:\Users\thoma\lexi_2.0\src\app\globals.css` (import `_landing.css`)
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `productLoop`)

**Why:** Three-frame fade strip — question → feedback → reward. CSS keyframes only; no JS. Reference: `Landing.v3.jsx:240–274`.

- [ ] **Step 1: Add productLoop messages to `nl-NL.json`**

```json
"productLoop": {
  "eyebrow": "Hoe het werkt",
  "title": "Vraag, feedback, beloning — in lus",
  "lead": "Elke 15-minuten-sessie is een lus van proberen, leren en winnen.",
  "frames": {
    "question": "Welk getal hoort hier?",
    "feedback": "Goed zo! Je bent nu sneller dan gisteren.",
    "reward": "+5 munten"
  }
}
```

- [ ] **Step 2: Create `_landing.css`**

```css
/* _landing.css — landing-only keyframe animations.
   Imported from globals.css. Honors prefers-reduced-motion. */

@keyframes lexi-loop-frame {
  0%, 28% { opacity: 1; transform: translateY(0); }
  33%, 100% { opacity: 0; transform: translateY(-8px); }
}

.lexi-loop-frame {
  animation: lexi-loop-frame 12s ease-in-out infinite;
}
.lexi-loop-frame--2 { animation-delay: 4s; }
.lexi-loop-frame--3 { animation-delay: 8s; }

@media (prefers-reduced-motion: reduce) {
  .lexi-loop-frame { animation: none; opacity: 1 !important; transform: none !important; }
  .lexi-loop-stack { display: grid !important; gap: 1rem; height: auto !important; }
  .lexi-loop-stack > * { position: static !important; }
}

@keyframes lexi-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.lexi-fade-up { animation: lexi-fade-up 600ms ease-out both; }
```

- [ ] **Step 3: Import `_landing.css` from `globals.css`**

Add at the END of `src/app/globals.css` (after the `body { ... }` block):

```css
@import "./_landing.css";
```

- [ ] **Step 4: Implement `product-loop.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";

export function ProductLoop() {
  const t = useTranslations("productLoop");
  const f = useTranslations("productLoop.frames");
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
          center
        />
        <div className="lexi-loop-stack relative mt-12 mx-auto h-48 max-w-md md:mt-16 md:h-56">
          <Frame className="lexi-loop-frame">{f("question")}</Frame>
          <Frame className="lexi-loop-frame lexi-loop-frame--2 bg-ok-soft">{f("feedback")}</Frame>
          <Frame className="lexi-loop-frame lexi-loop-frame--3 bg-primary-soft text-primary-ink">{f("reward")}</Frame>
        </div>
      </div>
    </section>
  );
}

function Frame({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center rounded-lexi-lg border border-line bg-card text-center font-display text-2xl font-bold text-ink shadow-lexi md:text-3xl ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Verify build succeeds**

```bash
npm run build
```

Expected: compiles. CSS imports resolve.

---

### Task 14: SamenModus

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\samen-modus.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `samenModus`)

**Why:** *The* differentiator vs Squla per `design_handoff/README.md` §7.1. Parent phone + kid tablet pairing concept. Reference: `Landing.v3.jsx:276–371`.

- [ ] **Step 1: Add samenModus messages to `nl-NL.json`**

```json
"samenModus": {
  "eyebrow": "Samen-modus",
  "title": "Jij coacht. Lexi past zich aan. Je kind oefent.",
  "lead": "Op zondagavond pak je je telefoon, je kind pakt de tablet. Vijftien minuten later weten jullie allebei waar het volgende week om gaat.",
  "parent": {
    "label": "Op je telefoon",
    "title": "Vraag uitleggen",
    "body": "Lexi geeft jou de uitleg en context. Jij stelt de vraag in eigen woorden."
  },
  "kid": {
    "label": "Op de tablet",
    "title": "Antwoord geven",
    "body": "Je kind antwoordt in een spelvorm. Krijgt directe feedback en munten."
  }
}
```

- [ ] **Step 2: Implement `samen-modus.tsx`**

Reference `SamenModus` and `SamenScene` (`Landing.v3.jsx:276` and `:319`). Translate the inline-styled phone/tablet illustration to Tailwind. Phone is a `rounded-[40px] border` rectangle with a tiny notch, tablet is a wider `rounded-[28px]` rectangle. Both use `bg-card` with subtle `shadow-lexi`. Inside each, a small heading + body paragraph. Use `Smartphone` and `Tablet` Lucide icons as inline-mini icons next to the labels.

Skeleton:

```tsx
import { useTranslations } from "next-intl";
import { Smartphone, Tablet } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

export function SamenModus() {
  const t = useTranslations("samenModus");
  const parent = useTranslations("samenModus.parent");
  const kid = useTranslations("samenModus.kid");
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-2">
          <Device tone="parent" Icon={Smartphone} label={parent("label")} title={parent("title")} body={parent("body")} />
          <Device tone="kid" Icon={Tablet} label={kid("label")} title={kid("title")} body={kid("body")} />
        </div>
      </div>
    </section>
  );
}

function Device({ tone, Icon, label, title, body }: {
  tone: "parent" | "kid";
  Icon: typeof Smartphone;
  label: string;
  title: string;
  body: string;
}) {
  const tint = tone === "parent" ? "bg-teal-soft" : "bg-sun-soft";
  return (
    <div className={`rounded-lexi-lg border border-line ${tint} p-8 shadow-lexi md:p-10`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-2">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">{title}</h3>
      <p className="mt-3 text-ink-2">{body}</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 15: RewardLoop

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\reward-loop.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `rewardLoop`)

**Why:** Coins → avatar → physical goodies pipeline. Reference: `Landing.v3.jsx:373–438`.

- [ ] **Step 1: Add rewardLoop messages**

```json
"rewardLoop": {
  "eyebrow": "Belonen",
  "title": "Munten verzamelen, eigen avatar bouwen, échte cadeaus.",
  "lead": "Wat je kind verdient, kan ze ook uitgeven — digitaal én op de mat.",
  "steps": {
    "coins": { "title": "Munten", "body": "Verdiend met goed antwoorden." },
    "avatar": { "title": "Avatar-items", "body": "Hoeden, diertjes, kamerstijlen." },
    "goodies": { "title": "Echte goodies", "body": "Stickers, posters, mini-werkboeken." }
  }
}
```

- [ ] **Step 2: Implement `reward-loop.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Coins, Sparkles, Gift, ArrowRight } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

const STEPS = [
  { key: "coins" as const, Icon: Coins, tint: "bg-sun-soft text-ink" },
  { key: "avatar" as const, Icon: Sparkles, tint: "bg-plum-soft text-ink" },
  { key: "goodies" as const, Icon: Gift, tint: "bg-ok-soft text-ink" },
];

export function RewardLoop() {
  const t = useTranslations("rewardLoop");
  const s = useTranslations("rewardLoop.steps");
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <div className="mt-12 grid items-center gap-6 md:mt-16 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {STEPS.map((step, i) => (
            <Step key={step.key} step={step} title={s(`${step.key}.title`)} body={s(`${step.key}.body`)} delay={i * 200} sep={i < STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ step, title, body, delay, sep }: {
  step: typeof STEPS[number];
  title: string;
  body: string;
  delay: number;
  sep: boolean;
}) {
  return (
    <>
      <div className="lexi-fade-up" style={{ animationDelay: `${delay}ms` }}>
        <div className={`flex h-16 w-16 items-center justify-center rounded-lexi-lg ${step.tint}`}>
          <step.Icon className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-ink">{title}</h3>
        <p className="mt-2 text-ink-2">{body}</p>
      </div>
      {sep && <ArrowRight className="hidden text-ink-3 md:block" />}
    </>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 16: Subjects

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\subjects.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `subjects`)

**Why:** 5-subject grid (Rekenen, Taal, Lezen, Wereld, Engels). Region-aware via `common.groep` and `common.groepRange`. Reference: `Landing.v3.jsx:440–481`.

- [ ] **Step 1: Add subjects messages to `nl-NL.json`**

```json
"subjects": {
  "eyebrow": "Vakken",
  "title": "Alles wat ze op school zien — slim verpakt.",
  "lead": "Voor {groep} {groepRange}.",
  "items": {
    "rekenen": { "title": "Rekenen", "body": "Tafels, breuken, verhaaltjessommen — gepacificeerd in stappen." },
    "taal":    { "title": "Taal", "body": "Woordenschat, spelling, grammatica zonder droge invuloefeningen." },
    "lezen":   { "title": "Lezen", "body": "Begrijpend lezen met korte teksten en open vragen." },
    "wereld":  { "title": "Wereldoriëntatie", "body": "Aardrijkskunde, geschiedenis, natuur — verkennend." },
    "engels":  { "title": "Engels", "body": "Vanaf groep 7 in NL, vanaf leerjaar 5 in BE." }
  }
}
```

- [ ] **Step 2: Implement `subjects.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Calculator, Type, BookOpen, Globe, Languages } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

const SUBJECTS = [
  { key: "rekenen" as const, Icon: Calculator, tint: "bg-teal-soft text-ink", border: "border-teal" },
  { key: "taal"    as const, Icon: Type,       tint: "bg-primary-soft text-primary-ink", border: "border-primary" },
  { key: "lezen"   as const, Icon: BookOpen,   tint: "bg-sun-soft text-ink", border: "border-sun" },
  { key: "wereld"  as const, Icon: Globe,      tint: "bg-plum-soft text-ink", border: "border-plum" },
  { key: "engels"  as const, Icon: Languages,  tint: "bg-ok-soft text-ink",   border: "border-ok" },
];

export function Subjects() {
  const t = useTranslations("subjects");
  const s = useTranslations("subjects.items");
  const c = useTranslations("common");
  return (
    <section id="producten" className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead", { groep: c("groep"), groepRange: c("groepRange") })}
          center
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 md:grid-cols-3 lg:grid-cols-5">
          {SUBJECTS.map((sub) => (
            <li
              key={sub.key}
              className={`rounded-lexi-lg border ${sub.border} ${sub.tint} p-6 shadow-lexi-sm`}
            >
              <sub.Icon className="h-8 w-8" />
              <h3 className="mt-4 font-display text-xl font-bold">{s(`${sub.key}.title`)}</h3>
              <p className="mt-2 text-sm text-ink-2">{s(`${sub.key}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles. (Note: `border-teal` etc. are NOT in our default Tailwind tokens — the tokens are colors, not border classes. Tailwind 4 generates `border-teal` automatically from `--color-teal`. Verify in dev that the borders render in the right colors.)

---

### Task 17: SeoProof

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\seo-proof.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `seoProof`)
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-BE.json` (BE override for `seoProof`)

**Why:** Region-conditional curriculum framing — SEO leerlijn 2026 (NL) vs ZILL (BE). Parent-benefit copy first per `design_handoff/README.md` §7.1 #6. Reference: `Landing.v3.jsx:483–547`.

- [ ] **Step 1: Add seoProof to `nl-NL.json`**

```json
"seoProof": {
  "eyebrow": "Bewezen leerlijn",
  "title": "Je kind oefent precies wat de juf volgende week toetst.",
  "lead": "Lexi volgt de SEO leerlijn 2026 — dezelfde leerdoelen die ook op school worden getoetst.",
  "rows": [
    { "label": "Rekenen — getalbegrip",   "topic": "Tafels van 6, 7, 8", "pct": 78 },
    { "label": "Taal — werkwoordspelling", "topic": "Stam + t / d",       "pct": 64 },
    { "label": "Lezen — begrijpend",       "topic": "Hoofdgedachte vinden", "pct": 71 },
    { "label": "Wereld — geschiedenis",    "topic": "Romeinse tijd",      "pct": 55 }
  ],
  "footnote": "Percentages tonen voltooid van het thema voor groep 6."
}
```

- [ ] **Step 2: Add BE override to `nl-BE.json`**

```json
"seoProof": {
  "title": "Jouw kind oefent precies wat de juf of meester volgende week toetst.",
  "lead": "Lexi volgt het ZILL-leerplan — dezelfde leerdoelen die ook op school worden getoetst.",
  "footnote": "Percentages tonen voltooid van het thema voor leerjaar 4."
}
```

- [ ] **Step 3: Implement `seo-proof.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";

type Row = { label: string; topic: string; pct: number };

export function SeoProof() {
  const t = useTranslations("seoProof");
  const rows = t.raw("rows") as Row[];
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <ul className="mt-12 divide-y divide-line-2 rounded-lexi-lg border border-line bg-card md:mt-16">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{r.label}</p>
                <p className="text-sm text-ink-3">{r.topic}</p>
              </div>
              <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-bg-2 md:block">
                <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
              </div>
              <p className="font-mono text-sm tabular-nums text-ink-2">{r.pct}%</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-3">{t("footnote")}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 18: ParentDashboardPreview

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\parent-dashboard-preview.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `parentDashboard`)

**Why:** Light + warm "zondagavond op de bank" framing. Sample gespreksstarter card. Reference: `Landing.v3.jsx:549–601`.

- [ ] **Step 1: Add parentDashboard messages**

```json
"parentDashboard": {
  "eyebrow": "Voor jou",
  "title": "Eén dashboard. Geen schoolportaal-look.",
  "lead": "Zondagavond, koffie. Zien wat ze deze week deden, en één gespreksstarter voor aan tafel.",
  "starter": {
    "label": "Gespreksstarter — deze week",
    "question": "Welke som vond je deze week het lastigst en waarom?",
    "tag": "Rekenen — groep 5"
  },
  "stats": {
    "minutes": "78 min deze week",
    "streak": "12 dagen op rij",
    "mastery": "Rekenen 64% beheerst"
  }
}
```

- [ ] **Step 2: Implement `parent-dashboard-preview.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Coffee, MessageCircle, Flame, Clock } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

export function ParentDashboardPreview() {
  const t = useTranslations("parentDashboard");
  const starter = useTranslations("parentDashboard.starter");
  const stats = useTranslations("parentDashboard.stats");
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <div className="mt-12 grid gap-6 rounded-lexi-lg border border-line bg-bg-2 p-6 md:mt-16 md:grid-cols-[2fr_1fr] md:p-10">
          <div className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-ink">
              <MessageCircle className="h-4 w-4" />
              {starter("label")}
            </div>
            <p className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
              {starter("question")}
            </p>
            <p className="mt-4 text-xs text-ink-3">{starter("tag")}</p>
          </div>
          <ul className="grid gap-3">
            <Stat Icon={Clock} label={stats("minutes")} />
            <Stat Icon={Flame} label={stats("streak")} />
            <Stat Icon={Coffee} label={stats("mastery")} />
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stat({ Icon, label }: { Icon: typeof Coffee; label: string }) {
  return (
    <li className="flex items-center gap-3 rounded-lexi border border-line bg-card px-4 py-3">
      <Icon className="h-5 w-5 text-primary-ink" />
      <span className="text-sm text-ink-2">{label}</span>
    </li>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 19: Trust (placeholder testimonials)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\trust.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `trust`)

**Why:** "in beta — eerste gezinnen" framing. Three testimonial cards. Per `design_handoff/README.md` §7.1 #8: "Do not invent user counts." Placeholder copy from prototype. Reference: `Landing.v3.jsx:603–649`.

- [ ] **Step 1: Add trust messages with TODO comment in source**

```json
"trust": {
  "eyebrow": "Eerste gezinnen",
  "title": "Lexi is nog in beta — en dit zeggen de eerste ouders.",
  "lead": "Echte testimonials komen zodra we genoeg verhalen hebben. Onderstaande citaten zijn voorlopig.",
  "testimonials": [
    { "quote": "Mijn dochter zat er deze week vrijwilig elke dag voor. Dat zegt genoeg.", "author": "Marieke", "context": "Moeder van Liv (groep 5)" },
    { "quote": "De gespreksstarter aan tafel werkt verrassend goed.", "author": "Joris", "context": "Vader van Tijn (groep 7)" },
    { "quote": "Eindelijk iets digitaals dat niet aanvoelt als saaie schoolwerk.", "author": "Anouk", "context": "Moeder van Sara (leerjaar 4)" }
  ]
}
```

- [ ] **Step 2: Implement `trust.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";

// TODO(real-testimonials): replace prototype quotes once the product team
// supplies real ones. Spec: docs/superpowers/specs/2026-05-08-lexi-landing-design.md
type Testimonial = { quote: string; author: string; context: string };

export function Trust() {
  const t = useTranslations("trust");
  const items = t.raw("testimonials") as Testimonial[];
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <ul className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.author}
              className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm"
            >
              <p className="text-ink">"{it.quote}"</p>
              <p className="mt-4 text-sm font-medium text-ink">{it.author}</p>
              <p className="text-xs text-ink-3">{it.context}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 20: Pricing

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\pricing.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `pricing`)

**Why:** 3 tier cards: Maandelijks (€11,95), Jaarlijks (€119, savings badge), Gezinsabonnement (€19,95, max 4 kids). Per `design_handoff/README.md` §7.1 #9. CTA → `/signup?plan=monthly|yearly|family`. Reference: `Landing.v3.jsx:651–719`.

- [ ] **Step 1: Add pricing messages**

```json
"pricing": {
  "eyebrow": "Prijzen",
  "title": "Eerlijk geprijsd. Geen verborgen kosten.",
  "lead": "Eerste 14 dagen gratis. Per maand opzegbaar.",
  "ctaTrial": "Start 14 dagen gratis",
  "tiers": {
    "monthly":  { "name": "Maandelijks",       "price": "€11,95", "interval": "per maand", "features": ["1 ouder + 1 kind", "Alle vakken", "Voortgangsdashboard"], "badge": "" },
    "yearly":   { "name": "Jaarlijks",          "price": "€119",   "interval": "per jaar",  "features": ["1 ouder + 1 kind", "Alle vakken", "Voortgangsdashboard", "2 maanden gratis"], "badge": "Voordeligst" },
    "family":   { "name": "Gezinsabonnement",   "price": "€19,95", "interval": "per maand", "features": ["1 ouder + tot 4 kinderen", "Alle vakken", "Familie-dashboard", "Aparte avatars per kind"], "badge": "" }
  }
}
```

- [ ] **Step 2: Implement `pricing.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Btn } from "@/components/ui/btn";
import { SectionIntro } from "@/components/ui/section-intro";

const TIERS = ["monthly", "yearly", "family"] as const;

export function Pricing() {
  const t = useTranslations("pricing");
  const tier = useTranslations("pricing.tiers");
  return (
    <section id="prijzen" className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <ul className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          {TIERS.map((id) => {
            const features = tier.raw(`${id}.features`) as string[];
            const badge = tier(`${id}.badge`);
            const featured = id === "yearly";
            return (
              <li
                key={id}
                className={`flex flex-col rounded-lexi-lg border p-8 ${
                  featured
                    ? "border-primary bg-card shadow-lexi"
                    : "border-line bg-card shadow-lexi-sm"
                }`}
              >
                {badge && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    {badge}
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-ink">{tier(`${id}.name`)}</h3>
                <p className="mt-3">
                  <span className="font-display text-4xl font-bold text-ink">{tier(`${id}.price`)}</span>
                  <span className="ml-2 text-sm text-ink-3">{tier(`${id}.interval`)}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Btn href={`/signup?plan=${id}`} className="mt-8 w-full">
                  {t("ctaTrial")}
                </Btn>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 21: FAQ (Radix accordion, client component)

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\faq.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `faq`)
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-BE.json` (override BE-specific FAQ items if any)

**Why:** Six accordion items. Region-aware: copy mentions SEO/ZILL and groep/leerjaar. Reference: `Landing.v3.jsx:721–761`.

- [ ] **Step 1: Add faq messages to `nl-NL.json`**

```json
"faq": {
  "eyebrow": "Veelgestelde vragen",
  "title": "Vragen die ouders ons stellen.",
  "items": [
    { "q": "Voor welke leeftijden is Lexi.kids?", "a": "Voor groep 1 t/m 8 (NL) en leerjaar 1 t/m 6 (BE), grofweg 4 tot 12 jaar." },
    { "q": "Volgt Lexi de schoolleerlijn?", "a": "Ja — we volgen de SEO leerlijn 2026 in Nederland en het ZILL-leerplan in België." },
    { "q": "Heb ik een creditcard nodig om te starten?", "a": "Nee. De eerste 14 dagen zijn gratis en vragen geen betaalgegevens." },
    { "q": "Kan ik per maand opzeggen?", "a": "Ja, op elk moment, zonder uitleg." },
    { "q": "Hoeveel kinderen kunnen op één account?", "a": "1 kind bij Maandelijks of Jaarlijks. Tot 4 kinderen bij het Gezinsabonnement." },
    { "q": "Werkt het op tablet en telefoon?", "a": "Ja. We adviseren tablet voor het kind en telefoon voor de ouder (Samen-modus)." }
  ]
}
```

- [ ] **Step 2: Implement `faq.tsx`**

```tsx
"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

type Item = { q: string; a: string };

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as Item[];
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} center />
        <Accordion.Root
          type="single"
          collapsible
          className="mx-auto mt-12 max-w-3xl rounded-lexi-lg border border-line bg-card md:mt-16"
        >
          {items.map((it, i) => (
            <Accordion.Item
              key={it.q}
              value={`item-${i}`}
              className="border-b border-line-2 last:border-b-0"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-ink hover:bg-bg-2">
                  <span className="font-medium">{it.q}</span>
                  <ChevronDown className="h-4 w-4 text-ink-3 transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-6 pb-4 text-ink-2">
                {it.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 22: FinalCTA

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\src\components\landing\final-cta.tsx`
- Modify: `C:\Users\thoma\lexi_2.0\src\messages\nl-NL.json` (add `finalCta`)

**Why:** One last conversion banner. Reference: `Landing.v3.jsx:763–795`.

- [ ] **Step 1: Add finalCta messages**

```json
"finalCta": {
  "title": "Begin vanavond. Veertien dagen gratis.",
  "lead": "Geen creditcard. Per maand opzegbaar.",
  "ctaTrial": "Start 14 dagen gratis",
  "ctaTry": "Eerst een vraag proberen"
}
```

- [ ] **Step 2: Implement `final-cta.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";

export function FinalCta() {
  const t = useTranslations("finalCta");
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-3xl rounded-lexi-lg border border-primary bg-primary-soft p-10 text-center md:p-16">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-ink-2 md:text-lg">{t("lead")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn href="/signup">{t("ctaTrial")}</Btn>
          <Btn href="/probeer" variant="ghost">{t("ctaTry")}</Btn>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: compiles.

---

### Task 23: Compose page.tsx

**Files:**
- Modify: `C:\Users\thoma\lexi_2.0\src\app\page.tsx` (overwrite)

**Why:** Wires every section into the route in the order specified by `design_handoff/README.md` §7.1.

- [ ] **Step 1: Overwrite `page.tsx`**

```tsx
import { Nav } from "@/components/nav/nav";
import { Hero } from "@/components/landing/hero";
import { ProductLoop } from "@/components/landing/product-loop";
import { SamenModus } from "@/components/landing/samen-modus";
import { RewardLoop } from "@/components/landing/reward-loop";
import { Subjects } from "@/components/landing/subjects";
import { SeoProof } from "@/components/landing/seo-proof";
import { ParentDashboardPreview } from "@/components/landing/parent-dashboard-preview";
import { Trust } from "@/components/landing/trust";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProductLoop />
        <SamenModus />
        <RewardLoop />
        <Subjects />
        <SeoProof />
        <ParentDashboardPreview />
        <Trust />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify build succeeds**

```bash
npm run build
```

Expected: compiles. `/` is still listed as `○ (Static)` (or `λ (Server)` due to dynamic cookie reads — either is fine).

- [ ] **Step 3: Visual smoke test**

```bash
npm run dev
```

Open http://localhost:3000. Walk through each section top to bottom. Confirm:
- Nav with brand mark + region picker (NL flag visible by default).
- Hero with kicker, big title, two CTAs, price snippet, three trust bullets, and product frame on the right.
- ProductLoop animates between three frames (or shows them stacked if `prefers-reduced-motion`).
- All 12 sections render without console errors.
- Footer shows "Lexi.kids B.V. — Amsterdam".
- Click the region picker, switch to België. After re-render, footer shows "Lexi.kids — Antwerpen", subjects lead reads "Voor leerjaar 1 t/m 6", SEO Proof title says "ZILL".

Stop the dev server.

---

### Task 24: Playwright E2E happy path

**Files:**
- Create: `C:\Users\thoma\lexi_2.0\tests\e2e\landing.spec.ts`

**Why:** One spec covering: load page, switch locale, expand FAQ, click hero CTA. Per spec §Testing.

- [ ] **Step 1: Create the spec file**

```ts
import { test, expect } from "@playwright/test";

test("landing page — region switch + FAQ + hero CTA", async ({ page, context }) => {
  // Start without any locale cookie — defaults to nl-NL
  await context.clearCookies();

  await page.goto("/");

  // NL default: subjects lead mentions "groep" and "1 t/m 8"
  await expect(page.getByText(/Voor groep 1 t\/m 8/)).toBeVisible();

  // Switch to BE via the region picker
  await page.getByRole("button", { name: /Kies regio/i }).click();
  await page.getByRole("button", { name: /België/i }).click();

  // After revalidation, BE copy should be visible
  await expect(page.getByText(/Voor leerjaar 1 t\/m 6/)).toBeVisible();
  await expect(page.getByText(/Lexi\.kids — Antwerpen/)).toBeVisible();

  // Open the first FAQ item
  const firstFaq = page.getByRole("button", { name: /Voor welke leeftijden/i });
  await firstFaq.click();
  await expect(page.getByText(/grofweg 4 tot 12 jaar/)).toBeVisible();

  // Hero CTA — clicking navigates to /signup (will 404 until that phase)
  // Just assert the link href; navigating into a 404 isn't useful here.
  const heroCta = page.getByRole("link", { name: /Start 14 dagen gratis/ }).first();
  await expect(heroCta).toHaveAttribute("href", "/signup");
});
```

- [ ] **Step 2: Run the E2E test**

```bash
npm run test:e2e
```

Expected: 1 test, passing in ~5s. (Playwright spins up `npm run dev` per `playwright.config.ts`.)

---

### Task 25: Lighthouse run + final acceptance

**Files:** none modified. Read-only checks.

**Why:** Confirms Performance ≥ 90 and Accessibility ≥ 95 per `CLAUDE.md` §What done looks like.

- [ ] **Step 1: Production build is clean**

```bash
npm run build
```

Expected: no errors. Output mentions `/` route.

- [ ] **Step 2: Run Lighthouse**

```bash
npm run lighthouse
```

Expected: lhci spins up `npm run start`, runs Lighthouse against `/`, asserts Performance ≥ 0.9 and Accessibility ≥ 0.95. Both pass.

If Performance fails, common culprits: large unoptimized images (none in this scaffold), heavy client JS (we have only two client islands — investigate). If Accessibility fails, check that every Lucide icon used decoratively has `aria-hidden="true"` and every SVG flag has the `<title>` element (it does).

- [ ] **Step 3: Run the unit tests once more**

```bash
npm test
```

Expected: all suites pass — locale-cookie (4), set-locale-action (3), btn (4), section-intro (3) = 14 assertions.

- [ ] **Step 4: Manual visual check at 1280px and 375px**

```bash
npm run dev
```

In one tab: http://localhost:3000. In another: open `C:\Users\thoma\lexi_2.0\design_handoff\design\Lexi.kids v3.html`. Compare side-by-side at 1280px (desktop) and 375px (mobile, use browser devtools). Spot-check:
- Color tokens match (cream bg, primary-coral accents).
- Typography matches (Bricolage Grotesque h1, Geist body).
- Section spacing roughly matches.
- Region picker behavior matches.

Stop the dev server.

- [ ] **Step 5: Tell the user the landing page is ready**

Post a short message:
> Landing page complete and rendering at `/`. All 12 sections, region switching, FAQ accordion, Lighthouse passing. Test summary: 14 unit assertions + 1 E2E spec passing.
>
> When you're ready: commit, push, redeploy on Vercel. Next sub-project from the roadmap is `/signup` (Phase 3 — auth + Clerk + first kid + 14-day Stripe trial).

- [ ] **Step 6: STOP**

Do not git commit, push, or deploy. Hand control back to the user.

---

## Self-review notes (executor can ignore)

- **Spec coverage:** Every component listed in spec §"File structure" has a dedicated task: i18n (T2-T5), atoms (T6-T7), nav stack (T8-T10), footer (T11), hero stack (T12), all 10 mid-page sections (T13-T22), composition (T23). Test infra has T1 (setup) + T24 (E2E) + T25 (Lighthouse). Spec acceptance checklist items map to T23 step 3 (visual), T24 (locale switch + FAQ + CTA), T25 (build, Lighthouse, no emojis — verified by code review during execution).
- **Placeholder scan:** No "TBD" / "TODO: implement later" in implementation steps. The single in-source `TODO(real-testimonials)` comment in T19 is product-team-facing, not engineer-facing.
- **Type / name consistency:** `Locale` type defined in T2; reused by T4 (validity check), T9 (RegionPicker option type). `setLocale` action exported in T4; consumed by T9. `Btn` exported in T6; consumed by T10 (Nav), T12 (Hero), T20 (Pricing), T22 (FinalCta). `SectionIntro` exported in T7; consumed by T13, T14, T15, T16, T17, T18, T19, T20, T21. Message namespace keys (`nav`, `hero`, `productLoop`, etc.) consistent across the message-file additions and the `useTranslations(...)` calls in component code. Verified.
- **Tailwind 4 caveat:** `border-teal`, `border-primary`, etc. (T16) rely on Tailwind 4 auto-generating border utilities from `--color-*` theme tokens. If a future Tailwind version changes that, T16 will need explicit `tailwind.config` entries. Documented as an open question in the spec.
