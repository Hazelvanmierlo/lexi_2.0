import { useTranslations } from "next-intl";
import { SubjectTile } from "./subject-tile";

type Subject = {
  id: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  pct: number;
  tint: string;
  barColor: string;
};

type Props = { subjects: Subject[] };

export function MijnVakken({ subjects }: Props) {
  const t = useTranslations("kid.mijnVakken");
  const s = useTranslations("kid.subjects");
  return (
    <section>
      <h2 className="font-display text-base font-bold uppercase tracking-wider text-ink-2">
        {t("title")}
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {subjects.map((sub) => (
          <li key={sub.id}>
            <SubjectTile id={sub.id} label={s(sub.id)} pct={sub.pct} tint={sub.tint} barColor={sub.barColor} />
          </li>
        ))}
      </ul>
    </section>
  );
}
