import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentHousehold, currentParent } from "@/lib/auth";
import { LogoutButton } from "@/components/ouder/logout-button";
import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/landing/footer";
import { MascotImage } from "@/components/ui/mascot";
import { Coins, Flame, TrendingUp, MessageCircle } from "lucide-react";
import type {
  DbHousehold,
  DbKid,
  DbParent,
  DbSessionForStats,
} from "@/lib/db-types";

type ParentWithRel = DbParent & {
  household: DbHousehold & { kids: DbKid[] };
};

// View-model the page renders against. Both the demo path and the auth-on
// path normalize into this shape so the JSX below stays unchanged.
type OuderViewModel = {
  parentEmail: string;
  household: {
    id: string;
    subscriptionTier: "MONTHLY" | "YEARLY" | "FAMILY" | null;
    trialEndsAt: Date | null;
  };
  kids: Array<{ id: string; name: string; groep: number }>;
};

export const dynamic = "force-dynamic";

// Demo identity used when AUTH is disabled.
const DEMO_PARENT_ID = "seed-parent-demo";

async function loadDemoHousehold(): Promise<OuderViewModel | null> {
  const parent = (await db.parent.findUnique({
    where: { id: DEMO_PARENT_ID },
    include: {
      household: { include: { kids: true } },
    },
  })) as ParentWithRel | null;
  if (!parent) return null;
  return {
    parentEmail: parent.email,
    household: {
      id: parent.household.id,
      subscriptionTier: parent.household.subscriptionTier,
      trialEndsAt: parent.household.trialEndsAt,
    },
    kids: parent.household.kids.map((k) => ({
      id: k.id,
      name: k.name,
      groep: k.groep,
    })),
  };
}

async function loadAuthedHousehold(): Promise<OuderViewModel | null> {
  const parent = await currentParent();
  if (!parent) return null;
  const household = await currentHousehold();
  if (!household) return null;
  // currentHousehold() doesn't return subscription fields, so we do an
  // extra targeted lookup keyed off the household id.
  const subscription = (await db.household.findUnique({
    where: { id: household.id },
    select: { subscriptionTier: true, trialEndsAt: true },
  })) as Pick<DbHousehold, "subscriptionTier" | "trialEndsAt"> | null;
  return {
    parentEmail: parent.email,
    household: {
      id: household.id,
      subscriptionTier: subscription?.subscriptionTier ?? null,
      trialEndsAt: subscription?.trialEndsAt ?? null,
    },
    kids: household.kids.map((k) => ({
      id: k.id,
      name: k.name,
      groep: k.groep,
    })),
  };
}

// SEO learning-goal rows stay static until MasteryRecord ships — replacing
// these is a one-line swap-over.
type Row = { code: string; topic: string; pct: number; color: string };
const DEMO_ROWS: Row[] = [
  { code: "REK-5.1", topic: "Decimale getallen lezen", pct: 92, color: "bg-ok" },
  { code: "REK-5.2", topic: "Kommagetallen optellen", pct: 78, color: "bg-primary" },
  { code: "REK-5.3", topic: "Breuken vergelijken", pct: 100, color: "bg-ok" },
  { code: "REK-5.4", topic: "Breuken optellen", pct: 42, color: "bg-sun" },
  { code: "REK-5.5", topic: "Verhoudingstabel", pct: 18, color: "bg-line" },
];

function startOfWeek(d = new Date()) {
  const start = new Date(d);
  const day = (start.getDay() + 6) % 7; // monday = 0
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default async function OuderPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-bg-2">
        <OuderBody />
      </main>
      <Footer />
    </>
  );
}

async function OuderBody() {
  const t = await getTranslations("ouder");
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

  const data = authEnabled
    ? await loadAuthedHousehold()
    : await loadDemoHousehold();

  if (authEnabled && !data) redirect("/login?next=/ouder");
  if (!data) {
    throw new Error(
      `Demo parent "${DEMO_PARENT_ID}" not found. Run "npm run db:seed" first — see docs/backend.md.`,
    );
  }

  const kids = data.kids;
  const primaryKid: { id: string; name: string; groep: number } | undefined =
    kids[0];

  // This-week stats — server-side aggregation.
  const weekStart = startOfWeek();
  const sessionsThisWeek: DbSessionForStats[] = primaryKid
    ? ((await db.session.findMany({
        where: {
          kidId: primaryKid.id,
          startedAt: { gte: weekStart },
          status: "COMPLETED",
        },
        select: {
          finishedAt: true,
          startedAt: true,
          correctCount: true,
          coinsEarned: true,
        },
      })) as DbSessionForStats[])
    : [];

  const totalMs = sessionsThisWeek.reduce(
    (acc, s) =>
      acc +
      ((s.finishedAt ?? s.startedAt).getTime() - s.startedAt.getTime()),
    0,
  );
  const totalCorrect = sessionsThisWeek.reduce(
    (acc, s) => acc + s.correctCount,
    0,
  );

  const stats = [
    {
      id: "minutes",
      icon: Coins,
      label: "Geoefend",
      value: `${Math.round(totalMs / 60_000)} min`,
    },
    { id: "streak", icon: Flame, label: "Streak", value: "—" },
    {
      id: "levels",
      icon: TrendingUp,
      label: "Goed beantwoord",
      value: `${totalCorrect}`,
    },
  ];

  const parentNameFromEmail = data.parentEmail.split("@")[0].split(/[+.]/)[0];

  return (
    <div className="mx-auto max-w-[980px] px-5 py-10 md:py-16">
      {/* Greeting */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
            {t("kicker")} · week {weekNumber(new Date())}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {t("greeting", { name: capitalize(parentNameFromEmail) || "ouder" })}
          </h1>
        </div>
        {authEnabled && <LogoutButton />}
      </header>

      {/* Kid list */}
      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-2">
          {t("kidsLabel")}
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {kids.map((k) => (
            <li key={k.id}>
              <Link
                href="/kind"
                className="flex items-center gap-3 rounded-lexi-lg border border-line bg-card p-4 hover:border-primary hover:shadow-lexi-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
                  <MascotImage
                    style="bot"
                    age="kid"
                    size={40}
                    decorative
                    className="h-10 w-10"
                  />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-ink">
                    {k.name}
                  </p>
                  <p className="text-xs text-ink-2">groep {k.groep}</p>
                </div>
                <span aria-hidden="true" className="ml-auto text-ink-3">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Weekly report */}
      <section className="mt-8 overflow-hidden rounded-lexi-lg border border-line bg-card shadow-lexi">
        <div className="flex items-center justify-between border-b border-line-2 bg-bg-2 px-6 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
              WEEKRAPPORT · WEEK {weekNumber(new Date())}
            </p>
            <p className="mt-0.5 font-display text-lg font-bold text-ink">
              {primaryKid
                ? `${primaryKid.name} ${sessionsThisWeek.length > 0 ? "had een goede week." : "is nog niet gestart."}`
                : "Geen kinderen gekoppeld."}
            </p>
          </div>
          <span className="rounded-full border border-line bg-card px-3 py-1 text-xs text-ink-2">
            3 min lezen
          </span>
        </div>

        <ul className="grid gap-3 p-6 sm:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.id} className="rounded-lexi border border-line-2 p-4">
                <div className="flex items-center gap-2 text-xs text-ink-3">
                  <Icon className="h-4 w-4" />
                  <span>{s.label}</span>
                </div>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
                  {s.value}
                </p>
              </li>
            );
          })}
        </ul>

        <ul className="px-6 pb-6">
          {DEMO_ROWS.map((r) => (
            <li key={r.code} className="border-t border-line-2 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="font-mono text-xs text-ink-3">{r.code}</span>
                  <span className="truncate text-sm text-ink">{r.topic}</span>
                </div>
                <span className="font-mono text-xs text-ink-2">{r.pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-2">
                <div
                  className={`h-full ${r.color}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Gespreksstarter */}
        <div className="border-t border-line-2 bg-sun-soft p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lexi border border-sun bg-card">
              <MessageCircle className="h-4 w-4 text-ink" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
                {t("starter.kicker")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {t("starter.body")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription management */}
      <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lexi-lg border border-line bg-card p-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            {t("manageSection.title")}
          </h3>
          <p className="mt-1 text-sm text-ink-2">
            {subscriptionLine(data.household)}
          </p>
        </div>
        <a
          href="https://billing.stripe.com/p/login/test"
          className="inline-flex items-center rounded-lexi border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("manageSection.cta")}
        </a>
      </section>
    </div>
  );
}

function subscriptionLine(h: {
  subscriptionTier: "MONTHLY" | "YEARLY" | "FAMILY" | null;
  trialEndsAt: Date | null;
}): string {
  if (h.trialEndsAt && h.trialEndsAt > new Date()) {
    const days = Math.ceil(
      (h.trialEndsAt.getTime() - Date.now()) / 86_400_000,
    );
    return `Proefperiode — nog ${days} dagen gratis.`;
  }
  switch (h.subscriptionTier) {
    case "MONTHLY":
      return "Maandelijks · €11,95 / maand.";
    case "YEARLY":
      return "Jaarlijks · €119 / jaar.";
    case "FAMILY":
      return "Gezinsabonnement · €19,95 / maand (4 kinderen).";
    default:
      return "Geen actief abonnement.";
  }
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function weekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = (target.getTime() - firstThursday.getTime()) / 86_400_000;
  return 1 + Math.round(diff / 7);
}
