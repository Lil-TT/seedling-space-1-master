"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GuestExitButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function exitGuest() {
    setLoading(true);
    try {
      await fetch("/api/guest/clear", { method: "POST" });
      router.push("/guest");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exitGuest}
      disabled={loading}
      className="px-5 py-2.5 rounded-2xl bg-white border-4 border-slate-900 text-slate-900 text-sm font-black shadow-[4px_4px_0_#1e293b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-60"
    >
      {loading ? "退出中…" : "结束访客参观"}
    </button>
  );
}
