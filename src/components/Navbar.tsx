"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePrivacy } from "@/context/PrivacyContext";
import { useModal } from "@/context/ModalContext";
import {
  Eye,
  EyeOff,
  Plus,
  Building2,
  CreditCard,
  Vault,
  Users,
  Gift,
  ArrowLeftRight,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Navbar({ user }: { user?: any }) {
  const pathname = usePathname();
  const { isPrivate, togglePrivacy } = usePrivacy();
  const { openModal } = useModal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navTabs = [
    { label: "Dashboard", href: "/" },
    { label: "Reports & Print", href: "/reports" },
    { label: "P2P Ledger", href: "/p2p" },
  ];

  const displayName = user?.name
    ? (user.salutation && !user.name.toLowerCase().startsWith(user.salutation.toLowerCase()))
      ? `${user.salutation} ${user.name}`
      : user.name
    : "Vault Master";

  return (
    <header className="sticky top-0 z-40 w-full vault-glass border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Crest & Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg p-0.5 border border-amber-400/30 group-hover:border-amber-400/60 transition bg-slate-900/60">
            <Image
              src="/logo/DhanKosh-Main-logo.png"
              alt="DhanKosh Crest Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-serif">
                DhanKosh
              </span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-amber-400/80 font-semibold -mt-1">
              Private Vault
            </div>
          </div>
        </Link>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? "text-amber-400 bg-amber-400/10 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/10 hover:border-amber-400/40 text-xs font-medium text-slate-300 hover:text-white transition group"
              title="Vault Master Profile & Options"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-[10px] shadow-sm">
                {displayName.charAt(0)}
              </div>
              <span className="max-w-[120px] truncate">{displayName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl p-2 z-50 animate-fadeIn text-slate-200">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                    Logged In Vault Master
                  </div>
                  <div className="font-medium text-sm text-white truncate">{displayName}</div>
                  {user?.email && (
                    <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    openModal("SETTINGS");
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs hover:bg-white/5 hover:text-amber-300 rounded-xl transition text-left"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Vault Settings & Danger Zone</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 rounded-xl transition text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Lock Vault & Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Lock / Sign Out Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900/60 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition group"
            title="Lock Vault & Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
            <span className="hidden xl:inline">Lock Vault</span>
          </button>

          {/* Hide / Reveal Privacy Toggle Button */}
          <button
            onClick={togglePrivacy}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isPrivate
                ? "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-slate-900/60 text-slate-300 border-white/10 hover:text-white hover:bg-slate-800"
            }`}
            title="Mask/Reveal sensitive monetary amounts"
          >
            {isPrivate ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Hidden</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide/Reveal</span>
              </>
            )}
          </button>

          {/* New Transaction Button */}
          <button
            onClick={() => openModal("NEW_TRANSACTION")}
            className="hidden lg:flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transaction</span>
          </button>

          {/* + Create Account Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="btn-gold flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Account</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl vault-modal-glass border border-white/15 shadow-2xl py-2 z-50 animate-fadeIn text-slate-200">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("CREATE_BANK");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs hover:bg-amber-400/10 hover:text-amber-300 text-left transition"
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Bank Account</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("CREATE_CARD");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs hover:bg-amber-400/10 hover:text-amber-300 text-left transition"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Credit Card</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("CREATE_PHYSICAL");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs hover:bg-amber-400/10 hover:text-amber-300 text-left transition"
                >
                  <Vault className="w-4 h-4 text-emerald-400" />
                  <span>Physical Record</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("CREATE_P2P");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs hover:bg-amber-400/10 hover:text-amber-300 text-left transition"
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>P2P Account</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("CREATE_GIFT");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs hover:bg-amber-400/10 hover:text-amber-300 text-left transition"
                >
                  <Gift className="w-4 h-4 text-pink-400" />
                  <span>Gift Card Record</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("P2P_TRANSACTION");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs hover:bg-emerald-400/10 hover:text-emerald-300 text-left transition"
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                  <span>P2P Settlement</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
