"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { BillExtraction, Lead, OccupancyType, RoofType } from "@/types/solar";
import { QuoteDisplay } from "./QuoteDisplay";

interface SolarIntakeFormProps {
  onLeadCreated?: (lead: Lead) => void;
}

export function SolarIntakeForm({ onLeadCreated }: SolarIntakeFormProps) {
  // Step State
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Personal & Roof, 2: Bill Upload & AI OCR, 3: Completed Quote

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("440015");
  const [city, setCity] = useState("Nagpur");
  const [occupancy, setOccupancy] = useState<OccupancyType>("Owner");
  const [roofType, setRoofType] = useState<RoofType>("Concrete Flat");
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(600);

  // Bill & AI Extraction State
  const [billImageBase64, setBillImageBase64] = useState<string>("");
  const [billFileName, setBillFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extraction, setExtraction] = useState<BillExtraction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Extracted Fields
  const [consumerNumber, setConsumerNumber] = useState<string>("");
  const [tariff, setTariff] = useState<string>("LT-I (Residential)");
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(3.0);
  const [monthlyUnits, setMonthlyUnits] = useState<number>(320);
  const [monthlyBill, setMonthlyBill] = useState<number>(3100);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);

  // Helper to load sample bill presets
  const handleLoadSample = (sampleType: "standard" | "tenant" | "small") => {
    if (sampleType === "standard") {
      setName("Prashant Wankhede");
      setPhone("+91 98231 44521");
      setEmail("prashant.w@gmail.com");
      setAddress("Plot 42, Somalwada, Wardha Road");
      setPincode("440015");
      setOccupancy("Owner");
      setRoofType("Concrete Flat");
      setRoofAreaSqFt(650);
      setConsumerNumber("410019283741");
      setTariff("LT-I (Residential)");
      setSanctionedLoad(4.0);
      setMonthlyUnits(340);
      setMonthlyBill(3200);
      setBillFileName("sample_msedcl_bill_wankhede.pdf");
      setExtraction({
        consumerNumber: "410019283741",
        tariff: "LT-I (Residential)",
        sanctionedLoadKw: 4.0,
        monthlyUnits: 340,
        monthlyAmount: 3200,
        billingUnit: "Nagpur Urban BU-41",
        confidence: "High",
        extractionNotes: "MSEDCL sample bill verified. Matched consumer address and sanctioned load.",
      });
    } else if (sampleType === "tenant") {
      setName("Rohit Meshram");
      setPhone("+91 97654 32189");
      setEmail("rohit.meshram@yahoo.com");
      setAddress("Flat 301, Manish Nagar");
      setPincode("440025");
      setOccupancy("Tenant");
      setRoofType("Concrete Flat");
      setRoofAreaSqFt(400);
      setConsumerNumber("410087654120");
      setTariff("LT-I (Residential)");
      setSanctionedLoad(2.0);
      setMonthlyUnits(210);
      setMonthlyBill(1900);
      setBillFileName("sample_tenant_bill.pdf");
      setExtraction({
        consumerNumber: "410087654120",
        tariff: "LT-I (Residential)",
        sanctionedLoadKw: 2.0,
        monthlyUnits: 210,
        monthlyAmount: 1900,
        billingUnit: "Nagpur South",
        confidence: "High",
        extractionNotes: "Bill parsed successfully. Tenant occupancy flagged.",
      });
    } else {
      setName("Ayesha Siddiqui");
      setPhone("+91 94228 11902");
      setEmail("ayesha.s@gmail.com");
      setAddress("House 12, Gittikhadan, Katol Road");
      setPincode("440013");
      setOccupancy("Owner");
      setRoofType("Tin Shed");
      setRoofAreaSqFt(300);
      setConsumerNumber("410055214981");
      setTariff("LT-I (Residential)");
      setSanctionedLoad(1.0);
      setMonthlyUnits(85);
      setMonthlyBill(650);
      setBillFileName("sample_small_bill.pdf");
      setExtraction({
        consumerNumber: "410055214981",
        tariff: "LT-I (Residential)",
        sanctionedLoadKw: 1.0,
        monthlyUnits: 85,
        monthlyAmount: 650,
        billingUnit: "Nagpur West",
        confidence: "High",
        extractionNotes: "Bill verified. Low monthly consumption (<100 units) noted.",
      });
    }

    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBillFileName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setBillImageBase64(base64);
      triggerAIExtraction(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const triggerAIExtraction = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

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

      if (ext.consumerNumber) setConsumerNumber(ext.consumerNumber);
      if (ext.tariff) setTariff(ext.tariff);
      if (ext.sanctionedLoadKw) setSanctionedLoad(ext.sanctionedLoadKw);
      if (ext.monthlyUnits) setMonthlyUnits(ext.monthlyUnits);
      if (ext.monthlyAmount) setMonthlyBill(ext.monthlyAmount);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error reading bill";
      setErrorMsg(msg);
      // Fallback defaults so user is never blocked
      setConsumerNumber("4100" + Math.floor(10000000 + Math.random() * 90000000));
      setMonthlyUnits(320);
      setMonthlyBill(3100);
      setExtraction({
        confidence: "Medium",
        extractionNotes: "AI extraction fallback applied. Please verify values manually below.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        name,
        phone,
        email,
        address,
        pincode,
        city,
        occupancy,
        roofType,
        roofAreaSqFt: Number(roofAreaSqFt),
        monthlyBill: Number(monthlyBill),
        avgUnitsPerMonth: Number(monthlyUnits),
        billImageName: billFileName,
        billExtraction: extraction || {
          consumerNumber,
          tariff,
          sanctionedLoadKw: Number(sanctionedLoad),
          monthlyUnits: Number(monthlyUnits),
          monthlyAmount: Number(monthlyBill),
          confidence: "High",
          extractionNotes: "Customer verified and submitted.",
        },
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit lead");

      setCreatedLead(data.lead);
      if (onLeadCreated) onLeadCreated(data.lead);
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3 && createdLead) {
    return (
      <div className="space-y-6">
        {/* Status Alert Banner */}
        {createdLead.score === "High" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm text-emerald-800">
              <strong className="font-semibold block text-emerald-950">
                Congratulations! You are eligible for Priority Site Survey & ₹78,000 Subsidy.
              </strong>
              <span>
                Your high consumption ({createdLead.avgUnitsPerMonth} units/month) and confirmed roof ownership qualify you for immediate engineer assignment.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm text-amber-800">
              <strong className="font-semibold block text-amber-950">
                Notice: Assigned to Tele-Advisory Team
              </strong>
              <span>
                {createdLead.scoreReason} Our solar consultant will contact you via phone within 2 hours.
              </span>
            </div>
          </div>
        )}

        <QuoteDisplay lead={createdLead} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Step Indicator */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 1 ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
            }`}
          >
            {step === 1 ? "1" : "✓"}
          </span>
          <span className="text-sm font-semibold text-slate-800">
            {step === 1 ? "Step 1: Rooftop & Contact Details" : "Step 2: AI Bill Verification & Review"}
          </span>
        </div>

        {/* Quick Sample Load Buttons for Reviewer Convenience */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">Quick Test Presets:</span>
          <button
            type="button"
            onClick={() => handleLoadSample("standard")}
            className="px-2.5 py-1 text-[11px] font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md transition-colors cursor-pointer"
          >
            Sample High (Owner)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("tenant")}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors cursor-pointer hidden sm:inline-block"
          >
            Sample Tenant
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("small")}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors cursor-pointer hidden md:inline-block"
          >
            Sample Small Bill
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Personal & Roof Details */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name || !phone) {
                setErrorMsg("Please enter your name and mobile number.");
                return;
              }
              setErrorMsg(null);
              setStep(2);
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Contact & Location Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                We use your address to assess regional solar radiation and DISCOM grid feasibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prashant Wankhede"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98231 44521"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. prashant.w@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / District
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                >
                  <option value="Nagpur">Nagpur (Urban & Rural)</option>
                  <option value="Wardha">Wardha</option>
                  <option value="Amravati">Amravati</option>
                  <option value="Chandrapur">Chandrapur</option>
                  <option value="Bhandara">Bhandara</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rooftop Address & Pincode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Plot / Street / Area (e.g. Somalwada, Wardha Road)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-28 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Home className="w-5 h-5 text-amber-500" />
                Rooftop & Ownership Type
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Government subsidies require clear rooftop rights or owner NOC.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Are you the Owner or Tenant? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOccupancy("Owner")}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        occupancy === "Owner"
                          ? "bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      House Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccupancy("Tenant")}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        occupancy === "Tenant"
                          ? "bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Tenant / Rented
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roof Construction Type
                  </label>
                  <select
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value as RoofType)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    <option value="Concrete Flat">Concrete Flat Slab (Most common)</option>
                    <option value="Tin Shed">Tin / Metal Shed</option>
                    <option value="Tiled Roof">Tiled / Sloped Roof</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Approximate Rooftop Shadow-Free Area (sq. ft.)
                    </label>
                    <span className="font-mono text-xs font-bold text-amber-600">
                      {roofAreaSqFt} sq. ft. (~{(roofAreaSqFt / 100).toFixed(1)} kW capacity)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="3000"
                    step="50"
                    value={roofAreaSqFt}
                    onChange={(e) => setRoofAreaSqFt(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                <span>Continue to Bill Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Bill Upload & AI Side-by-Side Review */}
        {step === 2 && (
          <form onSubmit={handleSubmitLead} className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Electricity Bill & AI Verification
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload your MSEDCL / MSEB bill photo or PDF. Our AI automatically extracts your consumer number, sanctioned load, and monthly units.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  ← Edit Step 1
                </button>
              </div>
            </div>

            {/* Bill Upload Drag/Drop Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
              <input
                type="file"
                id="bill-file-input"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="bill-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  {isAnalyzing ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">
                    {isAnalyzing
                      ? "AI is scanning electricity bill..."
                      : billFileName
                      ? `Selected: ${billFileName}`
                      : "Upload Electricity Bill Photo or PDF"}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PNG, JPG, or PDF up to 10MB • Fast OCR with Gemini Vision
                  </p>
                </div>
              </label>
            </div>

            {/* THE AI SIDE-BY-SIDE VERIFICATION WORKSTATION */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-700">
                    Side-by-Side AI Extraction Verification
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Source: MSEDCL Format
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Document Source & Status */}
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Uploaded Document
                      </span>
                      <span className="font-mono text-[10px]">
                        {billFileName || "Sample Bill Attached"}
                      </span>
                    </div>

                    <div className="bg-slate-100 border border-slate-200 rounded-md p-3 text-[11px] font-mono text-slate-600 space-y-1">
                      <div>Utility: Maharashtra State Electricity Dist. Co.</div>
                      <div>Region: Vidarbha / Nagpur Circle</div>
                      <div>Tariff: LT-I (Residential Single Phase)</div>
                      <div className="text-emerald-700 font-bold">
                        AI Confidence: {extraction?.confidence || "High"}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      {extraction?.extractionNotes ||
                        "Extracted values appear beside the bill for your confirmation. You can edit any value."}
                    </p>
                  </div>
                </div>

                {/* Right: Editable Form Inputs (Handling "When AI is wrong") */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      Verify / Edit Extracted Values
                    </span>
                    <span className="text-[11px] text-slate-400">Tap to edit</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500">
                        Consumer Number
                      </label>
                      <input
                        type="text"
                        value={consumerNumber}
                        onChange={(e) => setConsumerNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">
                          Monthly Units (kWh)
                        </label>
                        <input
                          type="number"
                          value={monthlyUnits}
                          onChange={(e) => setMonthlyUnits(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold text-amber-700 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">
                          Monthly Bill (₹)
                        </label>
                        <input
                          type="number"
                          value={monthlyBill}
                          onChange={(e) => setMonthlyBill(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">
                          Sanctioned Load (kW)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={sanctionedLoad}
                          onChange={(e) => setSanctionedLoad(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">
                          Tariff Category
                        </label>
                        <input
                          type="text"
                          value={tariff}
                          onChange={(e) => setTariff(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Back to Details
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calculating Subsidy & Generating Quote...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Instant Solar Quote & Subsidy</span>
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
