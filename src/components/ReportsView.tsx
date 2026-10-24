"use client";

import React, { useState, useEffect } from "react";
import { formatThermalDate, formatINR } from "@/lib/formatters";
import { getFilteredTransactionsAction } from "@/actions/transactions";
import {
  Search,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  Filter,
  Calendar,
  Loader2,
  FileText,
} from "lucide-react";

export default function ReportsView({ initialTransactions = [] }: { initialTransactions?: any[] }) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [copied, setCopied] = useState(false);

  // Filters state
  const [query, setQuery] = useState("");
  const [txType, setTxType] = useState("All");
  const [category, setCategory] = useState("All Categories");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [totals, setTotals] = useState({
    totalDebits: 0,
    totalCredits: 0,
  });

  const CATEGORIES = [
    "All Categories",
    "Salary",
    "Fuel",
    "Fuel & Travel",
    "Groceries",
    "Groceries & Home",
    "P2P Settlement",
    "Dining & Restaurants",
    "Shopping & Retail",
    "Bills & Utilities",
    "Investment / Dividend",
    "Opening Balance",
    "General",
  ];

  const handleFilter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const res = await getFilteredTransactionsAction({
      query,
      type: txType,
      category,
      startDate,
      endDate,
    });

    setLoading(false);
    if (res.success && res.data) {
      setTransactions(res.data);
      if (res.summary) {
        setTotals({
          totalDebits: res.summary.totalDebits,
          totalCredits: res.summary.totalCredits,
        });
      }
    }
  };

  useEffect(() => {
    handleFilter();
  }, []);

  // Compute thermal ASCII text
  const generateAsciiStatement = () => {
    const divider = "----------------------------------------";
    const header = [
      "    DHANKOSH PRIVATE VAULT - STATEMENT",
      `       FROM ${startDate || "ALL"} TO ${endDate || "PRESENT"}`,
      divider,
      "DATE        DESC             AMT(RS) TYPE",
    ];

    const lines = transactions.slice(0, 15).map((t) => {
      const d = formatThermalDate(t.date || t.createdAt);
      let desc = (t.description || t.accountName || "TRANSACTION").toUpperCase();
      if (desc.length > 15) desc = desc.slice(0, 13) + "..";
      desc = desc.padEnd(16, " ");

      const amt = (t.amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).padStart(10, " ");

      let code = "WD";
      if (t.type === "DEPOSIT") code = "DEP";
      else if (t.type === "P2P_RECEIVE" || t.type === "RECEIVE") code = "RECV";
      else if (t.type === "P2P_PAY") code = "PAY";
      else if (t.type === "CARD_BILL_PAY") code = "BPAY";
      else if (t.type === "CARD_SPEND") code = "SPND";

      return `${d} ${desc} ${amt} ${code}`;
    });

    const footer = [
      divider,
      `TOTAL DEBITS:  ${formatINR(totals.totalDebits)}`,
      `TOTAL CREDITS: ${formatINR(totals.totalCredits)}`,
    ];

    return [...header, ...lines, ...footer].join("\n");
  };

  const asciiText = generateAsciiStatement();

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(asciiText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount (INR)"];
    const rows = transactions.map((t) => [
      formatThermalDate(t.date),
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${t.category || ""}"`,
      t.type,
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
      `DhanKosh_Statement_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
            Reports & Print Statement
          </h1>
          <p className="text-xs text-slate-400">
            Generate audited statements, thermal receipt slips, and financial ledger exports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Filter Controls */}
        <div className="lg:col-span-6 vault-glass rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="flex items-center space-x-2 pb-4 border-b border-white/10">
            <Filter className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Statement Filters</h2>
          </div>

          <form onSubmit={handleFilter} className="mt-5 space-y-4">
            {/* Search by Keywords */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Search by Keywords
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition text-sm"
                />
                <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Transaction Type
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                <option value="All">All</option>
                <option value="Debit">Debit (Withdrawal / Card Spend / P2P Pay)</option>
                <option value="Credit">Credit (Deposit / Received / Salary)</option>
                <option value="Internal Transfer">Internal Transfer</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range / Manual Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Date Range / Manual Selection
              </label>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/50"
                  />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/50"
                  />
                </div>
              </div>
            </div>

            {/* Gold Search & Filter Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search and Filter</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Export Options & Estimated Thermal / Typewriter Preview */}
        <div className="lg:col-span-6 space-y-4">
          {/* Export Action Buttons */}
          <div className="vault-glass rounded-2xl p-4 border border-white/10 shadow-xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Export Options
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePrint}
                className="btn-gold px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export as CSV</span>
              </button>

              <button
                onClick={handleCopyAscii}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Realistic Monospace Thermal / Typewriter Receipt Slip */}
          <div className="vault-glass rounded-2xl p-5 border border-white/10 shadow-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Estimated Thermal / Typewriter Preview</span>
              <span className="text-[10px] text-slate-500 font-mono">80mm Receipt Slip</span>
            </div>

            <div
              id="thermal-receipt"
              className="bg-[#FFFDF7] text-slate-950 font-mono text-xs rounded-xl p-5 shadow-inner border border-amber-200/50 whitespace-pre leading-relaxed overflow-x-auto selection:bg-amber-300 selection:text-slate-950"
            >
              {asciiText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
