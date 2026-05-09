// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SchoolBadge from "@/components/brand/SchoolBadge";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/school-brand";

const ALL_NAV_LINKS = [
  { name: "成长生态", href: "/growth" },
  { name: "童心市场", href: "/market" },
  { name: "活动大厅", href: "/activities" },
  { name: "情绪兑换", href: "/redeem" },
  { name: "拼图", href: "/puzzle" },
] as const;

const GUEST_NAV_LINKS = [
  { name: "活动大厅", href: "/activities" },
  { name: "童心市场", href: "/market" },
  { name: "访客主页", href: "/profile" },
] as const;

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [guestNav, setGuestNav] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setGuestNav(false);
      return;
    }
    if (status !== "unauthenticated") return;
    fetch("/api/guest/me")
      .then((r) => r.json())
      .then((d) => setGuestNav(!!d.guest))
      .catch(() => setGuestNav(false));
  }, [status]);

  const navLinks = guestNav ? [...GUEST_NAV_LINKS] : [...ALL_NAV_LINKS];

  return (
    <nav className="fixed top-8 left-0 w-full z-[100] px-6 py-4">
      <div className="container mx-auto flex items-center justify-between bg-white/90 backdrop-blur-md border-4 border-slate-900 px-6 py-3 rounded-full shadow-[4px_4px_0_rgba(30,41,59,0.12)]">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
            <SchoolBadge size="sm" showCaption={false} className="scale-90 md:scale-100" />
            <span className="flex flex-col leading-tight">
              <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                {SCHOOL_NAME}
              </span>
              <span className="text-[10px] md:text-[11px] font-black text-amber-700 uppercase tracking-wider">
                {SCHOOL_TAGLINE}
              </span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full border-2 border-slate-900">
            <span className="text-sm">🏫</span>
            <span className="text-[10px] font-black text-slate-800 tracking-wide truncate max-w-[140px] md:max-w-[200px]">
              {SCHOOL_NAME} · 在线
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-black transition-colors hover:text-amber-700 ${
                pathname === link.href ? "text-amber-700" : "text-slate-700"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {status === "loading" ? (
            <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-slate-900 animate-pulse" />
          ) : session ? (
            <Link href="/profile" className="flex items-center gap-2 group">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-900 leading-none mb-0.5">
                  {session.user?.name || "用户"}
                </p>
                <p className="text-[9px] font-bold text-slate-500 capitalize">
                  {(session.user as any).role?.toLowerCase()}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center text-sm font-black border-2 border-slate-900 group-hover:ring-2 ring-amber-400 ring-offset-2 transition-all">
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>
          ) : guestNav ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-200 border-2 border-slate-900 text-slate-900 text-xs font-black shadow-[3px_3px_0_#1e293b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <span>🎫</span> 访客主页
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-amber-400 text-slate-900 text-sm font-black border-2 border-slate-900 shadow-[3px_3px_0_#1e293b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
