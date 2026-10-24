"use client";

import React, { useState } from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { useModal } from "@/context/ModalContext";
import { formatINR, formatDate } from "@/lib/formatters";
import {
  Users,
  Plus,
  ArrowLeftRight,
  Phone,
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export default function P2PView({ p2pContacts = [] }: { p2pContacts?: any[] }) {
  const { isPrivate } = usePrivacy();
  const { openModal } = useModal();
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [search, setSearch] = useState("");

  const totalReceivables = p2pContacts
    .filter((c) => c.netBalance > 0)
    .reduce((sum, c) => sum + c.netBalance, 0);

  const totalPayables = p2pContacts
    .filter((c) => c.netBalance < 0)
    .reduce((sum, c) => sum + Math.abs(c.netBalance), 0);

  const netP2P = totalReceivables - totalPayables;

  const filteredContacts = p2pContacts.filter((c) => {
    const matchesGroup = selectedGroup === "ALL" || c.group?.toUpperCase() === selectedGroup;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.relationshipRemarks && c.relationshipRemarks.toLowerCase().includes(search.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  const GROUPS = ["ALL", "FRIENDS", "FAMILY", "BUSINESS", "COLLEAGUES"];

  return (
    <div className="space-y-6">
      {/* Title & Add Contact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Peer-to-Peer (P2P) Ledger
            </h1>
            <p className="text-xs text-slate-400">
              Track bilateral borrowings, personal loans, settlements, and shared expenses
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => openModal("P2P_TRANSACTION")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Settlement</span>
          </button>

          <button
            onClick={() => openModal("CREATE_P2P")}
            className="btn-gold px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Receivables */}
        <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-xl">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Total Receivables (They Owe You)
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {formatINR(totalReceivables, isPrivate)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {p2pContacts.filter((c) => c.netBalance > 0).length} contacts with pending repayments
          </div>
        </div>

        {/* Total Payables */}
        <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-xl">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Total Payables (You Owe Them)
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400 font-mono">
            {formatINR(totalPayables, isPrivate)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {p2pContacts.filter((c) => c.netBalance < 0).length} contacts you owe funds to
          </div>
        </div>

        {/* Net P2P Position */}
        <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-xl">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Net P2P Position
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono ${
              netP2P >= 0 ? "text-cyan-400" : "text-amber-400"
            }`}
          >
            {formatINR(netP2P, isPrivate)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {netP2P >= 0 ? "Net Positive (Asset surplus)" : "Net Negative (Liability surplus)"}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl vault-glass border border-white/10">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedGroup === g
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      {/* Contacts Cards Grid */}
      {filteredContacts.length === 0 ? (
        <div className="vault-glass rounded-2xl p-10 text-center border border-dashed border-white/10">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">No P2P contacts found.</p>
          <p className="text-xs text-slate-500 mt-1">
            Create a contact to start tracking loans, advances, and split expenses.
          </p>
          <button
            onClick={() => openModal("CREATE_P2P")}
            className="btn-gold mt-4 px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create P2P Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            const isReceivable = contact.netBalance >= 0;
            return (
              <div
                key={contact.id}
                className="vault-glass rounded-2xl p-5 border border-white/10 hover:border-amber-400/30 transition shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar, Name & Group Tag */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{contact.name}</div>
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          {contact.phone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span className="font-mono">{contact.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium border border-white/10">
                      {contact.group || "Friends"}
                    </span>
                  </div>

                  {contact.relationshipRemarks && (
                    <div className="mt-3 text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-white/5">
                      "{contact.relationshipRemarks}"
                    </div>
                  )}

                  {/* Net Status Badge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Net Status
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          isReceivable ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isReceivable ? "They Owe You (Receivable)" : "You Owe Them (Payable)"}
                      </div>
                    </div>
                    <div className="text-right font-mono font-extrabold text-base text-white">
                      {formatINR(Math.abs(contact.netBalance), isPrivate)}
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Pay/Receive Button */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Updated {formatDate(contact.updatedAt)}
                  </span>
                  <button
                    onClick={() =>
                      openModal("P2P_TRANSACTION", {
                        contactId: contact.id,
                        amount: Math.abs(contact.netBalance),
                      })
                    }
                    className="btn-gold px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Pay / Receive</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
