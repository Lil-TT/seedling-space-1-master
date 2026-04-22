// app/growth/page.tsx
"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import { GrowthTree, GrowthTreeHandle } from "@/components/scene/GrowthTree";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import * as THREE from "three";

export default function GrowthEcosystem() {
  const uiRef = useRef<HTMLDivElement>(null);
  const treeComponentRef = useRef<GrowthTreeHandle>(null);

  // === 基础状态 ===
  // 新增了 coins 字段用于前端展示余额和扣款
  const [growthData, setGrowthData] = useState({ leafCount: 0, seed: 0.5, coins: 0 });
  
  // === 灵感记录状态 ===
  const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);
  const [inspireText, setInspireText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === 🌊 情绪之海 (漂流瓶) 状态 ===
  const [isOceanModalOpen, setIsOceanModalOpen] = useState(false);
  const [oceanMode, setOceanMode] = useState<"menu" | "throw" | "salvage" | "view">("menu");
  const [bottleContent, setBottleContent] = useState("");
  const [salvagedBottle, setSalvagedBottle] = useState<any>(null);
  const [isOceanLoading, setIsOceanLoading] = useState(false);

  // 页面加载时拉取一次真实数据
  useEffect(() => {
    fetch("/api/growth/status")
      .then(res => res.json())
      .then(data => {
        if (data.leafCount !== undefined) {
          // 假设后端一并返回了当前的情绪币余额 coins
          setGrowthData({ leafCount: data.leafCount, seed: data.seed, coins: data.coins || 0 });
        }
      });
  }, []);

  // --- 原有的业务逻辑 ---
  const handleWatering = async () => {
    const res = await fetch("/api/growth/water", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      if (treeComponentRef.current) treeComponentRef.current.waterTree();
      setGrowthData(prev => ({ ...prev, leafCount: data.leafCount }));
    } else {
      alert(data.error);
    }
  };

  const handleTroubles = async () => {
    try {
      const res = await fetch("/api/growth/trouble", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        if (treeComponentRef.current) treeComponentRef.current.pourTroubles();
        if (data.isCrisis) console.warn("触发危机逻辑，老师端已亮起红灯！");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecordInspiration = async () => {
    if (!inspireText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/growth/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inspireText })
      });
      const data = await res.json();
      if (res.ok) {
        setIsInspireModalOpen(false);
        setInspireText("");
        if (treeComponentRef.current) treeComponentRef.current.recordInspiration();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrisisAlert = () => {
    alert("树叶承载不住你的烦恼掉落了... 我们已经悄悄通知了关心你的老师，深呼吸，一切都会好起来的。");
  };

  // ==========================================
  // 🌊 情绪之海 核心逻辑 (新增)
  // ==========================================
  
  // 1. 扔瓶子
  const handleThrowBottle = async () => {
    if (!bottleContent.trim()) return;
    setIsOceanLoading(true);
    try {
      const res = await fetch("/api/ocean/throw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: bottleContent, isAnonymous: true })
      });
      const data = await res.json();
      if (res.ok) {
        alert("漂流瓶已经随着海浪远去了 🌊");
        setBottleContent("");
        setOceanMode("menu");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOceanLoading(false);
    }
  };

  // 2. 捞瓶子
  const handleSalvageBottle = async () => {
    setIsOceanLoading(true);
    try {
      const res = await fetch("/api/ocean/salvage");
      const data = await res.json();
      if (res.ok) {
        setSalvagedBottle(data.bottle);
        setOceanMode("view"); // 切换到查看瓶子内容模式
      } else {
        alert(data.error || "目前海面上空空如也，晚点再来看看吧~");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOceanLoading(false);
    }
  };

  // 3. 给个抱抱 (发回声)
  const handleSendEcho = async () => {
    if (growthData.coins < 1) {
      return alert("你的情绪币不够了哦，快去完成任务或者记录灵感获取吧！");
    }
    
    setIsOceanLoading(true);
    try {
      const res = await fetch("/api/ocean/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleId: salvagedBottle.id, content: "给你一个温暖的抱抱 🫂" })
      });
      const data = await res.json();
      if (res.ok) {
        // 前端立刻扣除 1 个硬币，提升体验
        setGrowthData(prev => ({ ...prev, coins: prev.coins - 1 }));
        alert("你的安慰已经送达！-1 情绪币");
        setOceanMode("menu"); // 退回菜单
        setSalvagedBottle(null);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOceanLoading(false);
    }
  };

  // GSAP 动画初始化
  useGSAP(() => {
    gsap.fromTo(".mood-card",
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "back.out(1.7)", delay: 0.5, clearProps: "transform" }
    );
    gsap.fromTo(".growth-header",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, { scope: uiRef });

  return (
    <div className="relative w-full h-screen bg-[#EBE9E0] overflow-hidden">

      {/* UI 交互层 */}
      <div ref={uiRef} className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        <div className="growth-header flex justify-between items-start pointer-events-auto pt-24">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-3">成长生态</h1>
            <p className="text-slate-600 text-lg">每一份倾诉，都在让你的专属情绪树发芽。</p>
          </div>
          <div className="flex items-center gap-4">
            {/* 显示当前的情绪币余额 */}
            <div className="px-4 py-2 rounded-full bg-yellow-100 border-2 border-yellow-400 text-yellow-700 font-bold shadow-sm">
              🤑 {growthData.coins}
            </div>
            <Link href="/" className="px-6 py-2 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-800">
              返回首页
            </Link>
          </div>
        </div>

        {/* 底部心情互动卡片 */}
        <div className="flex flex-wrap gap-4 md:gap-6 pointer-events-auto mb-8 items-center">
          {[
            { emoji: "☀️", label: "开心灌溉", color: "text-amber-500", action: handleWatering },
            { emoji: "🌧️", label: "倾诉烦恼", color: "text-blue-500", action: handleTroubles }
          ].map((mood, idx) => (
            <div
              key={idx}
              onClick={mood.action}
              className="mood-card bg-white px-6 py-4 md:px-8 md:py-5 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex items-center gap-3 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] transition-[box-shadow,transform] duration-300"
            >
              <span className={`text-2xl md:text-3xl ${mood.color}`}>{mood.emoji}</span>
              <span className="font-medium text-slate-800 md:text-lg">{mood.label}</span>
            </div>
          ))}
          
          {/* 灵感按钮 */}
          <button
            onClick={() => setIsInspireModalOpen(true)}
            className="w-16 h-16 rounded-full bg-amber-400 text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
            title="记录灵感"
          >
            ✨
          </button>

          {/* 🌊 新增：漂流瓶入口按钮 */}
          <button
            onClick={() => { setIsOceanModalOpen(true); setOceanMode("menu"); }}
            className="w-16 h-16 rounded-full bg-sky-400 border-4 border-white text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
            title="情绪之海"
          >
            🌊
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🌊 情绪之海（漂流瓶）弹窗层 */}
      {/* ========================================== */}
      {isOceanModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-opacity">
          <div className="bg-gradient-to-b from-sky-50 to-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-sky-200 relative overflow-hidden">
            
            {/* 顶部装饰 / 返回键 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-sky-900 flex items-center gap-2">
                🌊 情绪之海
              </h3>
              <button 
                onClick={() => setIsOceanModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 模式 1：菜单选择 */}
            {oceanMode === "menu" && (
              <div className="flex flex-col gap-4 py-4">
                <button 
                  onClick={() => setOceanMode("throw")}
                  className="w-full py-6 rounded-3xl bg-sky-100 border-4 border-sky-300 text-sky-800 font-bold text-xl hover:bg-sky-200 hover:-translate-y-1 transition-all shadow-sm"
                >
                  扔一个漂流瓶 💌
                </button>
                <button 
                  onClick={handleSalvageBottle}
                  disabled={isOceanLoading}
                  className="w-full py-6 rounded-3xl bg-indigo-100 border-4 border-indigo-300 text-indigo-800 font-bold text-xl hover:bg-indigo-200 hover:-translate-y-1 transition-all shadow-sm disabled:opacity-50"
                >
                  {isOceanLoading ? "打捞中..." : "捞一个瓶子 🎣"}
                </button>
              </div>
            )}

            {/* 模式 2：写瓶子 */}
            {oceanMode === "throw" && (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4">
                <textarea 
                  value={bottleContent}
                  onChange={(e) => setBottleContent(e.target.value)}
                  placeholder="写下你的烦恼或秘密，将它交给大海..."
                  className="w-full h-40 p-5 rounded-3xl bg-white border-2 border-sky-200 focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none resize-none transition-all placeholder:text-sky-300/80 text-sky-900 font-medium"
                />
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setOceanMode("menu")} className="px-6 py-3 rounded-2xl text-slate-500 font-bold bg-slate-100 hover:bg-slate-200">返回</button>
                  <button 
                    onClick={handleThrowBottle}
                    disabled={isOceanLoading || !bottleContent.trim()}
                    className="flex-1 py-3 rounded-2xl bg-sky-500 text-white font-bold shadow-md hover:bg-sky-400 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isOceanLoading ? "抛掷中..." : "用力扔进海里！"}
                  </button>
                </div>
              </div>
            )}

            {/* 模式 3：查看捞到的瓶子 */}
            {oceanMode === "view" && salvagedBottle && (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200 shadow-inner relative">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-3 bg-amber-200 rounded-full opacity-50"></div>
                  <p className="text-slate-700 leading-relaxed font-medium mt-4 whitespace-pre-wrap">
                    {salvagedBottle.content}
                  </p>
                  <p className="text-xs text-amber-600 font-bold mt-6 text-right">
                    — 来自未知的 {salvagedBottle.author?.name || "神秘人"}
                  </p>
                </div>
                
                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    onClick={handleSendEcho}
                    disabled={isOceanLoading}
                    className="w-full py-4 rounded-2xl bg-rose-400 text-white font-black text-lg shadow-[0_4px_0_#be123c] hover:-translate-y-1 hover:shadow-[0_6px_0_#be123c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    给TA一个抱抱 🫂 <span className="text-xs bg-rose-500 px-2 py-1 rounded-lg">-1 🪙</span>
                  </button>
                  <button onClick={() => setOceanMode("menu")} className="py-2 text-slate-400 font-bold hover:text-slate-600 text-sm">
                    悄悄放回海里
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* === 原有的灵感记录弹窗 === */}
      {isInspireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md w-full max-w-lg rounded-[2rem] p-8 shadow-2xl border border-white/50">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">✨ 捕获灵感瞬间</h3>
            <textarea 
              value={inspireText}
              onChange={(e) => setInspireText(e.target.value)}
              placeholder="刚刚脑海中闪过了什么奇妙的想法？"
              className="w-full h-32 p-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsInspireModalOpen(false)} className="px-6 py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-100 transition-colors">取消</button>
              <button 
                onClick={handleRecordInspiration}
                disabled={isSubmitting || !inspireText.trim()}
                className="px-6 py-3 rounded-xl bg-amber-400 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? "珍藏中..." : "封存灵感"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D 渲染层 */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 1.5, 8], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={1024} shadow-bias={-0.0001} />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#9BB7D4" />
          <Suspense fallback={null}>
            <GrowthTree ref={treeComponentRef} leafCount={growthData.leafCount} treeSeed={growthData.seed} onCrisisTrigger={handleCrisisAlert} />
            <Environment preset="city" />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.7} scale={12} blur={2} far={4} color="#2a3b2c" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2 + 0.1} minAzimuthAngle={-Math.PI / 4} maxAzimuthAngle={Math.PI / 4} />
        </Canvas>
      </div>

    </div>
  );
}