// components/market/InfiniteSlider.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

interface MarketItem {
  id: string;
  title: string;
  desc: string;
  type: string;
  iconName?: string | null;
  owner: { user: { name: string } };
}

// 高饱和度卡通色板
const gradients = [
  "bg-rose-200",
  "bg-teal-200",
  "bg-amber-200",
  "bg-emerald-200",
  "bg-indigo-200"
];

export default function InfiniteSlider({ items }: { items: MarketItem[] }) {
  const displayItems = items.length > 0 && items.length < 5
    ? Array.from({ length: 5 }).map((_, i) => ({ ...items[i % items.length], _key: `${items[i % items.length].id}-${i}` }))
    : items.map(i => ({ ...i, _key: i.id }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const controllerInnerRef = useRef<HTMLDivElement>(null);
  const controllerOuterRef = useRef<HTMLDivElement>(null);

  const slideWidth = 375;

  const handleTradeRequest = async () => {
    if (!activeItem || tradeLoading) return;
    setTradeLoading(true);
    try {
      const res = await fetch("/api/market/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: activeItem.id })
      });
      const data = await res.json();

      if (res.ok) {
        const activeEl = itemRefs.current[displayItems.findIndex(i => i.id === activeItem.id)];
        if (activeEl) {
          gsap.to(activeEl, {
            y: -500,
            opacity: 0,
            duration: 1,
            ease: "back.in(1.7)",
            onComplete: () => window.location.reload()
          });
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTradeLoading(false);
    }
  };

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
        scale: isActive ? 1.2 : 0.8,
        opacity: isPreviewOpen && !isActive ? 0 : 1,
        zIndex: isActive ? 100 : 1,
        duration: 0.75,
        ease: "power3.inOut",
      });
    });
  }, [currentIndex, isPreviewOpen, displayItems.length]);

  useEffect(() => {
    const handleRemoteSelect = (e: CustomEvent) => {
      const targetId = e.detail;

      // 1. 在当前的展示列表中找到目标物品的索引
      const targetIndex = displayItems.findIndex(item => item.id === targetId);

      if (targetIndex !== -1) {
        // 2. 将轮播图快速滑动到该物品
        setCurrentIndex(targetIndex);

        // 3. 自动触发“查看详情”的面板翻转动画
        // 延迟 300ms 等待轮播图转到正中间，再弹出面板体验更好
        setTimeout(() => {
          setIsAnimating(true);
          const willOpen = true;

          gsap.to(previewRef.current, {
            y: "-50%",
            opacity: 1,
            duration: 0.75,
            ease: "power3.inOut",
            onComplete: () => {
              setIsPreviewOpen(true);
              setIsAnimating(false);
            }
          });

          gsap.to(controllerOuterRef.current, {
            clipPath: "circle(0% at 50% 50%)",
            duration: 0.75,
            ease: "power3.inOut"
          });
          gsap.to(controllerInnerRef.current, {
            clipPath: "circle(50% at 50% 50%)",
            background: "#0f172a",
            duration: 0.75,
            ease: "power3.inOut"
          });
        }, 300);
      }
    };

    // 绑定全局自定义事件
    window.addEventListener("market-item-select", handleRemoteSelect as EventListener);

    return () => {
      window.removeEventListener("market-item-select", handleRemoteSelect as EventListener);
    };
  }, [displayItems, isPreviewOpen]);

  const moveNext = () => {
    if (isAnimating || isPreviewOpen) return;
    setCurrentIndex(prev => prev + 1);
  };

  const movePrev = () => {
    if (isAnimating || isPreviewOpen) return;
    setCurrentIndex(prev => prev - 1);
  };

  const togglePreview = () => {
    if (isAnimating || displayItems.length === 0) return;
    setIsAnimating(true);
    const willOpen = !isPreviewOpen;

    gsap.to(previewRef.current, {
      y: willOpen ? "-50%" : "100%",
      opacity: willOpen ? 1 : 0,
      duration: 0.75,
      ease: "power3.inOut",
      onComplete: () => {
        setIsPreviewOpen(willOpen);
        setIsAnimating(false);
      }
    });

    // 控制器动画变成硬核街机风
    gsap.to(controllerOuterRef.current, {
      clipPath: willOpen ? "circle(0% at 50% 50%)" : "circle(50% at 50% 50%)",
      duration: 0.75,
      ease: "power3.inOut"
    });
    gsap.to(controllerInnerRef.current, {
      clipPath: willOpen ? "circle(50% at 50% 50%)" : "circle(40% at 50% 50%)",
      background: willOpen ? "#0f172a" : "#f43f5e", // 展开时变黑，关闭时是亮粉色
      duration: 0.75,
      ease: "power3.inOut"
    });
  };

  if (displayItems.length === 0) return null;
  const activeItem = displayItems[((currentIndex % displayItems.length) + displayItems.length) % displayItems.length];

  return (
    // 给整个组件一个明确的卡通外框底座，避免与父级页面混淆
    <div className="relative w-full h-[75vh] md:h-[650px] overflow-hidden bg-sky-100 rounded-[40px] border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] mb-10">

      {/* --- 顶部信息 (卡通字体) --- */}
      <div className="absolute top-8 left-8 right-8 flex justify-between z-20 font-black uppercase text-slate-900 tracking-widest text-lg">
        <p className="bg-white border-2 border-slate-900 px-4 py-1 rounded-xl shadow-[4px_4px_0px_0px_#0f172a]">
          童心流转中心
        </p>
        <p className="bg-yellow-400 border-2 border-slate-900 px-4 py-1 rounded-xl shadow-[4px_4px_0px_0px_#0f172a] truncate max-w-[50%] text-right">
          {activeItem?.title || "Loading..."}
        </p>
      </div>

      {/* --- 无限轮播轨道 --- */}
      <ul className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-[60%] z-10">
        {displayItems.map((item, i) => (
          <li
            key={item._key}
            ref={el => { itemRefs.current[i] = el; }}
            className="absolute flex justify-center items-center w-full h-full will-change-transform"
          >
            {/* 卡通商品卡片：粗黑边、硬阴影 */}
            <div className={`w-[240px] h-[240px] rounded-3xl ${gradients[i % gradients.length]} flex flex-col items-center justify-center border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] cursor-pointer overflow-visible group relative`}>

              {item.iconName ? (
                <img
                  src={item.iconName}
                  alt={item.title}
                  className="w-28 h-28 object-contain group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-2xl"
                />
              ) : (
                <span className="text-7xl group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-xl">
                  {item.type === "WISH" ? "🌠" : "🎁"}
                </span>
              )}

              <p className="mt-6 font-black text-slate-900 bg-white border-2 border-slate-900 px-4 py-1 rounded-full shadow-[4px_4px_0px_0px_#0f172a]">
                来自: {item.owner.user.name}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* --- 实体化预览面板 (不再使用毛玻璃) --- */}
      <div
        ref={previewRef}
        className="absolute top-1/2 left-1/2 w-[90%] md:w-[450px] h-[70%] -translate-x-1/2 translate-y-full opacity-0 bg-white rounded-[3rem] p-8 flex flex-col border-4 border-slate-900 shadow-[16px_16px_0px_0px_#0f172a] z-30"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-violet-400 border-2 border-slate-900 text-slate-900 rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#0f172a]">
            {activeItem?.type === "WISH" ? "心愿清单" : "闲置流转"}
          </span>
          <span className="text-slate-600 font-bold text-sm">发布者: {activeItem?.owner.user.name}</span>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-4">{activeItem?.title}</h2>

        <div className="flex-1 bg-slate-100 rounded-2xl p-6 border-2 border-slate-900 overflow-y-auto custom-scrollbar shadow-inner">
          <p className="text-slate-700 leading-relaxed font-medium">{activeItem?.desc}</p>
        </div>

        <button
          onClick={handleTradeRequest}
          disabled={tradeLoading}
          className={`mt-6 w-full py-4 rounded-2xl font-black text-lg transition-all border-4 border-slate-900 
            ${tradeLoading
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-indigo-400 text-slate-900 hover:bg-indigo-300 shadow-[6px_6px_0px_0px_#0f172a] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_#0f172a] active:scale-95"
            }`}
        >
          {tradeLoading ? "正在传递..." : "发起交换请求!"}
        </button>
      </div>

      {/* --- 底部控制台 (卡通街机摇杆风) --- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-40 z-40 select-none">
        {/* 中心确认按钮 */}
        <div
          ref={controllerInnerRef}
          onClick={togglePreview}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-rose-400 border-4 border-slate-900 rounded-full flex items-center justify-center cursor-pointer z-20 shadow-[4px_4px_0px_0px_#0f172a] transition-transform hover:scale-110 active:scale-95"
          style={{ clipPath: "circle(40% at 50% 50%)" }}
        >
          {isPreviewOpen ? (
            <span className="text-white text-3xl font-black">✕</span>
          ) : (
            <span className="text-slate-900 text-base font-black tracking-widest uppercase">查看</span>
          )}
        </div>

        {/* 外部轨道背景 */}
        <div
          ref={controllerOuterRef}
          className="absolute inset-0 bg-yellow-400 border-4 border-slate-900 rounded-full z-10 shadow-[6px_6px_0px_0px_#0f172a]"
          style={{ clipPath: "circle(50% at 50% 50%)" }}
        >
          <button
            onClick={movePrev}
            disabled={isPreviewOpen || isAnimating}
            className="absolute top-1/2 left-2 -translate-y-1/2 text-slate-900 p-2 hover:scale-125 transition-transform disabled:opacity-30"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <button
            onClick={moveNext}
            disabled={isPreviewOpen || isAnimating}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-900 p-2 hover:scale-125 transition-transform disabled:opacity-30"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}