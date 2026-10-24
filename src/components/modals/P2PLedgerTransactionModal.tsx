"use client";

import React, { useState, useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { createP2PLedgerTransactionAction } from "@/actions/transactions";
import { X, Users, Loader2 } from "lucide-react";

export default function P2PLedgerTransactionModal({
  p2pContacts = [],
  bankAccounts = [],
  physicalAssets = [],
  giftCards = [],
}: {
  p2pContacts?: any[];
  bankAccounts?: any[];
  physicalAssets?: any[];
  giftCards?: any[];
}) {
  const { activeModal, closeModal, modalPayload } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [p2pContactId, setP2pContactId] = useState(modalPayload?.contactId || "");
  const [mode, setMode] = useState<"PAY" | "RECEIVE">("RECEIVE");
  const [amount, setAmount] = useState(modalPayload?.amount ? String(modalPayload.amount) : "");
  const [sourceType, setSourceType] = useState<"Physical Cash" | "Bank Account" | "Gift Card">("Physical Cash");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (modalPayload?.contactId) {
      setP2pContactId(modalPayload.contactId);
    } else if (p2pContacts[0] && !p2pContactId) {
      setP2pContactId(p2pContacts[0].id);
    }
    if (modalPayload?.amount) {
      setAmount(String(modalPayload.amount));
    }
  }, [modalPayload, p2pContacts, p2pContactId]);

  if (activeModal !== "P2P_TRANSACTION") return null;

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

    const contactToUse = p2pContactId || (p2pContacts[0] ? p2pContacts[0].id : "");
    if (!contactToUse) {
      setError("Please select or create a P2P contact first");
      setLoading(false);
      return;
    }

    const res = await createP2PLedgerTransactionAction({
      p2pContactId: contactToUse,
      mode,
      amount: amountNum,
      sourceType,
      sourceAccountId: sourceAccountId || undefined,
      date,
      remarks,
    });

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to record P2P transaction");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold tracking-wide text-white">P2P Ledger Transaction</h2>
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
          {/* Participant Search / Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Participant Search / Select
            </label>
            <select
              value={p2pContactId}
              onChange={(e) => setP2pContactId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              required
            >
              {p2pContacts.length === 0 ? (
                <option value="">No contacts found — Create a P2P contact first</option>
              ) : (
                p2pContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""} - Net: {c.netBalance >= 0 ? `+₹${c.netBalance}` : `-₹${Math.abs(c.netBalance)}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Pay vs Receive Toggle */}
          <div>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/60 border border-white/10">
              <button
                type="button"
                onClick={() => setMode("PAY")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "PAY"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Pay (You Gave)
              </button>
              <button
                type="button"
                onClick={() => setMode("RECEIVE")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "RECEIVE"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Receive (You Got)
              </button>
            </div>
          </div>

          {/* Amount (₹) & Destination / Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 15000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-amber-400 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Destination / Source
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                <option value="Physical Cash">💵 Physical Record (Cash)</option>
                <option value="Bank Account">🏦 Bank Account</option>
                <option value="Gift Card">🧧 Gift Card</option>
              </select>
            </div>
          </div>

          {/* Specific Source/Destination Account Dropdown if multiple exist */}
          {sourceType === "Bank Account" && bankAccounts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Bank Account
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} (•••• {b.last4Digits}) - Bal: ₹{b.balance}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceType === "Physical Cash" && physicalAssets.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Cash Wallet / Storage
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
              >
                {physicalAssets.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.storageName} - Bal: ₹{c.currentBalance}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
            />
          </div>

          {/* Remarks / Purpose */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Remarks / Purpose
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Hand loan return"
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
              <span>Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
