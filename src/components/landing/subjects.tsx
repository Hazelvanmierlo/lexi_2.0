import { useTranslations } from "next-intl";
import { Calculator, Type, BookOpen, Globe, Languages } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

const SUBJECTS = [
  { key: "rekenen" as const, Icon: Calculator, tint: "bg-teal-soft text-ink", border: "border-teal" },
  { key: "taal"    as const, Icon: Type,       tint: "bg-primary-soft text-primary-ink", border: "border-primary" },
  { key: "lezen"   as const, Icon: BookOpen,   tint: "bg-sun-soft text-ink", border: "border-sun" },
  { key: "wereld"  as const, Icon: Globe,      tint: "bg-plum-soft text-ink", border: "border-plum" },
  { key: "engels"  as const, Icon: Languages,  tint: "bg-ok-soft text-ink",   border: "border-ok" },
];

export function Subjects() {
  const t = useTranslations("subjects");
  const s = useTranslations("subjects.items");
  const c = useTranslations("common");
  return (
    <section id="vakken" className="px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead", { groep: c("groep"), groepRange: c("groepRange") })}
          center
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 md:grid-cols-3 lg:grid-cols-5">
          {SUBJECTS.map((sub) => (
            <li
              key={sub.key}
              className={`rounded-lexi-lg border ${sub.border} ${sub.tint} p-6 shadow-lexi-sm`}
            >
              <sub.Icon className="h-8 w-8" />
              <h3 className="mt-4 font-display text-xl font-bold">{s(`${sub.key}.title`)}</h3>
              <p className="mt-2 text-sm text-ink-2">{s(`${sub.key}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
