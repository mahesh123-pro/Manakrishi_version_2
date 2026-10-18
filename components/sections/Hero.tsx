"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Leaf, MapPin, Plane, Sprout, Tractor } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { HeroMedia } from "./HeroMedia";

export function Hero() {
  const t = useT();
  const c = (en: string, te: string) => t({ en, te });
  return <>
    <section className="fullscreen-home-hero relative mt-[88px] min-h-[calc(100svh-88px)] overflow-hidden bg-forest">
      <HeroMedia>
        <div className="hero-overlaid pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-88px)] w-[92%] max-w-7xl items-center pt-12 pb-36 sm:pt-16 sm:pb-32">
          <div className="hero-copy pointer-events-auto max-w-xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"><Sprout className="h-3.5 w-3.5" />{c("Local roots. Smarter farming.", "మన నేల. తెలివైన వ్యవసాయం.")}</span>
            <h1 className="font-heading text-[clamp(2.7rem,5.7vw,5.8rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-white">{c("Better care.", "మెరుగైన సంరక్షణ.")}<br />{c("Every crop.", "ప్రతి పంటకు.")}<br /><span className="text-[#d5edb4]">{c("Every acre.", "ప్రతి ఎకరానికి.")}</span></h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/85 sm:text-base">{c("Precision drone spraying and dependable farm services, brought to your field. Spend less time coordinating and more time growing.", "కచ్చితమైన డ్రోన్ స్ప్రేయింగ్ మరియు నమ్మకమైన వ్యవసాయ సేవలు మీ పొలం వద్దకే. పంటపై మరింత దృష్టి పెట్టండి.")}</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/book" className="farm-button">{t("hero.cta.book")}<ArrowUpRight className="h-4 w-4" /></Link><a href="#services" className="farm-button-secondary">{t("hero.cta.services")}<ArrowDown className="h-4 w-4" /></a></div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-white/85">{["hero.trust.operators", "hero.trust.booking", "hero.trust.support"].map(key => <span key={key} className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[#d5edb4]" />{t(key)}</span>)}</div>
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/70"><MapPin className="h-4 w-4 text-[#d5edb4]" />{t("hero.local.title")}</div>
          </div>
        </div>
      </HeroMedia>
    </section>
    <div className="border-b border-green/10 bg-[#f5f8ef] py-5"><div className="mx-auto grid w-[92%] max-w-7xl gap-3 sm:grid-cols-3">
      {[{ href: "/book?service=drone", icon: Plane, en: "Precision drone spraying", te: "కచ్చితమైన డ్రోన్ స్ప్రేయింగ్", sub: "A better way to protect your crop", subTe: "మీ పంటను సంరక్షించే మెరుగైన మార్గం" }, { href: "/book?service=tractor", icon: Tractor, en: "Tractors & field preparation", te: "ట్రాక్టర్లు & భూమి తయారీ", sub: "Get your land ready for the season", subTe: "పంట కోసం భూమిని సిద్ధం చేయండి" }, { href: "/support", icon: Leaf, en: "Support that stays local", te: "స్థానిక సహాయం", sub: "A real team to plan your next step", subTe: "మీ తదుపరి పనికి మా బృందం" }].map(item => <Link key={item.href} href={item.href} className="home-service-link group flex items-center gap-3 rounded-2xl border border-green/10 bg-white/70 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green/5 text-green"><item.icon className="h-5 w-5" /></span><span className="min-w-0"><span className="block text-xs font-semibold text-green">{c(item.en, item.te)}</span><span className="mt-1 block text-[10px] leading-4 text-muted">{c(item.sub, item.subTe)}</span></span><ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-green/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>)}
    </div></div>
  </>;
}
