import React from "react";
import { getVaultDataAction } from "@/actions/vault";
import Navbar from "@/components/Navbar";
import NetWorthBanner from "@/components/NetWorthBanner";
import BankAccountsSection from "@/components/BankAccountsSection";
import CreditCardsSection from "@/components/CreditCardsSection";
import NetGrowthChart from "@/components/NetGrowthChart";
import AssetBreakdownChart from "@/components/AssetBreakdownChart";
import P2PLedgerWidget from "@/components/P2PLedgerWidget";
import TransactionHistoryTable from "@/components/TransactionHistoryTable";
import ModalContainer from "@/components/ModalContainer";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const vaultData = await getVaultDataAction();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C16] overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/10" />
      <div className="ambient-glow top-1/2 -right-32 w-[600px] h-[600px] bg-purple-600/10" />
      <div className="ambient-glow bottom-0 left-10 w-[500px] h-[500px] bg-amber-500/5" />

      {/* Top Navbar */}
      <Navbar user={vaultData.user} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Top Grid: Net Worth Banner & Net Growth Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <NetWorthBanner summary={vaultData.summary} />
          </div>
          <div className="lg:col-span-5 flex flex-col justify-between">
            <NetGrowthChart
              growthData={vaultData.growthData}
              netWorth={vaultData.summary.netWorth}
            />
          </div>
        </div>

        {/* Middle Grid: Bank Accounts & Asset Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <BankAccountsSection bankAccounts={vaultData.bankAccounts} />
          </div>
          <div className="lg:col-span-4">
            <AssetBreakdownChart data={vaultData.assetBreakdown} />
          </div>
        </div>

        {/* Lower Grid: Credit Cards & P2P Ledger Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <CreditCardsSection creditCards={vaultData.creditCards} />
          </div>
          <div className="lg:col-span-4">
            <P2PLedgerWidget p2pContacts={vaultData.p2pContacts} />
          </div>
        </div>

        {/* Unified Bottom Ledger: Transaction History */}
        <div>
          <TransactionHistoryTable transactions={vaultData.transactions} />
        </div>
      </main>

      {/* Global Modals Container */}
      <ModalContainer vaultData={vaultData} />
    </div>
  );
}
