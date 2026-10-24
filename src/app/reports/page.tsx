import React from "react";
import { getVaultDataAction } from "@/actions/vault";
import Navbar from "@/components/Navbar";
import ReportsView from "@/components/ReportsView";
import ModalContainer from "@/components/ModalContainer";

export const dynamic = "force-dynamic";


export default async function ReportsPage() {
  const vaultData = await getVaultDataAction();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C16] overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10" />
      <div className="ambient-glow bottom-1/4 left-10 w-[600px] h-[600px] bg-blue-600/10" />

      {/* Navbar */}
      <Navbar user={vaultData.user} />

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 relative z-10">
        <ReportsView initialTransactions={vaultData.transactions} />
      </main>

      {/* Modal Container */}
      <ModalContainer vaultData={vaultData} />
    </div>
  );
}
