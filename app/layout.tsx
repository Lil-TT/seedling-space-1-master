// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Preloader from "@/components/animations/Preloader";
import Navbar from "@/components/layout/Navbar";
import SessionProvider from "@/components/providers/SessionProvider";
import StudentGlobalBackground from "@/components/layout/StudentGlobalBackground";
import GlobalMarquee from "@/components/layout/GlobalMarquee";


export const metadata: Metadata = {
  title: "光明小学 · 童心成长站",
  description: "光明小学校园专属情绪成长与活动门户",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-background text-slate-800 antialiased overflow-x-hidden min-h-screen">
        <SessionProvider>
          <StudentGlobalBackground />

          <GlobalMarquee />
          {/* 全局加载动画 */}
          <Preloader />

          {/* 顶部导航栏 */}
          <Navbar />

          {/* 为跑马灯 + fixed Navbar 预留顶部空间（见 globals.css --app-header-offset） */}
          <main className="relative z-10 pt-[var(--app-header-offset)]">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}