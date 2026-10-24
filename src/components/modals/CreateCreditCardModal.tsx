"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createCreditCardAction } from "@/actions/vault";
import { X, CreditCard as CardIcon, Loader2 } from "lucide-react";

const POPULAR_BANKS = [
  "HDFC Bank",
  "State Bank of India (SBI)",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "RBL Bank",
  "IndusInd Bank",
  "Federal Bank",
  "IDFC FIRST Bank",
  "Standard Chartered",
  "HSBC",
  "American Express",
  "Bank of Baroda",
  "AU Small Finance Bank",
  "Yes Bank",
  "Punjab National Bank (PNB)",
  "Canara Bank",
];

const POPULAR_CARDS = [
  "Amazon Pay",
  "Flipkart",
  "Regalia Gold",
  "Infinia",
  "Millennia",
  "Magnus",
  "Atlas",
  "Tata Neu Infinity",
  "SimplyCLICK",
  "SimplySAVE",
  "Coral",
  "Rubyx",
  "Sapphiro",
  "OneCard",
  "Swiggy",
  "Airtel Axis",
  "IndianOil",
  "Club Vistara",
];

export default function CreateCreditCardModal({ existingCards = [] }: { existingCards?: any[] }) {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardName, setCardName] = useState("");
  const [issuingBank, setIssuingBank] = useState("");
  const [holderName, setHolderName] = useState("");
  const [last4Digits, setLast4Digits] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [isSharedLimit, setIsSharedLimit] = useState(false);
  const [parentCardId, setParentCardId] = useState("");
  const [dueDateDay, setDueDateDay] = useState(15);
  const [theme, setTheme] = useState("blue");

  if (activeModal !== "CREATE_CARD") return null;

  const resetForm = () => {
    setCardName("");
    setIssuingBank("");
    setHolderName("");
    setLast4Digits("");
    setCreditLimit("");
    setIsSharedLimit(false);
    setParentCardId("");
    setDueDateDay(15);
    setTheme("blue");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedCardName = cardName.trim();
    const trimmedBank = issuingBank.trim();
    const trimmedHolder = holderName.trim();
    const trimmedLast4 = last4Digits.trim();

    if (!trimmedCardName) {
      setError("Please enter Card Name / Label");
      setLoading(false);
      return;
    }

    if (trimmedLast4.length !== 4 || !/^\d{4}$/.test(trimmedLast4)) {
      setError("Please enter exactly 4 digits for Last 4 Digits");
      setLoading(false);
      return;
    }

    const limitNum = parseFloat(creditLimit) || 0;
    if (limitNum <= 0 && !isSharedLimit) {
      setError("Please enter a valid credit limit");
      setLoading(false);
      return;
    }

    // Compose final card name with issuing bank if not already present
    let finalCardName = trimmedCardName;
    if (trimmedBank) {
      const lowerCard = trimmedCardName.toLowerCase();
      const lowerBank = trimmedBank.toLowerCase();
      if (!lowerCard.includes(lowerBank)) {
        finalCardName = `${trimmedBank} ${trimmedCardName}`;
      }
    }

    const res = await createCreditCardAction({
      cardName: finalCardName,
      holderName: trimmedHolder || "Cardholder",
      last4Digits: trimmedLast4,
      creditLimit: limitNum,
      availableBalance: limitNum,
      totalOutstanding: 0,
      dueDateDay: Number(dueDateDay),
      theme,
      isSharedLimit,
      parentCardId: isSharedLimit && parentCardId ? parentCardId : null,
    });

    setLoading(false);
    if (res.success) {
      resetForm();
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
          {/* Card Name / Label */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Card Name / Label
            </label>
            <div className="relative">
              <input
                type="text"
                list="card-name-suggestions"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="eg. Amazon Pay, Flipkart..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
                required
              />
              <datalist id="card-name-suggestions">
                {POPULAR_CARDS.map((card) => (
                  <option key={card} value={card} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Issuing Banks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Issuing Banks
            </label>
            <div className="relative">
              <input
                type="text"
                list="issuing-bank-suggestions"
                value={issuingBank}
                onChange={(e) => setIssuingBank(e.target.value)}
                placeholder="eg. HDFC, SBI..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              />
              <datalist id="issuing-bank-suggestions">
                {POPULAR_BANKS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Card Holder Name & Last 4 Digits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Card Holder Name
              </label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="eg. Mr. Harsh Anand"
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
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setLast4Digits(cleaned);
                }}
                placeholder="eg. 9696"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-amber-400 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition text-sm text-center tracking-widest"
                required
              />
            </div>
          </div>

          {/* Credit Limit (₹) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Credit Limit (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="eg. 1,00,000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
              required={!isSharedLimit}
            />
          </div>

          {/* Link this card to an existing card's limit (on/off) */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200">
                Link this card to an existing card's limit (on/off)
              </span>
              <button
                type="button"
                onClick={() => setIsSharedLimit(!isSharedLimit)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSharedLimit ? "bg-amber-500" : "bg-slate-700"
                }`}
                title={isSharedLimit ? "Link Limit: ON" : "Link Limit: OFF"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSharedLimit ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {isSharedLimit && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-xs text-slate-400 mb-1">
                  Select Primary Card
                </label>
                {existingCards && existingCards.length > 0 ? (
                  <select
                    value={parentCardId}
                    onChange={(e) => setParentCardId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/50"
                    required={isSharedLimit}
                  >
                    <option value="">-- Choose Primary Card --</option>
                    {existingCards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cardName} (•••• {c.last4Digits})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-400/80 italic">
                    No primary cards found in your vault yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Billing Date & Card Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Billing Date
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Card Theme
              </label>
              <div className="flex items-center space-x-2 pt-1">
                {THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${t.class} ${
                      theme === t.id
                        ? "scale-110 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900"
                        : "opacity-60 hover:opacity-100"
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
              <span>Create Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
