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

Next.js 16 App Router + TypeScript, Tailwind CSS 4 with OKLCH design tokens, Prisma (Postgres), Clerk auth, Stripe payments, next-intl for nl-NL / nl-BE, PostHog analytics, Vercel hosting. See `CLAUDE.md` for the full list.

## Status

Phase 1 (scaffold) complete. Feature work tracked in `docs/superpowers/plans/`.
