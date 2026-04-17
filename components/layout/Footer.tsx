// components/layout/Footer.tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Let's Grow 波浪下划线视差动画
      gsap.from(".underline-wave", {
        xPercent: -10, // 文本波浪下划线轻微 x 轴视差
        ease: "none",
        scrollTrigger: {
          trigger: footerRef.current,
          scrub: true,
          start: "top 90%",
        },
      });
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} className="bg-[#EBE9E0] pt-24 pb-12 relative z-20 text-slate-800">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* =========================================================
            第一层：项目发起与导航链接
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 border-b border-slate-300/60">
          
          {/* 左侧：Call to action */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-md text-slate-900 mb-10">
              想加入这片充满魔法的童心天地吗？无论是想要发布成长悬赏的老师，还是期待用闲置交换心愿的勇士，我们随时张开双臂。让每一次情绪波动，都化作成长的养分。
            </p>
            <Link
              href="/api/auth/signin"
              className="group flex items-center justify-center h-14 pl-6 pr-1.5 rounded-full bg-[#E4D218] shadow-sm hover:bg-[#d4c316] transition-colors gap-3"
            >
              <span className="text-[15px] font-bold text-slate-900 tracking-wide">开启成长之旅</span>
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 group-hover:scale-105 transition-transform duration-300">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 10h10M11 5l5 5-5 5" />
                </svg>
              </span>
            </Link>
          </div>

          {/* 右侧：双列导航菜单 */}
          <div className="lg:col-span-5 lg:col-start-8 grid grid-cols-2 gap-8 text-lg font-bold text-slate-800">
            <ul className="flex flex-col gap-y-4">
              <li><Link href="/activities" className="hover:text-morandi-green transition-colors">委托活动大厅</Link></li>
              <li><Link href="/market" className="hover:text-morandi-green transition-colors">童心流转市场</Link></li>
              <li><Link href="/growth" className="hover:text-morandi-green transition-colors">3D 树洞与成长</Link></li>
              <li><Link href="/profile" className="hover:text-morandi-green transition-colors">个人数字工作台</Link></li>
            </ul>
            <ul className="flex flex-col gap-y-4">
              <li><Link href="#" className="hover:text-morandi-green transition-colors">家长共育指南</Link></li>
              <li><Link href="#" className="hover:text-morandi-green transition-colors">情绪币经济学</Link></li>
              <li><Link href="#" className="hover:text-morandi-green transition-colors">隐私与安全政策</Link></li>
              <li><button type="button" className="hover:text-morandi-green transition-colors text-left">关于独立开发者</button></li>
            </ul>
          </div>

        </div>

        {/* =========================================================
            第二层：巨型标题与联系地址
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-20 border-b border-slate-300/60">
          
          {/* 左侧：Let's Grow 巨型文本 */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-[12vw] md:text-[8vw] font-black leading-[0.9] tracking-tighter text-slate-900">
              Let’s <br />
              <span className="relative inline-block text-morandi-green">
                Grow
                {/* 动态波浪线 */}
                <span 
                  className="underline-wave absolute left-0 -bottom-2 w-[120%] h-4 md:h-6"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 10'%3E%3Cpath d='M0 5 Q 10 0, 20 5 T 40 5' fill='none' stroke='%238ED462' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat-x',
                    backgroundSize: 'auto 100%'
                  }}
                ></span>
              </span>
            </h2>
          </div>

          {/* 右侧：地址与邮箱 */}
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-10 text-[15px] text-slate-700 leading-relaxed font-medium">
            
            {/* 运营中心 */}
            <div>
              <p className="font-black text-slate-900 mb-1 text-lg">共进会运营中心</p>
              <p>探讨技术痛点与内容走向</p>
              <p>持续打磨更懂孩子的情绪生态</p>
              <p className="text-slate-500 mt-1 font-mono text-xs">ONLINE / COMMUNITY</p>
            </div>

            {/* 技术实验室 */}
            <div>
              <p className="font-black text-slate-900 mb-1 text-lg">数字架构实验室</p>
              <p>WebGL / Three.js / WebGPU</p>
              <p>极致丝滑与 3D 渲染探索</p>
              <p className="text-slate-500 mt-1 font-mono text-xs">VIRTUAL / CREATIVE</p>
            </div>

            {/* 邮箱 */}
            <div>
              <p className="font-bold text-slate-500 mb-1 text-xs uppercase tracking-widest">Connect with us</p>
              <a href="mailto:hello@emotionweb.dev" className="font-black text-xl text-slate-900 hover:text-morandi-green transition-colors border-b-2 border-slate-900 hover:border-morandi-green pb-1">
                hello@emotionweb.dev
              </a>
            </div>

          </div>
        </div>

        {/* =========================================================
            第三层：版权与合规标识
        ========================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-center py-10 text-sm text-slate-500 font-medium gap-6">
          <p>Copyright © 2026 Emotion Value Web. All rights reserved.</p>
          
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Status: Healthy
            </span>
            <a href="#" className="hover:text-morandi-green transition-colors underline underline-offset-4 font-bold text-slate-700">
              Made with ❤️ by Creator
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}