// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Preloader from "@/components/animations/Preloader";
import Navbar from "@/components/layout/Navbar";
import SessionProvider from "@/components/providers/SessionProvider";
import StudentGlobalBackground from "@/components/layout/StudentGlobalBackground";
import GlobalMarquee from "@/components/layout/GlobalMarquee";


export const metadata: Metadata = {
  title: "MindMarket | 童心市场与成长生态",
  description: "基于情绪价值网的互动社区",
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

          {/* 核心页面内容：增加 pt-20 为 fixed 的导航栏腾出空间 */}
          <main className="relative z-10">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}