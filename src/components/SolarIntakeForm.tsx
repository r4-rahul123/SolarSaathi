"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Home,
  Zap,
  ArrowRight,
  RefreshCw,
  Edit3,
  ShieldCheck,
} from "lucide-react";
import { BillExtraction, Lead, OccupancyType, RoofType } from "@/types/solar";
import { QuoteDisplay } from "./QuoteDisplay";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { clearPendingEstimate, loadPendingEstimate, savePendingEstimate } from "@/lib/pending-estimate-storage";
import { getBusinessSupportMailto } from "@/config/business";

interface SolarIntakeFormProps {
  onLeadCreated?: (lead: Lead) => void;
}
export function SolarIntakeForm({ onLeadCreated }: SolarIntakeFormProps) {
  const { lang, t } = useLanguage();
  const { user, setIsAuthModalOpen } = useAuth();
  const getDisplayError = (message: string | undefined, fallbackKey: string) =>
    lang === "en" && message ? message : t(fallbackKey);

  // Step State: 1 = Details, 2 = AI Bill Verification, 3 = Quote
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Nagpur");
  const [occupancy, setOccupancy] = useState<OccupancyType>("Owner");
  const [roofType, setRoofType] = useState<RoofType>("Concrete Flat");
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(650);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Bill & AI Extraction State
  const [billImageBase64, setBillImageBase64] = useState<string>("");
  const [billMimeType, setBillMimeType] = useState<string>("");
  const [aiReadFailed, setAiReadFailed] = useState(false);
  const [billFileName, setBillFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extraction, setExtraction] = useState<BillExtraction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Extracted Fields
  const [consumerNumber, setConsumerNumber] = useState<string>("");
  const [tariff, setTariff] = useState<string>("");
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(0);
  const [monthlyUnits, setMonthlyUnits] = useState<number>(0);
  const [monthlyBill, setMonthlyBill] = useState<number>(0);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("resumeEstimate") !== "1") return;
    let active = true;
    const restoreDraft = async () => {
      try {
        let draft: { form: Record<string, unknown>; previewLead?: unknown } | null = null;
        try {
          draft = await loadPendingEstimate();
        } catch {
          // Fall back to the session draft for browsers where IndexedDB is unavailable.
        }
        if (!draft) {
          const saved = sessionStorage.getItem("solarsaathi-pending-estimate");
          if (saved && saved !== "indexeddb") draft = JSON.parse(saved);
        }
        if (!draft || !active) return;
        const form = draft.form as Record<string, unknown>;
        const readString = (key: string) => typeof form[key] === "string" ? form[key] as string : "";
        const readNumber = (key: string, fallback: number) => Number(form[key]) || fallback;
        const restoredImage = readString("billImageBase64");
        const restoredMime = readString("billMimeType");
        const restoredExtraction = form.extraction as typeof extraction;
        const restoredLead = draft.previewLead as Lead | null;
        const restoredOccupancy: OccupancyType = readString("occupancy") === "Tenant" ? "Tenant" : "Owner";
        const roofTypes: RoofType[] = ["Concrete Flat", "Tin Shed", "Tiled Roof", "Other"];
        const storedRoofType = readString("roofType") as RoofType;
        if (!active) return;
      queueMicrotask(() => {
        setName(readString("name"));
        setPhone(readString("phone"));
        setEmail(readString("email"));
        setAddress(readString("address"));
        setPincode(readString("pincode"));
        setCity(readString("city") || "Nagpur");
        setOccupancy(restoredOccupancy);
        setRoofType(roofTypes.includes(storedRoofType) ? storedRoofType : "Concrete Flat");
        setRoofAreaSqFt(readNumber("roofAreaSqFt", 650));
        setPrivacyConsent(true);
        setBillFileName(readString("billFileName"));
        if (restoredImage) setBillImageBase64(restoredImage);
        if (restoredMime) setBillMimeType(restoredMime);
        setExtraction(restoredExtraction || null);
        setConsumerNumber(readString("consumerNumber"));
        setTariff(readString("tariff"));
        setSanctionedLoad(readNumber("sanctionedLoad", 0));
        setMonthlyUnits(readNumber("monthlyUnits", 0));
        setMonthlyBill(readNumber("monthlyBill", 0));
        setPreviewLead(restoredLead || null);
        setStep(3);
        window.history.replaceState({}, "", `${window.location.pathname}#estimate`);
      });
      } catch (error) {
        console.error("Could not restore the saved estimate", error);
      }
    };
    void restoreDraft();
    return () => { active = false; };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg(t("invalidBillFile"));
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(t("billFileTooLarge"));
      e.target.value = "";
      return;
    }

    setErrorMsg(null);
    setExtraction(null);
    setConsumerNumber("");
    setTariff("");
    setSanctionedLoad(0);
    setMonthlyUnits(0);
    setMonthlyBill(0);
    setBillFileName(file.name);
    setBillMimeType(file.type);
    setAiReadFailed(false);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setBillImageBase64(base64);
      triggerAIExtraction(base64, file.type);
    };
    reader.onerror = () => setErrorMsg(t("couldNotOpenFile"));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const triggerAIExtraction = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAiReadFailed(false);

    try {
      const res = await fetch("/api/ai/parse-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze bill");

      const ext: BillExtraction = data.extraction;
      setExtraction(ext);
      const hasExtractedValue = Boolean(
        ext.consumerNumber || ext.tariff || ext.sanctionedLoadKw || ext.monthlyUnits || ext.monthlyAmount,
      );
      setAiReadFailed(!hasExtractedValue);

      if (ext.consumerNumber) setConsumerNumber(ext.consumerNumber);
      if (ext.tariff) setTariff(ext.tariff);
      if (ext.sanctionedLoadKw) setSanctionedLoad(ext.sanctionedLoadKw);
      if (ext.monthlyUnits) setMonthlyUnits(ext.monthlyUnits);
      if (ext.monthlyAmount) setMonthlyBill(ext.monthlyAmount);
    } catch {
      setAiReadFailed(true);
      setErrorMsg(getDisplayError(undefined, "billReadFailed"));
      setExtraction({
        confidence: { overall: "Unclear" },
        extractionNotes: t("billValuesNotRead"),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buildPayload = () => ({
    name: name.trim(), phone: phone.trim(), email: email.trim(),
    address: address.trim() || city, pincode: pincode.trim(), city, occupancy,
    roofType, roofAreaSqFt: Number(roofAreaSqFt), monthlyBill: Number(monthlyBill),
    avgUnitsPerMonth: Number(monthlyUnits), billImageName: billFileName,
    billExtraction: {
      ...extraction, consumerNumber: consumerNumber || undefined, tariff,
      sanctionedLoadKw: Number(sanctionedLoad), monthlyUnits: Number(monthlyUnits),
      monthlyAmount: Number(monthlyBill),
      extractionNotes: extraction?.extractionNotes || "Values entered by the customer.",
    },
  });

  const validateEstimate = (requireBill = true) => {
    if (!name.trim() || !phone.trim() || monthlyUnits <= 0 || monthlyBill <= 0 || sanctionedLoad <= 0 || !tariff.trim()) {
      setErrorMsg(t("contactFieldsRequired"));
      return false;
    }
    if (requireBill && !billImageBase64 && !extraction) {
      setErrorMsg(t("billUploadRequired"));
      return false;
    }
    return true;
  };

  const handlePreviewEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEstimate()) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/leads/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not calculate estimate");
      setPreviewLead(data.lead);
      setCreatedLead(null);
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : undefined;
      setErrorMsg(getDisplayError(msg, "estimateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEstimate = async () => {
    if (!user) {
      const formPayload = {
        name, phone, email, address, pincode, city, occupancy, roofType, roofAreaSqFt,
        billFileName, billImageBase64, billMimeType, extraction, consumerNumber, tariff,
        sanctionedLoad, monthlyUnits, monthlyBill
      };
      try {
        await savePendingEstimate({ form: formPayload, previewLead });
        sessionStorage.setItem("solarsaathi-pending-estimate", "indexeddb");
      } catch {
        try {
          const rest: Record<string, unknown> = { ...formPayload };
          delete rest.billImageBase64;
          delete rest.billMimeType;
          sessionStorage.setItem("solarsaathi-pending-estimate", JSON.stringify({ form: rest, previewLead }));
          setErrorMsg(t("billDraftStorageFallback"));
        } catch {
          setErrorMsg(t("billDraftStorageFailed"));
          return;
        }
      }
      setIsAuthModalOpen(true);
      return;
    }
    if (user.role !== "HOMEOWNER") {
      setErrorMsg(t("homeownerAccountRequired"));
      return;
    }
    if (!validateEstimate(false)) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload()) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save estimate");
      setCreatedLead(data.lead);
      setPreviewLead(null);
      sessionStorage.removeItem("solarsaathi-pending-estimate");
      void clearPendingEstimate().catch(() => {});
      onLeadCreated?.(data.lead);
    } catch (err: unknown) {
      setErrorMsg(getDisplayError(err instanceof Error ? err.message : undefined, "saveEstimateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3 && (createdLead || previewLead)) {
    const displayLead = createdLead || previewLead!;
    const breakdown = createdLead?.scoreBreakdown;
    const isSiteVisit = createdLead?.nextAction === "SITE_VISIT";

    return (
      <div className="space-y-6">
        {createdLead && <div className="print:hidden space-y-6">
        {/* Status Alert Banner */}
        {isSiteVisit ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-[#198754]/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4 backdrop-blur-sm shadow-md">
            <div className="p-3 bg-[#198754] text-white rounded-2xl shadow-md shrink-0">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#198754] text-white">
                  SURVEY REVIEW
                </span>
                <span className="text-xs font-bold text-[#123D2B] dark:text-emerald-300">
                  Ref: #{createdLead.id}
                </span>
              </div>
              <h4 className="font-black text-[#123D2B] dark:text-emerald-200 text-lg">
                Strong fit for a site survey
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                Based on the details provided, this lead is recommended for a survey review. Subsidy eligibility is checked separately.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4 backdrop-blur-sm shadow-md">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                  PHONE REVIEW
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Ref: #{createdLead.id}
                </span>
              </div>
              <h4 className="font-black text-amber-950 dark:text-amber-200 text-lg">
                A short phone review is recommended
              </h4>
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 mt-1 font-medium leading-relaxed">
                {breakdown?.explanation || createdLead.scoreReason || "A team member can discuss the next step with you."} This score guides the next step; it does not reject your request.
              </p>
            </div>
          </div>
        )}

        {/* 100-POINT TRANSPARENT SCORE BREAKDOWN CARD */}
        {breakdown && user?.role !== "HOMEOWNER" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#198754] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> How this lead was scored
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Solar Fit Score: {breakdown.totalScore} / 100
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Evaluation Tier</span>
                  <span
                    className={`font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider ${
                      breakdown.tier === "High"
                        ? "bg-[#E7F3EC] text-[#123D2B] border border-[#198754]/40"
                        : breakdown.tier === "Medium"
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {breakdown.tier} score · {createdLead?.nextAction === "SITE_VISIT" ? "Survey review" : "Short call first"}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Score Progress Bar */}
            <div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    breakdown.tier === "High" ? "bg-[#198754]" : breakdown.tier === "Medium" ? "bg-blue-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(breakdown.totalScore, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {breakdown.explanation}
              </p>
            </div>

            {/* Score Component Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[11px] font-medium">Roof Ownership</span>
                <span className="font-mono font-black text-[#123D2B] dark:text-emerald-400 text-sm">
                  {breakdown.ownershipPoints} / 25
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {occupancy === "Owner" ? "Owner (+25)" : "Tenant (+5)"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[11px] font-medium">Monthly Bill</span>
                <span className="font-mono font-black text-[#123D2B] dark:text-emerald-400 text-sm">
                  {breakdown.billPoints} / 25
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">₹{monthlyBill}/month</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[11px] font-medium">Shadow-Free Area</span>
                <span className="font-mono font-black text-[#123D2B] dark:text-emerald-400 text-sm">
                  {breakdown.roofAreaPoints} / 20
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">{roofAreaSqFt} sq. ft.</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[11px] font-medium">Power Consumption</span>
                <span className="font-mono font-black text-[#123D2B] dark:text-emerald-400 text-sm">
                  {breakdown.consumptionPoints} / 20
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">{monthlyUnits} kWh</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[11px] font-medium">Feeder Serviceability</span>
                <span className="font-mono font-black text-[#123D2B] dark:text-emerald-400 text-sm">
                  {breakdown.serviceabilityPoints} / 10
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">Nagpur PIN {pincode}</span>
              </div>
            </div>

            {/* Why Tele-Advisory Desk Notice */}
            <div className="p-3.5 bg-[#E7F3EC]/60 dark:bg-[#123D2B]/30 rounded-2xl border border-[#198754]/30 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
              <span>
                This score helps the team decide whether to start with a site survey or a short call. It does not determine subsidy eligibility.
              </span>
            </div>
          </div>
        )}
        </div>}

        <QuoteDisplay lead={displayLead} isPreview={!createdLead} isSavingEstimate={isSubmitting} onSaveEstimate={handleSaveEstimate} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-colors print:hidden">
      {/* Top Header & Step Progress Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#123D2B] text-white flex items-center justify-center font-black text-sm shadow-xs">
            {step === 1 ? "1" : "2"}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {step === 1 ? t("stepPropertyContact") : t("stepReviewBill")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {step === 1 ? `${t("homeownerEnquiry")} • ${t("region")}` : t("reviewBillValues")}
            </p>
          </div>
        </div>

      </div>

      <div className="p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
            <a className="shrink-0 font-bold underline underline-offset-2" href={getBusinessSupportMailto("General enquiry")}>
              {t("contactSupport")}
            </a>
          </div>
        )}

        {/* STEP 1: Personal & Rooftop Information */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name || !phone) {
                setErrorMsg(t("contactFieldsRequired"));
                return;
              }
              if (!/^\d{6}$/.test(pincode)) {
                setErrorMsg(t("invalidPinCode"));
                return;
              }
              if (!privacyConsent) {
                setErrorMsg(t("consentRequired"));
                return;
              }
              setErrorMsg(null);
              setStep(2);
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#198754]" />
                {t("contactInstallationAddress")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {t("pinServiceAreaHint")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("mobileFollowUp")}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t("mobilePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("emailForQuote")}
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("districtDivision")}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Nagpur">Nagpur</option>
                  <option value="Wardha">Wardha</option>
                  <option value="Amravati">Amravati</option>
                  <option value="Chandrapur">Chandrapur</option>
                  <option value="Bhandara">Bhandara</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("rooftopAddressPin")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("addressPlaceholder")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t("pinPlaceholder")}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    inputMode="numeric"
                    required
                    className="w-32 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] font-mono font-bold transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Home className="w-5 h-5 text-[#198754]" />
                {t("rooftopOwnershipStructure")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
                {t("ownershipEligibilityHint")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("ownerOrTenant")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOccupancy("Owner")}
                      className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl border transition-all cursor-pointer ${
                        occupancy === "Owner"
                          ? "bg-[#123D2B] text-white border-[#123D2B] shadow-md scale-[1.02]"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      ✓ {t("owner")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccupancy("Tenant")}
                      className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl border transition-all cursor-pointer ${
                        occupancy === "Tenant"
                          ? "bg-[#123D2B] text-white border-[#123D2B] shadow-md scale-[1.02]"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {t("tenant")}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("rooftopConstruction")}
                  </label>
                  <select
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value as RoofType)}
                    className="w-full px-4 py-3 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#198754]/20 focus:border-[#198754] transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Concrete Flat">{t("concreteRoof")}</option>
                    <option value="Tin Shed">{t("metalShed")}</option>
                    <option value="Tiled Roof">{t("tiledRoof")}</option>
                    <option value="Other">{t("otherRoof")}</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {t("shadowFreeArea")}
                    </label>
                    <span className="font-mono text-xs sm:text-sm font-black text-[#198754] bg-[#E7F3EC] dark:bg-[#123D2B]/50 px-2.5 py-1 rounded-lg border border-[#198754]/30">
                      {roofAreaSqFt} sq. ft. (~{(roofAreaSqFt / 100).toFixed(1)} {t("roofCapacityGuide")})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="2500"
                    step="50"
                    value={roofAreaSqFt}
                    onChange={(e) => setRoofAreaSqFt(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#198754]"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#198754]"
              />
              <span>{t("privacyConsent")}</span>
            </label>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#123D2B] hover:bg-[#198754] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#123D2B]/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>{t("continueBillVerification")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Bill Upload & AI Side-by-Side Review Workstation */}
        {step === 2 && (
          <form onSubmit={handlePreviewEstimate} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#198754]" />
                  {t("billAnalysisTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {t("billAnalysisHint")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#198754] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t("editStepOne")}
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#198754] rounded-3xl p-6 text-center bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
              <input
                type="file"
                id="bill-upload-input"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="bill-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2.5"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E7F3EC] dark:bg-[#123D2B]/60 text-[#198754] flex items-center justify-center shadow-xs">
                  {isAnalyzing ? (
                    <RefreshCw className="w-7 h-7 animate-spin text-[#198754]" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {isAnalyzing
                      ? t("readingBill")
                      : billFileName
                      ? `${t("selectedFile")} ${billFileName}`
                      : t("uploadBill")}
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {t("uploadFileLimit")}
                  </p>
                </div>
              </label>
            </div>

            {aiReadFailed && billImageBase64 && !isAnalyzing && (
              <button
                type="button"
                onClick={() => triggerAIExtraction(billImageBase64, billMimeType)}
                className="rounded-xl border border-[#198754]/30 bg-[#E7F3EC]/60 px-4 py-2 text-sm font-bold text-[#123D2B] hover:bg-[#E7F3EC] dark:bg-[#123D2B]/40 dark:text-emerald-300"
              >
                {t("retryBillReading")}
              </button>
            )}

            {/* THE SIDE-BY-SIDE VERIFICATION WORKSTATION */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#198754]" />
                  <span className="text-xs uppercase tracking-wider font-black text-slate-800 dark:text-slate-200">
                    {t("documentFieldVerification")}
                  </span>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400">{t("checkBillFields")}</span>
              </div>

              {extraction?.extractionNotes && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {lang === "en"
                    ? extraction.extractionNotes
                    : aiReadFailed
                      ? t("billValuesNotRead")
                      : t("billExtractionReviewNote")}
                  {aiReadFailed && (
                    <span className="mt-2 block">
                      {t("billReadingHelp")} <a className="font-bold underline underline-offset-2" href={getBusinessSupportMailto("Bill reading assistance")}>{t("emailSolarSaathiSupport")}</a>.
                    </span>
                  )}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  {billImageBase64 && billImageBase64.startsWith("data:image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={billImageBase64} alt={t("uploadedBillImage")} className="max-h-[520px] w-full object-contain" />
                  ) : billImageBase64 && billImageBase64.startsWith("data:application/pdf") ? (
                    <iframe title={t("uploadedBillPdf")} src={billImageBase64} className="h-[520px] w-full" />
                  ) : (
                    <div className="px-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                      <p className="font-medium">{billFileName || t("noBillUploaded")}</p>
                      <p className="mt-1 text-xs">{billImageBase64 ? t("previewUnavailable") : t("uploadBillToPreview")}</p>
                    </div>
                  )}
                </div>
                {/* Right Column: Active Editable Form (When AI is wrong/human in the loop) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#198754]" />
                      {t("verifyAdjustValues")}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{t("editableFields")}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t("consumerNumber")}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={consumerNumber}
                        onChange={(e) => setConsumerNumber(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#198754] focus:outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t("monthlyUnits")}
                          </label>
                        </div>
                        <input
                        type="number"
                          required
                          min="1"
                          value={monthlyUnits || ""}
                          onChange={(e) => setMonthlyUnits(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono font-black text-[#198754] dark:text-emerald-400 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#198754] focus:outline-none bg-white dark:bg-slate-950"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t("monthlyBill")}
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={monthlyBill || ""}
                          onChange={(e) => setMonthlyBill(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono font-black text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#198754] focus:outline-none bg-white dark:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t("sanctionedLoad")}
                          </label>
                        </div>
                        <input
                          type="number"
                          required
                          min="0.1"
                          step="0.1"
                          value={sanctionedLoad || ""}
                          onChange={(e) => setSanctionedLoad(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#198754] focus:outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t("tariffCategory")}
                          </label>
                        </div>
                        <input
                          type="text"
                          value={tariff}
                          onChange={(e) => setTariff(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#198754] focus:outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {t("back")}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isAnalyzing}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#123D2B] hover:bg-[#198754] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#123D2B]/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t("calculatingEstimate")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("prepareEstimate")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
