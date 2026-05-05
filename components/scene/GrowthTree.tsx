// components/scene/GrowthTree.tsx
"use client";

import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Icosahedron, Cylinder } from "@react-three/drei";
import gsap from "gsap";

// ==========================================
// 1. 核心伪随机数生成器 (Mulberry32)
// 保证相同的 seed 永远生成相同的乱序序列
// ==========================================
function seededRandom(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export interface GrowthTreeHandle {
  waterTree: () => void;
  pourTroubles: () => void;
  recordInspiration: () => void;
}

interface GrowthTreeProps {
  leafCount: number;  // 数据库里真实的树叶数量
  treeSeed: number;   // 数据库里真实的随机种子
  /** 心情连续打卡驱动的形态阶段 0–3，树冠与树干略变化 */
  growthStage?: number;
  onCrisisTrigger?: () => void; 
}

export const GrowthTree = forwardRef<GrowthTreeHandle, GrowthTreeProps>(({ leafCount, treeSeed, growthStage = 0, onCrisisTrigger }, ref) => {
  const treeRef = useRef<THREE.Group>(null);
  const foliageRef = useRef<THREE.Group>(null);
  const fragileLeafRef = useRef<THREE.Mesh>(null);
  const troubleClickCount = useRef(0);

  // ==========================================
  // 2. 球面坐标系算法：计算树叶的 3D 空间坐标
  // ==========================================
  const stage = Math.min(3, Math.max(0, growthStage || 0));
  const crownBoost = 1 + stage * 0.07;
  const trunkBoost = 1 + stage * 0.08;

  const leaves = useMemo(() => {
    // 使用数据库里的 seed 初始化随机生成器
    const random = seededRandom(treeSeed || 0.12345);
    const leafData = [];
    
    // 根据数据库真实数量生成叶片
    for(let i = 0; i < leafCount; i++) {
       // 球面坐标算法：让树叶均匀分布在树冠表面
       const theta = random() * Math.PI * 2; // 水平角度
       const phi = Math.acos(2 * random() - 1); // 垂直角度
       
       // 树冠的半径基准设为 1.4，加上一点点随机扰动让边缘不那么圆滑
       const radius = (1.4 + random() * 0.3) * crownBoost; 

       // 将球面坐标转换为笛卡尔 3D 坐标 (X, Y, Z)
       const x = radius * Math.sin(phi) * Math.cos(theta);
       const y = radius * Math.cos(phi);
       const z = radius * Math.sin(phi) * Math.sin(theta);

       leafData.push({
         position: [x, y, z] as [number, number, number],
         rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI] as [number, number, number],
         scale: 0.3 + random() * 0.4 // 叶子大小随机变化
       });
    }
    return leafData;
  }, [leafCount, treeSeed, crownBoost]); // 只要叶子数量增加，就会自动计算出下一片叶子的固定位置

  // ... 之前的 useImperativeHandle 动画逻辑保持不变 ...
  useImperativeHandle(ref, () => ({
    waterTree: () => {
      if (!foliageRef.current) return;
      gsap.killTweensOf(foliageRef.current.scale);
      gsap.fromTo(foliageRef.current.scale, { x: 1, y: 1, z: 1 }, { x: 1.15, y: 1.15, z: 1.15, duration: 0.8, ease: "elastic.out(1.2, 0.3)", yoyo: true, repeat: 1 });
    },
    pourTroubles: () => {
      troubleClickCount.current += 1;
      const count = troubleClickCount.current;
      const fragileLeaf = fragileLeafRef.current;
      const foliage = foliageRef.current;

      if (foliage) {
        gsap.fromTo(foliage.scale, { x: 1, y: 1, z: 1 }, { x: 1.05, y: 0.8, z: 1.05, duration: 1.5, ease: "power1.inOut", yoyo: true, repeat: 1 });
      }

      if (!fragileLeaf) return;
      const material = fragileLeaf.material as THREE.MeshStandardMaterial;

      if (count === 1) {
        gsap.to(material.color, { r: 0.8, g: 0.8, b: 0.4, duration: 1 });
      } else if (count === 2) {
        gsap.to(material.color, { r: 0.7, g: 0.5, b: 0.2, duration: 1 });
      } else if (count === 3) {
        gsap.to(fragileLeaf.position, { y: -4, x: fragileLeaf.position.x - 1, duration: 1.8, ease: "bounce.out" });
        gsap.to(fragileLeaf.rotation, { x: "+=4", z: "+=2", duration: 1.8 });
        if (onCrisisTrigger) onCrisisTrigger();
      }
    },
    recordInspiration: () => {
      if (!foliageRef.current || !treeRef.current) return;
      gsap.fromTo(foliageRef.current.scale, { x: 1, y: 1, z: 1 }, { x: 0.8, y: 1.4, z: 0.8, duration: 0.6, ease: "back.out(1.5)", yoyo: true, repeat: 1 });
      gsap.to(treeRef.current.rotation, { y: "+=" + Math.PI * 2, duration: 1.2, ease: "back.out(1.2)" });
    }
  }));

  useFrame((state, delta) => {
    if (treeRef.current) {
      treeRef.current.rotation.y += delta * 0.1;
      treeRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05 - 1.2;
    }
  });

  return (
    <group ref={treeRef} dispose={null} position={[0, -1.2, 0]}>
      {/* 树干 */}
      <Cylinder args={[0.15 * trunkBoost, 0.35 * trunkBoost, 2.5 * trunkBoost, 7]} position={[0, 1.25 * trunkBoost, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={stage >= 2 ? "#7a6a5e" : "#8B7E74"} roughness={0.9} flatShading />
      </Cylinder>
      
      {/* 树冠组 */}
      <group ref={foliageRef} position={[0, 2.8 + stage * 0.12, 0]}>
        
        {/* 底层核心网格 (遮挡空白) */}
        <Icosahedron args={[1.2 * crownBoost, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={stage >= 3 ? "#6f9b78" : "#84A087"} roughness={0.8} flatShading />
        </Icosahedron>

        {/* 3. 动态渲染生成的叶子群 */}
        {leaves.map((leaf, index) => (
          <Icosahedron 
            key={index} 
            args={[1, 0]} 
            position={leaf.position} 
            rotation={leaf.rotation} 
            scale={leaf.scale}
            castShadow 
            receiveShadow
          >
            {/* 用不同的绿色色阶来增加层次感 */}
            <meshStandardMaterial 
               color={
                 stage >= 3
                   ? index % 3 === 0 ? "#8fd4a4" : index % 2 === 0 ? "#7eb89a" : "#6f9b78"
                   : stage >= 1
                     ? index % 3 === 0 ? "#9bc4a8" : index % 2 === 0 ? "#8fb8c8" : "#739880"
                     : index % 3 === 0 ? "#A5BAAA" : index % 2 === 0 ? "#9BB7D4" : "#84A087"
               }
               roughness={0.8} 
               flatShading 
            />
          </Icosahedron>
        ))}
        
        {/* 单独剥离出来的：承载烦恼的脆弱叶子 */}
        <Icosahedron ref={fragileLeafRef} args={[0.7, 0]} position={[-0.8, 0.3, -0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#E1CFB2" roughness={0.8} flatShading />
        </Icosahedron>

      </group>
    </group>
  );
});

GrowthTree.displayName = "GrowthTree";