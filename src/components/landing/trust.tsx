import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";

// TODO(real-testimonials): replace prototype quotes once the product team
// supplies real ones. Spec: docs/superpowers/specs/2026-05-08-lexi-landing-design.md
type Testimonial = { quote: string; author: string; context: string };

export function Trust() {
  const t = useTranslations("trust");
  const items = t.raw("testimonials") as Testimonial[];
  return (
    <section className="bg-bg-2 px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <ul className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.author}
              className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm"
            >
              <p className="text-ink">&ldquo;{it.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-medium text-ink">{it.author}</p>
              <p className="text-xs text-ink-2">{it.context}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
