"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Html, Sphere } from "@react-three/drei";
import { useRef } from "react";
import Image from "next/image";

// 单个卫星（商品）组件
function SatelliteItem({ item, index, total, onSelect }: { item: any, index: number, total: number, onSelect: (id: string) => void }) {
  const groupRef = useRef<any>(null);
  
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  const radius = 6;

  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(phi);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = y + Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Html transform center distanceFactor={15}>
          {/* ==========================================
              修复重点在这里：增加一个透明的保护壳(Wrapper) 
              使用 pointer-events-auto 强制捕获鼠标
          ========================================== */}
          <div className="pointer-events-auto p-4">
            <div 
              onClick={(e) => { 
                e.stopPropagation(); 
                onSelect(item.id); 
              }}
              // 把所有的 hover 动画放在内层
              className="w-48 bg-white/90 backdrop-blur-md p-4 rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] cursor-pointer hover:border-emerald-400 hover:scale-110 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="h-20 bg-slate-100 rounded-2xl mb-3 flex items-center justify-center overflow-hidden border-2 border-slate-900 relative">
                {item.iconName ? (
                  <Image 
                    src={item.iconName} 
                    alt={item.title} 
                    fill 
                    className="object-contain p-2 drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">🎁</span>
                )}
              </div>
              <h4 className="font-black text-slate-800 text-center truncate">{item.title}</h4>
              <div className="mt-2 flex justify-center">
                <span className="text-xs font-black text-slate-900 bg-yellow-400 border-2 border-slate-900 px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#0f172a]">
                  @{item.owner?.user?.name || "神秘人"}
                </span>
              </div>
            </div>
          </div>
          {/* ========================================== */}
        </Html>
      </Float>
    </group>
  );
}

// 主场景组件接收 onSelectItem
export default function ChildhoodPlanet({ items, onSelectItem }: { items: any[], onSelectItem: (id: string) => void }) {
  return (
    <div className="w-full h-screen absolute inset-0 bg-slate-900 z-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 to-slate-900 pointer-events-none"></div>
      
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fdba74" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Sphere args={[2.5, 64, 64]}>
            <meshStandardMaterial color="#10b981" roughness={0.8} metalness={0.1} />
          </Sphere>
        </Float>

        <group>
          {items.map((item, index) => (
            <SatelliteItem 
              key={item.id} 
              item={item} 
              index={index} 
              total={items.length} 
              onSelect={onSelectItem} // 传递回调
            />
          ))}
        </group>

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} maxDistance={30} minDistance={5} />
      </Canvas>
    </div>
  );
}