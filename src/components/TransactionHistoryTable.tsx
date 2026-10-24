"use client";

import React, { useState } from "react";
import { usePrivacy } from "@/context/PrivacyContext";
import { formatINR, formatDate } from "@/lib/formatters";
import { deleteTransactionAction } from "@/actions/transactions";
import {
  Search,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Trash2,
  Loader2,
} from "lucide-react";

export default function TransactionHistoryTable({
  transactions = [],
}: {
  transactions?: any[];
}) {
  const { isPrivate } = usePrivacy();
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getAccountName = (t: any) => {
    if (t.bankAccount) return `${t.bankAccount.bankName} (•••• ${t.bankAccount.last4Digits || ""})`;
    if (t.creditCard) return `${t.creditCard.cardName} (•••• ${t.creditCard.last4Digits || ""})`;
    if (t.physicalAsset) return t.physicalAsset.storageName;
    if (t.giftCard) return `${t.giftCard.brandName} Card`;
    return "Vault General";
  };

  const filtered = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    const id = (t.id || "").toLowerCase();
    const desc = (t.description || "").toLowerCase();
    const cat = (t.category || "").toLowerCase();
    const type = (t.type || "").toLowerCase();
    const account = getAccountName(t).toLowerCase();
    return (
      id.includes(term) ||
      desc.includes(term) ||
      cat.includes(term) ||
      type.includes(term) ||
      account.includes(term)
    );
  });

  const handleCopy = () => {
    const header = "Date / Type | Transaction ID | Category | Remark | Account | Amount (INR)";
    const text = [
      header,
      ...filtered.map(
        (t) =>
          `${formatDate(t.date)} (${t.type}) | ${t.id} | ${t.category} | ${t.description || "—"} | ${getAccountName(t)} | ₹${t.amount}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTx = (tx: any) => {
    const text = `${formatDate(tx.date)} (${tx.type}) | ${tx.id} | ${tx.category} | ${tx.description || "—"} | ${getAccountName(tx)} | ₹${tx.amount}`;
    navigator.clipboard.writeText(text);
    setCopiedTxId(tx.id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleCopyIdOnly = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteTransactionAction(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (!res.success) {
      alert(res.error || "Failed to delete transaction");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Date / Type",
      "Transaction ID",
      "Category",
      "Remark",
      "Account",
      "Amount (INR)",
    ];
    const rows = filtered.map((t) => [
      `"${formatDate(t.date)} (${t.type})"`,
      `"${t.id}"`,
      `"${t.category || ""}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${getAccountName(t).replace(/"/g, '""')}"`,
      t.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `DhanKosh_Transactions_${new Date().toISOString().slice(0, 10)}.csv`
    );
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
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, remark, category..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400/50 transition font-mono"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Action Buttons: Print, CSV, Copy */}
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
            title="Copy all to clipboard"
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

      {/* Table with columns: Date / Type | Transaction ID | Category | Remark | Account | Amount (INR) | Action */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Date / Type</th>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Remark</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4 text-right">Amount (INR)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isDebit = ["WITHDRAW", "CARD_SPEND", "P2P_PAY"].includes(tx.type);
                const isCopied = copiedTxId === tx.id;
                const isConfirming = confirmDeleteId === tx.id;
                const isDeleting = deletingId === tx.id;

                return (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                    {/* 1. Date / Type */}
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
                          <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                            {tx.type}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Transaction ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 group">
                        <span
                          className="font-mono text-xs text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                          title={tx.id}
                        >
                          #{tx.id ? `${tx.id.slice(0, 8)}...` : "—"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyIdOnly(e, tx.id)}
                          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition opacity-80 group-hover:opacity-100"
                          title="Copy Full Transaction ID"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 3. Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-white/5 text-slate-300 text-[10px] font-medium whitespace-nowrap">
                        {tx.category || "General"}
                      </span>
                    </td>

                    {/* 4. Remark */}
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-200">
                      <span title={tx.description || tx.category || ""}>
                        {tx.description || tx.category || "—"}
                      </span>
                    </td>

                    {/* 5. Account */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {tx.bankAccount ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm leading-none shrink-0">🏦</span>
                          <span className="truncate">
                            {tx.bankAccount.bankName} (•••• {tx.bankAccount.last4Digits})
                          </span>
                        </div>
                      ) : tx.creditCard ? (
                        <div className="flex items-center space-x-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {tx.creditCard.cardName} (•••• {tx.creditCard.last4Digits})
                          </span>
                        </div>
                      ) : tx.physicalAsset ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm leading-none shrink-0">💵</span>
                          <span className="truncate">{tx.physicalAsset.storageName}</span>
                        </div>
                      ) : tx.giftCard ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm leading-none shrink-0">🧧</span>
                          <span className="truncate">{tx.giftCard.brandName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Vault Ledger</span>
                      )}
                    </td>

                    {/* 6. Amount (INR) */}
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isDebit ? "text-rose-400" : "text-emerald-400"}>
                        {isDebit ? "-" : "+"}
                        {formatINR(tx.amount, isPrivate)}
                      </span>
                    </td>

                    {/* 7. Action */}
                    <td className="py-3 px-4 text-center">
                      {isConfirming ? (
                        <div className="inline-flex items-center space-x-1 animate-fadeIn">
                          <button
                            type="button"
                            onClick={() => handleDelete(tx.id)}
                            disabled={isDeleting}
                            className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold flex items-center space-x-1 shadow"
                            title="Confirm Deletion"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <span>Confirm</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={isDeleting}
                            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleCopyTx(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                            title="Copy Row Summary"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
