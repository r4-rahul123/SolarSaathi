"use client";

import React from "react";
import { Sun, Zap, Home, BatteryCharging, ArrowRight } from "lucide-react";

interface AnimatedEnergyFlowProps {
  systemSizeKw: number;
}

export function AnimatedEnergyFlow({ systemSizeKw }: AnimatedEnergyFlowProps) {
  const annualUnits = systemSizeKw * 1400;
  const dailyUnits = (annualUnits / 365).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-6 border-b border-slate-800 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Live Solar Energy Simulation</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Vidarbha Rooftop Generation & MSEDCL Net-Metering Flow
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Generating ~{dailyUnits} kWh Daily</span>
        </div>
      </div>

      {/* Interactive Animated SVG Energy Circuit */}
      <div className="py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-center">
          {/* Node 1: Vidarbha Sun */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative group hover:border-amber-400/40 transition-colors">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2 animate-pulse">
                <Sun className="w-9 h-9 animate-[spin_20s_linear_infinite]" />
              </div>
              <div className="absolute -inset-1 rounded-full bg-amber-400/20 blur-md pointer-events-none animate-pulse" />
            </div>
            <span className="font-bold text-xs text-slate-200">Nagpur Sunlight</span>
            <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">5.6 kWh/m²/day Peak</span>
          </div>

          {/* Node 2: Rooftop Solar Panels */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative group hover:border-blue-400/40 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
              <div className="grid grid-cols-2 gap-1 p-2 bg-slate-900/80 rounded-lg border border-blue-400/40">
                <div className="w-3.5 h-3.5 bg-blue-500/80 rounded-xs animate-pulse" />
                <div className="w-3.5 h-3.5 bg-blue-500/80 rounded-xs animate-pulse delay-75" />
                <div className="w-3.5 h-3.5 bg-blue-500/80 rounded-xs animate-pulse delay-150" />
                <div className="w-3.5 h-3.5 bg-blue-500/80 rounded-xs animate-pulse delay-200" />
              </div>
            </div>
            <span className="font-bold text-xs text-slate-200">{systemSizeKw} kW Mono PERC</span>
            <span className="text-[10px] text-blue-400 font-mono mt-0.5">{systemSizeKw * 1000}W DC Generation</span>
          </div>

          {/* Node 3: On-Grid Smart Inverter */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative group hover:border-emerald-400/40 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <BatteryCharging className="w-8 h-8 animate-pulse" />
            </div>
            <span className="font-bold text-xs text-slate-200">On-Grid Smart Inverter</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5">98.4% Efficiency • 230V AC</span>
          </div>

          {/* Node 4: Home & Net-Meter Grid */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative group hover:border-purple-400/40 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
              <Home className="w-8 h-8 text-purple-400" />
            </div>
            <span className="font-bold text-xs text-slate-200">MSEDCL Net-Meter</span>
            <span className="text-[10px] text-purple-300 font-mono mt-0.5">Surplus Export to Grid</span>
          </div>
        </div>

        {/* Animated Direction Indicator Strips */}
        <div className="hidden md:flex items-center justify-between px-12 pt-4 text-slate-600 text-xs font-mono">
          <div className="flex items-center gap-1 text-amber-400/60 animate-pulse">
            <span>Photons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 text-blue-400/60 animate-pulse">
            <span>DC Power</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 text-emerald-400/60 animate-pulse">
            <span>Clean 230V AC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Energy Metrics Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <span className="text-slate-400 block text-[10px]">Annual Clean Energy</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {annualUnits.toLocaleString()} kWh (Units)
          </span>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <span className="text-slate-400 block text-[10px]">Coal Burn Prevented</span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            ~{(annualUnits * 0.45).toFixed(0)} kg / year
          </span>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-slate-400 block text-[10px]">Equivalent Trees Planted</span>
          <span className="font-mono font-bold text-blue-400 text-sm">
            ~{Math.round(annualUnits / 85)} Trees / year
          </span>
        </div>
      </div>
    </div>
  );
}
