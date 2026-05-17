import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteBaseUrl } from "@/lib/utils";
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
  metadataBase: new URL(siteBaseUrl()),
  title: {
    default: "MediLink",
    template: "%s | MediLink",
  },
  description:
    "Multi-tenant care operations platform for clinics, hospitals, and pharmacies in Uganda and East Africa.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f3f8ff] font-sans text-slate-950">{children}</body>
    </html>
  );
}
