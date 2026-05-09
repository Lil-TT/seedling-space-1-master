import Link from "next/link";

export default async function GuestLimitPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const fromLabel = from ? decodeURIComponent(from) : null;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-[2rem] border-4 border-slate-900 bg-amber-50 p-10 shadow-[10px_10px_0_#0f172a] text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">访客模式下不可用</h1>
        <p className="text-slate-700 font-bold text-sm leading-relaxed mb-2">
          当前为外校参观通行证，仅开放<strong className="text-amber-800">活动大厅</strong>、
          <strong className="text-amber-800">童心市场</strong>与<strong className="text-amber-800">访客主页</strong>。
        </p>
        {fromLabel && (
          <p className="text-xs font-mono text-slate-500 mb-6 break-all">来源路径：{fromLabel}</p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href="/activities"
            className="block py-3 rounded-xl bg-emerald-600 text-white font-black border-2 border-slate-900"
          >
            去活动大厅
          </Link>
          <Link
            href="/market"
            className="block py-3 rounded-xl bg-rose-400 text-slate-900 font-black border-2 border-slate-900"
          >
            去童心市场
          </Link>
          <Link
            href="/profile"
            className="block py-3 rounded-xl bg-white text-slate-900 font-black border-2 border-slate-900"
          >
            访客主页
          </Link>
          <Link href="/login" className="text-sm font-black text-amber-800 underline underline-offset-2">
            校内师生请登录后使用完整功能
          </Link>
        </div>
      </div>
    </div>
  );
}
