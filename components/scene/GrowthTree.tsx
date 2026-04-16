// components/scene/GrowthTree.tsx
"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Icosahedron, Cylinder } from "@react-three/drei";
import gsap from "gsap";

// 1. 扩充向外暴露的指令接口
export interface GrowthTreeHandle {
  waterTree: () => void;
  pourTroubles: () => void;
  recordInspiration: () => void;
}

export const GrowthTree = forwardRef<GrowthTreeHandle>((props, ref) => {
  const treeRef = useRef<THREE.Group>(null);
  const foliageRef = useRef<THREE.Group>(null);

  useImperativeHandle(ref, () => ({
    waterTree: () => {
      if (!foliageRef.current) return;
      gsap.killTweensOf(foliageRef.current.scale);
      gsap.killTweensOf(foliageRef.current.rotation);

      // 开心灌溉：瞬间膨胀，Q弹回弹
      gsap.fromTo(
        foliageRef.current.scale,
        { x: 1, y: 1, z: 1 },
        {
          x: 1.35, y: 1.35, z: 1.35,
          duration: 0.8,
          ease: "elastic.out(1.2, 0.3)",
          yoyo: true,
          repeat: 1,
        }
      );
      gsap.to(foliageRef.current.rotation, {
        y: "+=0.6",
        duration: 1.2,
        ease: "power2.out"
      });
    },

    pourTroubles: () => {
      if (!foliageRef.current || !treeRef.current) return;
      gsap.killTweensOf(foliageRef.current.scale);
      gsap.killTweensOf(foliageRef.current.rotation);

      // 倾诉烦恼：沉重、下垂、叹气感
      gsap.fromTo(
        foliageRef.current.scale,
        { x: 1, y: 1, z: 1 },
        {
          x: 1.05, 
          y: 0.8, // Y轴被压扁，表现出低落
          z: 1.05,
          duration: 1.5,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 1,
        }
      );
      // 树冠缓慢左右低迷摇晃
      gsap.fromTo(
        foliageRef.current.rotation,
        { z: 0 },
        {
          z: 0.15,
          duration: 0.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 3, // 来回摇晃几次
        }
      );
    },

    recordInspiration: () => {
      if (!foliageRef.current || !treeRef.current) return;
      gsap.killTweensOf(foliageRef.current.scale);
      gsap.killTweensOf(treeRef.current.rotation);

      // 记录灵感：迸发拉伸
      gsap.fromTo(
        foliageRef.current.scale,
        { x: 1, y: 1, z: 1 },
        {
          x: 0.8, 
          y: 1.4, // Y轴瞬间拉长，表现出灵感迸发
          z: 0.8,
          duration: 0.6,
          ease: "back.out(1.5)",
          yoyo: true,
          repeat: 1,
        }
      );
      // 树干整体快速完成一次华丽的 360° 自转 (2π 弧度)
      gsap.to(treeRef.current.rotation, {
        y: "+=" + Math.PI * 2,
        duration: 1.2,
        ease: "back.out(1.2)" // 带有轻微回弹的旋转结束
      });
    }
  }));

  // 基础生命力动效：呼吸与自转保持不变
  useFrame((state, delta) => {
    if (treeRef.current) {
      treeRef.current.rotation.y += delta * 0.1;
      treeRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05 - 1.2;
    }
    if (foliageRef.current) {
      foliageRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group ref={treeRef} dispose={null} position={[0, -1.2, 0]}>
      <Cylinder args={[0.15, 0.35, 2.5, 7]} position={[0, 1.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B7E74" roughness={0.9} flatShading />
      </Cylinder>
      <group ref={foliageRef} position={[0, 2.8, 0]}>
        <Icosahedron args={[1.4, 0]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#A5BAAA" roughness={0.8} flatShading />
        </Icosahedron>
        <Icosahedron args={[0.8, 0]} position={[0.9, -0.2, 0.6]} castShadow receiveShadow>
          <meshStandardMaterial color="#9BB7D4" roughness={0.8} flatShading />
        </Icosahedron>
        <Icosahedron args={[0.7, 0]} position={[-0.8, 0.3, -0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#E1CFB2" roughness={0.8} flatShading />
        </Icosahedron>
        <Icosahedron args={[0.5, 0]} position={[0.2, 1.1, 0.2]} castShadow receiveShadow>
          <meshStandardMaterial color="#D5A7A1" roughness={0.8} flatShading />
        </Icosahedron>
      </group>
    </group>
  );
});

GrowthTree.displayName = "GrowthTree";