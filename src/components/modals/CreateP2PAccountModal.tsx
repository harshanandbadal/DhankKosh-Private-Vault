"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { createP2PContactAction } from "@/actions/vault";
import { X, Users, Loader2 } from "lucide-react";

export default function CreateP2PAccountModal() {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialStatus, setInitialStatus] = useState<"They Owe Me (To Receive)" | "I Owe Them (To Pay)">(
    "They Owe Me (To Receive)"
  );
  const [openingBalance, setOpeningBalance] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState("Friends");
  const [relationshipRemarks, setRelationshipRemarks] = useState("");

  if (activeModal !== "CREATE_P2P") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createP2PContactAction({
      name: name.trim(),
      phone: phone.trim(),
      initialStatus,
      openingBalance: parseFloat(openingBalance) || 0,
      email: email.trim(),
      group,
      relationshipRemarks: relationshipRemarks.trim(),
    });

    setLoading(false);
    if (res.success) {
      closeModal();
    } else {
      setError(res.error || "Failed to create P2P record");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold tracking-wide text-white">Create P2P Account</h2>
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
          {/* Person Name / Contact Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Person Name / Contact Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rahul Verma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., +91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
              required
            />
          </div>

          {/* Initial Status Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Initial Status</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/60 border border-white/10">
              <button
                type="button"
                onClick={() => setInitialStatus("They Owe Me (To Receive)")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${initialStatus === "They Owe Me (To Receive)"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                They Owe Me (To Receive)
              </button>
              <button
                type="button"
                onClick={() => setInitialStatus("I Owe Them (To Pay)")}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${initialStatus === "I Owe Them (To Pay)"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                I Owe Them (To Pay)
              </button>
            </div>
          </div>

          {/* Opening Balance (₹) & Email Address */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Opening Balance (₹)
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="e.g., 5000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-amber-400 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., rahul@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
              />
            </div>
          </div>

          {/* Group / Category & Relationship / Remarks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Group / Category
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                <option value="Friends">Friends</option>
                <option value="Family">Family</option>
                <option value="Business">Business</option>
                <option value="Colleagues">Colleagues</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Relationship / Remarks
              </label>
              <input
                type="text"
                value={relationshipRemarks}
                onChange={(e) => setRelationshipRemarks(e.target.value)}
                placeholder="e.g., Freelance Project"
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
              <span>Create P2P Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
