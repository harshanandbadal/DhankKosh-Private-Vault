"use client";

import React, { useState, useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { quickDepositAction, quickWithdrawAction } from "@/actions/vault";
import { X, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/formatters";

export default function QuickBankTxModal({ bankAccounts = [] }: { bankAccounts?: any[] }) {
  const { activeModal, closeModal, modalPayload } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountId, setAccountId] = useState(modalPayload?.accountId || "");
  const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">(modalPayload?.mode || "DEPOSIT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (modalPayload?.accountId) {
      setAccountId(modalPayload.accountId);
    } else if (bankAccounts[0] && !accountId) {
      setAccountId(bankAccounts[0].id);
    }
    if (modalPayload?.mode) {
      setMode(modalPayload.mode);
    }
  }, [modalPayload, bankAccounts, accountId]);

  if (activeModal !== "QUICK_BANK") return null;

  const currentAccount = bankAccounts.find((b) => b.id === accountId) || bankAccounts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Please enter a valid amount");
      setLoading(false);
      return;
    }

    if (!currentAccount) {
      setError("No bank account found");
      setLoading(false);
      return;
    }

    let res;
    if (mode === "DEPOSIT") {
      res = await quickDepositAction(currentAccount.id, amt, description);
    } else {
      res = await quickWithdrawAction(currentAccount.id, amt, description);
    }

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to process transaction");
    }
  };

  const isDeposit = mode === "DEPOSIT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            {isDeposit ? (
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            )}
            <h2 className="text-xl font-semibold tracking-wide text-white">
              {isDeposit ? "Quick Deposit" : "Quick Withdraw"}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Account Pill */}
          {currentAccount && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Target Bank Account 🏦</div>
                <div className="text-sm font-semibold text-white">
                  {currentAccount.bankName}{" "}
                  <span className="text-xs text-slate-400 font-mono">
                    (•••• {currentAccount.last4Digits})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Current Balance</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {formatINR(currentAccount.balance)}
                </div>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/60 border border-white/10">
            <button
              type="button"
              onClick={() => setMode("DEPOSIT")}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${isDeposit
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Deposit Funds
            </button>
            <button
              type="button"
              onClick={() => setMode("WITHDRAW")}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${!isDeposit
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Withdraw Funds
            </button>
          </div>

          {/* Amount (₹) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono font-semibold"
              required
              autoFocus
            />
          </div>

          {/* Quick chips */}
          <div className="flex items-center space-x-2">
            {[5000, 10000, 25000, 50000].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setAmount(String(preset))}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 transition"
              >
                +₹{preset / 1000}k
              </button>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Remarks (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isDeposit ? "e.g., Salary credit or dividend" : "e.g., ATM Cash withdrawal"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 text-sm rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold px-6 py-2.5 text-sm rounded-xl flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isDeposit ? "Confirm Deposit" : "Confirm Withdraw"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
