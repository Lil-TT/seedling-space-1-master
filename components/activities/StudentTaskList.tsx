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

  // 模拟给任务分配“星期”标签（如果是真实业务，可以根据任务创建时间动态计算）
  const weekDays = ["星期一", "星期三", "星期五", "周末"];

  return (
    <div className="mt-10 bg-[#F0F4F2] rounded-[3rem] p-8 md:p-12 border-4 border-emerald-900 shadow-[12px_12px_0_rgba(4,120,87,0.15)] relative z-10 overflow-hidden">
      {/* 游戏化装饰背景 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <h2 className="text-3xl font-black text-emerald-900 mb-10 flex items-center gap-3 relative z-10">
        <span className="text-4xl drop-shadow-md">🗺️</span> 
        <span className="uppercase tracking-widest">本周勇气日程轴</span>
      </h2>

      {/* 日程轴容器 */}
      <div className="relative pl-4 md:pl-8 border-l-4 border-dashed border-emerald-300 space-y-10 z-10">
        {participations.map((p: any, index: number) => {
          // 随机取一个星期标签制造日程感
          const dayTag = weekDays[index % weekDays.length]; 

          return (
            <div key={p.id} className="relative">
              {/* 日程轴节点 (时间点) */}
              <div className="absolute -left-[27px] md:-left-[43px] top-4 w-6 h-6 md:w-8 md:h-8 bg-amber-300 border-4 border-emerald-900 rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] z-20 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-900 rounded-full"></div>
              </div>

              {/* 游戏化卡片 */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border-4 border-emerald-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[6px_6px_0_rgba(4,120,87,1)] hover:shadow-[8px_8px_0_rgba(4,120,87,1)] hover:-translate-y-1 transition-all">
                
                <div className="flex-1">
                  {/* 星期角标 */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 border-2 border-amber-900 rounded-xl mb-3 transform -rotate-2">
                    <span className="text-[11px] font-black text-amber-900">{dayTag} 专属任务</span>
                  </div>
                  
                  <h4 className="text-2xl font-black text-slate-800 leading-tight">
                    {p.activity.title}
                  </h4>
                  <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 rounded-md">赏金: {p.activity.reward} 🪙</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">经验值 +150</span>
                  </p>
                </div>

                {/* 🎮 街机摇杆按钮 (核心动效) */}
                {p.status === "SUBMITTED" ? (
                  <div className="px-6 py-4 bg-slate-200 border-4 border-slate-400 text-slate-500 rounded-2xl font-black text-lg transform rotate-2 shadow-inner">
                    ⏳ 老师审核中...
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSubmit(p.id)}
                    disabled={loadingId === p.id}
                    className="group relative px-8 py-4 bg-amber-400 border-4 border-amber-900 rounded-2xl font-black text-xl text-amber-900 
                    shadow-[0_8px_0_rgba(120,53,15,1)] 
                    active:shadow-[0_0px_0_rgba(120,53,15,1)] active:translate-y-2 
                    transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {/* 按钮上的反光高光 */}
                    <div className="absolute top-1 left-2 right-2 h-2 bg-white/30 rounded-full"></div>
                    {loadingId === p.id ? "上传数据中..." : "按下完成 ⚡"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}