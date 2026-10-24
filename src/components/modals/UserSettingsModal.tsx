"use client";

import React, { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { updateProfileAction, resetVaultDataAction, deleteAccountAction, seedSampleVaultAction } from "@/actions/settings";
import { X, User, ShieldAlert, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

export default function UserSettingsModal({ user }: { user?: any }) {
  const { activeModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [salutation, setSalutation] = useState<"Mr." | "Mrs." | "Ms." | "Dr.">(
    (user?.salutation as any) || "Mr."
  );
  const [name, setName] = useState(user?.name || "Mr. Sharma");
  const [password, setPassword] = useState("");

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (activeModal !== "SETTINGS") return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res = await updateProfileAction({
      salutation,
      name,
      password: password || undefined,
    });

    setLoading(false);
    if (res.success) {
      setMsg({ type: "success", text: "Profile credentials updated successfully" });
      setPassword("");
    } else {
      setMsg({ type: "error", text: res.error || "Failed to update profile" });
    }
  };

  const handleSeedDemo = async () => {
    if (!confirm("This will initialize sample demo data (cards, banks, P2P loans). Continue?")) return;
    setLoading(true);
    setMsg(null);
    const res = await seedSampleVaultAction();
    setLoading(false);
    if (res.success) {
      setMsg({ type: "success", text: "Demo vault data initialized!" });
      setTimeout(() => closeModal(), 800);
    } else {
      setMsg({ type: "error", text: res.error || "Failed to seed demo vault" });
    }
  };

  const handleResetVault = async () => {
    setLoading(true);
    setMsg(null);
    const res = await resetVaultDataAction();
    setLoading(false);
    if (res.success) {
      setMsg({ type: "success", text: "Vault data reset successfully" });
      setConfirmReset(false);
      setTimeout(() => closeModal(), 800);
    } else {
      setMsg({ type: "error", text: res.error || "Failed to reset vault" });
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setMsg(null);
    const res = await deleteAccountAction();
    setLoading(false);
    if (res.success) {
      closeModal();
      signOut({ callbackUrl: "/login" });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to delete account" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold tracking-wide text-white">Vault Master Settings</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && (
          <div
            className={`mt-4 p-3 rounded-xl border text-sm ${
              msg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Salutation</label>
              <select
                value={salutation}
                onChange={(e) => setSalutation(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Change Master Password (Optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 font-mono">{user?.email}</span>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold px-5 py-2 text-xs rounded-xl flex items-center space-x-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        {/* Demo Data Preset Section */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div>
              <div className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Initialize Demo Vault ("Mr. Sharma")</span>
              </div>
              <div className="text-[11px] text-amber-200/70 mt-0.5">
                Populates dashboard cards, charts, P2P loans, and transactions
              </div>
            </div>
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-medium transition"
            >
              Load Demo
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 pt-5 border-t border-rose-500/20 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
          </div>

          {/* Reset Vault Data */}
          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-rose-300">Reset Vault Data</div>
              <div className="text-[11px] text-slate-400">
                Wipes all accounts, transactions, and P2P ledger (User account is kept)
              </div>
            </div>
            {confirmReset ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetVault}
                  className="px-3 py-1 text-xs rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition"
              >
                Reset Vault
              </button>
            )}
          </div>

          {/* Delete Account */}
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-rose-400">Delete Account Permanently</div>
              <div className="text-[11px] text-slate-400">
                Permanently deletes your account and cascades all data from Neon DB
              </div>
            </div>
            {confirmDelete ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-3 py-1 text-xs rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-medium transition"
              >
                Delete Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
