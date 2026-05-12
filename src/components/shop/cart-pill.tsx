"use client";

import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";

export function CartPill() {
  const t = useTranslations("shop.cart");
  return (
    <button
      type="button"
      aria-label={t("label")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-white shadow-lexi-lg hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ShoppingCart className="h-5 w-5" />
      <span>{t("empty")}</span>
    </button>
  );
}
