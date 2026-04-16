// app/activities/page.tsx
"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { activitiesData } from "@/lib/dashboard-data";

export default function ActivitiesHall() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 使用 React State 记录已被接取的任务 ID
  const [acceptedTasks, setAcceptedTasks] = useState<number[]>([]);

  useGSAP(() => {
    // 页面头部淡入下沉
    gsap.fromTo(".activity-header", 
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    // 任务卡片的交错网格入场
    gsap.fromTo(".activity-card",
      { y: 60, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: "back.out(1.2)", // 适度的 Q 弹入场
        clearProps: "transform" // 释放控制权给 Tailwind 的 Hover
      }
    );
  }, { scope: containerRef });

  // 极其干脆的接取任务动效处理
  const handleAcceptTask = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    // 如果已经接取或完成，就不再触发
    if (acceptedTasks.includes(id)) return;

    const buttonElement = e.currentTarget;

    // 1. GSAP 负责视觉层的瞬间物理挤压反馈
    gsap.fromTo(buttonElement, 
      { scale: 0.85 }, // 瞬间被按压
      { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.3)" } // 极速橡皮筋回弹
    );

    // 2. React 负责更新数据状态
    setAcceptedTasks(prev => [...prev, id]);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F5F5F3] pt-24 pb-32">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* =========================================================
            大厅头部
        ========================================================= */}
        <div className="activity-header flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              活动大厅
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              完成日常挑战与社区共建，积攒属于你的情绪币。每一次互动，都是社区生态里不可或缺的养料。
            </p>
          </div>
          <Link 
            href="/" 
            className="shrink-0 px-6 py-2.5 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            返回首页
          </Link>
        </div>

        {/* =========================================================
            任务卡片网格 (CSS Grid)
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activitiesData.map((task) => {
            const isCompleted = task.status === "completed";
            const isAccepted = acceptedTasks.includes(task.id);
            // 计算当前卡片的视觉状态
            const isDimmed = isCompleted; 
            
            return (
              <div 
                key={task.id}
                className={`activity-card flex flex-col justify-between p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                  isDimmed ? "bg-slate-200/60 opacity-80" : task.color
                }`}
              >
                {/* 上半部：标签与标题 */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700">
                      {task.type}
                    </span>
                    {/* 状态徽章 */}
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        已完成
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-3 ${isDimmed ? "text-slate-600" : "text-slate-900"}`}>
                    {task.title}
                  </h3>
                  <p className={`text-base leading-relaxed mb-6 ${isDimmed ? "text-slate-500" : "text-slate-700/90"}`}>
                    {task.desc}
                  </p>
                </div>

                {/* 下半部：奖励与操作 */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 mb-1 font-medium">任务奖励</span>
                    <span className={`text-lg font-bold ${isDimmed ? "text-slate-500" : "text-slate-900"}`}>
                      {task.reward}
                    </span>
                  </div>

                  {/* 核心操作按钮 */}
                  <button 
                    onClick={(e) => handleAcceptTask(task.id, e)}
                    disabled={isCompleted || isAccepted}
                    className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors ${
                      isCompleted 
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : isAccepted
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-white text-slate-800 hover:bg-slate-900 hover:text-white border border-slate-200"
                    }`}
                  >
                    {isCompleted ? "已结算" : isAccepted ? "进行中" : "接取任务"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}