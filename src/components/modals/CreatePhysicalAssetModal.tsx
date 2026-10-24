"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createPhysicalAssetAction } from "@/actions/vault";
import { X, Loader2 } from "lucide-react";

export default function CreatePhysicalAssetModal() {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storageName, setStorageName] = useState("");

  if (activeModal !== "CREATE_PHYSICAL") return null;

  const resetForm = () => {
    setStorageName("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storageName.trim()) {
      setError("Please enter a locker / storage name");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await createPhysicalAssetAction({
      storageName: storageName.trim(),
      holderName: "Vault Owner",
      currentBalance: 0,
      denominations: {},
      locationDetails: "",
      remarks: "",
      assetType: "CASH",
    });

    setLoading(false);
    if (res.success) {
      resetForm();
      closeModal();
    } else {
      setError(res.error || "Failed to create physical record");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xl leading-none">💵</span>
            <h2 className="text-xl font-semibold tracking-wide text-white">Create Physical Record</h2>
          </div>
          <button
            onClick={handleClose}
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
              placeholder="e.g., Home Safe, Wallet..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              required
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
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
              <span>Create Physical Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
