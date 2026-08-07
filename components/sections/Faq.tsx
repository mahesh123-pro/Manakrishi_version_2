"use client";

import { useT } from "@/lib/i18n/context";
import { FAQS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  const t = useT();
  const items = FAQS.map((f) => ({ q: t(f.q), a: t(f.a) }));

  return (
    <Section id="faq" className="bg-[var(--background-2)]/40">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          align="left"
          eyebrow={t("faq.eyebrow")}
          title={t("faq.title")}
          description="Everything you need to know about booking drone spraying with Manakrishi."
        />
        <Reveal>
          <Accordion items={items} />
        </Reveal>
      </div>
    </Section>
  );
}
