import React from "react";
import { getVaultDataAction } from "@/actions/vault";
import Navbar from "@/components/Navbar";
import ModalContainer from "@/components/ModalContainer";
import SettingsPageContent from "@/components/SettingsPageContent";

export const dynamic = "force-dynamic";


export default async function SettingsPage() {
  const vaultData = await getVaultDataAction();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C16] overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow top-0 left-10 w-[500px] h-[500px] bg-blue-600/10" />
      <div className="ambient-glow bottom-0 right-10 w-[500px] h-[500px] bg-rose-600/10" />

      {/* Navbar */}
      <Navbar user={vaultData.user} />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 lg:px-8 py-8 relative z-10">
        <SettingsPageContent user={vaultData.user} />
      </main>

      {/* Modal Container */}
      <ModalContainer vaultData={vaultData} />
    </div>
  );
}
