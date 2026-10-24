"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createGiftCardAction } from "@/actions/vault";
import { X, Gift, Loader2 } from "lucide-react";

export default function CreateGiftCardModal({ bankAccounts = [] }: { bankAccounts?: any[] }) {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brandName, setBrandName] = useState("");
  const [ownerName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [last4Digits, setLast4Digits] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [linkedAccountId, setLinkedAccountId] = useState("");
  const [purchaseMethod, setPurchaseMethod] = useState("Credit Card");
  const [remarks, setRemarks] = useState("");

  if (activeModal !== "CREATE_GIFT") return null;

  const handleCardNumberChange = (val: string) => {
    setCardNumber(val);
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length >= 4) {
      setLast4Digits(cleaned.slice(-4));
    } else {
      setLast4Digits(val.slice(-4));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedCard = cardNumber.trim();
    const derivedLast4 = last4Digits.trim() || (trimmedCard ? trimmedCard.replace(/\D/g, "").slice(-4) : "");

    const res = await createGiftCardAction({
      brandName: brandName.trim(),
      ownerName: ownerName.trim(),
      cardNumber: trimmedCard,
      last4Digits: derivedLast4 || "0000",
      initialBalance: parseFloat(initialBalance) || 0,
      expiryDate: expiryDate || undefined,
      linkedAccountId,
      purchaseMethod,
      remarks: remarks.trim(),
    });

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to create gift card record");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold tracking-wide text-white">Add Gift Card Record</h2>
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
          {/* Gift Card Brand / Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Gift Card Brand / Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g., Amazon Pay, Flipkart"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              required
            />
          </div>

          {/* Owner / User */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Owner / User
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="e.g., Mr. Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              required
            />
          </div>

          {/* Card Number / Unique ID & Last 4 Digits */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Card Number / Unique ID
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="e.g., 9876-5432-1098-7654"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
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
                placeholder="e.g., 7654"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-amber-400 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition text-sm text-center"
              />
            </div>
          </div>

          {/* Initial Balance (₹) & Expiry Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Initial Balance (₹)
              </label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="e.g., 10000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-amber-400 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              />
            </div>
          </div>

          {/* Linked Account (Optional) & Purchase Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Linked Account (Optional)
              </label>
              <select
                value={linkedAccountId}
                onChange={(e) => setLinkedAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                <option value="">None</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} (..{b.last4Digits})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Purchase Method
              </label>
              <select
                value={purchaseMethod}
                onChange={(e) => setPurchaseMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Account">Bank Account</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Remarks / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Remarks / Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Birthday gift from sibling"
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
              <span>Create Gift Card Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
