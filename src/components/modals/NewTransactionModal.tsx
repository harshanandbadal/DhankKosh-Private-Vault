"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createNewTransactionAction } from "@/actions/transactions";
import { X, ArrowLeftRight, Loader2 } from "lucide-react";

export default function NewTransactionModal({
  bankAccounts = [],
  creditCards = [],
  physicalAssets = [],
}: {
  bankAccounts?: any[];
  creditCards?: any[];
  physicalAssets?: any[];
}) {
  const { activeModal, closeModal, modalPayload } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"Deposit" | "Withdraw">("Deposit");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(
    modalPayload?.accountId ||
      (bankAccounts[0] ? `bank:${bankAccounts[0].id}` : "") ||
      (physicalAssets[0] ? `cash:${physicalAssets[0].id}` : "")
  );
  const [category, setCategory] = useState("Salary");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  if (activeModal !== "NEW_TRANSACTION") return null;

  const CATEGORIES = [
    "Salary",
    "Fuel",
    "Groceries",
    "P2P Settlement",
    "Dining & Restaurants",
    "Shopping & Retail",
    "Bills & Utilities",
    "Investment / Dividend",
    "Healthcare",
    "Entertainment",
    "General",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount");
      setLoading(false);
      return;
    }

    const res = await createNewTransactionAction({
      type,
      amount: amountNum,
      accountId: accountId || (bankAccounts[0] ? `bank:${bankAccounts[0].id}` : ""),
      category,
      date,
      description,
    });

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to confirm transaction");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold tracking-wide text-white">New Transaction</h2>
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
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/60 border border-white/10">
              <button
                type="button"
                onClick={() => setType("Deposit")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  type === "Deposit"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setType("Withdraw")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  type === "Withdraw"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Withdraw
              </button>
            </div>
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
            />
          </div>

          {/* From/To Account & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                From/To Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
                required
              >
                <optgroup label="🏦 Bank Accounts">
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={`bank:${b.id}`}>
                      {b.bankName} (•••• {b.last4Digits})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="💵 Physical Records">
                  {physicalAssets.map((c) => (
                    <option key={c.id} value={`cash:${c.id}`}>
                      {c.storageName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="💳 Credit Cards">
                  {creditCards.map((c) => (
                    <option key={c.id} value={`card:${c.id}`}>
                      {c.cardName} (•••• {c.last4Digits})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Date & Time</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
            />
          </div>

          {/* Description / Remarks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Remark
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Paid to Rahul for trip"
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
              <span>Confirm Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
