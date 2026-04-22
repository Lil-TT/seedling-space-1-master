"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Html, Sphere } from "@react-three/drei";
import { useRef, useMemo } from "react";
import Image from "next/image";

// 单个卫星（商品）组件
function SatelliteItem({ item, index, total }: { item: any, index: number, total: number }) {
  const groupRef = useRef<any>(null);
  
  // 利用数学公式将物品均匀分布在星球周围的球面上
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  const radius = 6; // 轨道半径

  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(phi);

  useFrame((state) => {
    if (groupRef.current) {
      // 让卫星不仅绕星球转，自己也轻微上下浮动
      groupRef.current.position.y = y + Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Html transform center distanceFactor={15}>
          <div className="w-48 bg-white/90 backdrop-blur-md p-4 rounded-3xl border-4 border-slate-200 shadow-xl cursor-pointer hover:border-emerald-400 hover:scale-110 transition-all group">
            <div className="h-20 bg-slate-100 rounded-2xl mb-3 flex items-center justify-center overflow-hidden relative">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-2 drop-shadow-md group-hover:scale-110 transition-transform" />
              ) : (
                <span className="text-4xl drop-shadow-sm">🎁</span>
              )}
            </div>
            <h4 className="font-black text-slate-800 text-center truncate">{item.title}</h4>
            <div className="mt-2 flex justify-center">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                @{item.owner?.user?.name || "神秘人"}
              </span>
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

// 主场景组件
export default function ChildhoodPlanet({ items }: { items: any[] }) {
  return (
    <div className="w-full h-screen absolute inset-0 bg-slate-900 z-40 overflow-hidden">
      {/* 极光背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-slate-900 pointer-events-none"></div>
      
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fdba74" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />

        {/* 浪漫星空背景 */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        {/* 中心：Morandi 毛毡流转星 */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Sphere args={[2.5, 64, 64]}>
            <meshStandardMaterial 
              color="#10b981" // 翡翠绿
              roughness={0.8} // 高粗糙度模拟毛毡质感
              metalness={0.1}
            />
          </Sphere>
        </Float>

        {/* 环绕的商品卫星 */}
        <group>
          {items.map((item, index) => (
            <SatelliteItem key={item.id} item={item} index={index} total={items.length} />
          ))}
        </group>

        {/* 控制器：允许拖拽旋转和缩放 */}
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} maxDistance={30} minDistance={5} />
      </Canvas>
    </div>
  );
}