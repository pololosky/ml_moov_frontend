import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moov Africa — ML Analytics",
  description: "Plateforme analytique ML : churn, segmentation, fraude",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={geistSans.variable}>
      <body className="min-h-screen flex" style={{ backgroundColor: "#F4F6FA", color: "#1C1C2E" }}>
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen ml-60" style={{ backgroundColor: "#F4F6FA" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
