import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVaultDataAction } from "@/actions/vault";
import Navbar from "@/components/Navbar";
import P2PView from "@/components/P2PView";
import ModalContainer from "@/components/ModalContainer";

export const dynamic = "force-dynamic";

export default async function P2PPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const vaultData = await getVaultDataAction();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C16] overflow-hidden">
      {/* Ambient glows */}
      <div className="ambient-glow top-0 left-1/3 w-[500px] h-[500px] bg-purple-600/10" />
      <div className="ambient-glow bottom-0 right-10 w-[500px] h-[500px] bg-amber-500/10" />

      {/* Navbar */}
      <Navbar user={vaultData.user} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 relative z-10">
        <P2PView p2pContacts={vaultData.p2pContacts} />
      </main>

      {/* Modal Container */}
      <ModalContainer vaultData={vaultData} />
    </div>
  );
}
