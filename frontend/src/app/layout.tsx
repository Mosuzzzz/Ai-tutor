import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai"
});

export const metadata: Metadata = {
  title: "AI Tutor Platform",
  description: "Personal AI study workspace for document summary, chat, quizzes, and review analytics"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={notoThai.variable} lang="th">
      <body>{children}</body>
    </html>
  );
}
