import Link from "next/link";
import GuestExitButton from "./GuestExitButton";
import { SCHOOL_NAME } from "@/lib/school-brand";

export default function GuestProfileShell({ label }: { label: string | null }) {
  return (
    <div className="min-h-screen pt-4 pb-20 md:pt-6">
      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 p-10 md:p-14 shadow-[10px_10px_0_#0f172a] mb-10">
          <div className="absolute -right-16 -top-16 text-[10rem] opacity-[0.12] pointer-events-none select-none">
            🎫
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-900 mb-3">
                外校访客 · 参观通行证
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                欢迎莅临 {SCHOOL_NAME}
              </h1>
              <p className="text-slate-700 font-bold text-lg leading-relaxed max-w-xl">
                您正以<strong className="text-amber-900">访客身份</strong>
                浏览校园数字空间。可参观活动大厅与童心市场；成长树、兑换与拼图等需校内账号登录。
              </p>
              {label && (
                <p className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 border-2 border-slate-900 text-sm font-black text-slate-800">
                  <span>🏷️</span> {label}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <GuestExitButton />
              <Link
                href="/login"
                className="text-center px-5 py-2.5 rounded-2xl bg-slate-900 text-amber-300 text-sm font-black border-4 border-slate-900 shadow-[4px_4px_0_#f59e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                花名册登录（校内师生）
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/activities"
            className="group block rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[6px_6px_0_#0f172a] hover:-translate-y-1 hover:shadow-[8px_8px_0_#0f172a] transition-all"
          >
            <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">⚔️</span>
            <h2 className="text-2xl font-black text-slate-900 mb-2">活动大厅</h2>
            <p className="text-slate-600 font-bold text-sm leading-relaxed">
              浏览班级悬赏与亲子任务展板，了解校园活动氛围。
            </p>
            <p className="mt-4 text-xs font-black text-amber-700">进入大厅 →</p>
          </Link>
          <Link
            href="/market"
            className="group block rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[6px_6px_0_#0f172a] hover:-translate-y-1 hover:shadow-[8px_8px_0_#0f172a] transition-all"
          >
            <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">🛒</span>
            <h2 className="text-2xl font-black text-slate-900 mb-2">童心市场</h2>
            <p className="text-slate-600 font-bold text-sm leading-relaxed">
              参观孩子们上架的心愿与闲置，感受分享文化。
            </p>
            <p className="mt-4 text-xs font-black text-rose-700">去市场逛逛 →</p>
          </Link>
        </div>

        <p className="mt-10 text-center text-xs font-bold text-slate-500">
          入场口令为一次性使用；当前浏览器会话有效期内可继续参观开放区域。
        </p>
      </div>
    </div>
  );
}
