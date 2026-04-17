// components/activities/StudentTaskList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentTaskList({ participations }: { participations: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSubmit = async (participantId: string) => {
    if (loadingId) return;
    setLoadingId(participantId);

    try {
      const res = await fetch("/api/activities/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId })
      });

      if (res.ok) {
        // 提交成功后，刷新当前页面拉取最新状态
        router.refresh();
      } else {
        alert("提交失败，请重试");
      }
    } catch (error) {
      alert("网络错误");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mt-8 bg-[#F0F4F2] rounded-[2.5rem] p-8 border-4 border-emerald-900 shadow-[8px_8px_0_rgba(4,120,87,0.1)] relative z-10">
      <h2 className="text-2xl font-black text-emerald-900 mb-6 flex items-center gap-2">
        <span>🌿</span> 正在进行的修行
      </h2>
      <div className="space-y-4">
        {participations.map((p: any) => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border-2 border-emerald-900 flex justify-between items-center shadow-[4px_4px_0_rgba(0,0,0,0.05)]">
            <div>
              <h4 className="font-black text-slate-800">{p.activity.title}</h4>
              <p className="text-xs text-emerald-600 font-bold mt-1">赏金: {p.activity.reward} 🪙</p>
            </div>
            {p.status === "SUBMITTED" ? (
              <span className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm italic">等待审核中...</span>
            ) : (
              <button 
                onClick={() => handleSubmit(p.id)}
                disabled={loadingId === p.id}
                className="px-6 py-3 bg-emerald-500 text-white border-2 border-emerald-900 rounded-xl font-black shadow-[3px_3px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loadingId === p.id ? "提交中..." : "我完成了 ⚔️"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}