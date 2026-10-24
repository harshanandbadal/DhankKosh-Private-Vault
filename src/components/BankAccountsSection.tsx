"use client";

import React, { useState } from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { useModal } from "@/context/ModalContext";
import { formatINR } from "@/lib/formatters";
import { Plus, ArrowDownRight, ArrowUpRight, Copy, Check } from "lucide-react";

export default function BankAccountsSection({
  bankAccounts = [],
}: {
  bankAccounts?: any[];
}) {
  const { isPrivate } = usePrivacy();
  const { openModal } = useModal();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyAcc = (e: React.MouseEvent, acc: any) => {
    e.stopPropagation();
    const details = `Bank: ${acc.bankName}\nAccount Holder: ${acc.holderName}\nAccount No: **** ${acc.last4Digits}\nIFSC: ${acc.ifscCode || "NEXB0004812"}\nBranch: ${acc.branch || "Main Branch"}`;
    navigator.clipboard.writeText(details);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-base leading-none">🏦</span>
          <h3 className="text-sm font-bold text-white tracking-wide">Bank Accounts</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {bankAccounts.length}
          </span>
        </div>
        <button
          onClick={() => openModal("CREATE_BANK")}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Bank</span>
        </button>
      </div>

      {bankAccounts.length === 0 ? (
        <div className="vault-glass rounded-3xl p-8 text-center border border-dashed border-white/10">
          <p className="text-xs text-slate-400">No bank accounts linked yet.</p>
          <button
            onClick={() => openModal("CREATE_BANK")}
            className="mt-3 px-4 py-2 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-semibold hover:bg-amber-400/30 transition shadow-sm"
          >
            + Link Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bankAccounts.map((account) => {
            const rawType = (account.accountType || "Savings").toUpperCase();
            const accountTypeDisplay = rawType.includes("SAVINGS")
              ? rawType
              : `${rawType} SAVINGS`;

            return (
              <div
                key={account.id}
                style={{
                  aspectRatio: "3.37 / 2.15",
                  background: `
                    radial-gradient(circle at 18% 30%, rgba(217, 70, 239, 0.45) 0%, transparent 48%),
                    radial-gradient(circle at 76% 18%, rgba(245, 158, 11, 0.42) 0%, transparent 42%),
                    radial-gradient(circle at 82% 82%, rgba(34, 211, 238, 0.38) 0%, transparent 50%),
                    radial-gradient(circle at 45% 65%, rgba(139, 92, 246, 0.48) 0%, transparent 52%),
                    linear-gradient(135deg, rgba(13, 17, 35, 0.92) 0%, rgba(28, 22, 68, 0.88) 50%, rgba(10, 14, 28, 0.96) 100%)
                  `,
                  boxShadow: `
                    0 22px 50px -10px rgba(0, 0, 0, 0.85),
                    0 0 0 1px rgba(255, 255, 255, 0.22),
                    0 0 32px rgba(168, 85, 247, 0.22),
                    0 0 42px rgba(56, 189, 248, 0.18),
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.75),
                    inset 0 -1.5px 2px 0 rgba(217, 70, 239, 0.45),
                    inset 1.5px 0 2px 0 rgba(56, 189, 248, 0.45)
                  `,
                }}
                className="relative rounded-3xl p-4 sm:p-5 border border-white/35 transition-all duration-300 flex flex-col justify-between group overflow-hidden select-none hover:scale-[1.015] hover:shadow-[0_28px_60px_-10px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.35)]"
              >
                {/* Diagonal Glass Reflection & Sheen */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{
                    background:
                      "linear-gradient(115deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 32%, transparent 55%, rgba(255, 255, 255, 0.08) 100%)",
                  }}
                />

                {/* Hover Quick Actions Bar (Deposit, Withdraw, Copy) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center space-x-1.5 z-30">
                  <button
                    type="button"
                    onClick={(e) => handleCopyAcc(e, account)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/25 backdrop-blur-md transition shadow-md"
                    title="Copy Account Details"
                  >
                    {copiedId === account.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-200" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("QUICK_BANK", { accountId: account.id, mode: "DEPOSIT" });
                    }}
                    className="px-2.5 py-1 rounded-full bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/40 backdrop-blur-md text-[10px] font-bold transition flex items-center space-x-1 shadow-lg active:scale-95"
                    title="Quick Deposit"
                  >
                    <ArrowDownRight className="w-3 h-3 text-emerald-300" />
                    <span>Deposit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("QUICK_BANK", { accountId: account.id, mode: "WITHDRAW" });
                    }}
                    className="px-2.5 py-1 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border border-rose-400/40 backdrop-blur-md text-[10px] font-bold transition flex items-center space-x-1 shadow-lg active:scale-95"
                    title="Quick Withdraw"
                  >
                    <ArrowUpRight className="w-3 h-3 text-rose-300" />
                    <span>Withdraw</span>
                  </button>
                </div>

                {/* Top Row: Metallic 3D Bank Logo & Name + Contactless / ALL-IN-ONE CARD */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    {/* Metallic Chrome Monogram Emblem */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-white via-slate-200 to-slate-400 p-[1.5px] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center shrink-0">
                      <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 font-black text-lg sm:text-xl tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          N
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate max-w-[140px] sm:max-w-[180px]">
                        {account.bankName || "NEXUS BANK"}
                      </div>
                      <div className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] text-slate-300 uppercase drop-shadow-sm">
                        PRIME
                      </div>
                    </div>
                  </div>

                  {/* Top Right: Contactless Payment Wave & ALL-IN-ONE CARD badge */}
                  <div className="flex flex-col items-end space-y-1.5 group-hover:opacity-20 transition-opacity duration-200">
                    {/* Contactless Wave Icon */}
                    <svg
                      className="w-5 h-5 text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M8.5 15.5a5 5 0 0 1 0-7" />
                      <path d="M12 18a8.5 8.5 0 0 1 0-12" />
                      <path d="M15.5 20.5a12 12 0 0 1 0-17" />
                    </svg>

                    {/* ALL-IN-ONE CARD Pill Badge */}
                    <div className="px-2.5 py-0.5 rounded-full border border-white/30 bg-white/[0.08] backdrop-blur-md text-[7px] sm:text-[8px] font-bold tracking-widest text-slate-100 uppercase shadow-sm">
                      ALL-IN-ONE CARD
                    </div>
                  </div>
                </div>

                {/* Middle Row: Realistic Gold EMV Chip + ACCOUNT TYPE + Floating Frosted Balance Capsule */}
                <div className="relative z-10 flex items-center justify-between gap-2 my-auto py-1">
                  {/* Left: EMV Chip & Account Type */}
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    {/* Realistic Gold EMV Microchip */}
                    <div className="relative w-10 h-7 sm:w-11 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-200 to-yellow-500 p-[1.5px] shadow-[0_0_16px_rgba(245,158,11,0.45),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-amber-300/80 shrink-0">
                      <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 relative p-1 flex flex-col justify-between overflow-hidden">
                        {/* Microchip Contact Lines */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-3 sm:w-3.5 h-full border-x border-amber-900/40" />
                        </div>
                        <div className="h-[1.5px] w-full bg-amber-900/40 relative z-10" />
                        <div className="h-1.5 w-2.5 rounded-sm border border-amber-900/40 mx-auto relative z-10" />
                        <div className="h-[1.5px] w-full bg-amber-900/40 relative z-10" />
                      </div>
                    </div>

                    {/* Account Type Display */}
                    <div>
                      <div className="text-[7px] sm:text-[8px] font-bold text-amber-200/80 tracking-widest uppercase">
                        ACCOUNT TYPE:
                      </div>
                      <div className="text-[11px] sm:text-xs font-black text-amber-100 tracking-wider uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                        {accountTypeDisplay}
                      </div>
                    </div>
                  </div>

                  {/* Right: Floating Frosted Balance Capsule Pod */}
                  <div className="relative rounded-2xl sm:rounded-3xl px-3 py-1.5 sm:px-4 sm:py-2 bg-white/[0.1] backdrop-blur-2xl border border-white/40 shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-1px_2px_rgba(0,0,0,0.25)] flex flex-col items-end shrink-0">
                    <div className="text-[7px] sm:text-[8px] font-bold text-slate-300 uppercase tracking-widest drop-shadow-sm">
                      AVAILABLE BALANCE
                    </div>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-sm sm:text-base lg:text-lg font-black text-white font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {formatINR(account.balance, isPrivate)}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 font-sans tracking-wider">
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Account Holder & Details Row (Account No, IFSC, Branch) */}
                <div className="relative z-10 space-y-1.5">
                  {/* Account Holder Name */}
                  <div>
                    <div className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest drop-shadow-sm">
                      ACCOUNT HOLDER
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] truncate max-w-[200px] sm:max-w-[280px]">
                      {account.holderName ? account.holderName.toUpperCase() : "ALEXANDER V. THORNE"}
                    </div>
                  </div>

                  {/* 3 Columns: Account No (Last 4), IFSC Code, Branch */}
                  <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-white/10 text-left">
                    <div>
                      <div className="text-[6.5px] sm:text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                        ACCOUNT NO. (LAST 4)
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono font-black text-white tracking-widest drop-shadow-sm">
                        **** {account.last4Digits || "8942"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[6.5px] sm:text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                        IFSC CODE
                      </div>
                      <div className="text-[8.5px] sm:text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider drop-shadow-sm truncate">
                        {account.ifscCode ? account.ifscCode.toUpperCase() : "NEXB0004812"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[6.5px] sm:text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                        BRANCH
                      </div>
                      <div className="text-[8.5px] sm:text-[10px] font-bold text-slate-200 uppercase tracking-wider drop-shadow-sm truncate">
                        {account.branch ? account.branch.toUpperCase() : "METROPOLIS MAIN"}
                      </div>
                    </div>
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
