"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createPhysicalAssetAction } from "@/actions/vault";
import { X, Loader2 } from "lucide-react";

const DENOMINATIONS = [500, 200, 100, 50, 20, 10] as const;

export default function CreatePhysicalAssetModal() {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storageName, setStorageName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [counts, setCounts] = useState<Record<number, number>>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
  });
  const [locationDetails, setLocationDetails] = useState("");
  const [remarks, setRemarks] = useState("");

  if (activeModal !== "CREATE_PHYSICAL") return null;

  const handleDenominationChange = (denom: number, countVal: string) => {
    const count = parseInt(countVal) || 0;
    const newCounts = { ...counts, [denom]: count };
    setCounts(newCounts);

    // Auto-calculate sum across all denominations
    let total = 0;
    for (const d of DENOMINATIONS) {
      total += d * (newCounts[d] || 0);
    }
    setCurrentBalance(total > 0 ? String(total) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createPhysicalAssetAction({
      storageName: storageName.trim(),
      holderName: holderName.trim(),
      currentBalance: parseFloat(currentBalance) || 0,
      denominations: counts,
      locationDetails: locationDetails.trim(),
      remarks: remarks.trim(),
      assetType: "CASH",
    });

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to add physical cash record");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xl leading-none">💵</span>
            <h2 className="text-xl font-semibold tracking-wide text-white">Add Physical Record</h2>
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
          {/* Locker / Storage Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Locker / Storage Name
            </label>
            <input
              type="text"
              value={storageName}
              onChange={(e) => setStorageName(e.target.value)}
              placeholder="e.g., Home Safe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              required
            />
          </div>

          {/* Holders / Owners */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Holders / Owners
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

          {/* Current Balance (₹) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Current Balance (₹)</label>
              <span className="text-[11px] text-amber-400/90 font-mono">
                Synced with denomination counter
              </span>
            </div>
            <input
              type="number"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              placeholder="e.g., 250000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono font-semibold"
              required
            />
          </div>

          {/* Interactive Currency Denominations Breakup */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Denominations Breakup (Interactive Counter)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {DENOMINATIONS.map((d) => (
                <div key={d} className="flex items-center space-x-1.5 bg-slate-900/80 border border-white/10 p-1.5 rounded-lg">
                  <span className="text-xs font-medium text-amber-400 min-w-[42px]">₹{d} ×</span>
                  <input
                    type="number"
                    min={0}
                    value={counts[d] || ""}
                    onChange={(e) => handleDenominationChange(d, e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-950 px-1.5 py-1 text-xs text-white text-center rounded border border-white/10 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Location / Vault Details */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Location / Vault Details
            </label>
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="e.g., Primary residence, bedroom safe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
            />
          </div>

          {/* Description / Remarks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Emergency funds kept in cash"
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
              <span>Create Cash Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
