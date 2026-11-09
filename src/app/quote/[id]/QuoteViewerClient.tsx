"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Lead } from "@/types/solar";
import { SolarQuotationDocument } from "@/components/SolarQuotationDocument";

interface QuoteViewerClientProps {
  lead: Lead;
  backHref?: string;
}

export function QuoteViewerClient({ lead, backHref = "/track" }: QuoteViewerClientProps) {
  const [selectedKw, setSelectedKw] = useState<number>(lead.recommendedKw || 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-6 print:p-0 print:m-0 print:bg-white">
      {/* Top Floating Action Bar (Hidden on print) */}
      <div className="max-w-[210mm] mx-auto px-4 mb-6 print:hidden">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#123D2B] dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project</span>
          </Link>

          {/* Option Selector Toolbar */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">
              Option:
            </span>
            {[1, 2, 3].map((kw) => (
              <button
                key={kw}
                onClick={() => setSelectedKw(kw)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedKw === kw
                    ? "bg-[#123D2B] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {kw} kW
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#123D2B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Document Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print:max-w-none print:w-full">
        <SolarQuotationDocument lead={lead} selectedKw={selectedKw} />
      </div>
    </div>
  );
}
