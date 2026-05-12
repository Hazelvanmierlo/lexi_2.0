import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { createQuiz } from "../actions";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewQuizPage() {
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED === "true") {
    await requireAdmin();
  }
  async function action(formData: FormData) {
    "use server";
    await createQuiz({
      title: String(formData.get("title") ?? ""),
      subject: formData.get("subject") as
        | "REKENEN"
        | "TAAL"
        | "LEZEN"
        | "WERELD"
        | "ENGELS",
      groep: Number(formData.get("groep") ?? 5),
      region: (formData.get("region") as "NL" | "BE") ?? "NL",
      gameType: formData.get("gameType") as
        | "MC"
        | "TYPE"
        | "CATAPULT"
        | "MATCH"
        | "DRAG_ORDER",
      customExplain: String(formData.get("customExplain") ?? ""),
    });
  }

  return (
    <>
      <AdminHeader />
      <main id="main-content" className="mx-auto max-w-[860px] px-5 py-10">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">
          <Link href="/admin/quizzen" className="hover:text-ink">
            Admin · Content
          </Link>{" "}
          / nieuwe quiz
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Nieuwe quiz
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-2">
          Vul de basisgegevens in. Je voegt vragen toe op de volgende stap, en
          publiceert pas als alle 10 vragen kloppen.
        </p>

        <form action={action} className="mt-8 grid gap-5">
          <Field label="Titel" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              maxLength={120}
              placeholder="Bv. Tafels van 3 en 5"
              className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-ink"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Vak" htmlFor="subject">
              <select
                id="subject"
                name="subject"
                defaultValue="REKENEN"
                className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-ink"
              >
                <option value="REKENEN">Rekenen</option>
                <option value="TAAL">Taal</option>
                <option value="LEZEN">Lezen</option>
                <option value="WERELD">Wereld</option>
                <option value="ENGELS">Engels</option>
              </select>
            </Field>
            <Field label="Groep" htmlFor="groep">
              <input
                id="groep"
                name="groep"
                type="number"
                min={1}
                max={8}
                defaultValue={5}
                className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-ink"
              />
            </Field>
            <Field label="Regio" htmlFor="region">
              <select
                id="region"
                name="region"
                defaultValue="NL"
                className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-ink"
              >
                <option value="NL">Nederland</option>
                <option value="BE">België</option>
              </select>
            </Field>
          </div>

          <Field label="Speltype" htmlFor="gameType">
            <select
              id="gameType"
              name="gameType"
              defaultValue="MC"
              className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-ink"
            >
              <option value="MC">Multiple choice</option>
              <option value="TYPE">Intypen</option>
              <option value="CATAPULT">Katapult</option>
              <option value="MATCH">Match-paren</option>
              <option value="DRAG_ORDER">Slepen & sorteren</option>
            </select>
          </Field>

          <Field
            label="Uitleg voor het kind"
            htmlFor="customExplain"
            hint="Wordt op het uitleg-scherm getoond voordat de quiz start."
          >
            <textarea
              id="customExplain"
              name="customExplain"
              rows={4}
              maxLength={800}
              placeholder="Korte intro in 1–2 zinnen."
              className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-ink"
            />
          </Field>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-lexi bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Quiz aanmaken
            </button>
            <Link
              href="/admin/quizzen"
              className="inline-flex items-center rounded-lexi border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink hover:bg-bg-2"
            >
              Annuleren
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-ink"
      >
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-ink-3">{hint}</p>}
      {children}
    </div>
  );
}
