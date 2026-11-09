"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, MapPin, FileText } from "lucide-react";
import { Lead, ProjectStage } from "@/types/solar";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { SolarQuotationDocument } from "@/components/SolarQuotationDocument";
import { maskConsumerNumber } from "@/lib/quotation-utils";
import { useLanguage } from "@/context/LanguageContext";
import type { PaymentSummary } from "@/lib/payment-utils";

interface TrackProjectClientProps {
  initialLead: Lead;
}

const ORDERED_STAGES: ProjectStage[] = [
  "LEAD_APPROVED",
  "SITE_SURVEY",
  "QUOTATION_APPROVED",
  "ADVANCE_PAYMENT",
  "INSTALLATION",
  "NET_METERING",
  "SUBSIDY_APPLICATION",
  "SUBSIDY_CREDITED",
];

export function TrackProjectClient({ initialLead }: TrackProjectClientProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { user, setIsAuthModalOpen } = useAuth();
  const [lead, setLead] = useState(initialLead);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const maskedConsumer = maskConsumerNumber(lead.billExtraction?.consumerNumber);
  const currentStageIndex = ORDERED_STAGES.indexOf(lead.status);
  const activeOption = lead.quote?.options?.find((option) => option.systemSizeKw === lead.recommendedKw) || lead.quote?.options?.[0];
  const isCustomer = user?.role === "HOMEOWNER";
  const canAccept = isCustomer && (!lead.ownerUserId || lead.ownerUserId === user.id) && lead.status !== "QUOTATION_APPROVED";

  useEffect(() => {
    if (!isCustomer || !user) return;
    let active = true;
    void fetch(`/api/payments?projectId=${encodeURIComponent(lead.id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => { if (active && data?.summary) setPaymentSummary(data.summary); })
      .catch(() => {});
    return () => { active = false; };
  }, [isCustomer, lead.id, user]);

  const acceptEstimate = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsAccepting(true);
    setError("");
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "QUOTATION_APPROVED", recommendedKw: lead.recommendedKw }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("acceptEstimateFailed"));
      setLead(data.lead);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("acceptEstimateFailed"));
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 transition-colors sm:px-6 print:hidden">
        <Link href={user?.role === "HOMEOWNER" ? "/track" : "/"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" /> {user?.role === "HOMEOWNER" ? t("backToProjects") : t("backToSolarSaathi")}
        </Link>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-100 pb-6 dark:border-slate-800 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{t("projectReferenceLabel")} {lead.id}</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{t("rooftopEstimate")}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><MapPin className="h-4 w-4 text-emerald-700" />{lead.address}, {lead.city} · {lead.pincode}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 px-5 py-4 dark:bg-emerald-950/40">
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("recommendedSystem")}</p>
                <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">{lead.recommendedKw} kW</p>
                {activeOption && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t("indicativeNetCost")} {formatCurrency(activeOption.netCost)}</p>}
              </div>
              <Link
                href={`/quote/${lead.id}`}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#123D2B] hover:bg-[#198754] text-white text-xs font-bold transition shadow-sm"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{t("pdfQuote")}</span>
              </Link>
            </div>
          </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-950 sm:grid-cols-4">
          <div><p className="text-xs text-slate-400">{t("monthlyUse")}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{lead.avgUnitsPerMonth} kWh</p></div>
          <div><p className="text-xs text-slate-400">{t("monthlyBillLabel")}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(lead.monthlyBill)}</p></div>
          <div><p className="text-xs text-slate-400">{t("estimatedSubsidy")}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{activeOption ? formatCurrency(activeOption.subsidyAmount) : "—"}</p></div>
          <div><p className="text-xs text-slate-400">{t("consumerNumberLabel")}</p><p className="mt-1 font-mono font-semibold text-slate-800 dark:text-slate-200">{maskedConsumer || "—"}</p></div>
        </div>

        {isCustomer && paymentSummary && <section aria-label="Project payment summary" className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20"><h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Project payment summary</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div><p className="text-xs text-slate-500">Project amount</p><p className="mt-1 font-semibold">{formatCurrency(paymentSummary.projectAmount)}</p></div><div><p className="text-xs text-slate-500">Amount paid</p><p className="mt-1 font-semibold">{formatCurrency(paymentSummary.totalPaid)}</p></div><div><p className="text-xs text-slate-500">Remaining balance</p><p className="mt-1 font-semibold">{formatCurrency(paymentSummary.remainingBalance)}</p></div><div><p className="text-xs text-slate-500">Payment status</p><p className="mt-1 font-semibold">{paymentSummary.status}</p></div></div><p className="mt-3 text-[11px] text-slate-500">Mock tracking only. This does not confirm a real payment.</p></section>}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{t("projectEstimateDisclaimer")}</div>

        <div>
          <div className="mb-5"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("projectProgress")}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("projectProgressHint")}</p></div>
          <div className="relative space-y-6 pl-8 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
            {ORDERED_STAGES.map((stage, index) => {
              const milestone = lead.timeline?.find((item) => item.stage === stage);
              const localizedStage = t(`stage_${stage}`);
              const completed = index < currentStageIndex || (index === currentStageIndex && lead.status === "SUBSIDY_CREDITED");
              const current = index === currentStageIndex && lead.status !== "SUBSIDY_CREDITED";
              return <article key={stage} className="relative">
                <span className={`absolute -left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm dark:border-slate-900 ${completed ? "bg-emerald-600" : current ? "bg-[#123D2B] ring-4 ring-emerald-500/15" : "bg-slate-300 dark:bg-slate-700"}`}>{completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center"><h3 className={`text-sm font-semibold ${completed || current ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>{localizedStage !== `stage_${stage}` ? localizedStage : milestone?.title || `${index + 1}. ${stage.replaceAll("_", " ")}`}</h3>{milestone?.completedAt && <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" />{new Date(milestone.completedAt).toLocaleDateString(lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}</div>
                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{t("pendingStageDescription")}</p>
                {current && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {t("currentStage")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      Status update notification generated (WhatsApp Mock)
                    </span>
                  </div>
                )}
              </article>;
            })}
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {canAccept && <div className="flex flex-col justify-between gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900 dark:text-white">{t("readyToMoveForward")}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("acceptEstimatePrompt")}</p></div><button type="button" onClick={acceptEstimate} disabled={isAccepting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174b32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216642] disabled:opacity-60">{isAccepting ? t("saving") : t("acceptEstimate")}<ArrowRight className="h-4 w-4" /></button></div>}
        {lead.status === "QUOTATION_APPROVED" && <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{t("estimateAccepted")}</div>}
      </section>
    </main>

    {/* Dedicated Quotation Print View */}
    <div id="dedicated-solar-quotation" className="hidden print:block">
      <SolarQuotationDocument lead={lead} selectedKw={lead.recommendedKw} />
    </div>
  </>
  );
}
