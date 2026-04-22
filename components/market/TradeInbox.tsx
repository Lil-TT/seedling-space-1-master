// components/market/TradeInbox.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

interface TradeRequest {
  id: string;
  item: { title: string };
  initiator: { user: { name: string } };
  createdAt: string;
}

export default function TradeInbox() {
  const [trades, setTrades] = useState<TradeRequest[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dotRef = useRef(null);

  // 1. 定期刷新或初始化获取数据
  useEffect(() => {
    const fetchTrades = () => {
      fetch("/api/student/received-trades")
        .then(res => res.json())
        .then(data => setTrades(Array.isArray(data) ? data : []));
    };
    fetchTrades();
    const timer = setInterval(fetchTrades, 30000); // 30秒轮询一次
    return () => clearInterval(timer);
  }, []);

  // 2. 红点呼吸动画
  useEffect(() => {
    if (trades.length > 0 && dotRef.current) {
      gsap.to(dotRef.current, {
        scale: 1.3,
        opacity: 0.6,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, [trades.length]);

  const handleRespond = async (tradeId: string, action: 'ACCEPT' | 'REJECT') => {
    const res = await fetch("/api/student/respond-trade", {
      method: "POST",
      body: JSON.stringify({ tradeId, action })
    });
    if (res.ok) {
      setTrades(prev => prev.filter(t => t.id !== tradeId));
    }
  };

  return (
    <div className="relative">
      {/* 按钮入口 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all relative group"
      >
        <span className="text-xl">🤝</span>
        {trades.length > 0 && (
          <span 
            ref={dotRef}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold"
          >
            {trades.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-slate-800 p-5 z-[9999]">
          <h3 className="font-black text-slate-800 mb-4 px-2 flex items-center gap-2">
            <span>📩</span> 收到的交换请求
          </h3>
          
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {trades.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10 font-bold">暂时没有小纸条飞过来~</p>
            ) : (
              trades.map(trade => (
                <div key={trade.id} className="bg-amber-50/50 p-4 rounded-3xl border-2 border-dashed border-amber-200 hover:border-amber-400 transition-colors">
                  <p className="text-xs text-amber-900/60 mb-2 font-bold">
                    来自 <span className="text-amber-600">@{trade.initiator.user.name}</span> 的请求：
                  </p>
                  <p className="text-sm font-black text-slate-800 mb-4">想要换你的《{trade.item.title}》</p>
                  
                  <div className="flex gap-2">
                    {/* 如果是待处理状态，显示接受/婉拒 */}
                    <button 
                      onClick={() => handleRespond(trade.id, 'REJECT')}
                      className="flex-1 py-2 bg-white border-2 border-slate-800 rounded-xl text-xs font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      婉拒
                    </button>
                    
                    {/* 接受按钮：接受后可以引导去私聊 */}
                    <button 
                      onClick={() => handleRespond(trade.id, 'ACCEPT')}
                      className="flex-1 py-2 bg-slate-900 text-white border-2 border-slate-800 rounded-xl text-xs font-bold shadow-[2px_2px_0_rgba(0,0,0,0.2)] hover:bg-emerald-600 transition-all"
                    >
                      接受并私聊
                    </button>
                  </div>

                  {/* 关键：如果交易已经是 ACCEPTED 状态（或者你想在列表里直接提供入口） */}
                  <Link 
                    href={`/market/trade/${trade.id}`}
                    className="mt-3 w-full py-2 bg-morandi-yellow border-2 border-slate-800 rounded-xl text-xs font-black text-slate-900 flex items-center justify-center gap-2 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-yellow-400 transition-all"
                  >
                    <span>💬</span> 进入秘密基地传纸条
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}