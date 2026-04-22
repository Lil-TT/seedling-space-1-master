"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars as DreiStars, Html } from "@react-three/drei";
import * as THREE from "three";

// ==========================================
// 1. 单个用户的实体星星组件 (保持不变)
// ==========================================
function UserStar({ student, position }: { student: any, position: [number, number, number] }) {
    const [hovered, setHovered] = useState(false);
    const starRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (starRef.current && student.isRecentlyActive) {
            const time = state.clock.getElapsedTime();
            const scale = 1 + Math.sin(time * 3 + position[0]) * 0.2;
            starRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={starRef}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[student.isRecentlyActive ? 0.2 : 0.1, 16, 16]} />
                <meshBasicMaterial color={student.isRecentlyActive ? "#34d399" : "#64748b"} />
            </mesh>

            {student.isRecentlyActive && (
                <mesh>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshBasicMaterial color="#34d399" transparent opacity={0.2} />
                </mesh>
            )}

            {/* 🌟 核心：悬浮的用户信息卡片 (卡通手账风改造) */}
            <Html center distanceFactor={15} zIndexRange={[100, 0]}>
                {/* 容器：增加了 Y 轴的微小偏移，让气泡有浮动感 */}
                <div className={`transition-all duration-300 flex flex-col items-center pointer-events-none ${hovered ? 'opacity-100 scale-125 z-50 -translate-y-6' : 'opacity-70 scale-75 z-0 -translate-y-3'}`}>

                    {/* 🎮 卡通对话气泡主体 */}
                    <div className={`relative px-3 py-2.5 rounded-[1.5rem] border-4 flex items-center gap-3 whitespace-nowrap min-w-max transition-all
            ${student.isRecentlyActive
                            ? 'bg-[#fffdf0] border-slate-800 shadow-[6px_6px_0_rgba(15,23,42,1)]' // 活跃状态：温暖白底 + 黑粗边 + 极硬的黑色阴影
                            : 'bg-slate-200 border-slate-400 shadow-[6px_6px_0_rgba(148,163,184,1)] grayscale-[0.3]' // 未活跃：灰色调
                        }
          `}>

                        {/* 💬 气泡底部的小尖角 (利用旋转 45 度的正方形实现) */}
                        <div className={`absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b-4 border-r-4 
              ${student.isRecentlyActive ? 'bg-[#fffdf0] border-slate-800' : 'bg-slate-200 border-slate-400'}
            `}></div>

                        {/* 🧑‍🎨 游戏化头像方块 (带有轻微的倾斜显得更调皮) */}
                        <div className={`w-10 h-10 rounded-[0.8rem] flex items-center justify-center text-lg font-black border-2 border-slate-800 shadow-inner transform -rotate-3 transition-transform ${hovered && 'rotate-3 scale-110'}
              ${student.isRecentlyActive ? 'bg-emerald-300 text-emerald-950' : 'bg-slate-300 text-slate-600'}
            `}>
                            {student.name.charAt(student.name.length - 1)}
                        </div>

                        {/* 📝 信息展示区 */}
                        <div className="flex flex-col pr-2 justify-center">
                            <span className={`text-sm font-black leading-tight tracking-wide ${student.isRecentlyActive ? 'text-slate-800' : 'text-slate-500'}`}>
                                {student.name}
                            </span>

                            {/* 🏷️ 鼠标悬停时的状态小贴纸 */}
                            {hovered && (
                                <span className="text-[10px] font-black text-rose-700 bg-rose-100 border-2 border-rose-200 px-2 py-0.5 rounded-lg mt-1 animate-fade-in inline-block shadow-sm tracking-widest">
                                    {student.action || "漂浮中 🚀"}
                                </span>
                            )}
                        </div>

                    </div>
                </div>
            </Html>
        </group>
    );
}

// ==========================================
// 2. 新增：将需要 Hook 的渲染逻辑抽离为内部组件
// ==========================================
function GalaxyCluster({ starData }: { starData: any[] }) {
    const groupRef = useRef<THREE.Group>(null);

    // 现在 useFrame 在 Canvas 内部运行，完美工作！
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
        }
    });

    return (
        <group ref={groupRef}>
            {starData.map((data, index) => (
                <UserStar key={index} student={data.student} position={data.position} />
            ))}
        </group>
    );
}

// ==========================================
// 3. 主星空外壳组件 (只负责计算数据和创建 Canvas)
// ==========================================
export default function StarrySky({ students }: { students: any[] }) {

    // 数据计算不需要 R3F 上下文，可以留在外面
    const starData = useMemo(() => {
        return students.map((student) => {
            const r = 10 + Math.random() * 15;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            return { student, position: [x, y, z] as [number, number, number] };
        });
    }, [students]);

    return (
        <div className="absolute inset-0 z-0 bg-slate-950">
            <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
                <ambientLight intensity={0.5} />

                <DreiStars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

                <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
                    {/* 将数据传给这个处于 Canvas 内部的组件 */}
                    <GalaxyCluster starData={starData} />
                </Float>
            </Canvas>

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950 pointer-events-none"></div>
        </div>
    );
}