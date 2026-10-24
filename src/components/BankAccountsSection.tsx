"use client";

import React from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { useModal } from "@/context/ModalContext";
import { formatINR, maskAccountNumber } from "@/lib/formatters";
import { Building2, Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function BankAccountsSection({
  bankAccounts = [],
}: {
  bankAccounts?: any[];
}) {
  const { isPrivate } = usePrivacy();
  const { openModal } = useModal();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-amber-400" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="vault-glass rounded-2xl p-4 border border-white/10 hover:border-amber-400/30 transition shadow-lg flex flex-col justify-between group"
            >
              {/* Top Row: Icon & Bank Name */}
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-sm">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{account.bankName}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {account.accountType || "Savings"} • {account.branch || "Private Vault"}
                    </div>
                  </div>
                </div>

                {/* Account Number & Balance */}
                <div className="mt-3">
                  <div className="text-[11px] font-mono text-slate-400 tracking-wider">
                    {maskAccountNumber(account.accountNumber, account.last4Digits, isPrivate)}
                  </div>
                  <div className="mt-1 text-lg font-bold text-white font-mono">
                    {formatINR(account.balance, isPrivate)}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Quick Deposit & Quick Withdraw Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() =>
                    openModal("QUICK_BANK", { accountId: account.id, mode: "DEPOSIT" })
                  }
                  className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 border border-white/10 text-[11px] font-medium text-slate-300 transition flex items-center justify-center space-x-1"
                >
                  <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() =>
                    openModal("QUICK_BANK", { accountId: account.id, mode: "WITHDRAW" })
                  }
                  className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 border border-white/10 text-[11px] font-medium text-slate-300 transition flex items-center justify-center space-x-1"
                >
                  <ArrowUpRight className="w-3 h-3 text-rose-400" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
