"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import TilePuzzle from "@/components/puzzle/TilePuzzle";
import { useRouter } from "next/navigation";

export default function PuzzlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center text-slate-500 font-bold">
        加载中…
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "STUDENT") {
    return (
      <div className="min-h-screen pt-28 px-6 max-w-lg mx-auto text-center space-y-6">
        <h1 className="text-3xl font-black text-slate-900">数字拼图</h1>
        <p className="text-slate-600 font-medium">
          仅学生账号可游玩并领取情绪币奖励。请先登录学生账号。
        </p>
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
      <div className="container mx-auto max-w-xl">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-900 flex items-center justify-center gap-3">
            <span>🧩</span> 冷静拼图
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            点击与空格相邻的滑块还原 1–8 顺序。每日首次通关可得少量情绪币。
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border-4 border-slate-100 p-8 shadow-sm">
          <TilePuzzle onSolved={() => router.refresh()} />
        </div>

        <p className="mt-8 text-center">
          <Link href="/growth" className="text-morandi-green font-bold text-sm hover:underline">
            ← 返回成长生态
          </Link>
        </p>
      </div>
    </div>
  );
}
