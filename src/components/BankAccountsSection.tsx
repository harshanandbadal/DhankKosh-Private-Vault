"use client";

import React from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { useModal } from "@/context/ModalContext";
import { formatINR, maskAccountNumber } from "@/lib/formatters";
import { Plus, ArrowDownRight, ArrowUpRight, Wifi } from "lucide-react";

export default function BankAccountsSection({
  bankAccounts = [],
}: {
  bankAccounts?: any[];
}) {
  const { isPrivate } = usePrivacy();
  const { openModal } = useModal();

  return (
    <div className="space-y-3">
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
        <div className="vault-glass rounded-2xl p-6 text-center border border-dashed border-white/10">
          <p className="text-xs text-slate-400">No bank accounts linked yet.</p>
          <button
            onClick={() => openModal("CREATE_BANK")}
            className="mt-3 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-semibold hover:bg-amber-400/30 transition"
          >
            + Link Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              style={{ aspectRatio: "3.37 / 2.15" }}
              className="relative rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-amber-400/40 transition-all duration-300 shadow-2xl flex flex-col justify-between group overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950/70 hover:scale-[1.01]"
            >
              {/* Glossy card sheen overlay & ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.08] pointer-events-none" />
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />

              {/* Top Row: Bank Logo 🏦, Bank Name & Contactless / Debit Badge */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                    <span>🏦</span>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[150px]">
                      {account.bankName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {account.accountType || "Savings"} • {account.branch || "Main"}
                    </div>
                  </div>
                </div>

                {/* Contactless Wave & Debit Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-bold font-mono tracking-widest text-slate-300/80 px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                    Debit
                  </span>
                  <Wifi className="w-4 h-4 text-slate-400/80 rotate-90" />
                </div>
              </div>

              {/* Middle Row: EMV Chip & Account Number / Balance */}
              <div className="relative z-10 my-auto py-1">
                <div className="flex items-center justify-between mb-2">
                  {/* Realistic Gold EMV Chip */}
                  <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 p-0.5 shadow-md border border-yellow-600/60 flex flex-col justify-around">
                    <div className="h-[1.5px] w-full bg-amber-800/40" />
                    <div className="h-[1.5px] w-full bg-amber-800/40" />
                  </div>

                  {/* Balance display */}
                  <div className="text-right">
                    <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                      Available Balance
                    </div>
                    <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono tracking-tight">
                      {formatINR(account.balance, isPrivate)}
                    </div>
                  </div>
                </div>

                {/* Masked Card / Account Number */}
                <div className="text-xs sm:text-sm font-mono tracking-[0.2em] text-slate-200 font-semibold drop-shadow-sm">
                  {maskAccountNumber(account.accountNumber, account.last4Digits, isPrivate)}
                </div>
              </div>

              {/* Bottom Row: Holder Name & Quick Actions */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Account Holder
                  </div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider truncate max-w-[130px]">
                    {account.holderName || "Vault Master"}
                  </div>
                </div>

                {/* Quick Deposit & Withdraw Action Buttons */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      openModal("QUICK_BANK", { accountId: account.id, mode: "DEPOSIT" })
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold transition flex items-center space-x-1 shadow-sm active:scale-95"
                    title="Quick Deposit"
                  >
                    <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                    <span>Deposit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openModal("QUICK_BANK", { accountId: account.id, mode: "WITHDRAW" })
                    }
                    className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-semibold transition flex items-center space-x-1 shadow-sm active:scale-95"
                    title="Quick Withdraw"
                  >
                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
