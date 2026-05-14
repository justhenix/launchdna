import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaunchDNA | Every Token Launch Leaves Evidence",
  description: "Forensic launch classifier for Solana tokens using Birdeye data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-ldna-bg text-ldna-text selection:bg-ldna-accent selection:text-white bg-dot-grid">
        <NavBar />
        <main className="flex-1 flex flex-col bg-ldna-bg/80">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
