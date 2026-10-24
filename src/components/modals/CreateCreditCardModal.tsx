"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createCreditCardAction } from "@/actions/vault";
import { X, CreditCard as CardIcon, Loader2 } from "lucide-react";

export default function CreateCreditCardModal({ existingCards = [] }: { existingCards?: any[] }) {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardName, setCardName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [last4Digits, setLast4Digits] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [availableBalance, setAvailableBalance] = useState("");
  const [totalOutstanding, setTotalOutstanding] = useState("");
  const [isSharedLimit, setIsSharedLimit] = useState(false);
  const [parentCardId, setParentCardId] = useState("");
  const [dueDateDay, setDueDateDay] = useState(15);
  const [theme, setTheme] = useState("blue");

  if (activeModal !== "CREATE_CARD") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedLast4 = last4Digits.trim();
    if (trimmedLast4.length !== 4) {
      setError("Please enter the last 4 digits of the card");
      setLoading(false);
      return;
    }

    const limitNum = parseFloat(creditLimit) || 0;
    const availNum = availableBalance !== "" ? (parseFloat(availableBalance) || 0) : limitNum;
    const outNum = parseFloat(totalOutstanding) || 0;

    const res = await createCreditCardAction({
      cardName: cardName.trim(),
      holderName: holderName.trim(),
      last4Digits: trimmedLast4,
      creditLimit: limitNum,
      availableBalance: availNum,
      totalOutstanding: outNum,
      dueDateDay: Number(dueDateDay),
      theme,
      isSharedLimit,
      parentCardId: isSharedLimit && parentCardId ? parentCardId : null,
    });

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to create credit card");
    }
  };

  const THEMES = [
    { id: "blue", label: "Midnight Blue", class: "bg-blue-600/40 border-blue-400" },
    { id: "red", label: "Crimson Red", class: "bg-rose-600/40 border-rose-400" },
    { id: "gold", label: "Imperial Gold", class: "bg-amber-500/40 border-amber-400" },
    { id: "purple", label: "Royal Purple", class: "bg-purple-600/40 border-purple-400" },
    { id: "orange", label: "Sunset Orange", class: "bg-orange-600/40 border-orange-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <CardIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold tracking-wide text-white">Create Credit Card</h2>
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
          {/* Card Name / Label */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Card Name / Label
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g., HDFC Regalia Gold"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              required
            />
          </div>

          {/* Card Holder Name & Last 4 Digits */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Card Holder Name
              </label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="e.g., Mr. Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Last 4 Digits
              </label>
              <input
                type="text"
                maxLength={4}
                value={last4Digits}
                onChange={(e) => setLast4Digits(e.target.value)}
                placeholder="e.g., 8901"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-amber-400 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition text-sm text-center"
                required
              />
            </div>
          </div>

          {/* Credit Limit & Available Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => {
                  setCreditLimit(e.target.value);
                  if (availableBalance === "" || availableBalance === creditLimit) {
                    setAvailableBalance(e.target.value);
                  }
                }}
                placeholder="e.g., 500000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Available Balance (₹)
              </label>
              <input
                type="number"
                value={availableBalance}
                onChange={(e) => setAvailableBalance(e.target.value)}
                placeholder="e.g., 500000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
              />
            </div>
          </div>

          {/* Total Outstanding */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Total Outstanding (₹)
            </label>
            <input
              type="number"
              value={totalOutstanding}
              onChange={(e) => setTotalOutstanding(e.target.value)}
              placeholder="e.g., 0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-rose-400 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
            />
          </div>

          {/* Shared Limit Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200">
                Link this card to an existing card's limit
              </span>
              <button
                type="button"
                onClick={() => setIsSharedLimit(!isSharedLimit)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isSharedLimit ? "bg-amber-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    isSharedLimit ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {isSharedLimit && (
              <div className="pt-2">
                <label className="block text-xs text-slate-400 mb-1">Select Parent Primary Card</label>
                <select
                  value={parentCardId}
                  onChange={(e) => setParentCardId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/50"
                >
                  <option value="">-- Choose Primary Card --</option>
                  {existingCards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cardName} (•••• {c.last4Digits})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Due Date & Card Theme */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Due Date
              </label>
              <select
                value={dueDateDay}
                onChange={(e) => setDueDateDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                    {d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"} of Month
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Card Theme</label>
              <div className="flex items-center space-x-1.5 pt-1">
                {THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${t.class} ${
                      theme === t.id ? "scale-125 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900" : "opacity-70 hover:opacity-100"
                    }`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
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
              <span>Create Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
