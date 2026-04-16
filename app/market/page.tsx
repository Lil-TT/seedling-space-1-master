// app/market/page.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { marketItems } from "@/lib/dashboard-data";

export default function KidsMarket() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 页面整体淡入下沉
    gsap.fromTo(".market-header", 
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    // 瀑布流卡片的弹性交错入场
    gsap.fromTo(".market-card",
      { y: 80, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.1, // 依次浮现
        duration: 1,
        ease: "back.out(1.5)", // 弹性缓动，符合“童心”主题
        clearProps: "transform" // 动画结束后交还给 Tailwind 处理 Hover
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F5F5F3] pt-24 pb-32">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* =========================================================
            页面头部：标题与导航
        ========================================================= */}
        <div className="market-header flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4">
              童心市场
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              在这里，交换的不只是闲置的物品，更是那份纯粹的心愿和情绪。浏览大家的寄托，或者留下你的一点小期待。
            </p>
          </div>
          <Link 
            href="/" 
            className="shrink-0 px-6 py-2.5 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-800"
          >
            返回首页
          </Link>
        </div>

        {/* =========================================================
            过滤标签 (Filters)
        ========================================================= */}
        <div className="market-header flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {["全部", "心愿", "闲置", "情绪交换", "手作"].map((tag, idx) => (
            <button 
              key={idx}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                idx === 0 
                  ? "bg-slate-800 text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-morandi-green hover:text-morandi-green"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* =========================================================
            纯 CSS 瀑布流 (Masonry Layout)
        ========================================================= */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {marketItems.map((item) => (
            <div 
              key={item.id} 
              // break-inside-avoid 防止卡片被硬生生从中间截断分到两列去
              className={`market-card break-inside-avoid relative flex flex-col justify-between p-8 rounded-3xl ${item.color} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden ${item.height}`}
            >
              {/* 卡片顶部：内容区域 */}
              <div className="relative z-10">
                <div className="flex gap-2 mb-4">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-xs font-semibold text-slate-800">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 leading-snug group-hover:text-slate-900">
                  {item.title}
                </h3>
              </div>

              {/* 卡片底部：发布者信息 */}
              <div className="relative z-10 flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-xl shadow-sm">
                    {item.avatar}
                  </div>
                  <span className="font-medium text-slate-700 text-sm">
                    {item.user}
                  </span>
                </div>
                
                {/* 交互按钮 */}
                <button className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* 装饰性背景光晕（增加质感） */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}