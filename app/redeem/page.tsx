"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  description: string;
  costCoins: number;
  iconEmoji: string;
  stock: number | null;
};

export default function RedeemPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [coins, setCoins] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/redeem/items");
    const data = await r.json();
    if (Array.isArray(data)) setItems(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "STUDENT") {
      return;
    }
    fetch("/api/growth/status")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.coins === "number") setCoins(d.coins);
      })
      .catch(() => {});
  }, [session, status]);

  const exchange = async (itemId: string) => {
    setLoadingId(itemId);
    try {
      const res = await fetch("/api/redeem/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setCoins(data.coins);
        load();
      } else {
        alert(data.error || "兑换失败");
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-28 text-center text-slate-500 font-bold">
        加载中…
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "STUDENT") {
    return (
      <div className="min-h-screen pt-28 px-6 max-w-lg mx-auto text-center space-y-6">
        <h1 className="text-3xl font-black text-slate-900">情绪币兑换站</h1>
        <p className="text-slate-600">请使用学生账号登录后兑换。</p>
        <Link
          href="/api/auth/signin"
          className="inline-block px-8 py-3 rounded-full bg-slate-900 text-white font-bold"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="container mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <span>🎁</span> 情绪币兑换
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              用成长积攒的情绪币兑换小奖励。
            </p>
          </div>
          <div className="px-6 py-4 bg-white rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)]">
            <p className="text-xs font-bold text-slate-500 uppercase">余额</p>
            <p className="text-3xl font-black text-emerald-600">
              {coins ?? "—"} <span className="text-lg">🤑</span>
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[2rem] border-4 border-slate-100 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm"
            >
              <div className="flex gap-4 items-start">
                <div className="text-5xl">{item.iconEmoji}</div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {item.title}
                  </h2>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-3">
                    {item.stock == null
                      ? "库存：不限"
                      : `剩余：${item.stock}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingId === item.id || (item.stock != null && item.stock <= 0)}
                onClick={() => exchange(item.id)}
                className="shrink-0 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black shadow-[4px_4px_0_rgba(15,23,42,1)] hover:bg-emerald-500 disabled:opacity-40 transition-colors"
              >
                {loadingId === item.id
                  ? "兑换中…"
                  : `${item.costCoins} 🤑 兑换`}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center">
          <Link href="/growth" className="text-morandi-green font-bold text-sm hover:underline">
            ← 返回成长生态
          </Link>
        </p>
      </div>
    </div>
  );
}
