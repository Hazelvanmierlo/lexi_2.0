// Seeds the local DB with the same content already hardcoded into the
// /admin/quizzen, /shop, /kind and /ouder pages so the UI doesn't change
// after pages are switched over to read from Prisma.
//
// Idempotent: re-running `npm run db:seed` updates rather than duplicates.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { validatePayload, type GameType } from "../src/lib/quiz-schemas";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set — see docs/backend.md.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

// ─── household + people ────────────────────────────────────────────────────

const HOUSEHOLD_ID = "seed-household-demo";
const PARENT_ID = "seed-parent-demo";
const KID_ID = "seed-kid-sara";

async function seedHousehold() {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await db.household.upsert({
    where: { id: HOUSEHOLD_ID },
    update: { region: "NL", trialEndsAt },
    create: {
      id: HOUSEHOLD_ID,
      ownerEmail: "demo+marieke@lexi.kids",
      region: "NL",
      subscriptionTier: "MONTHLY",
      subscriptionStatus: "TRIALING",
      trialEndsAt,
    },
  });

  await db.parent.upsert({
    where: { id: PARENT_ID },
    update: { role: "ADMIN" },
    create: {
      id: PARENT_ID,
      householdId: HOUSEHOLD_ID,
      clerkUserId: "seed_user_marieke", // replace once Clerk is wired
      email: "demo+marieke@lexi.kids",
      role: "ADMIN",
    },
  });

  await db.kid.upsert({
    where: { id: KID_ID },
    update: { coins: 428, groep: 5 },
    create: {
      id: KID_ID,
      householdId: HOUSEHOLD_ID,
      name: "Sara",
      groep: 5,
      coins: 428,
    },
  });

  await db.kidConsent.upsert({
    where: { kidId: KID_ID },
    update: {},
    create: {
      kidId: KID_ID,
      parentEmail: "demo+marieke@lexi.kids",
      consentedAt: new Date(),
      ipAddress: "127.0.0.1",
      userAgent: "seed/1.0",
    },
  });
}

// ─── quizzes ───────────────────────────────────────────────────────────────

type SeedQuiz = {
  id: string;
  title: string;
  subject: "REKENEN" | "TAAL" | "LEZEN" | "WERELD" | "ENGELS";
  groep: number;
  gameType: GameType;
  customExplain: string;
  questions: unknown[]; // validated below
  status?: "LIVE" | "CONCEPT";
};

const QUIZZES: SeedQuiz[] = [
  {
    id: "seed-quiz-tafels-3-5",
    title: "Tafels van 3 en 5",
    subject: "REKENEN",
    groep: 5,
    gameType: "MC",
    customExplain:
      "We oefenen de tafels van 3 en 5. Kies steeds het goede antwoord uit de 4 opties.",
    questions: makeMcQuestions([
      ["3 × 4", ["10", "12", "14", "16"], 1],
      ["5 × 6", ["25", "28", "30", "35"], 2],
      ["3 × 7", ["18", "21", "24", "27"], 1],
      ["5 × 8", ["35", "40", "45", "50"], 1],
      ["3 × 9", ["24", "26", "27", "30"], 2],
      ["5 × 4", ["18", "20", "22", "24"], 1],
      ["3 × 8", ["21", "24", "27", "30"], 1],
      ["5 × 9", ["40", "42", "45", "48"], 2],
      ["3 × 6", ["15", "18", "21", "24"], 1],
      ["5 × 7", ["30", "32", "35", "40"], 2],
    ]),
  },
  {
    id: "seed-quiz-spelling-dt",
    title: "Spelling: -d of -t",
    subject: "TAAL",
    groep: 6,
    gameType: "CATAPULT",
    customExplain:
      "Schiet de katapult op het juiste antwoord. Werkwoordspelling — kies tussen -d en -t.",
    questions: makeMcQuestions([
      ["Hij wand…", ["wandeld", "wandelt", "wandeld", "wandeldt"], 1],
      ["Zij verteld…", ["verteld", "vertelt", "verteldt", "verteld."], 1],
      ["Hij vind…", ["vind", "vint", "vindt", "vindd"], 2],
      ["Wij worden…", ["worden", "wordt", "worde", "wort"], 0],
      ["Hij antwoord…", ["antwoord", "antwoort", "antwoordt", "antwoordd"], 2],
      ["Zij houd…", ["houd", "hout", "houdt", "houdd"], 2],
      ["Het bestond…", ["bestond", "bestont", "bestondt", "bestondd"], 0],
      ["Hij rij…", ["rij", "rijt", "rijdt", "rijdd"], 2],
    ]),
  },
  {
    id: "seed-quiz-engelse-dieren",
    title: "Engelse dieren",
    subject: "ENGELS",
    groep: 5,
    gameType: "MATCH",
    customExplain:
      "Koppel het Engelse woord aan het Nederlandse dier. Sleep ze naar elkaar.",
    questions: makeMatchQuestions([
      [
        ["dog", "hond"],
        ["cat", "kat"],
        ["bird", "vogel"],
        ["horse", "paard"],
        ["fish", "vis"],
      ],
      [
        ["mouse", "muis"],
        ["cow", "koe"],
        ["sheep", "schaap"],
        ["pig", "varken"],
        ["rabbit", "konijn"],
      ],
      [
        ["bear", "beer"],
        ["wolf", "wolf"],
        ["fox", "vos"],
        ["deer", "hert"],
        ["owl", "uil"],
      ],
      [
        ["lion", "leeuw"],
        ["tiger", "tijger"],
        ["elephant", "olifant"],
        ["monkey", "aap"],
        ["zebra", "zebra"],
      ],
      [
        ["snake", "slang"],
        ["frog", "kikker"],
        ["spider", "spin"],
        ["bee", "bij"],
        ["ant", "mier"],
      ],
      [
        ["shark", "haai"],
        ["whale", "walvis"],
        ["octopus", "octopus"],
        ["crab", "krab"],
        ["dolphin", "dolfijn"],
      ],
      [
        ["chicken", "kip"],
        ["duck", "eend"],
        ["goose", "gans"],
        ["turkey", "kalkoen"],
        ["rooster", "haan"],
      ],
      [
        ["camel", "kameel"],
        ["giraffe", "giraf"],
        ["kangaroo", "kangoeroe"],
        ["panda", "panda"],
        ["koala", "koala"],
      ],
      [
        ["eagle", "adelaar"],
        ["penguin", "pinguïn"],
        ["seagull", "meeuw"],
        ["swan", "zwaan"],
        ["dove", "duif"],
      ],
      [
        ["butterfly", "vlinder"],
        ["worm", "worm"],
        ["snail", "slak"],
        ["ladybug", "lieveheersbeestje"],
        ["dragonfly", "libel"],
      ],
    ]),
  },
  {
    id: "seed-quiz-breuken-volgorde",
    title: "Breuken op volgorde",
    subject: "REKENEN",
    groep: 6,
    gameType: "DRAG_ORDER",
    customExplain:
      "Sleep de breuken van klein naar groot. Denk aan een pizza: hoe groter het stuk, hoe groter de breuk.",
    questions: makeOrderQuestions([
      ["1/8", "1/4", "1/2", "3/4"],
      ["1/6", "1/3", "1/2", "2/3"],
      ["1/10", "1/5", "1/4", "1/2"],
      ["1/4", "1/3", "2/5", "1/2"],
      ["2/8", "1/3", "1/2", "5/8"],
      ["1/12", "1/6", "1/4", "1/3"],
    ]),
  },
  {
    id: "seed-quiz-werkwoord-intypen",
    title: "Werkwoord intypen",
    subject: "TAAL",
    groep: 4,
    gameType: "TYPE",
    customExplain:
      "Typ het juiste werkwoord. Spelling-tolerant: je hoeft niet bang te zijn voor hoofdletters of spaties.",
    questions: makeTypeQuestions([
      ["De hond ___ over het hek. (springen, t.t.)", "springt"],
      ["Sara ___ haar fiets. (pakken, t.t.)", "pakt"],
      ["Wij ___ naar school. (lopen, t.t.)", "lopen"],
      ["Hij ___ het boek. (lezen, t.t.)", "leest"],
      ["Jij ___ snel. (rennen, t.t.)", "rent"],
      ["Zij ___ een liedje. (zingen, t.t.)", "zingt"],
      ["De kat ___ op de bank. (slapen, t.t.)", "slaapt"],
      ["Ik ___ een appel. (eten, t.t.)", "eet"],
      ["De bus ___ stil. (staan, t.t.)", "staat"],
      ["Mijn broer ___ goed voetbal. (spelen, t.t.)", "speelt"],
    ]),
  },
];

function makeMcQuestions(rows: Array<[string, string[], number]>) {
  return rows.map(([q, options, correctIdx]) => ({ q, options, correctIdx }));
}
function makeMatchQuestions(rows: Array<Array<[string, string]>>) {
  return rows.map((pairs, i) => ({
    q: i === 0 ? "Koppel het juiste paar" : "Koppel de paren",
    pairs: pairs.map(([l, r]) => ({ l, r })),
  }));
}
function makeOrderQuestions(rows: string[][]) {
  return rows.map((items) => ({
    q: "Zet van klein naar groot",
    items: [...items].reverse(), // present jumbled
    correctOrder: items,
  }));
}
function makeTypeQuestions(rows: Array<[string, string]>) {
  return rows.map(([q, answer]) => ({ q, answer }));
}

async function seedQuizzes() {
  for (const q of QUIZZES) {
    // Validate every payload through Zod first so we never seed garbage.
    q.questions.forEach((payload, i) => {
      try {
        validatePayload(q.gameType, payload);
      } catch (err) {
        throw new Error(
          `Invalid seed payload for ${q.id} q[${i}]: ${(err as Error).message}`,
        );
      }
    });

    await db.quiz.upsert({
      where: { id: q.id },
      update: {
        title: q.title,
        subject: q.subject,
        groep: q.groep,
        gameType: q.gameType,
        customExplain: q.customExplain,
        status: q.status ?? "LIVE",
        publishedAt: new Date(),
      },
      create: {
        id: q.id,
        title: q.title,
        subject: q.subject,
        groep: q.groep,
        region: "NL",
        gameType: q.gameType,
        customExplain: q.customExplain,
        status: q.status ?? "LIVE",
        publishedAt: new Date(),
      },
    });

    // Replace questions wholesale on re-seed.
    await db.question.deleteMany({ where: { quizId: q.id } });
    await db.question.createMany({
      data: q.questions.map((payload, i) => ({
        quizId: q.id,
        order: i + 1,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: payload as any,
      })),
    });
  }
}

// ─── shop catalogue ────────────────────────────────────────────────────────

const SUBSCRIPTION_SKUS = [
  {
    tier: "MONTHLY" as const,
    title: "Lexi.kids Maandelijks",
    priceCents: 1195,
    intervalLabel: "per maand",
    body: "Volledige toegang voor één kind. 14 dagen gratis proberen, geen creditcard.",
    badge: "POPULAIR",
  },
  {
    tier: "YEARLY" as const,
    title: "Lexi.kids Jaarlijks",
    priceCents: 11900,
    intervalLabel: "per jaar",
    body: "Voordeligste optie. Alles inclusief, plus toegang tot oefenboeken digitaal.",
    badge: "VOORDELIG",
  },
  {
    tier: "FAMILY" as const,
    title: "Gezinsabonnement",
    priceCents: 1995,
    intervalLabel: "per maand",
    body: "Eén account, vier kindprofielen. Ideaal voor gezinnen met meer dan één kind.",
    badge: "GEZIN",
  },
];

const BUNDLES = [
  {
    id: "seed-bundle-3-4",
    title: "Compleet pakket groep 3-4",
    groepBucket: "3-4",
    priceCents: 3995,
    originalCents: 5585,
    body: "4 werkboeken + 1 maand abonnement",
  },
  {
    id: "seed-bundle-5-6",
    title: "Compleet pakket groep 5-6",
    groepBucket: "5-6",
    priceCents: 4495,
    originalCents: 6080,
    body: "4 werkboeken + 1 maand abonnement",
  },
  {
    id: "seed-bundle-7-8",
    title: "Cito-pakket groep 7-8",
    groepBucket: "7-8",
    priceCents: 4995,
    originalCents: 6880,
    body: "4 werkboeken + 2 maanden abonnement",
  },
];

const WORKBOOK_SUBJECTS = [
  { key: "TAAL" as const,    label: "Taal",              symbol: "A", tint: "bg-teal-soft" },
  { key: "REKENEN" as const, label: "Rekenen",           symbol: "∑", tint: "bg-primary-soft" },
  { key: "LEZEN" as const,   label: "Begrijpend Lezen",  symbol: "B", tint: "bg-sun-soft" },
];

const WORKBOOK_HIGHLIGHTS = [
  "64 pagina's oefenstof",
  "Uitlegvideo's via QR-code bij elke opgave",
  "Past bij Cito, IEP en ROUTE 8",
  "Ontwikkeld door ervaren leerkrachten",
];

function workbookDescription(label: string, n: number): string {
  return `Dit werkboek is ontwikkeld voor leerlingen in groep ${n} en sluit aan op het reguliere basisschoolprogramma. Met heldere oefeningen, korte uitleg en stap-voor-stap voorbeelden bouwt je kind zelfvertrouwen op in ${label.toLowerCase()}.

Het boek behandelt de belangrijkste onderwerpen voor groep ${n}. Elke opgave heeft een QR-code naar een korte uitlegvideo, zodat een vastgelopen oefening nooit een blokkade wordt.

Geschikt voor zelfstandig oefenen na schooltijd of als aanvulling op huiswerk. Past bij de Cito-, IEP- en ROUTE 8-toetsen.`;
}

function workbookIsbn(subjectKey: "TAAL" | "REKENEN" | "LEZEN", n: number): string {
  const subjectOffset = subjectKey === "TAAL" ? 0 : subjectKey === "REKENEN" ? 100 : 200;
  const suffix = String(218833 + n + subjectOffset).padStart(6, "0");
  return `9789493${suffix}`;
}

async function seedShop() {
  for (const s of SUBSCRIPTION_SKUS) {
    await db.subscriptionSku.upsert({
      where: { tier: s.tier },
      update: { ...s },
      create: { ...s },
    });
  }
  for (const b of BUNDLES) {
    await db.bundleSku.upsert({
      where: { id: b.id },
      update: { ...b },
      create: { ...b },
    });
  }
  // Workbooks: replace existing rows wholesale with 24 (3 subjects × 8 groeps).
  // The spec moves groepBucket from "1-2"/"3-4"/... to single digits "1".."8".
  await db.workbookSku.deleteMany({});
  // sortOrder heuristic: lower = more popular. Younger groeps for Taal/Rekenen
  // are the strongest sellers in Junior-Einstein-like shops; Lezen has a
  // middle-groep peak. Formula: groep * 10 + subjectOrder (1=Taal, 2=Rekenen,
  // 3=Lezen). Real popularity replaces this when order-history exists.
  const SUBJECT_ORDER: Record<string, number> = { TAAL: 1, REKENEN: 2, LEZEN: 3 };
  for (const s of WORKBOOK_SUBJECTS) {
    for (let n = 1; n <= 8; n++) {
      const slug = `${s.key.toLowerCase()}-groep-${n}`;
      await db.workbookSku.create({
        data: {
          slug,
          title: `${s.label} groep ${n}`,
          subject: s.key,
          groepBucket: String(n),
          priceCents: 1695,
          coverSymbol: s.symbol,
          tint: s.tint,
          description: workbookDescription(s.label, n),
          pages: 64,
          isbn: workbookIsbn(s.key, n),
          highlights: WORKBOOK_HIGHLIGHTS,
          sortOrder: n * 10 + SUBJECT_ORDER[s.key],
        },
      });
    }
  }
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("→ seeding household + people");
  await seedHousehold();
  console.log("→ seeding quizzes + questions");
  await seedQuizzes();
  console.log("→ seeding shop catalogue");
  await seedShop();
  console.log("✓ seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
