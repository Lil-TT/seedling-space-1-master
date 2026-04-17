// app/growth/page.tsx
"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
// 引入组件以及刚刚定义的类型
import { GrowthTree, GrowthTreeHandle } from "@/components/scene/GrowthTree";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import * as THREE from "three";

export default function GrowthEcosystem() {
  const uiRef = useRef<HTMLDivElement>(null);
  // 1. 创建指向 3D 树木组件的 Ref
  const treeComponentRef = useRef<GrowthTreeHandle>(null);

  // 在你的组件内部新增状态
  const [growthData, setGrowthData] = useState({ leafCount: 0, seed: 0.5 });
  const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);
  const [inspireText, setInspireText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 页面加载时拉取一次真实数据
  useEffect(() => {
    // 假设你写了一个 /api/growth/status 的 GET 接口来返回这俩数据
    fetch("/api/growth/status")
      .then(res => res.json())
      .then(data => {
        if (data.leafCount !== undefined) {
          setGrowthData({ leafCount: data.leafCount, seed: data.seed });
        }
      });
  }, []);

  // 处理开心灌溉
  const handleWatering = async () => {
    const res = await fetch("/api/growth/water", { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      if (treeComponentRef.current) treeComponentRef.current.waterTree();
      // 成功后，叶子数量+1，触发 useMemo 重新计算，屏幕上瞬间长出一片新叶子！
      setGrowthData(prev => ({ ...prev, leafCount: data.leafCount }));
    } else {
      alert(data.error);
    }
  };

  // 处理倾诉烦恼
  const handleTroubles = async () => {
    try {
      const res = await fetch("/api/growth/trouble", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        // 触发 3D 树木的变黄/掉落动画
        if (treeComponentRef.current) {
          treeComponentRef.current.pourTroubles();
        }

        // 如果后端返回已达危机状态，可以在这里额外给学生一句安慰的话
        if (data.isCrisis) {
          console.warn("触发危机逻辑，老师端已亮起红灯！");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 处理记录灵感
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
        // 1. 关闭弹窗并清空输入
        setIsInspireModalOpen(false);
        setInspireText("");

        // 2. 触发 3D 树木开心的自转与拉伸动画
        if (treeComponentRef.current) {
          treeComponentRef.current.recordInspiration();
        }

        // 可选：提示获得了情绪币
        // alert("灵感已珍藏！+2 情绪币");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理危机预警的前端交互
  const handleCrisisAlert = () => {
    console.warn("🚨 危机触发：已向老师和家长后台推送 CRISIS 预警！");
    // 这里可以加一个温柔的浏览器弹窗，或者以后换成更好看的 Toast 组件
    alert("树叶承载不住你的烦恼掉落了... 我们已经悄悄通知了关心你的老师，深呼吸，一切都会好起来的。");
  };

  const handleInspiration = () => {
    if (treeComponentRef.current) treeComponentRef.current.recordInspiration();
  };

  useGSAP(() => {
    // 修复了 React 18 下的初始透明度问题
    gsap.fromTo(".mood-card",
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1.2,
        ease: "back.out(1.7)",
        delay: 0.5,
        clearProps: "transform"
      }
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
        <div className="growth-header flex justify-between items-start pointer-events-auto pt-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-3">成长生态</h1>
            <p className="text-slate-600 text-lg">每一份倾诉，都在让你的专属情绪树发芽。</p>
          </div>
          <Link href="/" className="px-6 py-2 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-800">
            返回首页
          </Link>
        </div>

        {/* 底部心情互动卡片 */}
        <div className="flex flex-wrap gap-4 md:gap-6 pointer-events-auto mb-8">
          {[
            // 2. 将新增的事件挂载到配置数组中
            { emoji: "☀️", label: "开心灌溉", color: "text-amber-500", action: handleWatering },
            { emoji: "🌧️", label: "倾诉烦恼", color: "text-blue-500", action: handleTroubles }
          ].map((mood, idx) => (
            <div
              key={idx}
              onClick={mood.action} // 挂载点击事件
              className="mood-card bg-white px-6 py-4 md:px-8 md:py-5 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex items-center gap-3 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] transition-[box-shadow,transform] duration-300"
            >
              <span className={`text-2xl md:text-3xl ${mood.color}`}>{mood.emoji}</span>
              <span className="font-medium text-slate-800 md:text-lg">{mood.label}</span>
            </div>
          ))}
          <button
          onClick={() => setIsInspireModalOpen(true)}
          className="w-16 h-16 rounded-full bg-morandi-yellow text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
        >
          ✨
        </button>
        </div>
      </div>

      {/* 灵感记录弹窗 */}
      {isInspireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md w-full max-w-lg rounded-[2rem] p-8 shadow-2xl border border-white/50">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              ✨ 捕获灵感瞬间
            </h3>
            <textarea 
              value={inspireText}
              onChange={(e) => setInspireText(e.target.value)}
              placeholder="刚刚脑海中闪过了什么奇妙的想法？"
              className="w-full h-32 p-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-morandi-yellow focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsInspireModalOpen(false)}
                className="px-6 py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleRecordInspiration}
                disabled={isSubmitting || !inspireText.trim()}
                className="px-6 py-3 rounded-xl bg-morandi-yellow text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? "珍藏中..." : "封存灵感"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D 渲染层 */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        {/* 修复了 Three.js 的 shadow type 警告 */}
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [0, 1.5, 8], fov: 45 }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={1024}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#9BB7D4" />

          <Suspense fallback={null}>
            {/* 4. 将 Ref 绑定到树木组件上 */}
            <GrowthTree
              ref={treeComponentRef}
              leafCount={growthData.leafCount}
              treeSeed={growthData.seed}
              onCrisisTrigger={handleCrisisAlert}
            />
            <Environment preset="city" />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.7} scale={12} blur={2} far={4} color="#2a3b2c" />
          </Suspense>

          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2 + 0.1} minAzimuthAngle={-Math.PI / 4} maxAzimuthAngle={Math.PI / 4} />
        </Canvas>
      </div>

    </div>
  );
}