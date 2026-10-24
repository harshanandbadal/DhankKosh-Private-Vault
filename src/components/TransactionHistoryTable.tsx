"use client";

import React, { useState } from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { formatINR, formatDate } from "@/lib/formatters";
import {
  Search,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building2,
  Vault,
} from "lucide-react";

export default function TransactionHistoryTable({
  transactions = [],
}: {
  transactions?: any[];
}) {
  const { isPrivate } = usePrivacy();
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    const desc = (t.description || "").toLowerCase();
    const cat = (t.category || "").toLowerCase();
    const bank = (t.bankAccount?.bankName || "").toLowerCase();
    const card = (t.creditCard?.cardName || "").toLowerCase();
    return desc.includes(term) || cat.includes(term) || bank.includes(term) || card.includes(term);
  });

  const handleCopy = () => {
    const text = filtered
      .map(
        (t) =>
          `${formatDate(t.date)} | ${t.description || t.category} | ${t.type} | ₹${t.amount}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount (INR)", "Account"];
    const rows = filtered.map((t) => [
      formatDate(t.date),
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${t.category || ""}"`,
      t.type,
      t.amount,
      `"${t.bankAccount?.bankName || t.creditCard?.cardName || t.physicalAsset?.storageName || "Vault"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DhanKosh_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-2xl space-y-4">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Transaction History
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Instant Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400/50 transition"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Action Buttons: Print (Orange), CSV, Copy */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition"
            title="Print Transactions"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition"
            title="Export as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Date / Type</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isDebit = ["WITHDRAW", "CARD_SPEND", "P2P_PAY"].includes(tx.type);
                return (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                    {/* Date / Type */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isDebit
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {isDebit ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{formatDate(tx.date)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{tx.type}</div>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-200">
                      {tx.description || tx.category}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/5 text-slate-300 text-[10px]">
                        {tx.category}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4 text-slate-400">
                      {tx.bankAccount ? (
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-blue-400" />
                          <span className="truncate">
                            {tx.bankAccount.bankName} (..{tx.bankAccount.last4Digits})
                          </span>
                        </div>
                      ) : tx.creditCard ? (
                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-3 h-3 text-amber-400" />
                          <span className="truncate">
                            {tx.creditCard.cardName} (..{tx.creditCard.last4Digits})
                          </span>
                        </div>
                      ) : tx.physicalAsset ? (
                        <div className="flex items-center space-x-1">
                          <Vault className="w-3 h-3 text-emerald-400" />
                          <span className="truncate">{tx.physicalAsset.storageName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Vault Ledger</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={isDebit ? "text-rose-400" : "text-emerald-400"}>
                        {isDebit ? "-" : "+"}
                        {formatINR(tx.amount, isPrivate)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
