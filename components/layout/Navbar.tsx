// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react"; // 引入 session 钩子
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession(); // 获取登录状态
  const pathname = usePathname();

  // 导航链接配置
  const navLinks = [
    { name: "成长生态", href: "/growth" },
    { name: "童心市场", href: "/market" },
    { name: "活动大厅", href: "/activities" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-4">
      <div className="container mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/20 px-8 py-3 rounded-full shadow-sm">
        
        {/* Logo 与真实感校牌部分 */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-tighter text-slate-900 hover:opacity-70 transition-opacity">
            SEEDLING<span className="text-morandi-green">.</span>
          </Link>
          
          {/* 🎓 新增：拟真校牌标签 (制造落地感) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
            <span className="text-sm">🏫</span>
            <span className="text-[11px] font-black text-slate-600 tracking-wide">光明小学 · 2026届3班</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        {/* 中间菜单 */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-morandi-green ${
                pathname === link.href ? "text-morandi-green" : "text-slate-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* 右侧：登录状态感应区 */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            // 加载状态
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>
          ) : session ? (
            // 1. 已登录状态：显示头像和个人中心链接
            <Link 
              href="/profile" 
              className="flex items-center gap-3 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold text-slate-900 leading-none mb-1">
                  {session.user?.name || "用户"}
                </p>
                <p className="text-[10px] text-slate-500 leading-none capitalize">
                  {(session.user as any).role?.toLowerCase()}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold group-hover:ring-2 ring-morandi-green ring-offset-2 transition-all">
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>
          ) : (
            // 2. 未登录状态：显示登录按钮
            <Link
              href="/api/auth/signin"
              className="px-6 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all active:scale-95"
            >
              登 录
            </Link>
          )}
        </div>
        
      </div>
    </nav>
  );
}