"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { registerUserAction, resetMasterPasswordAction } from "@/actions/auth";
import {
  Lock,
  Mail,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type AuthMode = "LOGIN" | "REGISTER" | "RESET";

export default function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("LOGIN");

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [regSalutation, setRegSalutation] = useState<"Mr." | "Mrs." | "Ms." | "Dr.">("Mr.");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Reset states
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear messages when switching tabs
  const switchMode = (newMode: AuthMode) => {
    setError(null);
    setSuccess(null);
    setMode(newMode);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await signIn("credentials", {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials. Please verify your Vault ID and Master Password.");
        setLoading(false);
      } else {
        setSuccess("Vault unlocked successfully! Decrypting repository...");
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  // 2. Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setError("Master password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const res = await registerUserAction({
      salutation: regSalutation,
      name: regName,
      email: regEmail,
      password: regPassword,
    });

    if (!res.success) {
      setError(res.error || "Failed to create vault account.");
      setLoading(false);
      return;
    }

    // Auto sign-in with newly registered credentials
    const loginRes = await signIn("credentials", {
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      redirect: false,
    });

    if (loginRes?.error) {
      setSuccess("Account created! Please unlock with your new master password.");
      setLoginEmail(regEmail);
      setLoginPassword("");
      setMode("LOGIN");
      setLoading(false);
    } else {
      setSuccess("Vault initialized successfully! Entering dashboard...");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  };

  // 3. Handle Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New master password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const res = await resetMasterPasswordAction({
      email: resetEmail,
      newPassword,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to reset password.");
    } else {
      setSuccess("Master password updated successfully! Please unlock your vault.");
      setLoginEmail(resetEmail);
      setLoginPassword(newPassword);
      setMode("LOGIN");
    }
  };

  // Quick Demo fill
  const fillDemo = () => {
    setLoginEmail("sharma@dhankosh.vault");
    setLoginPassword("vault123");
    setError(null);
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl vault-modal-glass border border-white/15 shadow-2xl space-y-6 relative z-10 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-block relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl p-1 border border-amber-400/40 bg-slate-900/80 mx-auto">
          <Image
            src="/logo/DhanKosh-Main-logo.png"
            alt="DhanKosh Crest Logo"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-serif">
            DhanKosh
          </h1>
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold">
            Private Vault
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Personal Wealth Repository & High-Security Asset Ledger
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-950/70 border border-white/10 text-xs font-semibold">
        <button
          type="button"
          onClick={() => switchMode("LOGIN")}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            mode === "LOGIN"
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Unlock Vault</span>
        </button>

        <button
          type="button"
          onClick={() => switchMode("REGISTER")}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            mode === "REGISTER"
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Vault</span>
        </button>

        <button
          type="button"
          onClick={() => switchMode("RESET")}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            mode === "RESET"
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Reset Key</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* 1. UNLOCK VAULT (LOGIN FORM) */}
      {mode === "LOGIN" && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Vault Identifier / Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g., your.name@dhankosh.vault"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
                required
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Master Vault Password
              </label>
              <button
                type="button"
                onClick={() => switchMode("RESET")}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 hover:underline"
              >
                Forgot key?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
                required
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>Unlock Private Vault</span>
          </button>
        </form>
      )}

      {/* 2. CREATE VAULT (REGISTER FORM) */}
      {mode === "REGISTER" && (
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Salutation
              </label>
              <select
                value={regSalutation}
                onChange={(e) => setRegSalutation(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/50"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Harsh Anand"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 text-sm"
                  required
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Vault Email / Identifier
            </label>
            <div className="relative">
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. harsh@dhankosh.vault"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 text-sm font-mono"
                required
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Master Password (min 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 text-sm font-mono"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Confirm Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 text-sm font-mono"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold shadow-lg mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>Initialize My Private Vault</span>
          </button>
        </form>
      )}

      {/* 3. RESET MASTER KEY FORM */}
      {mode === "RESET" && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Vault Email / Identifier
            </label>
            <div className="relative">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="e.g. harsh.anand.123@dhankosh.vault"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
                required
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              New Master Password (min 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirm New Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>Update Master Password</span>
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-white/10 w-full" />
        <span className="bg-[#0D1424] px-3 text-[10px] text-slate-500 uppercase tracking-widest absolute">
          or authenticate with
        </span>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center space-x-2 transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Demo Credentials Quick Pill */}
      {mode === "LOGIN" && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={fillDemo}
            className="text-[11px] text-amber-400/80 hover:text-amber-300 underline inline-flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Use Sample Demo Vault (Mr. Sharma)</span>
          </button>
        </div>
      )}
    </div>
  );
}
