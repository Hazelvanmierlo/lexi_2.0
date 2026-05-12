"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  updateQuiz,
  upsertQuestion,
  removeQuestion,
  setQuizStatus,
  deleteQuiz,
} from "@/app/admin/quizzen/actions";
import type { GameType, Region, Subject } from "@/generated/prisma/enums";
import { McQuestionForm } from "./question-forms/mc-question-form";
import { TypeQuestionForm } from "./question-forms/type-question-form";
import { MatchQuestionForm } from "./question-forms/match-question-form";
import { DragOrderQuestionForm } from "./question-forms/drag-order-question-form";

type QuizMeta = {
  id: string;
  title: string;
  subject: Subject;
  groep: number;
  region: Region;
  gameType: GameType;
  customExplain: string;
  status: "CONCEPT" | "LIVE";
};

type Question = {
  id: string;
  order: number;
  payload: unknown;
};

export function QuizEditor({
  quiz,
  questions: initialQuestions,
}: {
  quiz: QuizMeta;
  questions: Question[];
}) {
  const [meta, setMeta] = useState<QuizMeta>(quiz);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [error, setError] = useState<string | null>(null);
  const [, startTx] = useTransition();

  function onSaveMeta() {
    setError(null);
    startTx(async () => {
      try {
        await updateQuiz({
          id: meta.id,
          title: meta.title,
          subject: meta.subject,
          groep: meta.groep,
          region: meta.region,
          gameType: meta.gameType,
          customExplain: meta.customExplain,
        });
      } catch (e) {
        setError(`Bewaren mislukt: ${(e as Error).message}`);
      }
    });
  }

  function onSaveQuestion(question: Question, payload: unknown) {
    setError(null);
    startTx(async () => {
      try {
        const newId = await upsertQuestion({
          quizId: meta.id,
          questionId: question.id.startsWith("draft-") ? undefined : question.id,
          order: question.order,
          payload,
        });
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === question.id ? { ...q, id: newId, payload } : q,
          ),
        );
      } catch (e) {
        setError(`Vraag ${question.order}: ${(e as Error).message}`);
      }
    });
  }

  function onDeleteQuestion(question: Question) {
    if (question.id.startsWith("draft-")) {
      setQuestions((prev) => prev.filter((q) => q.id !== question.id));
      return;
    }
    if (!confirm(`Vraag ${question.order} verwijderen?`)) return;
    setError(null);
    startTx(async () => {
      try {
        await removeQuestion({ questionId: question.id });
        setQuestions((prev) => prev.filter((q) => q.id !== question.id));
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function onAddQuestion() {
    const order = (questions.at(-1)?.order ?? 0) + 1;
    setQuestions((prev) => [
      ...prev,
      {
        id: `draft-${order}-${Math.random().toString(36).slice(2, 8)}`,
        order,
        payload: defaultPayload(meta.gameType),
      },
    ]);
  }

  function onTogglePublish() {
    setError(null);
    startTx(async () => {
      try {
        await setQuizStatus({
          id: meta.id,
          status: meta.status === "LIVE" ? "CONCEPT" : "LIVE",
        });
        setMeta((m) => ({
          ...m,
          status: m.status === "LIVE" ? "CONCEPT" : "LIVE",
        }));
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function onDeleteQuiz() {
    if (!confirm(`Quiz "${meta.title}" verwijderen? Dit kan niet ongedaan.`))
      return;
    setError(null);
    startTx(async () => {
      try {
        await deleteQuiz({ id: meta.id });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="mt-6 space-y-8">
      {error && (
        <div className="rounded-lexi border border-primary bg-primary-soft px-4 py-3 text-sm text-primary-ink">
          {error}
        </div>
      )}

      {/* Status + actions strip */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lexi-lg border border-line bg-card p-4">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              meta.status === "LIVE"
                ? "bg-ok-soft text-ink"
                : "bg-sun-soft text-ink"
            }`}
          >
            {meta.status === "LIVE" ? "● Live" : "◌ Concept"}
          </span>
          <span className="font-mono text-xs text-ink-3">
            {questions.length} / 10 vragen
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/kind/spelen/${meta.id}`}
            className="inline-flex items-center rounded-lexi border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg-2"
          >
            Bekijk als kind →
          </Link>
          <button
            type="button"
            onClick={onTogglePublish}
            className="inline-flex items-center rounded-lexi bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            {meta.status === "LIVE" ? "Naar concept" : "Live zetten"}
          </button>
          <button
            type="button"
            onClick={onDeleteQuiz}
            className="inline-flex items-center gap-1.5 rounded-lexi border border-primary bg-card px-3 py-1.5 text-xs font-semibold text-primary-ink hover:bg-primary-soft"
          >
            <Trash2 className="h-3.5 w-3.5" /> Verwijder
          </button>
        </div>
      </section>

      {/* Metadata form */}
      <section className="rounded-lexi-lg border border-line bg-card p-6">
        <h2 className="font-display text-lg font-bold text-ink">Basisgegevens</h2>
        <div className="mt-5 grid gap-5">
          <Field label="Titel">
            <input
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 outline-none focus:border-ink"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Vak">
              <select
                value={meta.subject}
                onChange={(e) =>
                  setMeta({ ...meta, subject: e.target.value as Subject })
                }
                className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 outline-none focus:border-ink"
              >
                <option value="REKENEN">Rekenen</option>
                <option value="TAAL">Taal</option>
                <option value="LEZEN">Lezen</option>
                <option value="WERELD">Wereld</option>
                <option value="ENGELS">Engels</option>
              </select>
            </Field>
            <Field label="Groep">
              <input
                type="number"
                min={1}
                max={8}
                value={meta.groep}
                onChange={(e) =>
                  setMeta({ ...meta, groep: Number(e.target.value) })
                }
                className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 outline-none focus:border-ink"
              />
            </Field>
            <Field label="Regio">
              <select
                value={meta.region}
                onChange={(e) =>
                  setMeta({ ...meta, region: e.target.value as Region })
                }
                className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 outline-none focus:border-ink"
              >
                <option value="NL">Nederland</option>
                <option value="BE">België</option>
              </select>
            </Field>
          </div>
          <Field
            label="Speltype"
            hint="Let op: van speltype wisselen kan vragen ongeldig maken."
          >
            <select
              value={meta.gameType}
              onChange={(e) =>
                setMeta({ ...meta, gameType: e.target.value as GameType })
              }
              className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 outline-none focus:border-ink"
            >
              <option value="MC">Multiple choice</option>
              <option value="TYPE">Intypen</option>
              <option value="CATAPULT">Katapult</option>
              <option value="MATCH">Match-paren</option>
              <option value="DRAG_ORDER">Slepen & sorteren</option>
            </select>
          </Field>
          <Field label="Uitleg voor het kind">
            <textarea
              value={meta.customExplain}
              onChange={(e) =>
                setMeta({ ...meta, customExplain: e.target.value })
              }
              rows={3}
              className="w-full rounded-lexi border border-line bg-card px-3 py-2.5 outline-none focus:border-ink"
            />
          </Field>
          <div>
            <button
              type="button"
              onClick={onSaveMeta}
              className="inline-flex items-center rounded-lexi bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Basisgegevens opslaan
            </button>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Vragen</h2>
          <button
            type="button"
            onClick={onAddQuestion}
            className="rounded-lexi border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg-2"
          >
            + Vraag toevoegen
          </button>
        </div>
        <ol className="mt-4 space-y-4">
          {questions.length === 0 && (
            <li className="rounded-lexi-lg border border-dashed border-line bg-card p-8 text-center text-sm text-ink-3">
              Nog geen vragen. Klik op &ldquo;+ Vraag toevoegen&rdquo;.
            </li>
          )}
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-lexi-lg border border-line bg-card p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-ink-3">
                  Vraag {q.order}
                  {q.id.startsWith("draft-") && (
                    <span className="ml-2 rounded bg-sun-soft px-2 py-0.5 text-[10px] font-bold text-ink">
                      ONGESLAGEN
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteQuestion(q)}
                  className="inline-flex items-center gap-1.5 rounded-lexi border border-line bg-card px-2.5 py-1 text-xs font-medium text-ink hover:bg-bg-2"
                >
                  <Trash2 className="h-3 w-3" /> Verwijder
                </button>
              </div>
              <QuestionFormSwitch
                gameType={meta.gameType}
                initial={q.payload}
                onSave={(payload) => onSaveQuestion(q, payload)}
              />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function defaultPayload(gameType: GameType): unknown {
  switch (gameType) {
    case "MC":
    case "CATAPULT":
      return { q: "", options: ["", "", "", ""], correctIdx: 0 };
    case "TYPE":
      return { q: "", answer: "" };
    case "MATCH":
      return {
        q: "",
        pairs: Array.from({ length: 5 }, () => ({ l: "", r: "" })),
      };
    case "DRAG_ORDER":
      return { q: "", items: ["", "", ""], correctOrder: ["", "", ""] };
  }
}

function QuestionFormSwitch({
  gameType,
  initial,
  onSave,
}: {
  gameType: GameType;
  initial: unknown;
  onSave: (payload: unknown) => void;
}) {
  switch (gameType) {
    case "MC":
    case "CATAPULT":
      return <McQuestionForm initial={initial} onSave={onSave} />;
    case "TYPE":
      return <TypeQuestionForm initial={initial} onSave={onSave} />;
    case "MATCH":
      return <MatchQuestionForm initial={initial} onSave={onSave} />;
    case "DRAG_ORDER":
      return <DragOrderQuestionForm initial={initial} onSave={onSave} />;
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-ink-3">{hint}</p>}
      {children}
    </div>
  );
}
