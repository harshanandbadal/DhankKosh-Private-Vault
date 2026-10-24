import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrivacyProvider } from "@/context/PrivacyContext";
import { ModalProvider } from "@/context/ModalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DhanKosh — PRIVATE VAULT",
  description: "Production-grade, full-stack personal wealth repository, asset vault, and P2P ledger",
  icons: {
    icon: "/logo/DhanKosh-Main-logo.png",
    apple: "/logo/DhanKosh-Main-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080C16] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        <PrivacyProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </PrivacyProvider>
      </body>
    </html>
  );
}
