# Quickstart — hand this folder to Claude Code

You're holding a complete handoff package for **Lexi.kids**, a Dutch/Belgian adaptive-learning platform for kids in groep 1 t/m 8.

## What's in here

```
design_handoff_lexi_kids/
├── README.md         ← Full spec: tokens, routes, data model, acceptance criteria
├── CLAUDE.md         ← Drop into your new repo root — Claude Code reads this on every session
├── PROMPTS.md        ← Copy-paste prompts for each build phase
└── design/           ← The HTML/JSX design references
    ├── Lexi.kids v3.html
    └── src/
```

## 5-minute setup

```bash
# 1. Create the production repo
mkdir lexi-kids && cd lexi-kids
git init

# 2. Copy the handoff into the repo (so Claude Code can read it)
cp -r ../design_handoff_lexi_kids ./

# 3. Move CLAUDE.md to the repo root — Claude Code auto-reads it
cp design_handoff_lexi_kids/CLAUDE.md ./CLAUDE.md

# 4. Open the design in a browser (left tab) and Claude Code in a terminal (right tab)
open "design_handoff_lexi_kids/design/Lexi.kids v3.html"
claude
```

## First prompt to paste into Claude Code

> Read `CLAUDE.md` and `design_handoff_lexi_kids/README.md` end to end. Then open `design_handoff_lexi_kids/design/Lexi.kids v3.html` and the JSX files in `design_handoff_lexi_kids/design/src/v3/`. After you've done that, propose a build plan in 8 phases (matching the order in CLAUDE.md), and start phase 1 — Next.js skeleton, Tailwind tokens, fonts, Prisma, Clerk placeholder, Stripe placeholder. Stop after phase 1 and wait for my review.

That's it. Use `PROMPTS.md` for the phase-2 through phase-8 prompts.
