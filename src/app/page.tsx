"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, FileCheck2, Sun, WalletCards } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SolarIntakeForm = dynamic(
  () => import("@/components/SolarIntakeForm").then((module) => module.SolarIntakeForm),
  {
    ssr: false,
    loading: () => (
      <div className="h-[560px] animate-pulse rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 h-5 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />)}
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="pb-20">
      <section className="relative isolate overflow-hidden bg-[#f2f6f2] dark:bg-[#091710]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#315d47] shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
              <Sun className="h-4 w-4 text-amber-500" /> {t("region")}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-[#17251d] dark:text-white sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              {t("heroDescription")}
            </p>
            <a href="#estimate" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#174b32] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#216642]">
              {t("getQuote")} <ArrowDown className="h-4 w-4" />
            </a>
            <p className="mt-4 max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">{t("estimateNote")}</p>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[28px] shadow-xl shadow-emerald-950/10 sm:min-h-[380px]">
            <Image
              src="/images/hero-solar-rooftop.jpg"
              alt="Rooftop solar panels in bright daylight"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
              <div>
                <p className="text-sm font-semibold">{t("photoCaption")}</p>
                <p className="mt-1 text-xs text-white/75">{t("photoLocation")}</p>
              </div>
              <span className="rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium backdrop-blur">{t("illustrativePhoto")}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="estimate" className="mx-auto max-w-5xl scroll-mt-28 px-4 pt-10 sm:px-6 lg:px-8">
        <SolarIntakeForm />
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#198754]">{t("howItWorksEyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{t("howItWorksTitle")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: FileCheck2, title: t("processStepOneTitle"), description: t("processStepOneText") },
            { icon: Sun, title: t("processStepTwoTitle"), description: t("processStepTwoText") },
            { icon: WalletCards, title: t("processStepThreeTitle"), description: t("processStepThreeText") },
          ].map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f3ec] text-[#174b32] dark:bg-emerald-950 dark:text-emerald-300">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400">0{index + 1}</p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
