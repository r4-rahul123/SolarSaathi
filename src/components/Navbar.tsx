"use client";

import React from "react";
import Link from "next/link";
import { Sun, ShieldCheck, MapPin, PhoneCall } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:bg-amber-600 transition-colors">
              <Sun className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Vidarbha<span className="text-amber-600">Solar</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-800 rounded-full">
                  विदर्भ सोलर हब
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Nagpur & Vidarbha Rooftop Clean Energy</span>
              </div>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Get Solar Quote
            </Link>
            <Link
              href="/track/LD-30881"
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Track Project
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Staff CRM</span>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Top Notification Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 text-center flex items-center justify-center gap-2">
        <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded font-semibold text-[10px]">
          PM SURYA GHAR
        </span>
        <span>
          Get up to <strong>₹78,000 Direct Bank Subsidy</strong> on Nagpur Rooftop Solar.
        </span>
        <span className="hidden md:inline text-slate-400">|</span>
        <span className="hidden md:inline-flex items-center gap-1 text-amber-400">
          <PhoneCall className="w-3 h-3" /> Helpline: 0712-254890
        </span>
      </div>
    </header>
  );
}
