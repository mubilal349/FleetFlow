import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import BackToTop from "../components/common/BackToTop";

export const metadata: Metadata = {
  title: "FleetFlow",
  description: "Smart Logistics & Fleet Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:bg-[#050816] dark:text-white">
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
            <BackToTop />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
