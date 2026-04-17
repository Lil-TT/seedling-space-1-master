// app/profile/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-sm"
    >
      退出登录
    </button>
  );
}