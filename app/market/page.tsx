// app/market/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import UploadModal from "@/components/market/UploadModal";
import InfiniteSlider from "@/components/market/InfiniteSlider";
import MarketWrapper from "@/components/market/MarketWrapper";

export default function KidsMarket() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 初始化拉取数据
  useEffect(() => {
    fetch("/api/market/approved")
      .then(res => res.json())
      .then(data => {
        setMarketItems(data);
        setLoading(false);
      });
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen pt-24 overflow-hidden">
      <MarketWrapper items={marketItems}>
        <div className="container mx-auto px-6 lg:px-12">

          {/* =========================================================
            页面头部：标题与导航
        ========================================================= */}
          {/* 2. 页面头部：标题和发布按钮 */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">童心市场</h1>
              <p className="text-slate-500">在这里，每一份期待都有回响 ✨</p>
            </div>

            {/* 触发按钮：使用拟物化风格保持一致 */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              发布心愿
            </button>
          </div>

          {/* 核心展示区 */}
          {loading ? (
            <p className="text-center py-20 text-slate-400">正在布置展厅...</p>
          ) : marketItems.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100">
              <span className="text-6xl block mb-4">📦</span>
              <p className="text-slate-500 font-medium">目前的集市空空如也，快来投递第一个心愿吧！</p>
            </div>
          ) : (
            /* =========================================================
               这里替换了原本的瀑布流，使用全新的 3D 拟物轮播台
            ========================================================= */
            <InfiniteSlider items={marketItems} />
          )}

        </div>
      </MarketWrapper>

      {/* 4. 挂载上传弹窗组件 */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}