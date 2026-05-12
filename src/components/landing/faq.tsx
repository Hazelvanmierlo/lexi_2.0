"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

type Item = { q: string; a: string };

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as Item[];
  return (
    <section id="faq" className="bg-bg-2 px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} center />
        <Accordion.Root
          type="single"
          collapsible
          className="mx-auto mt-12 max-w-3xl rounded-lexi-lg border border-line bg-card md:mt-16"
        >
          {items.map((it, i) => (
            <Accordion.Item
              key={it.q}
              value={`item-${i}`}
              className="border-b border-line-2 last:border-b-0"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-ink hover:bg-bg-2">
                  <span className="font-medium">{it.q}</span>
                  <ChevronDown className="h-4 w-4 text-ink-3 transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-6 pb-4 text-ink-2">
                {it.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
