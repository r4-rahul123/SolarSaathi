"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Phone,
  FileCheck,
  Zap,
  MapPin,
  Save,
} from "lucide-react";
import { Lead, SubsidyRule, ProjectStatus, NextAction } from "@/types/solar";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rules, setRules] = useState<SubsidyRule[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "rules" | "analytics">("leads");
  const [filterScore, setFilterScore] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editable rule form state
  const [ruleName, setRuleName] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [tier1Rate, setTier1Rate] = useState(30000);
  const [tier2Rate, setTier2Rate] = useState(18000);
  const [maxCap, setMaxCap] = useState(78000);
  const [generationBenchmark, setGenerationBenchmark] = useState(1400);
  const [ruleSaveMsg, setRuleSaveMsg] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/rules");
      const data = await res.json();
      if (data.rules && data.rules.length > 0) {
        setRules(data.rules);
        const r = data.rules[0];
        setRuleName(r.name);
        setEffectiveFrom(r.effectiveFrom);
        setEffectiveTo(r.effectiveTo || "2027-03-31");
        setTier1Rate(r.rates[0]?.ratePerKw || 30000);
        setTier2Rate(r.rates[1]?.ratePerKw || 18000);
        setMaxCap(r.maxSubsidyCap);
        setGenerationBenchmark(r.generationPerKwPerYear);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchLeads(), fetchRules()]).finally(() => setIsLoading(false));
  }, []);

  const handleUpdateStatus = async (leadId: string, newStatus: ProjectStatus, nextAction: NextAction) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, nextAction }),
      });
      fetchLeads();
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus, nextAction } : null));
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
          rates: [
            { minKw: 0, maxKw: 2, ratePerKw: Number(tier1Rate) },
            { minKw: 2, maxKw: 3, ratePerKw: Number(tier2Rate) },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRuleSaveMsg("Subsidy rule updated with new effective dates!");
        setTimeout(() => setRuleSaveMsg(null), 3500);
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesFilter = filterScore === "ALL" || l.score === filterScore;
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  // Calculate metrics
  const totalLeads = leads.length;
  const highLeads = leads.filter((l) => l.score === "High").length;
  const lowLeads = leads.filter((l) => l.score === "Low").length;
  const savedSurveyCost = lowLeads * 2500;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Vidarbha Solar • Operations & CRM Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Live Staff Desk
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time lead qualification, surveyor routing, and dated subsidy rule administration.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "leads"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Leads & Surveys ({totalLeads})
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "rules"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Subsidy Rules Master
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Savings Analytics
          </button>
        </div>
      </div>

      {/* METRICS ROW (Solving the ₹26.4L Wasted Survey Problem) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Leads</span>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">{totalLeads}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Seeded from client brief dataset
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qualified For Survey</span>
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">{highLeads} Leads</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
            High score: Owners &gt;₹2,500/mo bill
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bypassed Surveys</span>
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-2">{lowLeads} Leads</div>
          <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
            Tenants & ₹600 bills diverted to call
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Survey Cost Saved</span>
            <div className="p-2.5 bg-slate-800 rounded-xl text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-amber-400 mt-2">
            {formatCurrency(savedSurveyCost)}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">
            At ₹2,500 saved per unviable physical survey
          </div>
        </div>
      </div>

      {/* TAB 1: LEADS MANAGEMENT & CRM QUEUE */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, ID, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">AI Score:</span>
              <div className="flex gap-1 text-xs">
                {["ALL", "High", "Medium", "Low"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterScore(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterScore === s
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Lead ID & Customer</th>
                    <th className="py-3.5 px-5">Occupancy & Roof</th>
                    <th className="py-3.5 px-5">Monthly Bill / Units</th>
                    <th className="py-3.5 px-5">AI Score & Reason</th>
                    <th className="py-3.5 px-5">Rec. kW</th>
                    <th className="py-3.5 px-5">Current Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-4 px-5">
                        <div className="font-mono font-black text-amber-600 dark:text-amber-400">{lead.id}</div>
                        <div className="font-bold text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="text-xs text-slate-400">{lead.phone}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{lead.occupancy}</div>
                        <div className="text-xs text-slate-400">
                          {lead.roofType} ({lead.roofAreaSqFt} sq. ft.)
                        </div>
                      </td>

                      <td className="py-4 px-5 font-mono">
                        <div className="font-black text-slate-900 dark:text-white">
                          {formatCurrency(lead.monthlyBill)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {lead.avgUnitsPerMonth} kWh/mo
                        </div>
                      </td>

                      <td className="py-4 px-5 max-w-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            lead.score === "High"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                              : lead.score === "Medium"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                          }`}
                        >
                          {lead.score === "High" ? "✓ High Score" : lead.score}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
                          {lead.scoreReason}
                        </p>
                      </td>

                      <td className="py-4 px-5 font-mono font-black text-slate-900 dark:text-white text-base">
                        {lead.recommendedKw} kW
                      </td>

                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-mono font-bold">
                          {lead.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/track/${lead.id}`}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                            title="Open Customer Tracker"
                          >
                            <ArrowUpRight className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LEAD DETAILS / STAGE UPDATE MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                  {selectedLead.id}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedLead.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {selectedLead.address}, {selectedLead.city}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
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
                    {selectedLead.billExtraction?.sanctionedLoadKw || 3.0} kW
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-sans">Monthly Units</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
              <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-800 font-medium">
                {selectedLead.scoreReason}
              </p>
            </div>

            {/* Change Pipeline Stage Buttons */}
            <div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                Update Pipeline Status:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "SURVEY_SCHEDULED", "SITE_VISIT")
                  }
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400 text-left font-bold transition-all cursor-pointer"
                >
                  <span className="block text-slate-900 dark:text-white text-sm">1. Schedule Survey</span>
                  <span className="text-xs text-slate-400">Assign site visit</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "DISCOM_APPLIED", "DISCOM_FILING")
                  }
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-400 text-left font-bold transition-all cursor-pointer"
                >
                  <span className="block text-slate-900 dark:text-white text-sm">2. File DISCOM</span>
                  <span className="text-xs text-slate-400">Net-meter app filed</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "INSTALLATION_IN_PROGRESS", "INSTALL_METER")
                  }
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 text-left font-bold transition-all cursor-pointer"
                >
                  <span className="block text-slate-900 dark:text-white text-sm">3. Installation</span>
                  <span className="text-xs text-slate-400">Panels mounting</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "SUBSIDY_CREDITED", "VERIFY_DOCS")
                  }
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-400 text-left font-bold transition-all cursor-pointer"
                >
                  <span className="block text-slate-900 dark:text-white text-sm">4. Subsidy Credited</span>
                  <span className="text-xs text-slate-400">₹78,000 DBT live</span>
                </button>
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
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATED SUBSIDY RULES & BENCHMARK PRICING MASTER */}
      {activeTab === "rules" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Central Government Subsidy & Pricing Master (Dated Rules)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Configure Central Residential Solar Scheme (PM Surya Ghar) subsidy slabs, caps, and generation benchmark with effective dates.
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
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-black text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-950"
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
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-black text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-950"
                />
                <span className="text-xs text-slate-400 mt-1 block font-medium">Explicit client requirement: 1,400</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Dated Subsidy Rules</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: BUSINESS SAVINGS ANALYTICS (Brief ROI Justification) */}
      {activeTab === "analytics" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Financial Impact & Survey Waste Elimination
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Direct verification of the client brief problem assumptions and cost savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-3xl space-y-3.5">
              <span className="font-black text-red-900 dark:text-red-300 uppercase tracking-wider text-xs block">
                The Old Problem (Manual Process)
              </span>
              <ul className="space-y-2 text-red-800 dark:text-red-300 list-disc list-inside font-medium">
                <li>1,400 leads/month with only 25% (350) genuine.</li>
                <li>40% of 220 monthly surveys wasted on tenants or ₹600 bills.</li>
                <li>88 wasted surveys × ₹2,500 = <strong>₹26.4 Lakh/year wasted</strong>.</li>
                <li>Quotes took 3 days: 14 lost leads/month = <strong>₹60.48 Lakh/year lost</strong>.</li>
                <li>Total Annual Loss: <strong>₹86.88 Lakh / year</strong>.</li>
              </ul>
            </div>

            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl space-y-3.5">
              <span className="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-xs block">
                The Solution (Vidarbha Solar Platform)
              </span>
              <ul className="space-y-2 text-emerald-800 dark:text-emerald-300 list-disc list-inside font-medium">
                <li>Instant AI Bill Reading filters tenants & tiny bills automatically.</li>
                <li>Unqualified physical surveys cut from 40% to <strong>under 12%</strong>.</li>
                <li>Instant Same-Day Quote with automatic PM Surya Ghar subsidy math.</li>
                <li>Status calls reduced by &gt;50% via the Public Magic Link Tracker.</li>
                <li>Net Annual Business Savings: <strong>~₹65+ Lakhs/year</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
