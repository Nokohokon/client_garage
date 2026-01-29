import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
import { Sidebar } from "@/components/layout/Sidebar";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background flex min-h-screen gap-6 p-4 transition-colors duration-300`}
      >
        <Sidebar />
        {children}
      </div>
  );
}
