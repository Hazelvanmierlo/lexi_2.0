// Hand-written row shapes mirroring the Prisma schema.
//
// Prisma 7 emits `@ts-nocheck` on all generated client files, which makes
// the inferred return types of `db.x.findMany()` collapse to `any` in
// strict-mode consumers. We work around that by declaring the shapes the
// page code actually uses here. Keep this in sync with prisma/schema.prisma.

import type { GameType, Region, Subject, Tier } from "@/generated/prisma/enums";

export type DbHousehold = {
  id: string;
  ownerEmail: string;
  region: Region;
  subscriptionTier: Tier | null;
  subscriptionStatus:
    | "TRIALING"
    | "ACTIVE"
    | "PAST_DUE"
    | "CANCELED"
    | "INCOMPLETE"
    | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DbParent = {
  id: string;
  householdId: string;
  clerkUserId: string;
  email: string;
  role: "PARENT" | "ADMIN";
  createdAt: Date;
};

export type DbKid = {
  id: string;
  householdId: string;
  name: string;
  groep: number;
  avatar: unknown;
  coins: number;
  createdAt: Date;
};

export type DbQuiz = {
  id: string;
  title: string;
  subject: Subject;
  groep: number;
  region: Region;
  gameType: GameType;
  customExplain: string;
  status: "CONCEPT" | "LIVE";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DbQuizWithCount = DbQuiz & {
  _count: { questions: number };
};

export type DbSessionForStats = {
  startedAt: Date;
  finishedAt: Date | null;
  correctCount: number;
  coinsEarned: number;
};

export type DbWorkbookSku = {
  id: string;
  title: string;
  subject: Subject;
  groepBucket: string;
  priceCents: number;
  stripePriceId: string | null;
  coverSymbol: string;
  tint: string;
  active: boolean;
  createdAt: Date;
};

export type DbBundleSku = {
  id: string;
  title: string;
  groepBucket: string;
  priceCents: number;
  originalCents: number;
  stripePriceId: string | null;
  body: string;
  active: boolean;
  createdAt: Date;
};

export type DbSubscriptionSku = {
  id: string;
  tier: Tier;
  title: string;
  priceCents: number;
  intervalLabel: string;
  body: string;
  badge: string;
  stripePriceId: string | null;
};

export type DbMasteryRecord = {
  id: string;
  kidId: string;
  subject: Subject;
  score: number;
  sessionsCount: number;
  lastSeenAt: Date;
};
