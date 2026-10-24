"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createBankAccountAction } from "@/actions/vault";
import { X, Search, Loader2 } from "lucide-react";

const POPULAR_BANKS = [
  "HDFC Bank",
  "State Bank of India (SBI)",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Canara Bank",
  "IndusInd Bank",
  "Yes Bank",
];

export default function CreateBankAccountModal() {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [accountType, setAccountType] = useState<"Savings" | "Current" | "Salary">("Savings");
  const [accountNumber, setAccountNumber] = useState("");
  const [last4Digits, setLast4Digits] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branch, setBranch] = useState("");

  if (activeModal !== "CREATE_BANK") return null;

  const handleAccountNumberChange = (val: string) => {
    setAccountNumber(val);
    if (val.length >= 4) {
      setLast4Digits(val.slice(-4));
    } else {
      setLast4Digits(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedAcc = accountNumber.trim();
    if (!trimmedAcc || trimmedAcc.length < 4) {
      setError("Please enter a valid account number (minimum 4 digits)");
      setLoading(false);
      return;
    }

    const res = await createBankAccountAction({
      bankName: bankName.trim(),
      holderName: holderName.trim(),
      accountType,
      accountNumber: trimmedAcc,
      last4Digits: (last4Digits.trim() || trimmedAcc.slice(-4)).slice(-4),
      initialBalance: parseFloat(initialBalance) || 0,
      ifscCode: ifscCode.trim(),
      branch: branch.trim(),
    });

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to create account");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xl leading-none">🏦</span>
            <h2 className="text-xl font-semibold tracking-wide text-white">Create Bank Account</h2>
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
          {/* Bank Name / Search */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Bank Name / Search
            </label>
            <div className="relative">
              <input
                type="text"
                list="bank-suggestions"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., HDFC Bank"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
                required
              />
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <datalist id="bank-suggestions">
                {POPULAR_BANKS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Account Holder Name
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

          {/* Account Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Type</label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950/60 border border-white/10">
              {(["Savings", "Current", "Salary"] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    accountType === type
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Account Number & Last 4 Digits */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                placeholder="e.g., 1234567890"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Last 4 Digits
              </label>
              <input
                type="text"
                maxLength={4}
                value={last4Digits}
                onChange={(e) => setLast4Digits(e.target.value)}
                placeholder="e.g., 3223"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-amber-400 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition text-sm text-center"
              />
            </div>
          </div>

          {/* Initial / Opening Balance (₹) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Initial / Opening Balance (₹)
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="e.g., 50000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
            />
          </div>

          {/* IFSC Code & Branch/City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                IFSC Code (Optional)
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g., HDFC0000123"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Branch / City
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g., New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              />
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
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
