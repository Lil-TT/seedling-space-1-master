// components/market/InfiniteSlider.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

interface MarketItem {
  id: string;
  title: string;
  desc: string;
  type: string;
  owner: { user: { name: string } };
}

// 替代图片的渐变色板
const gradients = [
  "from-rose-100 to-teal-100",
  "from-blue-100 to-indigo-200",
  "from-amber-100 to-orange-200",
  "from-emerald-100 to-cyan-200",
  "from-fuchsia-100 to-purple-200"
];

export default function InfiniteSlider({ items }: { items: MarketItem[] }) {
  // 如果物品太少（少于5个），我们复制几份来保证无限轮播的视觉效果不会断层
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

  const slideWidth = 375; // 间距比例 (0.375 * 1000)

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
            onComplete: () => {
              // 这里可以刷新页面或者从本地 items 状态里剔除该项
              window.location.reload();
            }
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

  // 计算相对索引，用于无限循环
  const getRelativeIndex = (index: number) => {
    const total = displayItems.length;
    let rel = index - (currentIndex % total);
    // 处理负数索引循环
    if (currentIndex < 0) rel = index - ((currentIndex % total) + total) % total;
    // 镜像折叠（让超出半圈的跑到反方向去）
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;
    return rel;
  };

  // 监听 index 变化，触发 3D 轮播动画
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
        ease: "power3.inOut",
      });
    });
  }, [currentIndex, isPreviewOpen, displayItems.length]);

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

    // 预览面板动画
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

    // 控制器动画变形
    gsap.to(controllerOuterRef.current, {
      clipPath: willOpen ? "circle(0% at 50% 50%)" : "circle(50% at 50% 50%)",
      duration: 0.75,
      ease: "power3.inOut"
    });
    gsap.to(controllerInnerRef.current, {
      clipPath: willOpen ? "circle(50% at 50% 50%)" : "circle(40% at 50% 50%)",
      background: willOpen ? "#000" : "#343434", // 展开时变成黑色关闭按钮
      duration: 0.75,
      ease: "power3.inOut"
    });
  };

  if (displayItems.length === 0) return null;

  // 获取当前正在展示的商品
  const activeItem = displayItems[((currentIndex % displayItems.length) + displayItems.length) % displayItems.length];

  return (
    <div className="relative w-full h-[75vh] overflow-hidden bg-slate-50/50">

      {/* --- 模糊背景墙 --- */}
      <div className="absolute inset-0 z-0 opacity-40 blur-3xl transition-colors duration-1000 bg-gradient-to-br from-slate-200 to-slate-300"></div>

      {/* --- 顶部信息 --- */}
      <div className="absolute top-8 left-8 right-8 flex justify-between z-20 font-mono uppercase text-slate-500 tracking-wider">
        <p>童心流转中心 / EXP</p>
        <p className="text-slate-800 font-bold transition-all duration-300">
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
            {/* 渐变生成的虚拟商品卡片 */}
            <div className={`w-[250px] h-[250px] rounded-[2rem] bg-gradient-to-br ${gradients[i % gradients.length]} shadow-2xl flex flex-col items-center justify-center border-4 border-white/60 cursor-pointer overflow-hidden group`}>
              <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                {item.type === "WISH" ? "🌠" : "🎁"}
              </span>
              <p className="mt-4 font-bold text-slate-800/80 bg-white/40 px-4 py-1 rounded-full backdrop-blur-md">
                来自: {item.owner.user.name}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* --- 玻璃拟物化预览面板 --- */}
      <div
        ref={previewRef}
        className="absolute top-1/2 left-1/2 w-[85%] md:w-[400px] h-[65%] -translate-x-1/2 translate-y-full opacity-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] p-8 flex flex-col border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-30"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-wider">
            {activeItem?.type === "WISH" ? "心愿清单" : "闲置流转"}
          </span>
          <span className="text-slate-500 text-sm">发布者: {activeItem?.owner.user.name}</span>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-4">{activeItem?.title}</h2>

        <div className="flex-1 bg-white/50 rounded-2xl p-6 overflow-y-auto custom-scrollbar">
          <p className="text-slate-600 leading-relaxed">{activeItem?.desc}</p>
        </div>

        <button
          onClick={handleTradeRequest}
          disabled={tradeLoading}
          className={`mt-6 w-full py-4 rounded-2xl font-bold transition-all shadow-lg 
            ${tradeLoading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-95"
            }`}
        >
          {tradeLoading ? "正在传递心愿..." : "发起交换请求"}
        </button>
      </div>

      {/* --- 底部控制台 (Controller) --- */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 z-40 select-none">
        {/* 内部主按钮（展开/关闭面板） */}
        <div
          ref={controllerInnerRef}
          onClick={togglePreview}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#343434] rounded-full flex items-center justify-center cursor-pointer z-20 shadow-xl transition-colors hover:scale-105"
          style={{ clipPath: "circle(40% at 50% 50%)" }}
        >
          {isPreviewOpen ? (
            <span className="text-white text-2xl font-bold">✕</span>
          ) : (
            <span className="text-white text-sm font-bold tracking-widest uppercase">查看</span>
          )}
        </div>

        {/* 外部轨道按钮（左右切换） */}
        <div
          ref={controllerOuterRef}
          className="absolute inset-0 bg-[#212121] rounded-full z-10"
          style={{ clipPath: "circle(50% at 50% 50%)" }}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono tracking-widest uppercase">
            Menu
          </div>

          <button
            onClick={movePrev}
            disabled={isPreviewOpen || isAnimating}
            className="absolute top-1/2 left-4 -translate-y-1/2 text-white p-2 hover:scale-110 transition-transform disabled:opacity-20"
          >
            {/* 左箭头 SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <button
            onClick={moveNext}
            disabled={isPreviewOpen || isAnimating}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-white p-2 hover:scale-110 transition-transform disabled:opacity-20"
          >
            {/* 右箭头 SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

    </div>
  );
}