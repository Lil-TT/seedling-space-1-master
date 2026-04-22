"use client";

import { useSession } from "next-auth/react";

export default function StudentGlobalBackground() {
  const { data: session } = useSession();

  // 1. 只有学生角色才渲染这个全局背景，老师和家长依然是干净的纯色背景
  if (session?.user?.role !== "STUDENT") return null;

  return (
    // 2. 核心修复：使用 fixed inset-0 和 -z-50，让它变成全局固定的底层壁纸
    <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none overflow-hidden bg-[#F5F5F3]">
      
      {/* 墙面背景纹理 */}
      <div 
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      ></div>
      
      {/* 宏大装饰贴片 1：改为百分比定位，适应各种屏幕高度 */}
      <img 
        src="/stickers/elephant.png" 
        alt="elephant decoration" 
        className="absolute -left-20 top-[15%] w-80 opacity-60 rotate-12 blur-[1px]"
      />
      
      {/* 宏大装饰贴片 2 */}
      <img 
        src="/stickers/star_deco.png" 
        alt="star decoration" 
        className="absolute -right-16 top-[50%] w-64 opacity-50 -rotate-6"
      />
      
      {/* 宏大装饰贴片 3 */}
      <img 
        src="/stickers/leaf_cluster.png" 
        alt="leaf decoration" 
        className="absolute -left-10 bottom-[10%] w-72 opacity-40 -rotate-12 blur-[1.5px]"
      />
    </div>
  );
}