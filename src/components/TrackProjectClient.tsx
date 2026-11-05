"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  Sun,
  ShieldCheck,
  FileText,
  Calendar,
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Lead, ProjectStage, MockNotification } from "@/types/solar";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";

interface TrackProjectClientProps {
  initialLead: Lead;
  allLeads: { id: string; name: string; score: string; isStuck?: boolean; status: ProjectStage }[];
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

export function TrackProjectClient({ initialLead, allLeads }: TrackProjectClientProps) {
  const [lead, setLead] = useState<Lead>(initialLead);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "notifications">("timeline");

  // Mask consumer number for DPDP compliance (e.g. 4100****3741)
  const rawConsumer = lead.billExtraction?.consumerNumber || "410019283741";
  const maskedConsumer =
    rawConsumer.length > 8
      ? `${rawConsumer.slice(0, 4)}****${rawConsumer.slice(-4)}`
      : rawConsumer;

  const currentStageIndex = ORDERED_STAGES.indexOf(lead.status);

  const handleAdvanceStage = async () => {
    if (currentStageIndex >= ORDERED_STAGES.length - 1) return;
    const nextStage = ORDERED_STAGES[currentStageIndex + 1];
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStage }),
      });
      const data = await res.json();
      if (data.lead) {
        setLead(data.lead);
        if (nextStage === "SUBSIDY_CREDITED") {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ["#198754", "#123D2B", "#f59e0b"],
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const isStuck = lead.isStuck || (lead.lastUpdatedDaysAgo && lead.lastUpdatedDaysAgo > 7);
  const tier = lead.score || lead.scoreBreakdown?.tier || "High";
  const activeOption =
    lead.quote?.options?.find((o) => o.systemSizeKw === lead.recommendedKw) ||
    lead.quote?.options?.[0];
  const subsidyVal = activeOption?.subsidyAmount ?? 78000;
  const paybackVal = activeOption?.paybackYears ?? 3.2;

  const defaultNotifications: MockNotification[] = [
    {
      id: "nt-def",
      channel: "WhatsApp",
      recipient: lead.phone,
      message: `Namaskar ${lead.name}, your solar inquiry (Ref: #${lead.id}) has been recorded. Track live: solarsaathi.app/track/${lead.id}`,
      sentAt: lead.createdAt || new Date().toISOString(),
      status: "DELIVERED",
    },
  ];
  const displayNotifications =
    lead.notifications && lead.notifications.length > 0
      ? lead.notifications
      : defaultNotifications;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 transition-colors">
      {/* Top Navigation & Status Tag */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-[#198754] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calculator</span>
        </Link>

        {/* Demo Switcher for Reviewer Convenience */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0">Demo Stages:</span>
          {allLeads.map((dl) => (
            <Link
              key={dl.id}
              href={`/track/${dl.id}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                dl.id.toLowerCase() === lead.id.toLowerCase()
                  ? "bg-[#123D2B] text-white shadow-xs"
                  : dl.isStuck
                  ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                  : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {dl.id} {dl.isStuck ? "(⚠ Stuck)" : `(${dl.score})`}
            </Link>
          ))}
        </div>
      </div>

      {/* STUCK PROJECT ALERT BANNER */}
      {isStuck && (
        <div className="p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-amber-500 text-white">
                  Stuck Project Alert
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Inactive for {lead.lastUpdatedDaysAgo || 10} Days (&gt;7 Days Threshold)
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-amber-950 dark:text-amber-100 mt-1">
                Awaiting MSEDCL Discom Inspection Approval
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Escalated to Nagpur Urban Circle Coordinator (Amit Verma) for expedite dispatch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdvanceStage}
            disabled={isUpdating}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Resolve & Advance Stage
          </button>
        </div>
      )}

      {/* Main Project Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono font-black text-[#123D2B] dark:text-emerald-300 bg-[#E7F3EC] dark:bg-[#123D2B]/50 border border-[#198754]/30 px-3 py-1 rounded-xl text-xs">
                Ref: #{lead.id}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  tier === "High"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                }`}
              >
                Score: {tier} Fit ({lead.scoreBreakdown?.totalScore || 85}/100)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {lead.name}&apos;s Rooftop Solar Installation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
              <MapPin className="w-4 h-4 text-[#198754]" />
              <span>
                {lead.address}, {lead.city} - {lead.pincode}
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Recommended Plant</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {lead.recommendedKw} kW <span className="text-sm font-normal text-slate-400">On-Grid</span>
            </div>
            <span className="text-xs font-bold text-[#198754] dark:text-emerald-400">
              Subsidy: {formatCurrency(subsidyVal)} (Direct DBT)
            </span>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-xs">MSEDCL Consumer</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{maskedConsumer}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Occupancy</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{lead.occupancy}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Monthly Units</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{lead.avgUnitsPerMonth} kWh</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Estimated Payback</span>
            <span className="font-mono font-bold text-[#198754] dark:text-emerald-400">
              {paybackVal} Years
            </span>
          </div>
        </div>

        {/* Tab Switcher: Timeline vs Mock Notifications */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "timeline"
                  ? "bg-[#123D2B] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              8-Stage Milestone Tracker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-[#123D2B] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp & SMS Stream</span>
              <span className="text-[10px] bg-[#198754] text-white px-1.5 py-0.2 rounded-full">
                {lead.notifications?.length || 1}
              </span>
            </button>
          </div>

          {currentStageIndex < ORDERED_STAGES.length - 1 && (
            <button
              type="button"
              onClick={handleAdvanceStage}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#198754] hover:bg-[#123D2B] text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>Advance Next Stage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* TAB 1: SWIGGY-STYLE 8-STAGE TIMELINE */}
        {activeTab === "timeline" && (
          <div className="mt-4">
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
              {ORDERED_STAGES.map((stg, idx) => {
                const milestone = lead.timeline?.find((t) => t.stage === stg);
                const isPast = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isCompleted = isPast || (isCurrent && lead.status === "SUBSIDY_CREDITED");

                return (
                  <div key={stg} className="relative flex items-start gap-4">
                    {/* Indicator Dot */}
                    <div
                      className={`absolute -left-[24px] sm:-left-[28px] mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900 shadow-sm ${
                        isCompleted
                          ? "bg-[#198754]"
                          : isCurrent
                          ? "bg-[#123D2B] ring-4 ring-[#198754]/30"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-[11px] font-bold text-white">{idx + 1}</span>
                      )}
                    </div>

                    {/* Milestone Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4
                          className={`text-sm sm:text-base font-bold ${
                            isCompleted
                              ? "text-slate-900 dark:text-white"
                              : isCurrent
                              ? "text-[#123D2B] dark:text-emerald-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {milestone?.title || `${idx + 1}. Stage: ${stg}`}
                        </h4>
                        {milestone?.completedAt && (
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(milestone.completedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {milestone?.description || "Awaiting previous stage completion."}
                      </p>

                      {isCurrent && lead.status !== "SUBSIDY_CREDITED" && (
                        <div className="mt-2.5 inline-flex items-center gap-2 bg-[#E7F3EC] dark:bg-[#123D2B]/50 border border-[#198754]/40 px-3 py-1 rounded-xl text-xs font-bold text-[#123D2B] dark:text-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-[#198754] animate-ping" />
                          <span>Active Milestone in Progress • Nagpur Team Assigned</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MOCK WHATSAPP & SMS NOTIFICATION HISTORY */}
        {activeTab === "notifications" && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              SolarSaathi dispatches automated updates via WhatsApp and SMS at each milestone stage to keep the homeowner informed without phone tag.
            </div>

            <div className="space-y-3">
              {displayNotifications.map((notif: MockNotification) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          notif.channel === "WhatsApp"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}
                      >
                        {notif.channel}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        To: {notif.recipient}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      &quot;{notif.message}&quot;
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {new Date(notif.sentAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[10px] font-bold text-[#198754]">✓✓ {notif.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Project Coordinator Card */}
        <div className="mt-8 p-5 bg-[#E7F3EC]/60 dark:bg-slate-950 rounded-2xl border border-[#198754]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#123D2B] text-white flex items-center justify-center font-black text-sm">
              SD
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Assigned Nagpur Project Officer</span>
              <div className="text-sm font-bold text-[#123D2B] dark:text-white">
                {lead.assignedStaff || "Sunil Deshpande"} (Wardha Road & Somalwada Desk)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`tel:0712254890`}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#198754]" />
              <span>Call Desk</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#123D2B] hover:bg-[#198754] rounded-xl transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Quote</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
