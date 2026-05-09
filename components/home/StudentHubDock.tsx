"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SCHOOL_NAME } from "@/lib/school-brand";

type PreviewActivity = {
  id: string;
  title: string;
  reward: number;
  kind: string;
};
type PreviewMarket = { id: string; title: string; type: string };
type PreviewRedeem = { title: string; costCoins: number; iconEmoji: string };

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

export default function StudentHubDock() {
  const [activities, setActivities] = useState<PreviewActivity[]>([]);
  const [marketItems, setMarketItems] = useState<PreviewMarket[]>([]);
  const [redeemItems, setRedeemItems] = useState<PreviewRedeem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/public-preview")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.activities)) setActivities(d.activities);
        if (Array.isArray(d.marketItems)) setMarketItems(d.marketItems);
        if (Array.isArray(d.redeemItems)) setRedeemItems(d.redeemItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative z-20 w-full max-w-6xl mx-auto px-4 md:px-6 pb-8 pt-4 pointer-events-auto">
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 p-6 md:p-10 shadow-[8px_8px_0_#1e293b]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">
              {SCHOOL_NAME} · 一站式大本营
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              小朋友们看这里！👋
            </h2>
            <p className="text-slate-600 font-bold text-sm mt-2">
              下面卡片里有<strong className="text-amber-800">真实任务和心愿</strong>
              ，点点就能去闯关～
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/guest"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-sm border-4 border-slate-900 shadow-[4px_4px_0_#94a3b8] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              🎫 访客 / NFC 入场
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-base shadow-[4px_4px_0_#f59e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all border-4 border-slate-900"
            >
              🎒 花名册登录
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {/* 成长树 */}
          <Link
            href="/growth"
            className="group relative overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-gradient-to-br from-emerald-300 to-teal-400 p-5 md:p-6 shadow-[6px_6px_0_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(15,23,42,1)] transition-all min-h-[160px] flex flex-col"
          >
            <span className="text-4xl md:text-5xl block mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">
              🌳
            </span>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">成长树</h3>
            <p className="text-xs md:text-sm font-bold text-slate-900/85 mt-1 flex-1">
              记录心情、给小树浇水，连续打卡还会变身哦～
            </p>
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none select-none">
              🌳
            </div>
          </Link>

          {/* 活动大厅 — 列表预览 */}
          <Link
            href="/activities"
            className="group relative overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-gradient-to-br from-amber-300 to-orange-400 p-5 md:p-6 shadow-[6px_6px_0_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(15,23,42,1)] transition-all min-h-[220px] sm:min-h-[240px] flex flex-col text-left"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform">
                ⚔️
              </span>
              <span className="text-[10px] font-black uppercase bg-white/90 border-2 border-slate-900 rounded-full px-2 py-0.5 text-slate-900">
                进行中
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">活动大厅</h3>
            <p className="text-[11px] font-bold text-slate-900/80 mb-2">班级小任务 · 赏金一览</p>
            <ul className="space-y-1.5 flex-1 min-h-[4.5rem]">
              {loading ? (
                <li className="h-7 rounded-lg bg-white/40 border-2 border-slate-900/20 animate-pulse" />
              ) : activities.length === 0 ? (
                <li className="text-xs font-bold text-slate-800/90 bg-white/50 rounded-xl px-2 py-2 border-2 border-dashed border-slate-900/30">
                  暂时没有新悬赏，老师正在酝酿大计划～
                </li>
              ) : (
                activities.slice(0, 4).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 text-xs font-black text-slate-900 bg-white/55 rounded-xl px-2.5 py-1.5 border-2 border-slate-900/40 shadow-sm"
                  >
                    <span className="truncate flex-1">{truncate(a.title, 14)}</span>
                    <span className="shrink-0 flex items-center gap-0.5 text-amber-900">
                      🪙{a.reward}
                    </span>
                    {a.kind === "PARENT_CHILD" && (
                      <span className="shrink-0 text-[9px] bg-rose-200 px-1 rounded border border-slate-900">
                        亲子
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>
            <p className="text-[10px] font-black text-slate-900/70 mt-2 text-right">进大厅接任务 →</p>
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 pointer-events-none select-none">
              ⚔️
            </div>
          </Link>

          {/* 童心市场 */}
          <Link
            href="/market"
            className="group relative overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-gradient-to-br from-pink-300 to-rose-400 p-5 md:p-6 shadow-[6px_6px_0_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(15,23,42,1)] transition-all min-h-[220px] sm:min-h-[240px] flex flex-col text-left"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform">
                🛒
              </span>
              <span className="text-[10px] font-black uppercase bg-white/90 border-2 border-slate-900 rounded-full px-2 py-0.5 text-slate-900">
                上架中
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">童心市场</h3>
            <p className="text-[11px] font-bold text-slate-900/80 mb-2">心愿 & 闲置 · 同学好物</p>
            <ul className="space-y-1.5 flex-1 min-h-[4.5rem]">
              {loading ? (
                <li className="h-7 rounded-lg bg-white/40 border-2 border-slate-900/20 animate-pulse" />
              ) : marketItems.length === 0 ? (
                <li className="text-xs font-bold text-slate-800/90 bg-white/50 rounded-xl px-2 py-2 border-2 border-dashed border-slate-900/30">
                  还没有上架物品，快去发布你的第一个心愿吧～
                </li>
              ) : (
                marketItems.slice(0, 4).map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 text-xs font-black text-slate-900 bg-white/55 rounded-xl px-2.5 py-1.5 border-2 border-slate-900/40 shadow-sm"
                  >
                    <span className="truncate flex-1">{truncate(m.title, 16)}</span>
                    <span className="shrink-0 text-[9px] bg-pink-100 px-1.5 py-0.5 rounded border border-slate-900">
                      {m.type === "WISH" ? "心愿" : "闲置"}
                    </span>
                  </li>
                ))
              )}
            </ul>
            <p className="text-[10px] font-black text-slate-900/70 mt-2 text-right">去市场逛逛 →</p>
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 pointer-events-none select-none">
              🛒
            </div>
          </Link>

          {/* 情绪兑换 */}
          <Link
            href="/redeem"
            className="group relative overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-gradient-to-br from-violet-300 to-purple-400 p-5 md:p-6 shadow-[6px_6px_0_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(15,23,42,1)] transition-all min-h-[200px] flex flex-col text-left"
          >
            <span className="text-4xl block mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">
              🎁
            </span>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">情绪兑换</h3>
            <p className="text-[11px] font-bold text-slate-900/80 mb-2">攒币换小礼物</p>
            <ul className="space-y-1 flex-1">
              {loading ? (
                <li className="h-6 rounded-lg bg-white/40 animate-pulse" />
              ) : redeemItems.length === 0 ? (
                <li className="text-xs font-bold opacity-90">兑换站补货中…</li>
              ) : (
                redeemItems.slice(0, 3).map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs font-black text-slate-900 bg-white/50 rounded-lg px-2 py-1 border-2 border-slate-900/35"
                  >
                    <span>{r.iconEmoji}</span>
                    <span className="truncate flex-1">{truncate(r.title, 12)}</span>
                    <span className="shrink-0 text-violet-900">🪙{r.costCoins}</span>
                  </li>
                ))
              )}
            </ul>
            <p className="text-[10px] font-black text-slate-900/70 mt-2 text-right">去兑换 →</p>
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 pointer-events-none select-none">
              🎁
            </div>
          </Link>

          {/* 拼图 */}
          <Link
            href="/puzzle"
            className="group relative overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-gradient-to-br from-sky-300 to-blue-400 p-5 md:p-6 shadow-[6px_6px_0_rgba(15,23,42,1)] hover:-translate-y-1 transition-all min-h-[160px] flex flex-col"
          >
            <span className="text-4xl block mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">
              🧩
            </span>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">拼图乐园</h3>
            <p className="text-xs md:text-sm font-bold text-slate-900/85 mt-1 flex-1">
              动动脑筋拼数字，每天第一次通关还有小奖励～
            </p>
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none select-none">
              🧩
            </div>
          </Link>

          {/* 我的主页 */}
          <Link
            href="/profile"
            className="group relative overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-gradient-to-br from-lime-300 to-green-400 p-5 md:p-6 shadow-[6px_6px_0_rgba(15,23,42,1)] hover:-translate-y-1 transition-all min-h-[160px] flex flex-col"
          >
            <span className="text-4xl block mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">
              ⭐
            </span>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">我的主页</h3>
            <p className="text-xs md:text-sm font-bold text-slate-900/85 mt-1 flex-1">
              徽章墙、任务进度、交易记录，你的成长全在这～
            </p>
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none select-none">
              ⭐
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
