# Lexi.kids — Games UX Overhaul

**Date:** 2026-05-13
**Status:** Approved design (auditing review 2026-05-13), ready for thematic implementation
**Depends on:** existing auth + engagement foundation. Stats writes from the engagement spec aren't required to ship Theme A but make Theme E (analytics integration) richer.

---

## Context

The current `/kind/spelen/[quizId]` flow works but has clear pedagogical gaps when compared to Duolingo (best-in-class engagement) and Squla (Dutch-market pedagogical leader). After reviewing all five game components (`mc-game.tsx`, `type-game.tsx`, `match-game.tsx`, `catapult-game.tsx`, `drag-order-game.tsx`) and the `quiz-player.tsx` orchestrator, a clear theme emerged: **the games are functional but treat wrong answers as transactions to log, not learning opportunities to leverage.**

This spec covers 30 specific improvements grouped into 5 themes, ordered by per-hour impact for kid learning outcomes. Each theme is a separate implementation plan and can ship independently.

---

## §1 — Goals & success criteria

### What ships (across all 5 themes)

A games experience that:
- **Teaches from mistakes** — every wrong answer surfaces the right one with context
- **Forgives small slip-ups** — type-tolerance, no-frustration paths
- **Reads aloud** — TTS for non-readers in groep 1-3
- **Feels alive** — mascot reacts, milestones celebrate, mid-quiz feedback
- **Matches touch expectations** — real drag, two-tap firing, pair-confirmation
- **Respects flow** — pause, skip-with-cost, leave-warning, optimistic feedback

### Definition of done — per-theme

Each theme has its own DoD; see the §3-§7 sections. Cumulative invariants:
- All Lexi house rules respected: Dutch-only, no emoji as UI, no third-party scripts on `/kind/*`, OKLCH colours, 44px+ hit targets.
- All games remain keyboard-accessible. New touch interactions (drag, two-tap fire) MUST have keyboard fallback.
- No new external dependencies without flagging — Web Speech API is browser-native so doesn't count.

### Out of scope

- Procedural question generators (e.g. parametrised math templates) — separate spec.
- Adaptive difficulty within a quiz session (intra-quiz IRT) — depends on the difficulty-calibration spec.
- Voice-recognition for spoken answers — too platform-fragile for v1.
- Multiplayer / social game modes.

---

## §2 — Five themes, prioritised

| Theme | Items | Pedagogical impact | Ship size | Notes |
|---|---|---|---|---|
| **A. Pedagogical correctness** | 6 | 🔥🔥🔥 highest | ~1 week | Show correct answer on fail; typo tolerance; per-question hint; review queue; MC/Match visual feedback during play |
| **B. Audio & accessibility** | 4 | 🔥🔥 high (groep 1-3) | ~3-4 days | TTS read-aloud on questions; audio button on Type/MC; on-screen letter strip for early typers; screen-reader copy polish |
| **C. Game mechanics fidelity** | 4 | 🔥🔥 high | ~3-4 days | Real drag in DragOrder (`@dnd-kit`); two-tap catapult fire; Match "Klaar?" confirmation; type-input retry-on-wrong |
| **D. Engagement during play** | 9 | 🔥 medium | ~4-5 days | Streak chip during quiz; mid-quiz milestones; mascot reacts; punchier coin animations; mid-quiz streak celebration; pictures on MC; kid header during play; bigger end-screen celebration; perfect-quiz confetti rain |
| **E. Quality-of-life** | 7 | 🔥 medium | ~3-4 days | Pause; skip-with-cost; optimistic feedback; haptic; leave-confirmation; "1 vraag te gaan" anticipation; ARIA polish |

**Total: ~3-4 weeks of implementation work.** Each theme is a standalone PR.

This session implements **Theme A in full** and writes the spec for B-E. The themes can be picked up in any order in future sessions, but A → B → C → D → E is the recommended ship order.

---

## §3 — Theme A: Pedagogical correctness

### A.1 Show correct answer on wrong (highest single impact)

**Affected games:** MC, Catapult, Match (per-pair), DragOrder, Type.

When a kid answers wrong, the feedback bar today says "Probeer de volgende". After this change:

| Game | Correct-answer reveal |
|---|---|
| **MC** | The kid's chosen option turns red with an X. The correct option turns green with a check. Both stay visible. The feedback bar reads "Het juiste antwoord was: **{correct}**". |
| **Catapult** | The kid's chosen target turns red with an X. The correct target turns green with a check. |
| **Type** | The input box shows the kid's typed answer struck-through; below it, the correct answer in green. |
| **DragOrder** | Each item's position is annotated: green if correct, red with the correct number if wrong. |
| **Match** | The wrong pair flashes red briefly, then the correct match is shown alongside. (See A.5 for per-pair feedback during play.) |

**Server-side change:** the existing `submitAnswer` action grades the answer but currently returns only `{ correct, coinsAwarded, ... }`. Extend to also return the **correct answer** (or "correct choice index" for MC/Catapult) so the client can reveal it. **This is safe** — server already knows the answer key from `payload`, the kid already gave their attempt, so revealing the correct one teaches without leaking future questions.

```ts
// SubmitResult extension
export type SubmitResult = {
  correct: boolean;
  coinsAwarded: number;
  correctCount: number;
  totalAnswered: number;
  // NEW:
  reveal: {
    kind: "mc" | "catapult" | "type" | "drag-order" | "match";
    // For mc/catapult: the index of the correct option (and the kid's chosen index)
    correctIndex?: number;
    chosenIndex?: number;
    // For type: the canonical correct answer (post-typo-tolerance)
    correctText?: string;
    // For drag-order: the correct sequence
    correctOrder?: string[];
    // For match: the correct pairings
    correctPairs?: Array<{ l: string; r: string }>;
  };
};
```

### A.2 Typo tolerance on Type game

Today: `"hond"` ≠ `"Hond"` ≠ `"hond "` = all wrong. Frustrating for groep 1-3 who are still mastering keyboard + spelling.

**Rule:** normalise both kid input and canonical answer through:
1. Trim whitespace
2. Collapse internal whitespace to single spaces
3. Lowercase
4. Strip diacritics (`é` → `e`, `ñ` → `n`)
5. Levenshtein-1 distance tolerance — one wrong/missing/extra character is forgiven

After normalisation, exact match → correct.

**Edge cases:**
- For 2-letter words like `"ja"` / `"nee"`: Levenshtein-1 would accept anything 1 char off (`"ye"` = wrong but `"j"` would match `"ja"`). Cap: only apply Levenshtein-1 for answers of length ≥ 4 characters. Below that, require exact normalised match.
- For numeric answers (digits only): no Levenshtein. `"42"` ≠ `"43"`.

Implementation: pure function `normaliseAndCompare(kidInput, canonical)` in `src/lib/type-tolerance.ts` with unit tests covering each rule.

Server-side `submitAnswer` for TYPE swaps the current strict-equality check for this function.

**Pedagogical note:** even when typo-accepted, the feedback bar should show "Goed! Je hebt 'hund' geschreven maar het juiste antwoord is 'hond'." (informational nudge). This is in A.1's reveal — kids see what the canonical answer was.

### A.3 Per-question hint / explanation

Today: `Quiz.customExplain` shows once on the uitleg-scherm. Per-question hints don't exist.

**Add `hint?: string` to every payload** (the `quiz-schemas.ts` discriminated union):

```ts
type McPayload   = { q: string; options: string[]; correct: number; hint?: string };
type TypePayload = { q: string; answer: string;                 hint?: string };
// etc.
```

UI:
- Tap a small Lucide `HelpCircle` icon in the corner of the question card → modal/popover shows `payload.hint || quiz.customExplain || "Probeer er eens over na te denken."`
- Cost: -3 coins on this question if a hint is opened (only deducted once per question, even if reopened). Tracked in `Session.perQuestion[i].hintUsed: boolean`.

**Why a cost:** prevents kids from auto-hinting through every question. Duolingo charges hearts; we charge coins. The cost is small enough not to be punitive.

**Show hint automatically after first wrong attempt** — even if kid didn't request it, the reveal screen includes the hint text inline. This is free (no coin cost) because it's part of the correction.

### A.4 Review queue (failed questions return mid-session)

Today: 10 sequential questions, fails are not re-tested. Spaced retrieval research says re-testing within the same session reinforces learning.

**Rule:** when a kid gets a question wrong:
- Mark it failed in the session-local state
- After the kid completes the last question (Q10), if any questions were failed, run a "review round" — show 1 failed question, grade it, no coins for the review (anti-gaming).
- Loop until 0 failed OR 3 review rounds completed (cap to prevent endless loops).
- Display: "Even oefenen — vraag {N}" header makes it clear it's a review, not a new question.

Implementation: `QuizPlayer` state machine gains a `review` phase between `feedback` (after Q10) and `done`. Review questions reuse the same payload + UI; just a different header banner and no coins.

**Server impact:** `Session.perQuestion` already records each entry. Reviews append additional entries with a `reviewOf: <originalQuestionId>` field. The mastery EWMA only counts the FIRST attempt per question per session (else reviews would unfairly inflate scores).

### A.5 MC visual feedback during play (in-game, not just feedback bar)

Today: tap an MC option → button click → wait → feedback bar shows result.

After: tap → option immediately becomes "selected" (filled with primary tint) → server response → option turns green (correct) or red (wrong) + correct option highlights green. All transitions <200ms.

This is **optimistic UI** (Theme E.4) applied specifically to MC. Pull it forward into Theme A because the visual-feedback-during-play is half the pedagogical value of A.1.

### A.6 Match per-pair feedback

Today: tap left + tap right → instant pair → all pairs end up "green" → submit on last pair → feedback bar.

After: tap left + tap right → pair flashes green (correct) or red (wrong) for 400ms → wrong pair UNDOES (both items return to unpicked state). Wrong pairings DON'T count as a submission — kid keeps trying. Once all pairs are correct, an explicit "Klaar?" button submits (instead of auto-submit on last pair).

This is closer to how Duolingo does match exercises and gives kids per-attempt feedback rather than punishing the whole pairing once at the end.

---

## §4 — Theme B: Audio & accessibility

### B.1 Text-to-speech (Web Speech API)

Every question card gets a small Lucide `Volume2` button. Tap it → browser's built-in `SpeechSynthesis` API reads `payload.q` aloud in Dutch (`nl-NL` or `nl-BE` based on household region).

```ts
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = region === "BE" ? "nl-BE" : "nl-NL";
utterance.rate = 0.95; // slightly slower for kids
speechSynthesis.speak(utterance);
```

No deps required. Works offline in modern browsers. Voice quality varies by OS but is acceptable for v1.

For Type game: an additional `Volume2` for the **expected answer** is NOT added (would leak the answer). Only the question gets TTS.

### B.2 On-screen letter strip for early typers (groep 1-3)

For Type game, when `ageBandFor(kid.groep) === "klein"`, render a touch-keyboard below the input box with just the Dutch alphabet (26 letters + space + backspace). Kid taps letters to compose the answer.

Physical keyboard still works in parallel. The strip is just an aid.

Render as 7-column grid of buttons, each ~40px square. Use Lucide `Delete` for backspace.

### B.3 Audio button on MC for non-readers

For groep 1-3 MC questions, add a `Volume2` icon next to each option. Tap → speak the option text. Lets non-readers identify options aurally.

For groep 4-8, audio buttons are hidden (they can read fluently — clutter).

### B.4 ARIA & screen-reader polish

- Every game's question root gets `role="region"` with `aria-label` matching the question text.
- Match game: progress announced via `aria-live="polite"` — "2 paren gemaakt, 3 te gaan."
- Catapult: when ball lands, `aria-live` announces "Geantwoord met: {chosen}".
- Type input: `aria-describedby` linking to TTS button label so SR users know audio is available.

---

## §5 — Theme C: Game mechanics fidelity

### C.1 Real drag in DragOrder

Today: tap up/down arrows. On touch devices kids expect to drag.

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable` (small, MIT, no transitive bloat). 2 new deps but minimal — both are React-only, no jQuery-era weight.

Drag handle is the whole row. Up/down arrows stay as keyboard fallback (and explicit a11y alternative). On touch: long-press to lift, drag to reorder.

### C.2 Two-tap catapult fire

Today: tap target = immediately fire ball + submit. Kid can't reconsider.

After:
- First tap on target = "aim" — target gets a highlighted ring, catapult rotates to face it visually
- Second tap on same target = "fire" — ball flies, ball lands, submit
- Tap a different target instead = re-aim

The second tap is a separate action so an accidental tap is recoverable. Keyboard: arrow keys move aim, space fires.

### C.3 Match "Klaar?" confirmation

Today: last pair auto-submits.

After: last pair completes → all paired items get a soft pulse → "Klaar?" button appears below the pairs. Kid taps Klaar → submit. Kid can also tap a paired item to unpair (returns both halves to unpicked).

### C.4 Type-input retry-on-wrong

Today: kid types wrong → server marks wrong → kid moves on.

After: kid types wrong → input shakes (CSS animation), error tint applies for 500ms, **but the input is not cleared** and the question is not yet "submitted" to the server. Kid has 2 retries max. Third attempt regardless of correctness submits.

Reduces frustration on near-misses ("hond" with extra space gets caught by A.2 typo tolerance anyway, but real misspellings get a second chance).

Server change: a `attempt` counter in payload submission so we know which retry produced the answer.

---

## §6 — Theme D: Engagement during play

### D.1 Streak chip during quiz

The streak chip from the engagement spec is also rendered in the quiz player header. Persistent reminder.

### D.2 Mid-quiz milestones

Between Q5 and Q6 (halfway), show a 1.5s overlay: "Halverwege! Goed bezig!" with mascot. Auto-dismisses. Skippable with tap/click.

### D.3 Mascot reacts

Replace the (currently absent) play-screen mascot with a small mascot in the header. State machine:
- Default: neutral/breathing animation
- On correct: smile + pop animation 800ms
- On wrong: small shake + slightly-sad expression 800ms
- On streak ≥ 3 in this session: small confetti burst around mascot

Use existing mascot SVG assets. Animations are CSS-only.

### D.4 Punchier coin animation

Today: `CoinPop` is a 16×16px circle above the feedback bar.

After: when correct, **the coin total in the header animates** (number flips up) AND a +N badge floats up from the question card. ~600ms total. Tunable.

### D.5 In-quiz streak celebration

When kid gets 5 correct in a row: brief celebration overlay "5 op rij! 🔥". Lucide `Flame` icon, not emoji. Auto-dismisses.

### D.6 Pictures on MC for visual subjects

Extend `McPayload.options[i]` to optionally include `{ text: string; image?: { src: string; alt: string } }`. Renders thumbnail above the option text. Useful for rekenen ("3 appels" = picture + label) and wereld (geography).

Out of v1 implementation: building an image library. The schema change ships now so content team can use it later.

### D.7 Kid header during play

The `KidHeader` (with coins balance, mascot, Wissel) currently isn't rendered on `/kind/spelen/[quizId]`. After: render a compact version at the top of the quiz player so kid sees coins balance update in real time.

### D.8 Bigger end-screen celebration

Today: end screen is a card with mascot + accuracy + back/retry. After:
- Perfect quiz (10/10): full-screen confetti rain (4-5s), mascot "hero" pose, coins counter animates from 0 → final
- 8-9/10: confetti burst from corners, mascot smile
- ≤7/10: regular end screen (no penalty for trying)

### D.9 Perfect-quiz badge

If kid finishes a quiz perfect: small "Trofee" badge shown on the recommended-quizzes card next time that quiz appears. Cleared after 7 days.

---

## §7 — Theme E: Quality-of-life

### E.1 Pause button

Persistent `Pause` icon top-right of the quiz player. Tap → freeze the timer (msSpent stops counting), show a backdrop with "Even pauze. Klaar om verder?" + Continue button.

Stops the session's stale-session-sweeper from firing (the existing 30-min sweeper would otherwise abandon a paused session).

### E.2 Skip-with-cost

`SkipForward` icon next to Pause. Tap → "Vraag overslaan? Je krijgt 0 munten voor deze vraag." → confirm → server submits `null` answer, marked wrong (no coins), kid moves to next question. Used sparingly; available for all games.

### E.3 Leave-warning

If kid taps "Terug" / browser back during a quiz, intercept with "Wil je stoppen? Je vooruitgang in deze quiz wordt opgeslagen voor later." → confirm/cancel. On confirm: session stays IN_PROGRESS (resume window applies); kid goes to `/kind`.

### E.4 Optimistic feedback

Already partially specified in A.5 (MC visual feedback). Generalise: every game shows the feedback state immediately on tap (using the kid's own claim about their answer), then reconciles when the server responds. If server disagrees (rare — network jitter, idempotency conflict), correct the UI gracefully.

### E.5 Haptic on correct

`navigator.vibrate(40)` on correct answer (browser-supported, no-op on desktop). 40ms is a single subtle pulse.

### E.6 "Nog 1 vraag" anticipation

On the LAST question of a quiz, prepend "Nog 1 vraag!" above the question text. Subtle motivator.

### E.7 ARIA polish

Items from B.4 plus: focus management — when a feedback overlay appears, focus moves to the "Volgende" button automatically; when the next question loads, focus moves to the first interactive element (e.g. first MC option).

---

## §8 — Schema changes (cumulative)

| Change | Theme | Migration |
|---|---|---|
| `Question.payload.hint?: string` | A | JSON schema — no Prisma migration; quiz-schemas.ts update |
| `Session.perQuestion[i].hintUsed: boolean` | A | JSON schema; no migration |
| `Session.perQuestion[i].reviewOf?: string` | A | JSON schema; no migration |
| `Session.perQuestion[i].attempt: number` | C.4 | JSON schema; no migration |
| `Question.payload.options[i].image?: {src, alt}` (MC) | D.6 | JSON schema; no migration |

All payload-level changes are validated in `src/lib/quiz-schemas.ts` (Zod). No DB schema migration required for any theme.

---

## §9 — Testing strategy (cumulative)

Per theme each adds its own slice; combined coverage:

**Unit (Vitest):**
- `src/lib/type-tolerance.test.ts` — A.2 normalisation + Levenshtein cases
- `src/lib/review-queue.test.ts` — A.4 round computation
- Game component snapshot/behaviour tests for reveal states

**E2E (Playwright):**
- Wrong MC → see correct option highlighted green, wrong red
- Wrong Type → see kid's typed answer + canonical answer
- Match wrong pair → both items return; pair turns green on retry
- Drag a DragOrder item — visible reorder via real drag (touch + mouse)
- Catapult two-tap — first tap aims, second fires
- TTS button speaks question text (mock SpeechSynthesis)
- Pause → freeze timer → resume

---

## §10 — Rollout

All themes are additive (new UI affordances, schema extends are JSON-shape only). No flag-gating required for the themes themselves.

**Suggested ship order:** A → B → C → D → E. Each is one PR.

After A ships, kid feedback should be measurably more useful (verified via the `QuestionStat.correctCount` trajectory from the engagement spec — same questions should see higher correct rates as kids learn from corrections).

After D ships, retention metrics (kids returning daily) should improve — verified via the `DailyKidStat` rows from the engagement spec.

---

## Open items / known tensions

1. **Hint cost calibration.** -3 coins/hint is a guess; refine based on real usage. If kids never hint, lower the cost or make it free for groep 1-3.
2. **Review queue interaction with mastery.** EWMA only counts the first attempt — discussed above. Verify in code review that the implementation respects this.
3. **TTS voice quality varies wildly by OS.** Windows Edge voice for `nl-NL` is mediocre; Safari macOS is better. We accept this for v1; future improvement is a curated audio file library per question (much bigger lift).
4. **Real drag library size.** `@dnd-kit` is small (~20kb gzipped) and well-maintained, but every new dep is a maintenance tax. If we want zero new deps, native HTML5 drag works but touch support requires polyfills.
