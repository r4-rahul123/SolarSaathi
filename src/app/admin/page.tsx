"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sliders,
  Search,
  Eye,
  Phone,
  Save,
  IndianRupee,
  Check,
  MessageSquare,
  Clock,
  Filter,
} from "lucide-react";
import { Lead, SubsidyRule, PricingRule, ProjectStage, NextAction, MockNotification } from "@/types/solar";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";
import { PaymentsSection } from "@/components/PaymentsSection";

export default function AdminDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rules, setRules] = useState<SubsidyRule[]>([]);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [notifSearch, setNotifSearch] = useState("");
  const [notifChannelFilter, setNotifChannelFilter] = useState("ALL");
  const [notifStatusFilter, setNotifStatusFilter] = useState("ALL");
  const [isNotifsLoading, setIsNotifsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"leads" | "stuck" | "payments" | "notifications" | "rules" | "analytics">("leads");
  const [filterScore, setFilterScore] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Editable subsidy rule form state
  const [ruleName, setRuleName] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [tier1Rate, setTier1Rate] = useState(30000);
  const [tier2Rate, setTier2Rate] = useState(18000);
  const [maxCap, setMaxCap] = useState(78000);
  const [generationBenchmark, setGenerationBenchmark] = useState(1400);
  const [ruleSaveMsg, setRuleSaveMsg] = useState<string | null>(null);

  // Editable pricing rules
  const [editingPricing, setEditingPricing] = useState<Record<number, number>>({
    1: 75000,
    2: 140000,
    3: 195000,
  });
  const [pricingSaveMsg, setPricingSaveMsg] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.leads)) throw new Error(data.error || "Could not load enquiries.");
      setLeads(data.leads);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load enquiries.");
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/rules", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load pricing and subsidy settings.");
      if (data.rules && data.rules.length > 0) {
        setRules(data.rules);
        const r = data.rules[0];
        setRuleName(r.name);
        setEffectiveFrom(r.effectiveFrom);
        setEffectiveTo(r.effectiveTo || "2027-03-31");
        setTier1Rate(r.tier1RatePerKw ?? 30000);
        setTier2Rate(r.tier2RatePerKw ?? 18000);
        setMaxCap(r.maxSubsidyCap);
        setGenerationBenchmark(r.generationPerKwPerYear);
      }
      if (data.pricing) {
        const priceMap: Record<number, number> = {};
        data.pricing.forEach((p: PricingRule) => {
          priceMap[p.systemSizeKw] = p.price;
        });
        setEditingPricing(priceMap);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load pricing and subsidy settings.");
    }
  };

  const fetchNotifications = async () => {
    setIsNotifsLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setIsNotifsLoading(false);
    }
  };

  const retryDashboardLoad = () => {
    setLoadError("");
    setIsLoading(true);
    void Promise.all([fetchLeads(), fetchRules(), fetchNotifications()]).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || user.role === "HOMEOWNER") {
      router.replace("/login");
      return;
    }
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      void Promise.all([fetchLeads(), fetchRules(), fetchNotifications()]).finally(() => {
        if (active) setIsLoading(false);
      });
    });
    return () => {
      active = false;
    };
  }, [isAuthLoading, router, user]);

  const getNextStage = (curr: ProjectStage): ProjectStage => {
    const ORDERED: ProjectStage[] = [
      "LEAD_APPROVED",
      "SITE_SURVEY",
      "QUOTATION_APPROVED",
      "ADVANCE_PAYMENT",
      "INSTALLATION",
      "NET_METERING",
      "SUBSIDY_APPLICATION",
      "SUBSIDY_CREDITED",
    ];
    const idx = ORDERED.indexOf(curr);
    return idx >= 0 && idx < ORDERED.length - 1 ? ORDERED[idx + 1] : "SUBSIDY_CREDITED";
  };

  const handleUpdateStatus = async (leadId: string, newStatus: ProjectStage, nextAction?: NextAction) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, nextAction }),
      });
      const data = await res.json();
      if (data.lead) {
        fetchLeads();
        fetchNotifications();
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(data.lead);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleSaveMsg(null);
    try {
      const res = await fetch("/api/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: rules[0]?.id || "PM-SURYA-GHAR-2026",
          name: ruleName,
          effectiveFrom,
          effectiveTo,
          maxSubsidyCap: Number(maxCap),
          generationPerKwPerYear: Number(generationBenchmark),
          tier1RatePerKw: Number(tier1Rate),
          tier2RatePerKw: Number(tier2Rate),
        }),
      });
      if (res.ok) {
        setRuleSaveMsg("Subsidy rule updated with new effective dates!");
        setTimeout(() => setRuleSaveMsg(null), 3500);
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePrice = async (kw: number, price: number) => {
    setPricingSaveMsg(null);
    try {
      const res = await fetch("/api/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pricing",
          systemSizeKw: kw,
          price: Number(price),
        }),
      });
      if (res.ok) {
        setPricingSaveMsg(`Updated ${kw} kW turnkey installation price to ${formatCurrency(price)}!`);
        setTimeout(() => setPricingSaveMsg(null), 3000);
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesFilter = filterScore === "ALL" || (l.scoreBreakdown?.tier || l.score) === filterScore;
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const stuckLeads = leads.filter((l) => l.isStuck || (l.lastUpdatedDaysAgo && l.lastUpdatedDaysAgo > 7));

  // Metrics
  const totalLeads = leads.length;
  const highLeads = leads.filter((l) => (l.scoreBreakdown?.tier || l.score) === "High").length;
  const mediumLeads = leads.filter((l) => (l.scoreBreakdown?.tier || l.score) === "Medium").length;
  const lowLeads = leads.filter((l) => (l.scoreBreakdown?.tier || l.score) === "Low").length;
  const savedSurveyCost = lowLeads * 2500;

  const currentRole = user?.role;

  if (isAuthLoading || isLoading || !user || user.role === "HOMEOWNER") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Loading your workspace…
        </div>
      </main>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Signed in as <strong>{user?.name}</strong> · {user?.role}
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <SolarSaathiLogo size="md" />
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              SolarSaathi • Operations & CRM Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E7F3EC] text-[#123D2B] border border-[#198754]/40">
              {currentRole === "SALES" ? "Sales Qualification Desk" : currentRole === "SURVEYOR" ? "Field Survey Operations" : "Coordinator Master Control"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Nagpur rooftop solar lead qualification, stuck project monitoring, and dated PM Surya Ghar subsidy administration.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "leads"
                ? "bg-white dark:bg-slate-800 text-[#123D2B] dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Leads & Pipeline ({totalLeads})
          </button>

          <button
            onClick={() => setActiveTab("stuck")}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "stuck"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-700 dark:text-amber-400 hover:text-amber-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stuck Projects ({stuckLeads.length})</span>
          </button>

          {(currentRole === "SALES" || currentRole === "COORDINATOR") && <button
            onClick={() => setActiveTab("payments")}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === "payments" ? "bg-white dark:bg-slate-800 text-[#123D2B] dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
          ><IndianRupee className="h-3.5 w-3.5" /> Payments</button>}

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "notifications"
                ? "bg-white dark:bg-slate-800 text-[#123D2B] dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>Mock Notifications</span>
            {notifications.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono">
                {notifications.length}
              </span>
            )}
          </button>

          {currentRole === "COORDINATOR" && (
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "rules"
                  ? "bg-white dark:bg-slate-800 text-[#123D2B] dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Subsidy & Pricing Master
            </button>
          )}

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-white dark:bg-slate-800 text-[#123D2B] dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Savings Analytics
          </button>
        </div>
      </div>

      {/* METRIC CARDS STRIP */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Received Leads</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {totalLeads}
          </div>
          <span className="text-xs text-slate-400 font-medium">Enquiries in your workspace</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">High-fit · survey review</span>
          <div className="text-2xl sm:text-3xl font-black text-[#198754] font-mono">
            {highLeads}
          </div>
          <span className="text-xs text-slate-400 font-medium">Suggested survey review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Review fit · standard follow-up</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {mediumLeads}
          </div>
          <span className="text-xs text-slate-400 font-medium">Needs team review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Phone Advisory (Low Score)</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
            {lowLeads}
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Suggested phone review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Illustrative low-score visit cost</span>
          <div className="text-2xl sm:text-3xl font-black text-[#123D2B] dark:text-emerald-400 font-mono">
            {formatCurrency(savedSurveyCost)}
          </div>
          <span className="text-xs text-slate-400 font-medium">Low-score leads × ₹2,500 estimate</span>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <p>{loadError}</p>
          <button type="button" onClick={retryDashboardLoad} className="shrink-0 rounded-xl border border-red-300 px-4 py-2 text-xs font-bold transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950">
            Try again
          </button>
        </div>
      )}

      {/* TAB 1: LEADS & PIPELINE TABLE */}
      {activeTab === "leads" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-5 sm:p-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, ref ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#198754] focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Tier:</span>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Scores</option>
                <option value="High">High (Immediate Survey)</option>
                <option value="Medium">Medium (Review)</option>
                <option value="Low">Low (Phone Desk)</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ref ID / Name</th>
                  <th className="py-3 px-4">Occupancy / Area</th>
                  <th className="py-3 px-4">Monthly Bill & Units</th>
                  <th className="py-3 px-4">100-Pt Score</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {totalLeads === 0 ? "No enquiries yet" : "No enquiries match your search"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {totalLeads === 0 ? "New homeowner enquiries will appear here." : "Try a different name, reference or phone number."}
                      </p>
                    </td>
                  </tr>
                )}
                {filteredLeads.map((ld) => {
                  const scoreTier = ld.scoreBreakdown?.tier || ld.score;
                  const scoreStyle = scoreTier === "High"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                    : scoreTier === "Medium"
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300";
                  const scoreLabel = `${scoreTier || "Unscored"} · ${ld.nextAction === "SITE_VISIT" ? "Survey review" : "Short call"}`;
                  return (
                    <tr key={ld.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#123D2B] dark:text-emerald-400 text-xs">
                          {ld.id}
                        </div>
                        <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {ld.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">{ld.phone}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            ld.occupancy === "Owner"
                              ? "bg-[#E7F3EC] text-[#123D2B]"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {ld.occupancy}
                        </span>
                        <div className="text-slate-600 dark:text-slate-300 text-xs mt-1">
                          {ld.roofAreaSqFt} sq.ft ({ld.roofType})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">₹{ld.monthlyBill}/mo</div>
                        <div className="text-[11px] text-slate-500">{ld.avgUnitsPerMonth} kWh</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black ${scoreStyle}`}
                        >
                          {scoreLabel} ({ld.scoreBreakdown?.totalScore ?? "—"}/100)
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">
                          {ld.scoreBreakdown?.explanation || ld.scoreReason}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={ld.status}
                          onChange={(e) => handleUpdateStatus(ld.id, e.target.value as ProjectStage)}
                          className="px-2.5 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                        >
                          <option value="LEAD_APPROVED">1. Lead Approved</option>
                          <option value="SITE_SURVEY">2. Site Survey</option>
                          <option value="QUOTATION_APPROVED">3. Quote Approved</option>
                          <option value="ADVANCE_PAYMENT">4. Advance Paid</option>
                          <option value="INSTALLATION">5. Installation</option>
                          <option value="NET_METERING">6. Net Metering</option>
                          <option value="SUBSIDY_APPLICATION">7. DBT Filing</option>
                          <option value="SUBSIDY_CREDITED">8. Subsidy Credited</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLead(ld)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Audit Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/track/${ld.id}`}
                            className="p-1.5 text-[#198754] hover:text-[#123D2B] rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Open Public Tracking Page"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "payments" && (currentRole === "SALES" || currentRole === "COORDINATOR") && <PaymentsSection />}

      {/* TAB: MOCK NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header & Prominent Disclaimer */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      WhatsApp Mock Notification Center
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Audit trail of automated customer notifications triggered on project status transitions.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchNotifications}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Clock className="w-3.5 h-3.5" />
                Refresh Notifications
              </button>
            </div>

            {/* Simulation Warning Banner */}
            <div className="rounded-2xl border-2 border-dashed border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-xs font-semibold text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
              <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-700 text-white tracking-wider">
                Simulated Notification
              </span>
              <span>
                <strong>Zero External Charges:</strong> This is an internal mock notification engine. No real WhatsApp Business API, SMS gateway, or Twilio integration is connected. No actual messages are transmitted to customers.
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, project ID, or message text..."
                value={notifSearch}
                onChange={(e) => setNotifSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-600 focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Channel:
              </span>
              <select
                value={notifChannelFilter}
                onChange={(e) => setNotifChannelFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Channels</option>
                <option value="WhatsApp Mock">WhatsApp Mock</option>
                <option value="SMS Mock">SMS Mock</option>
              </select>

              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={notifStatusFilter}
                onChange={(e) => setNotifStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Sent (Mock)">Sent (Mock)</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          {isNotifsLoading ? (
            <div className="py-12 text-center text-sm font-medium text-slate-500">
              Loading mock notifications...
            </div>
          ) : (
            (() => {
              const filtered = notifications.filter((n) => {
                const q = notifSearch.toLowerCase();
                const matchSearch =
                  !q ||
                  (n.customerName || "").toLowerCase().includes(q) ||
                  n.projectId.toLowerCase().includes(q) ||
                  n.message.toLowerCase().includes(q) ||
                  (n.stage || "").toLowerCase().includes(q);
                const matchChannel =
                  notifChannelFilter === "ALL" || n.channel === notifChannelFilter;
                const matchStatus =
                  notifStatusFilter === "ALL" || n.status === notifStatusFilter;
                return matchSearch && matchChannel && matchStatus;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">No mock notifications match your criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Notifications are generated automatically when a project status changes.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((notif) => (
                    <div
                      key={notif.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-950/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {notif.customerName || "Customer"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            {notif.projectId}
                          </span>
                          {notif.stage && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                              {notif.stage}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold text-[10px]">
                            {notif.channel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 font-bold text-[10px]">
                            {notif.status}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {new Date(notif.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs">
                          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                            Mock WhatsApp Message Body
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line font-normal leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        <div className="shrink-0 text-right md:w-44 text-xs space-y-1">
                          <div className="text-slate-400 font-medium text-[11px]">Recipient</div>
                          <div className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
                            {notif.recipient}
                          </div>
                          {notif.readAt && (
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Read: {new Date(notif.readAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* TAB 2: STUCK PROJECTS (>7 DAYS ALERT) */}
      {activeTab === "stuck" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Stuck Projects Escalation Dashboard (&gt;7 Days Inactive)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Projects without a status change for 7 full days are flagged here for follow-up.
            </p>
          </div>

          <div className="space-y-4">
            {stuckLeads.length === 0 && (
              <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 px-5 py-10 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                <p className="font-semibold text-slate-800 dark:text-slate-100">No projects need escalation</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Projects with no status change for 7 full days will appear here.</p>
              </div>
            )}
            {stuckLeads.map((stk) => (
              <div
                key={stk.id}
                className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-900 dark:text-amber-300 text-xs px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60">
                      Ref: #{stk.id}
                    </span>
                    <span className="text-xs font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Delayed: {stk.lastUpdatedDaysAgo || 10} Days
                    </span>
                    <span className="text-xs text-slate-500">Stage: {stk.timeline?.find((item) => item.stage === stk.status)?.title || stk.status}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {stk.name} • {stk.address}, {stk.city}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    No recent update is recorded. Confirm the latest status before advancing the project.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {stk.phone && stk.phone !== "0000000000" ? (
                    <a
                      href={`tel:${stk.phone}`}
                      className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>Call Customer</span>
                    </a>
                  ) : (
                    <span className="px-3.5 py-2 text-xs font-medium text-slate-500">No phone number available</span>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(stk.id, getNextStage(stk.status))}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs"
                  >
                    Resolve & Advance Stage
                  </button>
                  <Link
                    href={`/track/${stk.id}`}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    View Tracker
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATED SUBSIDY RULES & BENCHMARK PRICING MASTER (SCREEN 7) */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          {/* Section A: Subsidy Rules */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#198754]" />
                Central Government Subsidy Rules (Dated Effective Slabs)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Configure Central PM Surya Ghar subsidy slabs, caps, and generation benchmarks with strict effective dates.
              </p>
            </div>

            {ruleSaveMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{ruleSaveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRule} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Scheme Policy Name
                  </label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Effective From (Start Date) *
                  </label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Effective Until (Expiry Date) *
                  </label>
                  <input
                    type="date"
                    value={effectiveTo}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Max Subsidy Cap (₹) *
                  </label>
                  <input
                    type="number"
                    value={maxCap}
                    onChange={(e) => setMaxCap(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-black text-[#198754] bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tier 1 Subsidy (Up to 2 kW) ₹/kW
                  </label>
                  <input
                    type="number"
                    value={tier1Rate}
                    onChange={(e) => setTier1Rate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tier 2 Subsidy (3rd kW) ₹/kW
                  </label>
                  <input
                    type="number"
                    value={tier2Rate}
                    onChange={(e) => setTier2Rate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Generation Benchmark (Units/kW/Yr) *
                  </label>
                  <input
                    type="number"
                    value={generationBenchmark}
                    onChange={(e) => setGenerationBenchmark(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-black text-[#198754] bg-white dark:bg-slate-950"
                  />
                  <span className="text-xs text-slate-400 mt-1 block font-medium">Standard Nagpur benchmark: 1,400</span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D2B] hover:bg-[#198754] text-white rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Dated Subsidy Rules</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section B: Turnkey Installation Pricing Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#198754]" />
                Turnkey Installation Base Pricing Table
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Standard baseline pricing for Tier-1 Mono PERC panels, on-grid inverters, and DISCOM net-meter documentation.
              </p>
            </div>

            {pricingSaveMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{pricingSaveMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((kw) => (
                <div
                  key={kw}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                      {kw} kW System
                    </span>
                    <span className="text-[11px] font-bold text-[#198754] bg-[#E7F3EC] px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Turnkey Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editingPricing[kw] || (kw === 1 ? 65000 : kw === 2 ? 125000 : 180000)}
                      onChange={(e) =>
                        setEditingPricing({ ...editingPricing, [kw]: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 font-mono font-black text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePrice(kw, editingPricing[kw])}
                    className="w-full py-2 bg-[#123D2B] hover:bg-[#198754] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    Update {kw} kW Rate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BUSINESS SAVINGS ANALYTICS (Brief ROI Justification) */}
      {activeTab === "analytics" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Client assumptions and targets
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Scenario figures below come from the client brief. Targets are goals, not measured results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-3xl space-y-3.5">
              <span className="font-black text-red-900 dark:text-red-300 uppercase tracking-wider text-xs block">
                Stated annual opportunity
              </span>
              <ul className="space-y-2 text-red-800 dark:text-red-300 list-disc list-inside font-medium">
                <li>1,400 leads/month; 25% (350) expected to be genuine.</li>
                <li>40% of 220 monthly surveys expected to be unqualified.</li>
                <li>88 wasted surveys × ₹2,500 = <strong>₹26.4 Lakh/year wasted</strong>.</li>
                <li>Quote delay assumption: 14 lost leads/month × ₹36,000 margin = <strong>₹60.48 Lakh/year</strong>.</li>
                <li>Combined opportunity stated in the brief: <strong>₹86.88 Lakh/year</strong>.</li>
              </ul>
            </div>

            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl space-y-3.5">
              <span className="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-xs block">
                Client success targets
              </span>
              <ul className="space-y-2 text-emerald-800 dark:text-emerald-300 list-disc list-inside font-medium">
                <li>Unqualified surveys: reduce from 40% to <strong>under 15%</strong>.</li>
                <li>Quotes sent on the survey day: <strong>90%</strong>.</li>
                <li>Project status calls: reduce by <strong>50%</strong>.</li>
                <li>Review actual outcomes against these targets after launch.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL AUDIT MODAL (FOR SELECTED LEAD) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-black text-[#198754]">
                  Ref: #{selectedLead.id}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedLead.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {selectedLead.address}, {selectedLead.city} - {selectedLead.pincode}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                aria-label="Close details"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Extraction Audit Box */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm space-y-3">
              <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs block">
                Side-by-Side OCR Bill Audit Data
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div>
                  <span className="text-slate-400 block text-xs font-sans">Consumer No</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLead.billExtraction?.consumerNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-sans">Sanctioned Load</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLead.billExtraction?.sanctionedLoadKw || selectedLead.recommendedKw} kW
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-sans">Monthly Units</span>
                  <span className="font-bold text-[#198754]">
                    {selectedLead.avgUnitsPerMonth} kWh
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-sans">Monthly Bill</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{selectedLead.monthlyBill}
                  </span>
                </div>
              </div>
            </div>

            {/* 100-Point Transparent Score Breakdown */}
            {selectedLead.scoreBreakdown && (
              <div className="p-4 rounded-2xl bg-[#E7F3EC]/50 dark:bg-[#123D2B]/30 border border-[#198754]/30 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#123D2B] dark:text-emerald-300">
                    Lead Qualification Score: {selectedLead.scoreBreakdown.totalScore}/100
                  </span>
                  <span className="font-black uppercase tracking-wider text-[#198754]">
                    {selectedLead.scoreBreakdown.tier}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  {selectedLead.scoreBreakdown.explanation}
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 sm:grid-cols-5">
                  <span>Ownership {selectedLead.scoreBreakdown.ownershipPoints}/25</span>
                  <span>Bill {selectedLead.scoreBreakdown.billPoints}/25</span>
                  <span>Roof {selectedLead.scoreBreakdown.roofAreaPoints}/20</span>
                  <span>Units {selectedLead.scoreBreakdown.consumptionPoints}/20</span>
                  <span>Serviceability {selectedLead.scoreBreakdown.serviceabilityPoints}/10</span>
                </div>
                {selectedLead.scoreBreakdown.reasonCodes?.length ? (
                  <p className="text-slate-500 dark:text-slate-400">Review flags: {selectedLead.scoreBreakdown.reasonCodes.join(", ")}</p>
                ) : null}
              </div>
            )}

            {/* Change Pipeline Stage Buttons */}
            <div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                Update Pipeline Status:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { stage: "LEAD_APPROVED" as ProjectStage, label: "1. Lead Approved" },
                  { stage: "SITE_SURVEY" as ProjectStage, label: "2. Site Survey" },
                  { stage: "QUOTATION_APPROVED" as ProjectStage, label: "3. Quote Approved" },
                  { stage: "ADVANCE_PAYMENT" as ProjectStage, label: "4. Advance Paid" },
                  { stage: "INSTALLATION" as ProjectStage, label: "5. Installation" },
                  { stage: "NET_METERING" as ProjectStage, label: "6. Net Metering" },
                  { stage: "SUBSIDY_APPLICATION" as ProjectStage, label: "7. DBT Filing" },
                  { stage: "SUBSIDY_CREDITED" as ProjectStage, label: "8. Subsidy Credited" },
                ].map((item) => (
                  <button
                    key={item.stage}
                    onClick={() => handleUpdateStatus(selectedLead.id, item.stage)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      selectedLead.status === item.stage
                        ? "bg-[#123D2B] text-white border-[#123D2B]"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/track/${selectedLead.id}`}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-colors"
              >
                Open Customer Tracking Page
              </Link>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2.5 bg-[#123D2B] hover:bg-[#198754] text-white rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
