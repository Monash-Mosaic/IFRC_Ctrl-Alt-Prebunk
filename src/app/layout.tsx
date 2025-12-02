import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CTRL + ALT + PREBUNK",
  description: "IFRC Solferino Academy - Fact-checking and media literacy platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <Navigation />
        <main className="min-h-screen bg-white pt-24 pb-20 md:pb-0 md:pl-20">
          {children}
        </main>
      </body>
    </html>
  );
}
