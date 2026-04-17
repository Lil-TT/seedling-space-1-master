// components/activities/ActivitySlider.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

interface Activity {
  id: string;
  title: string;
  desc: string;
  reward: number;
  participants: any[];
}

const gradients = [
  "from-emerald-100 to-teal-200",
  "from-amber-100 to-yellow-300",
  "from-green-100 to-emerald-200",
  "from-lime-100 to-green-200"
];

const emojis = ["🏆", "🎯", "⚔️", "📜", "🚀"];

export default function ActivitySlider({ items }: { items: Activity[] }) {
  const displayItems = items.length > 0 && items.length < 5 
    ? Array.from({ length: 5 }).map((_, i) => ({...items[i % items.length], _key: `${items[i % items.length].id}-${i}`}))
    : items.map(i => ({...i, _key: i.id}));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const controllerInnerRef = useRef<HTMLDivElement>(null);
  const controllerOuterRef = useRef<HTMLDivElement>(null);

  const slideWidth = 375;

  const getRelativeIndex = (index: number) => {
    const total = displayItems.length;
    let rel = index - (currentIndex % total);
    if (currentIndex < 0) rel = index - ((currentIndex % total) + total) % total;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;
    return rel;
  };

  useEffect(() => {
    if (displayItems.length === 0) return;
    displayItems.forEach((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const rel = getRelativeIndex(i);
      const isActive = rel === 0;

      gsap.to(el, {
        x: isPreviewOpen ? rel * slideWidth * 1.5 : rel * slideWidth,
        scale: isActive ? 1.25 : 0.75,
        opacity: isPreviewOpen && !isActive ? 0 : 1,
        zIndex: isActive ? 100 : 1,
        duration: 0.75,
        ease: "power4.out",
      });
    });
  }, [currentIndex, isPreviewOpen, displayItems.length]);

  const moveNext = () => { if (!isAnimating && !isPreviewOpen) setCurrentIndex(prev => prev + 1); };
  const movePrev = () => { if (!isAnimating && !isPreviewOpen) setCurrentIndex(prev => prev - 1); };

  const togglePreview = () => {
    if (isAnimating || displayItems.length === 0) return;
    setIsAnimating(true);
    const willOpen = !isPreviewOpen;

    gsap.to(previewRef.current, {
      y: willOpen ? "-50%" : "100%",
      opacity: willOpen ? 1 : 0,
      duration: 0.75,
      ease: "power4.out",
      onComplete: () => { setIsPreviewOpen(willOpen); setIsAnimating(false); }
    });

    gsap.to(controllerOuterRef.current, {
      clipPath: willOpen ? "circle(0% at 50% 50%)" : "circle(50% at 50% 50%)",
      duration: 0.75, ease: "power3.inOut"
    });
    gsap.to(controllerInnerRef.current, {
      clipPath: willOpen ? "circle(50% at 50% 50%)" : "circle(40% at 50% 50%)",
      background: willOpen ? "#047857" : "#343434", // 展开时变成代表生机的翡翠绿
      duration: 0.75, ease: "power3.inOut"
    });
  };

  const handleAcceptTask = async () => {
    const activeItem = displayItems[((currentIndex % displayItems.length) + displayItems.length) % displayItems.length];
    if (!activeItem || loadingId) return;
    
    setLoadingId(activeItem.id);
    try {
      const res = await fetch("/api/activities/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activeItem.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        togglePreview();
      } else {
        alert(data.error);
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (displayItems.length === 0) return null;
  const activeItem = displayItems[((currentIndex % displayItems.length) + displayItems.length) % displayItems.length];

  return (
    <div className="relative w-full h-[70vh] overflow-hidden rounded-[3rem] bg-slate-900/5 shadow-inner">
      
      {/* 模糊背景墙 */}
      <div className="absolute inset-0 z-0 opacity-60 blur-3xl transition-colors duration-1000 bg-gradient-to-br from-emerald-100/50 to-amber-100/50"></div>

      {/* 无限轮播轨道 */}
      <ul className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-[60%] z-10">
        {displayItems.map((item, i) => (
          <li key={item._key} ref={el => { itemRefs.current[i] = el; }} className="absolute flex justify-center items-center w-full h-full will-change-transform">
            <div className={`w-[250px] h-[250px] rounded-[2.5rem] bg-gradient-to-br ${gradients[i % gradients.length]} shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center border-4 border-white/60 cursor-pointer overflow-hidden group relative`}>
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full font-black text-amber-600 text-sm flex items-center gap-1 shadow-sm">
                <span>🪙</span> {item.reward}
              </div>
              <span className="text-7xl group-hover:scale-110 transition-transform duration-500 drop-shadow-xl">
                {emojis[i % emojis.length]}
              </span>
              <p className="mt-6 font-black text-slate-800 text-center px-4 leading-tight">
                {item.title}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* 玻璃拟物化详情面板 */}
      <div ref={previewRef} className="absolute top-1/2 left-1/2 w-[85%] md:w-[400px] h-[65%] -translate-x-1/2 translate-y-full opacity-0 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 flex flex-col border border-white shadow-[0_30px_60px_rgba(0,0,0,0.12)] z-30">
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black uppercase tracking-wider">
            公会委托
          </span>
          <span className="text-amber-600 font-black flex items-center gap-1 text-lg">
            赏金: {activeItem?.reward} 🪙
          </span>
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-4">{activeItem?.title}</h2>
        
        <div className="flex-1 bg-white/50 rounded-2xl p-6 overflow-y-auto custom-scrollbar border border-white/60">
          <p className="text-slate-600 leading-relaxed font-medium">
            {activeItem?.desc || "发布者没有留下详细说明，直接干就完事了！"}
          </p>
          <p className="mt-4 text-xs font-bold text-slate-400">目前已有 {activeItem?.participants?.length || 0} 名勇士接取</p>
        </div>

        <button 
          onClick={handleAcceptTask}
          disabled={loadingId === activeItem?.id}
          className="mt-6 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
        >
          {loadingId === activeItem?.id ? "签署契约中..." : "⚔️ 揭榜接取悬赏"}
        </button>
      </div>

      {/* 底部控制台 (Controller) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-44 h-44 z-40 select-none">
        <div 
          ref={controllerInnerRef}
          onClick={togglePreview}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#343434] rounded-full flex items-center justify-center cursor-pointer z-20 shadow-2xl transition-all hover:scale-105"
          style={{ clipPath: "circle(40% at 50% 50%)" }}
        >
          {isPreviewOpen ? (
            <span className="text-white text-2xl font-bold">✕</span>
          ) : (
            <span className="text-white text-sm font-bold tracking-widest uppercase">查看</span>
          )}
        </div>
        <div ref={controllerOuterRef} className="absolute inset-0 bg-[#212121] rounded-full z-10" style={{ clipPath: "circle(50% at 50% 50%)" }}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono tracking-widest uppercase">Bounty</div>
          <button onClick={movePrev} disabled={isPreviewOpen || isAnimating} className="absolute top-1/2 left-4 -translate-y-1/2 text-white p-2 hover:scale-110 transition-transform disabled:opacity-20"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button onClick={moveNext} disabled={isPreviewOpen || isAnimating} className="absolute top-1/2 right-4 -translate-y-1/2 text-white p-2 hover:scale-110 transition-transform disabled:opacity-20"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
      </div>
    </div>
  );
}