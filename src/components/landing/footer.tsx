import Link from "next/link";
import { useTranslations } from "next-intl";

const COLUMNS: { titleKey: "products" | "forParents" | "company" | "legal"; links: { labelKey: string; href: string }[] }[] = [
  {
    titleKey: "products",
    links: [
      { labelKey: "landing", href: "/" },
      { labelKey: "shop", href: "/shop" },
      { labelKey: "tryQuestion", href: "/probeer" },
      { labelKey: "pricing", href: "#prijzen" },
    ],
  },
  {
    titleKey: "forParents",
    links: [
      { labelKey: "blog", href: "/blog" },
      { labelKey: "about", href: "/over-ons" },
      { labelKey: "contact", href: "/contact" },
    ],
  },
  {
    titleKey: "company",
    links: [
      { labelKey: "about", href: "/over-ons" },
      { labelKey: "contact", href: "/contact" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { labelKey: "terms", href: "/voorwaarden" },
      { labelKey: "privacy", href: "/privacy" },
      { labelKey: "cookies", href: "/cookies" },
    ],
  },
];

export function Footer() {
  const t = useTranslations("footer");
  const common = useTranslations("common");
  return (
    <footer className="border-t-2 border-line bg-card px-5 py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="font-display text-2xl font-bold text-ink">Lexi.kids</div>
            <p className="mt-2 max-w-xs text-sm text-ink-2">{t("tagline")}</p>
            <p className="mt-4 text-xs text-ink-2">{common("company")}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h3 className="text-sm font-semibold text-ink">{t(col.titleKey)}</h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-2">
                {col.links.map((l) => (
                  <li key={l.labelKey}>
                    <Link href={l.href} className="hover:text-ink">
                      {t(`links.${l.labelKey}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-xs text-ink-2">{t("copyright")}</p>
      </div>
    </footer>
  );
}
