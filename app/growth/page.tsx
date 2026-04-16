// app/growth/page.tsx
"use client";

import { Suspense, useRef } from "react";
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

 // 1. 完善事件处理函数
  const handleWatering = () => {
    if (treeComponentRef.current) treeComponentRef.current.waterTree();
  };
  
  const handleTroubles = () => {
    if (treeComponentRef.current) treeComponentRef.current.pourTroubles();
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
        <div className="growth-header flex justify-between items-start pointer-events-auto">
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
            { emoji: "🌧️", label: "倾诉烦恼", color: "text-blue-500", action: handleTroubles },
            { emoji: "✨", label: "记录灵感", color: "text-purple-500", action: handleInspiration }
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
        </div>
      </div>

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
            <GrowthTree ref={treeComponentRef} />
            <Environment preset="city" />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.7} scale={12} blur={2} far={4} color="#2a3b2c" />
          </Suspense>

          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2 + 0.1} minAzimuthAngle={-Math.PI / 4} maxAzimuthAngle={Math.PI / 4} />
        </Canvas>
      </div>

    </div>
  );
}