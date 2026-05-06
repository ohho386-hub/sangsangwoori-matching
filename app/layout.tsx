import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "상상우리 매칭",
  description: "시니어 ↔ 일자리 자동 매칭 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-8">
            <span className="text-2xl font-bold text-blue-700">상상우리</span>
            <Link
              href="/register"
              className="text-lg font-semibold text-gray-700 hover:text-blue-700 transition-colors"
            >
              프로필 등록
            </Link>
            <Link
              href="/recommendations"
              className="text-lg font-semibold text-gray-700 hover:text-blue-700 transition-colors"
            >
              추천 목록
            </Link>
            <Link
              href="/admin"
              className="text-lg font-semibold text-gray-700 hover:text-blue-700 transition-colors"
            >
              담당자 대시보드
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
