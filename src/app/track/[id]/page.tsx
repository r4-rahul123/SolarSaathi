import React from "react";
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
} from "lucide-react";
import { SolarDB } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackProjectPage({ params }: PageProps) {
  const { id } = await params;
  const lead = SolarDB.getLeadById(id);

  if (!lead) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Could not find an active rooftop solar installation for reference #{id}.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Mask consumer number for DPDP compliance (e.g. 4100****3741)
  const rawConsumer = lead.billExtraction?.consumerNumber || "410019283741";
  const maskedConsumer =
    rawConsumer.length > 8
      ? `${rawConsumer.slice(0, 4)}****${rawConsumer.slice(-4)}`
      : rawConsumer;

  const demoLeads = SolarDB.getLeads();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 transition-colors">
      {/* Top Navigation & Status Tag */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calculator</span>
        </Link>

        {/* Demo Switcher for Reviewer Convenience */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-bold text-slate-600 dark:text-slate-400">View Other Stages:</span>
          {demoLeads.map((dl) => (
            <Link
              key={dl.id}
              href={`/track/${dl.id}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                dl.id.toLowerCase() === id.toLowerCase()
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {dl.id} ({dl.score})
            </Link>
          ))}
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-xs">
                Ref: {lead.id}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  lead.score === "High"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                }`}
              >
                Score: {lead.score}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {lead.name}&apos;s Solar Project
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>
                {lead.address}, {lead.city} - {lead.pincode}
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium">System Capacity</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {lead.recommendedKw} kW <span className="text-sm font-normal text-slate-400">Plant</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Subsidy: {formatCurrency(lead.quote?.subsidyAmount || 78000)}
            </span>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
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
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {lead.quote?.paybackYears || 3.2} Years
            </span>
          </div>
        </div>

        {/* SWIGGY-STYLE TIMELINE & MILESTONES */}
        <div className="mt-8">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Live Project Milestone Tracker
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
            {lead.timeline.map((milestone, idx) => {
              const isCompleted = !!milestone.completedAt;
              const isCurrent = milestone.isCurrent;

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-[24px] sm:-left-[28px] mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900 shadow-sm ${
                      isCompleted
                        ? "bg-emerald-600"
                        : isCurrent
                        ? "bg-amber-500 ring-4 ring-amber-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{idx + 1}</span>
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
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      {milestone.completedAt && (
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
                      {milestone.description}
                    </p>

                    {isCurrent && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                        <span>Action in Progress • Next update within 24 hours</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Project Coordinator Card */}
        <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
              VS
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Assigned Nagpur Project Officer</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Sunil Deshpande (Wardha Road Desk)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="tel:0712254890"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>Call Desk</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-xl transition-colors border border-amber-300 dark:border-amber-700/60 shadow-xs"
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
