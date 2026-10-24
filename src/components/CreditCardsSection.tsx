"use client";

import React from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { useModal } from "@/context/ModalContext";
import { formatINR, maskCreditCardNumber } from "@/lib/formatters";
import { CreditCard as CardIcon, Plus, Wifi, Link as LinkIcon } from "lucide-react";

export default function CreditCardsSection({
  creditCards = [],
}: {
  creditCards?: any[];
}) {
  const { isPrivate } = usePrivacy();
  const { openModal } = useModal();

  const getThemeGradient = (theme?: string) => {
    switch (theme?.toLowerCase()) {
      case "red":
        return "from-rose-950 via-slate-900 to-rose-900/60 border-rose-500/30";
      case "gold":
        return "from-amber-950 via-slate-900 to-yellow-900/60 border-amber-500/30";
      case "purple":
        return "from-purple-950 via-slate-900 to-indigo-900/60 border-purple-500/30";
      case "orange":
        return "from-orange-950 via-slate-900 to-amber-900/60 border-orange-500/30";
      case "blue":
      default:
        return "from-blue-950 via-slate-900 to-cyan-900/60 border-cyan-500/30";
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return "bg-emerald-500";
    if (utilization <= 80) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CardIcon className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Credit Cards</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {creditCards.length}
          </span>
        </div>
        <button
          onClick={() => openModal("CREATE_CARD")}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Card</span>
        </button>
      </div>

      {creditCards.length === 0 ? (
        <div className="vault-glass rounded-2xl p-6 text-center border border-dashed border-white/10">
          <p className="text-xs text-slate-400">No credit cards configured yet.</p>
          <button
            onClick={() => openModal("CREATE_CARD")}
            className="mt-3 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-semibold hover:bg-amber-400/30 transition"
          >
            + Add Credit Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
          {creditCards.map((card) => {
            const limit = card.creditLimit || 1;
            const outstanding = card.totalOutstanding || 0;
            const utilization = Math.min(100, Math.round((outstanding / limit) * 100));
            const utilColor = getUtilizationColor(utilization);

            return (
              <div
                key={card.id}
                style={{ aspectRatio: "3.37 / 2.15" }}
                className={`relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${getThemeGradient(
                  card.theme
                )} border shadow-2xl flex flex-col justify-between overflow-hidden group hover:scale-[1.01] transition-all duration-300`}
              >
                {/* Glossy card sheen overlay & ambient shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.08] pointer-events-none" />

                {/* Top Row: EMV Chip & Network / Linked Status */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {/* Realistic Gold EMV Chip */}
                    <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-0.5 shadow-md border border-yellow-600/50 flex flex-col justify-around">
                      <div className="h-[1.5px] w-full bg-amber-700/40" />
                      <div className="h-[1.5px] w-full bg-amber-700/40" />
                    </div>
                    <Wifi className="w-4 h-4 text-slate-300/80 rotate-90" />
                  </div>

                  <div className="flex items-center space-x-2">
                    {card.isSharedLimit && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold flex items-center space-x-1">
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span>linked</span>
                      </span>
                    )}

                    {/* Mastercard / Payment Network Dual Circles */}
                    <div className="flex -space-x-1.5 opacity-90">
                      <div className="w-5 h-5 rounded-full bg-rose-500/90 shadow-sm" />
                      <div className="w-5 h-5 rounded-full bg-amber-500/90 shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* Middle Row: Card Name & Masked Card Number */}
                <div className="relative z-10 my-auto py-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase truncate drop-shadow-sm max-w-[200px]">
                      {card.cardName}
                    </div>
                    <span className="text-[10px] text-slate-300/80 font-mono">
                      DUE {card.dueDateDay}TH
                    </span>
                  </div>

                  <div className="mt-2 text-xs sm:text-base font-mono tracking-[0.22em] text-white font-bold drop-shadow-md">
                    {maskCreditCardNumber(card.last4Digits, isPrivate)}
                  </div>
                </div>

                {/* Bottom Row: Holder Name & Utilization Bar */}
                <div className="relative z-10 pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="overflow-hidden">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                        Card Holder
                      </div>
                      <div className="font-bold text-white uppercase tracking-wider truncate max-w-[140px]">
                        {card.holderName || "Vault Master"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                        Outstanding / Limit
                      </div>
                      <div className="font-mono text-xs font-bold text-white">
                        <span className="text-rose-400">
                          {formatINR(card.totalOutstanding, isPrivate)}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-300">
                          {formatINR(card.creditLimit, isPrivate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-950/80 overflow-hidden border border-white/10">
                      <div
                        style={{ width: `${utilization}%` }}
                        className={`h-full ${utilColor} rounded-full transition-all duration-500`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 min-w-[28px] text-right font-semibold">
                      {utilization}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
