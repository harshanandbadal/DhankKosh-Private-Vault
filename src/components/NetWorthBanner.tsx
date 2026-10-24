"use client";

import React, { useState } from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { formatINR } from "@/lib/formatters";
import { Info } from "lucide-react";

export default function NetWorthBanner({
  summary,
}: {
  summary: {
    netWorth: number;
    grossAssets: number;
    totalLiabilities: number;
  };
}) {
  const { isPrivate } = usePrivacy();
  const [showTooltip, setShowTooltip] = useState(false);

  const netWorth = summary?.netWorth ?? 0;
  const grossAssets = summary?.grossAssets ?? 0;
  const totalLiabilities = summary?.totalLiabilities ?? 0;

  // Percentage bar calculation
  const totalVolume = grossAssets + totalLiabilities;
  const assetRatio = totalVolume > 0 ? (grossAssets / totalVolume) * 100 : 70;
  const liabilityRatio = totalVolume > 0 ? (totalLiabilities / totalVolume) * 100 : 30;

  return (
    <div className="relative vault-glass rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Net Worth Figure */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Total Net Worth
            </span>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-white transition"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="absolute left-6 -top-2 w-64 p-2.5 rounded-xl bg-slate-900 border border-white/20 text-[11px] text-slate-300 shadow-xl z-30 animate-fadeIn">
                  Total Net Worth = (Bank Balances + Cash Safe + Gift Cards + P2P Receivables) - (Credit Card Outstanding + P2P Payables)
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
            {formatINR(netWorth, isPrivate)}
          </div>

          <div className="mt-2 flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <span>Gross Assets =</span>
            <span className="text-emerald-400 font-semibold font-mono">
              {formatINR(grossAssets, isPrivate)}
            </span>
          </div>
        </div>

        {/* Right Column: Health Bar & Breakdown */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col justify-center">
          {/* Multi-segment Health Bar */}
          <div className="h-3 w-full rounded-full bg-slate-950/80 p-0.5 border border-white/10 flex overflow-hidden shadow-inner">
            <div
              style={{ width: `${Math.min(100, Math.max(5, assetRatio))}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-500"
              title={`Assets: ${assetRatio.toFixed(1)}%`}
            />
            <div
              style={{ width: `${Math.min(100, Math.max(5, liabilityRatio))}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-500"
              title={`Liabilities: ${liabilityRatio.toFixed(1)}%`}
            />
          </div>

          {/* Subtext Comparison */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div>
              <div className="text-[11px] text-slate-400">Gross Assets</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {formatINR(grossAssets, isPrivate)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Total Liabilities</div>
              <div className="text-sm font-bold text-rose-400 font-mono">
                {formatINR(totalLiabilities, isPrivate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
