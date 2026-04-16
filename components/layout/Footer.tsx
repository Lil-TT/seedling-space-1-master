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
      // Let's Connect 波浪下划线视差动画
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
              Have a project in mind? We'd love to hear what you're working on and show you how we can help. Whether you're exploring a new market or launching your next product, we're ready when you are.
            </p>
            <Link
              href="/contact-us"
              className="group flex items-center justify-center h-14 pl-6 pr-1.5 rounded-full bg-[#E4D218] shadow-sm hover:bg-[#d4c316] transition-colors gap-3"
            >
              <span className="text-[15px] font-medium text-slate-900">Get a quote</span>
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 group-hover:scale-105 transition-transform duration-300">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 10h10M11 5l5 5-5 5" />
                </svg>
              </span>
            </Link>
          </div>

          {/* 右侧：双列导航菜单 */}
          <div className="lg:col-span-5 lg:col-start-8 grid grid-cols-2 gap-8 text-lg font-medium text-slate-900">
            <ul className="flex flex-col gap-y-4">
              <li><Link href="/services" className="hover:text-morandi-green transition-colors">Services</Link></li>
              <li><Link href="/methodology" className="hover:text-morandi-green transition-colors">Methodology</Link></li>
              <li><Link href="/sectors" className="hover:text-morandi-green transition-colors">Industry Sectors</Link></li>
              <li><Link href="/network" className="hover:text-morandi-green transition-colors">Network</Link></li>
              <li><Link href="/about-us" className="hover:text-morandi-green transition-colors">About Us</Link></li>
            </ul>
            <ul className="flex flex-col gap-y-4">
              <li><Link href="/articles" className="hover:text-morandi-green transition-colors">Insights</Link></li>
              <li><Link href="/contact-us" className="hover:text-morandi-green transition-colors">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-morandi-green transition-colors">Privacy Policy</Link></li>
              <li><button type="button" className="hover:text-morandi-green transition-colors text-left">Cookie Preferences</button></li>
            </ul>
          </div>

        </div>

        {/* =========================================================
            第二层：巨型标题与联系地址
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-20 border-b border-slate-300/60">
          
          {/* 左侧：Let's Connect 巨型文本 */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-[12vw] md:text-[8vw] font-bold leading-[0.9] tracking-tighter text-slate-900">
              Let’s <br />
              <span className="relative inline-block">
                Connect
                {/* 利用绝对定位的重复背景实现波浪线，配合 GSAP 产生移动效果 */}
                <span 
                  className="underline-wave absolute left-0 -bottom-4 w-[120%] h-4 md:h-6"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 10'%3E%3Cpath d='M0 5 Q 10 0, 20 5 T 40 5' fill='none' stroke='%238ED462' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat-x',
                    backgroundSize: 'auto 100%'
                  }}
                ></span>
              </span>
            </h2>
          </div>

          {/* 右侧：地址与邮箱 */}
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-10 text-[15px] text-slate-700 leading-relaxed">
            
            {/* 迪拜办公室 */}
            <div>
              <p className="font-bold text-slate-900 mb-1">Dubai</p>
              <p>Dubai Silicon Oasis, DDP,</p>
              <p>Building A2, 341041 Dubai, UAE</p>
              <p className="text-slate-500 mt-1">Mon-Fri 10:00 am - 7:00 pm (GST)</p>
            </div>

            {/* 伦敦办公室 */}
            <div>
              <p className="font-bold text-slate-900 mb-1">London</p>
              <p>3rd Floor, 86-90 Paul Street,</p>
              <p>London EC2A 4NE, UK</p>
              <p className="text-slate-500 mt-1">Mon-Fri 9:00 am - 6:00 pm (GMT)</p>
            </div>

            {/* 邮箱 */}
            <div>
              <a href="mailto:curious@mindmarket.com" className="font-bold text-lg text-slate-900 hover:text-morandi-green transition-colors">
                curious@mindmarket.com
              </a>
            </div>

          </div>
        </div>

        {/* =========================================================
            第三层：版权与合规标识
        ========================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-center py-10 text-sm text-slate-600 gap-6">
          <p>Copyright © 2026 MindMarket International</p>
          
          <div className="flex items-center gap-8">
            <a href="https://www.esomar.org/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              {/* 这里使用原版 HTML 中的 ESOMAR base64/URL 图片，你也可以替换为对应的图标路径 */}
              <img 
                src="https://www.datocms-assets.com/166003/1758542873-logo-google.png" // 替换为真实的 ESOMAR logo 路径 
                alt="ESOMAR" 
                className="h-6 grayscale" 
              />
            </a>
            <a href="https://www.linkedin.com/company/the-mindmarket" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-morandi-green transition-colors underline underline-offset-4">
              LinkedIn
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}