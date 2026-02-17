import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 紫微斗数 Pro",
  description: "智能紫微斗数命理分析应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
