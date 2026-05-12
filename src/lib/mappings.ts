// Bridges between Prisma enum values (UPPER_SNAKE) and the kebab/lower keys
// the UI components, message catalogues and existing URL slugs already use.
// Importing from one place keeps the four DB-backed pages in sync.

import type { GameType, Subject } from "@/generated/prisma/enums";

// ─── subject ───────────────────────────────────────────────────────────────

export type SubjectUi = "rekenen" | "taal" | "lezen" | "engels" | "wereld";

const SUBJECT_TO_UI: Record<Subject, SubjectUi> = {
  REKENEN: "rekenen",
  TAAL: "taal",
  LEZEN: "lezen",
  ENGELS: "engels",
  WERELD: "wereld",
};

const SUBJECT_TO_DB: Record<SubjectUi, Subject> = {
  rekenen: "REKENEN",
  taal: "TAAL",
  lezen: "LEZEN",
  engels: "ENGELS",
  wereld: "WERELD",
};

export const subjectToUi = (s: Subject): SubjectUi => SUBJECT_TO_UI[s];
export const subjectToDb = (s: SubjectUi): Subject => SUBJECT_TO_DB[s];

/** Human-readable label for admin tables. */
export function subjectLabel(s: Subject): string {
  switch (s) {
    case "REKENEN":
      return "Rekenen";
    case "TAAL":
      return "Taal";
    case "LEZEN":
      return "Lezen";
    case "ENGELS":
      return "Engels";
    case "WERELD":
      return "Wereld";
  }
}

// ─── game type ─────────────────────────────────────────────────────────────

export type GameTypeUi = "mc" | "type" | "match" | "drag-order" | "catapult";

const GAMETYPE_TO_UI: Record<GameType, GameTypeUi> = {
  MC: "mc",
  TYPE: "type",
  MATCH: "match",
  DRAG_ORDER: "drag-order",
  CATAPULT: "catapult",
};

export const gameTypeToUi = (g: GameType): GameTypeUi => GAMETYPE_TO_UI[g];

// ─── money ─────────────────────────────────────────────────────────────────

/**
 * Format an integer cents value as a Dutch-style euro string.
 *   centsToEuro(1195)  → "€11,95"
 *   centsToEuro(11900) → "€119"   (whole euros drop the ,00)
 */
export function centsToEuro(cents: number): string {
  const euros = cents / 100;
  if (Number.isInteger(euros)) return `€${euros}`;
  return `€${euros.toFixed(2).replace(".", ",")}`;
}

// ─── subject visual tokens (kept here so admin / kid / shop agree) ─────────

export type SubjectTokens = { tint: string; barColor: string };

const SUBJECT_TOKENS: Record<Subject, SubjectTokens> = {
  REKENEN: { tint: "bg-primary-soft", barColor: "bg-primary" },
  TAAL: { tint: "bg-teal-soft", barColor: "bg-teal" },
  LEZEN: { tint: "bg-ok-soft", barColor: "bg-ok" },
  WERELD: { tint: "bg-sun-soft", barColor: "bg-sun" },
  ENGELS: { tint: "bg-plum-soft", barColor: "bg-plum" },
};

export const subjectTokens = (s: Subject): SubjectTokens => SUBJECT_TOKENS[s];
