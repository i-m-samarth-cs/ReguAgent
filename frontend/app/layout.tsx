import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReguAgent — Regulatory Intelligence & Compliance",
  description: "Agentic regulatory compliance automation for Indian fintech and banking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
