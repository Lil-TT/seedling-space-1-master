"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SCHOOL_NAME } from "@/lib/school-brand";

type Step = "welcome" | "how" | "token" | "success" | "error";

export default function GuestEntryWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("welcome");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  const prefillFromUrl = useCallback(() => {
    const t = searchParams.get("t");
    if (t) {
      setToken(t);
      setStep("token");
    }
  }, [searchParams]);

  useEffect(() => {
    prefillFromUrl();
  }, [prefillFromUrl]);

  async function submitToken() {
    const raw = token.trim();
    if (raw.length < 8) {
      setErrMsg("请输入卡片或邀请函上的完整口令");
      setStep("error");
      return;
    }
    setBusy(true);
    setErrMsg(null);
    try {
      const res = await fetch("/api/guest/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: raw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error || "核销失败");
        setStep("error");
        return;
      }
      setLabel(typeof data.label === "string" ? data.label : null);
      setStep("success");
      window.setTimeout(() => router.push("/activities"), 2200);
    } catch {
      setErrMsg("网络异常，请稍后重试");
      setStep("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* 进度点 */}
        <div className="flex justify-center gap-2 mb-10">
          {(["welcome", "how", "token"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${
                step === "success"
                  ? "w-8 bg-emerald-500"
                  : step === s || (step === "token" && i < 2) || (step === "how" && i === 0)
                  ? "w-8 bg-amber-500"
                  : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>

        {step === "welcome" && (
          <div className="text-center animate-in fade-in duration-500">
            <div className="inline-block text-7xl mb-6 motion-safe:animate-bounce">🎫</div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {SCHOOL_NAME}
              <br />
              <span className="text-amber-700">访客参观通道</span>
            </h1>
            <p className="text-slate-600 font-bold mb-10 leading-relaxed">
              类似「碰一碰卡片」或扫码拿到的口令，只需使用一次，即可在展厅里自由浏览开放区域。
            </p>
            <button
              type="button"
              onClick={() => setStep("how")}
              className="w-full py-4 rounded-2xl bg-slate-900 text-amber-300 font-black text-lg border-4 border-slate-900 shadow-[6px_6px_0_#f59e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              下一步：怎么入场
            </button>
            <p className="mt-6 text-sm text-slate-500 font-bold">
              已有校内账号？{" "}
              <Link href="/login" className="text-amber-800 underline underline-offset-2">
                去花名册登录
              </Link>
            </p>
          </div>
        )}

        {step === "how" && (
          <div className="rounded-[2rem] border-4 border-slate-900 bg-gradient-to-br from-sky-50 to-indigo-50 p-8 shadow-[8px_8px_0_#0f172a] animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span>📱</span> 三步入场
            </h2>
            <ol className="space-y-4 mb-8">
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border-2 border-slate-900 font-black">
                  1
                </span>
                <p className="font-bold text-slate-700 pt-1">
                  向展台老师领取 NFC 标签、二维码或纸质口令（每条口令<strong className="text-amber-800">仅可核销一次</strong>）。
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border-2 border-slate-900 font-black">
                  2
                </span>
                <p className="font-bold text-slate-700 pt-1">
                  若打开链接时已带入口令，会自动填入；也可手动粘贴到下一步输入框。
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border-2 border-slate-900 font-black">
                  3
                </span>
                <p className="font-bold text-slate-700 pt-1">
                  核销成功后，可参观<strong>活动大厅</strong>、<strong>童心市场</strong>与<strong>本页个人主页（访客版）</strong>。
                </p>
              </li>
            </ol>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("welcome")}
                className="flex-1 py-3 rounded-xl border-4 border-slate-900 font-black text-slate-800 bg-white hover:bg-slate-50"
              >
                返回
              </button>
              <button
                type="button"
                onClick={() => setStep("token")}
                className="flex-1 py-3 rounded-xl bg-emerald-500 border-4 border-slate-900 font-black text-slate-900 shadow-[4px_4px_0_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                输入口令
              </button>
            </div>
          </div>
        )}

        {step === "token" && (
          <div className="rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0_#0f172a] animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2">粘贴入场口令</h2>
            <p className="text-sm font-bold text-slate-500 mb-6">
              从链接、二维码或卡片上复制整段字符，粘贴到下方。
            </p>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={3}
              placeholder="在此粘贴口令…"
              className="w-full rounded-2xl border-4 border-slate-200 focus:border-amber-500 p-4 font-mono text-sm font-bold text-slate-800 outline-none resize-none mb-6"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStep("how")}
                className="sm:flex-1 py-3 rounded-xl border-4 border-slate-900 font-black text-slate-800 bg-slate-50"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={submitToken}
                disabled={busy}
                className="sm:flex-[2] py-4 rounded-xl bg-amber-400 border-4 border-slate-900 font-black text-slate-900 shadow-[4px_4px_0_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
              >
                {busy ? "正在核验…" : "✨ 核销并入场"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center rounded-[2rem] border-4 border-emerald-600 bg-emerald-50 p-10 shadow-[8px_8px_0_#047857] animate-in zoom-in duration-300">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-emerald-900 mb-2">欢迎入场</h2>
            {label && (
              <p className="text-sm font-black text-emerald-800 mb-4 bg-white/80 inline-block px-4 py-2 rounded-xl border-2 border-emerald-200">
                {label}
              </p>
            )}
            <p className="text-emerald-800 font-bold mb-6">正在带您前往活动大厅…</p>
            <div className="flex justify-center gap-2 text-2xl motion-safe:animate-pulse">✨🌟✨</div>
            <button
              type="button"
              onClick={() => router.push("/activities")}
              className="mt-8 w-full py-3 rounded-xl bg-slate-900 text-white font-black border-2 border-slate-900"
            >
              立即前往
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="rounded-[2rem] border-4 border-rose-500 bg-rose-50 p-8 shadow-[8px_8px_0_#9f1239] animate-in fade-in">
            <h2 className="text-xl font-black text-rose-900 mb-3">未能入场</h2>
            <p className="text-rose-800 font-bold mb-6">{errMsg}</p>
            <button
              type="button"
              onClick={() => {
                setStep("token");
                setErrMsg(null);
              }}
              className="w-full py-3 rounded-xl bg-white border-4 border-slate-900 font-black text-slate-900"
            >
              重新输入口令
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
