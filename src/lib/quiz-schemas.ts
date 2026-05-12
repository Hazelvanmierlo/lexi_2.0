// Discriminated-union validators for Question.payload.
//
// The shape of a question's payload depends on the parent Quiz.gameType.
// Storing this as a Json column in Postgres is fine; the safety guarantee
// lives here. Every code path that reads or writes a Question MUST run
// the payload through validatePayload(gameType, payload) first.
//
// Spec: design_handoff/README.md §8.

import { z } from "zod";

// Shared bits ────────────────────────────────────────────────────────────────

const nonEmpty = z.string().min(1);

// MC — Multiple choice ──────────────────────────────────────────────────────
//   { q, options[4], correctIdx }
export const McPayload = z.object({
  q: nonEmpty,
  options: z.array(nonEmpty).length(4),
  correctIdx: z.number().int().min(0).max(3),
});
export type McPayload = z.infer<typeof McPayload>;

// TYPE — Intypen (typed answer with fuzzy accept) ──────────────────────────
//   { q, answer, accept?[] }
export const TypePayload = z.object({
  q: nonEmpty,
  answer: nonEmpty,
  accept: z.array(nonEmpty).optional(), // additional accepted spellings
});
export type TypePayload = z.infer<typeof TypePayload>;

// CATAPULT — same answer space as MC, different presentation ───────────────
//   { q, options[4], correctIdx }
export const CatapultPayload = z.object({
  q: nonEmpty,
  options: z.array(nonEmpty).length(4),
  correctIdx: z.number().int().min(0).max(3),
});
export type CatapultPayload = z.infer<typeof CatapultPayload>;

// MATCH — 5 left/right pairs ────────────────────────────────────────────────
//   { q, pairs: [{ l, r }] * 5 }
export const MatchPayload = z.object({
  q: nonEmpty,
  pairs: z.array(z.object({ l: nonEmpty, r: nonEmpty })).length(5),
});
export type MatchPayload = z.infer<typeof MatchPayload>;

// DRAG_ORDER — sort items into the correct sequence ────────────────────────
//   { q, items: string[], correctOrder: string[] }
//   correctOrder is a permutation of items.
export const DragOrderPayload = z
  .object({
    q: nonEmpty,
    items: z.array(nonEmpty).min(2).max(8),
    correctOrder: z.array(nonEmpty).min(2).max(8),
  })
  .refine(
    (p) =>
      p.items.length === p.correctOrder.length &&
      [...p.items].sort().every((v, i) => v === [...p.correctOrder].sort()[i]),
    { message: "correctOrder must be a permutation of items" },
  );
export type DragOrderPayload = z.infer<typeof DragOrderPayload>;

// Discriminated dispatch ────────────────────────────────────────────────────

export type GameType = "MC" | "TYPE" | "CATAPULT" | "MATCH" | "DRAG_ORDER";

const SCHEMAS = {
  MC: McPayload,
  TYPE: TypePayload,
  CATAPULT: CatapultPayload,
  MATCH: MatchPayload,
  DRAG_ORDER: DragOrderPayload,
} as const;

export type AnyPayload =
  | McPayload
  | TypePayload
  | CatapultPayload
  | MatchPayload
  | DragOrderPayload;

export function validatePayload(gameType: GameType, payload: unknown): AnyPayload {
  return SCHEMAS[gameType].parse(payload) as AnyPayload;
}

export function safeValidatePayload(
  gameType: GameType,
  payload: unknown,
): { ok: true; data: AnyPayload } | { ok: false; error: z.ZodError } {
  const r = SCHEMAS[gameType].safeParse(payload);
  return r.success ? { ok: true, data: r.data as AnyPayload } : { ok: false, error: r.error };
}

// Server-side grading. The client tells the server what the kid did; the
// server says whether it counts. Never trust client-supplied correctness.
export function gradeAnswer(
  gameType: GameType,
  payload: AnyPayload,
  answer: unknown,
): boolean {
  switch (gameType) {
    case "MC":
    case "CATAPULT": {
      const p = payload as McPayload;
      return typeof answer === "number" && answer === p.correctIdx;
    }
    case "TYPE": {
      const p = payload as TypePayload;
      if (typeof answer !== "string") return false;
      const normalize = (s: string) =>
        s.trim().toLocaleLowerCase("nl-NL").replace(/\s+/g, " ");
      const target = [p.answer, ...(p.accept ?? [])].map(normalize);
      return target.includes(normalize(answer));
    }
    case "MATCH": {
      const p = payload as MatchPayload;
      // answer = array of {l, r} mappings in any order
      if (!Array.isArray(answer)) return false;
      if (answer.length !== p.pairs.length) return false;
      const expected = new Set(p.pairs.map((x) => `${x.l}|${x.r}`));
      const given = new Set(
        (answer as Array<{ l?: unknown; r?: unknown }>).map(
          (x) => `${String(x?.l ?? "")}|${String(x?.r ?? "")}`,
        ),
      );
      if (expected.size !== given.size) return false;
      for (const v of expected) if (!given.has(v)) return false;
      return true;
    }
    case "DRAG_ORDER": {
      const p = payload as DragOrderPayload;
      if (!Array.isArray(answer)) return false;
      if (answer.length !== p.correctOrder.length) return false;
      return answer.every((v, i) => v === p.correctOrder[i]);
    }
  }
}
