// app/profile/ApprovalDrawer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { createPortal } from "react-dom";

interface PendingItem {
  id: string;
  title: string;
  desc: string;
  type: string;
  owner: { user: { name: string } };
}

export default function ApprovalDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取数据
  useEffect(() => {
    if (isOpen) {
      fetch("/api/teacher/pending-items")
        .then(res => res.json())
        .then(setItems);
    }
  }, [isOpen]);

  // GSAP 动画控制
  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, pointerEvents: "auto" });
      gsap.to(drawerRef.current, { x: 0, duration: 0.6, ease: "power4.out" });
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: "none" });
      gsap.to(drawerRef.current, { x: "100%", duration: 0.5, ease: "power4.in" });
    }
  }, [isOpen]);

  const handleAction = async (itemId: string, action: 'APPROVE' | 'REJECT') => {
    setLoading(true);
    await fetch("/api/teacher/approve-item", {
      method: "POST",
      body: JSON.stringify({ itemId, action })
    });
    setItems(prev => prev.filter(i => i.id !== itemId));
    setLoading(false);
    if (items.length <= 1) onClose(); // 审完了自动关闭
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* 遮罩层 */}
      <div 
        ref={overlayRef}
        onClick={onClose}
        className="fixed top-0 left-0 w-screen h-[100dvh] bg-slate-900/40 backdrop-blur-md z-[9998] opacity-0 pointer-events-none"
      />
      
      {/* 抽屉主体 */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-[100dvh] w-full max-w-xl bg-white/90 backdrop-blur-xl z-[9999] shadow-2xl translate-x-full border-l border-white/20 p-8 flex flex-col"
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">心愿审核</h2>
            <p className="text-slate-500 text-sm">在这里见证孩子们的交换逻辑</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {items.length === 0 ? (
            <div className="text-center py-20 text-slate-400">目前没有待审批的物品 ✨</div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                    {item.type === 'WISH' ? '心愿' : '闲置'}
                  </span>
                  <span className="text-sm text-slate-400">来自: {item.owner.user.name}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{item.desc}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={loading}
                    onClick={() => handleAction(item.id, 'REJECT')}
                    className="py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                  >
                    温柔退回
                  </button>
                  <button 
                    disabled={loading}
                    onClick={() => handleAction(item.id, 'APPROVE')}
                    className="py-3 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all"
                  >
                    允许流通
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>,
    document.body // 🎯 这里的 document.body 是魔法的本质
  );
}