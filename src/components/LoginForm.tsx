"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Lock, Mail, KeyRound, Loader2, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("sharma@dhankosh.vault");
  const [password, setPassword] = useState("vault123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid master vault credentials");
        setLoading(false);
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const fillDemo = () => {
    setEmail("sharma@dhankosh.vault");
    setPassword("vault123");
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl vault-modal-glass border border-white/15 shadow-2xl space-y-6 relative z-10 animate-fadeIn">
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
          Enter master security credentials to unlock repository
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Vault Identifier / Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., sharma@dhankosh.vault"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
              required
            />
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Master Vault Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm font-mono"
              required
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
            <ShieldCheck className="w-4 h-4" />
          )}
          <span>Unlock Private Vault</span>
        </button>
      </form>

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
        onClick={handleGoogleSignIn}
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
    </div>
  );
}
