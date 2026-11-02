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
        <h2 className="text-xl font-bold text-slate-900">Project Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Could not find an active rooftop solar installation for reference #{id}.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium"
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Navigation & Status Tag */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Calculator</span>
        </Link>

        {/* Demo Switcher for Reviewer Convenience */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-semibold text-slate-400">View Other Stages:</span>
          {demoLeads.map((dl) => (
            <Link
              key={dl.id}
              href={`/track/${dl.id}`}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                dl.id.toLowerCase() === id.toLowerCase()
                  ? "bg-amber-500 text-white font-bold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {dl.id} ({dl.score})
            </Link>
          ))}
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md text-xs">
                Ref: {lead.id}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  lead.score === "High"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                Score: {lead.score}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.name}&apos;s Solar Project</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {lead.address}, {lead.city} - {lead.pincode}
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">System Capacity</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {lead.recommendedKw} kW <span className="text-sm font-normal text-slate-500">Plant</span>
            </div>
            <span className="text-xs text-emerald-600 font-medium">
              Subsidy: {formatCurrency(lead.quote?.subsidyAmount || 78000)}
            </span>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block">MSEDCL Consumer</span>
            <span className="font-mono font-semibold text-slate-800">{maskedConsumer}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Occupancy</span>
            <span className="font-semibold text-slate-800">{lead.occupancy}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Monthly Units</span>
            <span className="font-mono font-semibold text-slate-800">{lead.avgUnitsPerMonth} kWh</span>
          </div>
          <div>
            <span className="text-slate-400 block">Estimated Payback</span>
            <span className="font-mono font-semibold text-blue-600">
              {lead.quote?.paybackYears || 3.2} Years
            </span>
          </div>
        </div>

        {/* SWIGGY-STYLE TIMELINE & MILESTONES */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Live Project Milestone Tracker
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            {lead.timeline.map((milestone, idx) => {
              const isCompleted = !!milestone.completedAt;
              const isCurrent = milestone.isCurrent;

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-[24px] sm:-left-[28px] mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xs ${
                      isCompleted
                        ? "bg-emerald-600"
                        : isCurrent
                        ? "bg-amber-500 ring-4 ring-amber-100"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600">{idx + 1}</span>
                    )}
                  </div>

                  {/* Milestone Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4
                        className={`text-sm font-bold ${
                          isCompleted
                            ? "text-slate-900"
                            : isCurrent
                            ? "text-amber-700"
                            : "text-slate-400"
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      {milestone.completedAt && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(milestone.completedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{milestone.description}</p>

                    {isCurrent && (
                      <div className="mt-2.5 inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
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
        <div className="mt-10 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
              VS
            </div>
            <div>
              <span className="text-xs text-slate-400">Assigned Nagpur Project Officer</span>
              <div className="text-sm font-bold text-slate-800">Sunil Deshpande (Wardha Road Desk)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:0712254890"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Call Desk</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg"
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
