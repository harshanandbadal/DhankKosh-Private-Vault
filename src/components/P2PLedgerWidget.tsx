"use client";

import React from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { useModal } from "@/context/ModalContext";
import { formatINR } from "@/lib/formatters";
import { Users, Plus, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

export default function P2PLedgerWidget({
  p2pContacts = [],
}: {
  p2pContacts?: any[];
}) {
  const { isPrivate } = usePrivacy();
  const { openModal } = useModal();

  // Show top active contacts with pending balances or all
  const activeContacts = p2pContacts.slice(0, 4);

  return (
    <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              P2P Ledger
            </h3>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Active Borrowings/Pending Settlements
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openModal("CREATE_P2P")}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-0.5"
            title="Add P2P Contact"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
          <Link
            href="/p2p"
            className="text-[11px] text-slate-400 hover:text-white transition underline"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Contacts List / Table */}
      {activeContacts.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-slate-400">No active P2P debts or receivables.</p>
          <button
            onClick={() => openModal("CREATE_P2P")}
            className="mt-2 text-xs text-amber-400 hover:underline"
          >
            + Create P2P Contact
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {activeContacts.map((contact) => {
            const isReceivable = contact.netBalance >= 0;
            return (
              <div
                key={contact.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/70 border border-white/5 transition group"
              >
                {/* Avatar & Details */}
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-white truncate">
                      {contact.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {contact.phone || contact.group || "Contact"}
                    </div>
                  </div>
                </div>

                {/* Balance Pill & Pay/Receive Button */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isReceivable
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {isReceivable ? "They Owe You" : "You Owe Them"}
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">
                      {formatINR(Math.abs(contact.netBalance), isPrivate)}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openModal("P2P_TRANSACTION", {
                        contactId: contact.id,
                        amount: Math.abs(contact.netBalance),
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-400/20 hover:text-amber-300 hover:border-amber-400/40 border border-white/10 text-[11px] font-medium text-slate-200 transition"
                  >
                    Pay/Receive
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
