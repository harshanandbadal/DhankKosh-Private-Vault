"use client";

import React, { useState, useEffect } from "react";
import { updateProfileAction, resetVaultDataAction, deleteAccountAction, seedSampleVaultAction } from "@/actions/settings";
import { User, ShieldAlert, Sparkles, Loader2, KeyRound, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPageContent({ user }: { user?: any }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [salutation, setSalutation] = useState<"Mr." | "Mrs." | "Ms." | "Dr.">(
    (user?.salutation as any) || "Mr."
  );
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    if (user?.salutation) {
      setSalutation(user.salutation as any);
    }
  }, [user]);

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
      setMsg({ type: "success", text: "Demo vault data initialized! Refreshing dashboard..." });
      window.location.href = "/";
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
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
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
      signOut({ callbackUrl: "/login" });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to delete account" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
            Vault Master Profile & Security
          </h1>
          <p className="text-xs text-slate-400">
            Manage your credentials, master vault encryption, and system administration
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl border text-sm ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="vault-glass rounded-2xl p-6 border border-white/10 shadow-2xl space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Account Details</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-slate-400 text-sm font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Update Master Password (Optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-gold px-6 py-2.5 text-sm rounded-xl flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>

        {/* Lock Vault & Sign Out Quick Card */}
        <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-200">Vault Session Security</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Lock your vault session immediately and clear credentials from this browser session.
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-2 transition shrink-0"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Lock Vault & Sign Out</span>
          </button>
        </div>
      </div>

      {/* Preset Demo Data */}
      <div className="vault-glass rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Load "Mr. Sharma" Sample Vault</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Seeds sample bank accounts (HDFC, SBI, ICICI), credit cards (Regalia, Magnus), emergency cash safe, and P2P ledger entries.
            </p>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-semibold transition shrink-0"
          >
            Load Demo Data
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="vault-glass rounded-2xl p-6 border border-rose-500/30 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Danger Zone</h2>
        </div>
        <p className="text-xs text-slate-400">
          Destructive actions that cannot be reversed. Please proceed with caution.
        </p>

        {/* Reset Vault Data */}
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-rose-300">Reset Vault Ledger & Accounts</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Permanently wipes all bank accounts, credit cards, assets, P2P loans, and transactions inside an atomic transaction while keeping your login intact.
            </div>
          </div>
          {confirmReset ? (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleResetVault}
                className="px-3.5 py-1.5 text-xs rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-xs rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition shrink-0"
            >
              Reset Vault
            </button>
          )}
        </div>

        {/* Delete Account */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-rose-400">Delete Account Permanently</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Deletes your user record and all associated assets, ledger entries, and credentials from Neon PostgreSQL with cascade deletion.
            </div>
          </div>
          {confirmDelete ? (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-3.5 py-1.5 text-xs rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition shrink-0"
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
