import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "AI Tutor Platform",
  description: "Personal AI study workspace for document summary, chat, quizzes, and review analytics"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${notoThai.variable} ${mono.variable}`} lang="th">
      <body>{children}</body>
    </html>
  );
}
