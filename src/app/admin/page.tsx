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
  // Each low score lead saves ₹2,500 wasted survey cost
  const savedSurveyCost = lowLeads * 2500;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Vidarbha Solar • Operations & CRM Portal
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Live Staff Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time lead qualification, surveyor routing, and dated subsidy rule administration.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "leads"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Leads & Surveys ({totalLeads})
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "rules"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Subsidy Rules Master
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Savings Analytics
          </button>
        </div>
      </div>

      {/* METRICS ROW (Solving the ₹26.4L Wasted Survey Problem) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">Total Leads Ingested</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Sample dataset seeded from brief</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">Qualified for Physical Survey</span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">{highLeads} Leads</div>
          <div className="text-[11px] text-emerald-700 mt-1">
            High score: Owners with &gt;₹2,500 monthly bills
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">Bypassed Surveys (Tenants/Small)</span>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 mt-2">{lowLeads} Leads</div>
          <div className="text-[11px] text-amber-700 mt-1">
            Survey replaced with quick 5-min phone call
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Survey Cost Saved by AI</span>
            <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {formatCurrency(savedSurveyCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            At ₹2,500 saved per unviable physical survey
          </div>
        </div>
      </div>

      {/* TAB 1: LEADS MANAGEMENT & CRM QUEUE */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, ID, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">AI Score:</span>
              <div className="flex gap-1 text-xs">
                {["ALL", "High", "Medium", "Low"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterScore(s)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      filterScore === s
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Lead ID & Customer</th>
                    <th className="py-3 px-4">Occupancy & Roof</th>
                    <th className="py-3 px-4">Monthly Bill / Units</th>
                    <th className="py-3 px-4">AI Score & Reason</th>
                    <th className="py-3 px-4">Rec. kW</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-amber-700">{lead.id}</div>
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-400">{lead.phone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{lead.occupancy}</div>
                        <div className="text-[11px] text-slate-400">
                          {lead.roofType} ({lead.roofAreaSqFt} sq. ft.)
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(lead.monthlyBill)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {lead.avgUnitsPerMonth} kWh/mo
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lead.score === "High"
                              ? "bg-emerald-100 text-emerald-800"
                              : lead.score === "Medium"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {lead.score === "High" ? "✓ High Score" : lead.score}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {lead.scoreReason}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {lead.recommendedKw} kW
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-mono">
                          {lead.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/track/${lead.id}`}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-amber-600 transition-colors"
                            title="Open Customer Tracker"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-amber-700">
                  {selectedLead.id}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedLead.address}, {selectedLead.city}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Extraction Audit Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Side-by-Side OCR Bill Audit Data
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Consumer No</span>
                  <span>{selectedLead.billExtraction?.consumerNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sanctioned Load</span>
                  <span>{selectedLead.billExtraction?.sanctionedLoadKw || 3.0} kW</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Units</span>
                  <span>{selectedLead.avgUnitsPerMonth} kWh</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Bill</span>
                  <span>₹{selectedLead.monthlyBill}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1">
                {selectedLead.scoreReason}
              </p>
            </div>

            {/* Change Pipeline Stage Buttons */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Update Pipeline Status:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "SURVEY_SCHEDULED", "SITE_VISIT")
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-amber-50 hover:border-amber-400 text-left font-medium transition-colors"
                >
                  <span className="block font-bold">1. Schedule Survey</span>
                  <span className="text-[10px] text-slate-400">Assign site visit</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "DISCOM_APPLIED", "DISCOM_FILING")
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-400 text-left font-medium transition-colors"
                >
                  <span className="block font-bold">2. File DISCOM</span>
                  <span className="text-[10px] text-slate-400">Net-meter app filed</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "INSTALLATION_IN_PROGRESS", "INSTALL_METER")
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-400 text-left font-medium transition-colors"
                >
                  <span className="block font-bold">3. Installation</span>
                  <span className="text-[10px] text-slate-400">Panels mounting</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedLead.id, "SUBSIDY_CREDITED", "VERIFY_DOCS")
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-400 text-left font-medium transition-colors"
                >
                  <span className="block font-bold">4. Subsidy Credited</span>
                  <span className="text-[10px] text-slate-400">₹78,000 DBT live</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Link
                href={`/track/${selectedLead.id}`}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Open Customer Tracking Page
              </Link>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATED SUBSIDY RULES & BENCHMARK PRICING MASTER */}
      {activeTab === "rules" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" />
              Central Government Subsidy & Pricing Master (Dated Rules)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure Central Residential Solar Scheme (PM Surya Ghar) subsidy slabs, caps, and generation benchmark with effective dates.
            </p>
          </div>

          {ruleSaveMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{ruleSaveMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveRule} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheme Policy Name
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Effective From (Start Date) *
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Effective Until (Expiry Date) *
                </label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Subsidy Cap (₹) *
                </label>
                <input
                  type="number"
                  value={maxCap}
                  onChange={(e) => setMaxCap(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tier 1 Subsidy (Up to 2 kW) ₹/kW
                </label>
                <input
                  type="number"
                  value={tier1Rate}
                  onChange={(e) => setTier1Rate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tier 2 Subsidy (3rd kW) ₹/kW
                </label>
                <input
                  type="number"
                  value={tier2Rate}
                  onChange={(e) => setTier2Rate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Generation Benchmark (Units/kW/Yr) *
                </label>
                <input
                  type="number"
                  value={generationBenchmark}
                  onChange={(e) => setGenerationBenchmark(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold text-amber-700"
                />
                <span className="text-[10px] text-slate-400">Explicit client brief requirement: 1,400</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Financial Impact & Survey Waste Elimination
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Direct verification of the client brief problem assumptions and cost savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
              <span className="font-bold text-red-900 uppercase tracking-wider text-[11px] block">
                The Old Problem (Manual Process)
              </span>
              <ul className="space-y-1.5 text-red-800 list-disc list-inside">
                <li>1,400 leads/month with only 25% (350) genuine.</li>
                <li>40% of 220 monthly surveys wasted on tenants or ₹600 bills.</li>
                <li>88 wasted surveys × ₹2,500 = <strong>₹26.4 Lakh/year wasted</strong>.</li>
                <li>Quotes took 3 days: 14 lost leads/month = <strong>₹60.48 Lakh/year lost</strong>.</li>
                <li>Total Annual Loss: <strong>₹86.88 Lakh / year</strong>.</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] block">
                The Solution (Vidarbha Solar Platform)
              </span>
              <ul className="space-y-1.5 text-emerald-800 list-disc list-inside">
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
