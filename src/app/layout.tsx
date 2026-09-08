import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mowa | 오늘의 마음",
  description: "마음이 쉬어가는 작은 방",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
