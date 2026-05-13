import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Btn } from "@/components/ui/btn";
import { MascotImage } from "@/components/ui/mascot";
import { RegionPicker } from "./region-picker";
import { NavCartIcon } from "./nav-cart-icon";

export function Nav() {
  const t = useTranslations("nav");
  const links: { label: string; href: string }[] = [
    { label: t("howItWorks"), href: "/#hoe" },
    { label: t("together"),   href: "/#samen" },
    { label: t("subjects"),   href: "/#vakken" },
    { label: t("shop"),       href: "/shop" },
    { label: t("wordLid"),    href: "/word-lid" },
    { label: t("faq"),        href: "/#faq" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-line-2 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto items-center justify-between gap-6 px-5 py-3">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <MascotImage style="bot" age="kid" size={32} decorative className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Lexi<span className="text-primary">.kids</span>
          </span>
        </Link>

        {/* Desktop — middle nav links */}
        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-7 text-sm text-ink-2 md:flex"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop — right side: signin + region + cart + CTA */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <RegionPicker />
          <Link href="/login" className="text-sm text-ink-2 hover:text-ink">
            {t("signIn")}
          </Link>
          <NavCartIcon />
          <Btn href="/signup">{t("ctaTrial")}</Btn>
        </div>

        {/* Mobile — region picker + cart + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <RegionPicker />
          <NavCartIcon />
          <button
            type="button"
            aria-label={t("menu")}
            className="rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
