import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moov Africa — ML Analytics",
  description: "Plateforme analytique ML · Churn · Segmentation · Fraude",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body style={{ display: "flex", minHeight: "100vh", background: "#F7F9FC", color: "#0F1923" }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh", background: "#F7F9FC" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
