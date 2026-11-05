import React from "react";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import { SolarDB } from "@/lib/db";
import { TrackProjectClient } from "@/components/TrackProjectClient";

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
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#123D2B] hover:bg-[#198754] text-white rounded-xl text-xs sm:text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const allLeads = SolarDB.getLeads().map((l) => ({
    id: l.id,
    name: l.name,
    score: l.score || l.scoreBreakdown?.tier || "High",
    isStuck: l.isStuck,
    status: l.status,
  }));

  return <TrackProjectClient initialLead={lead} allLeads={allLeads} />;
}
