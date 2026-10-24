import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#080C16] overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-32 -left-32 w-[600px] h-[600px] bg-blue-600/15" />
      <div className="ambient-glow -bottom-32 -right-32 w-[600px] h-[600px] bg-amber-500/10" />
      <div className="ambient-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10" />

      <LoginForm />
    </div>
  );
}
