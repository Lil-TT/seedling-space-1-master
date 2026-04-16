// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);

  // GSAP 进场动画：整体导航平滑落下
  useGSAP(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 2.2 }
    );
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-[100] pt-6 pointer-events-none">
      <div className="container mx-auto px-24 lg:px-24 flex items-center justify-around pointer-events-auto" ref={navRef}>
        
        {/* ================= 左侧长胶囊：Logo + 导航菜单 ================= */}
        <div className="flex items-center bg-white rounded shadow-sm border border-slate-100 h-14 pl-5 pr-2 gap-8 lg:gap-12">
          
          {/* 1. Logo 区域 */}
          <Link href="/" className="flex items-center text-morandi-green hover:opacity-80 transition-opacity gap-2 shrink-0">
            <span className="sr-only">Home</span>
            {/* Logo Icon */}
            <span className="flex items-center">
              <svg width="30" height="25" viewBox="0 0 36 30" aria-hidden="true" focusable="false">
                 <g fill="none">
                   <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M3.837 28.21C-3.478 6.354 15.187-1.665 16.235 10.905c.923 11.079-5.601 12.732-5.601 7.213s5.178-11.663 10.613-9.455c6.044 2.455 3.98 17.044-.55 15.424-3.305-1.182-.106-9.393 4.63-11.685 6.551-3.17 12.139 4.752 4.934 15.81"></path>
                   <path fill="#8ED462" d="M22.502 5.518a2.68 2.68 0 1 0 0-5.359 2.68 2.68 0 0 0 0 5.359"></path>
                   <path stroke="url(#logo-grad-a)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M12.988 21.127c1.764-.463 3.79-3.718 3.247-10.223a11 11 0 0 0-.218-1.46" opacity=".5"></path>
                   <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M13.815 20.71c-1.525 1.148-3.18.188-3.18-2.593 0-5.68 5.177-11.663 10.612-9.455 6.044 2.455 3.98 17.044-.55 15.424-3.304-1.182-.106-9.393 4.63-11.685 6.552-3.17 12.14 4.752 4.934 15.81"></path>
                   <path stroke="url(#logo-grad-b)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M24.574 13.08c1.336 5.053-.641 12.164-3.877 11.006" opacity=".5"></path>
                   <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M25.328 12.4c6.551-3.168 12.138 4.753 4.933 15.81"></path>
                   <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M20.697 24.086c-3.305-1.182-.106-9.394 4.63-11.685 6.551-3.17 12.139 4.752 4.934 15.809"></path>
                   <defs>
                     <linearGradient id="logo-grad-a" x1="16.35" x2="15.661" y1="18.015" y2="10.005" gradientUnits="userSpaceOnUse"><stop stopColor="#8ED462"></stop><stop offset="1" stopColor="#368D32"></stop></linearGradient>
                     <linearGradient id="logo-grad-b" x1="25.354" x2="24.614" y1="23.015" y2="13.372" gradientUnits="userSpaceOnUse"><stop stopColor="#8ED462"></stop><stop offset="1" stopColor="#368D32"></stop></linearGradient>
                   </defs>
                 </g>
              </svg>
            </span>
            {/* Logo Text */}
            <span className="flex items-center text-slate-900">
               <svg width="100" height="15" viewBox="0 0 127.1 18.8" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M126.6 16.3c-.1 0-.2 0-.4.1h-.5c-.3 0-.5 0-.8-.1-.2-.1-.4-.3-.6-.5-.2-.3-.2-.6-.2-1.1V7.3h2.7V5.2h-2.7V2h-2.6v3.2h-2v2.1h2v7.9c0 .8.2 1.5.5 2 .4.5.8.9 1.4 1.2s1.2.4 1.9.4c.4 0 .8 0 1-.1.3-.1.5-.1.6-.2zm-7.5-4.6c0-1.2-.2-2.2-.5-3.1s-.8-1.5-1.3-2.1c-.6-.5-1.2-.9-1.9-1.2-.7-.2-1.4-.4-2.2-.4q-1.8 0-3.3.9c-.9.6-1.6 1.4-2.2 2.4-.5 1-.8 2.3-.8 3.6 0 1.4.3 2.6.8 3.6s1.2 1.8 2.2 2.4 2.1.8 3.4.8c1 0 1.8-.1 2.6-.4s1.4-.7 1.9-1.3c.5-.5.9-1.2 1.1-1.9l-2.5-.4c-.2.4-.4.8-.7 1.1s-.6.5-1.1.6c-.4.1-.9.2-1.4.2-.8 0-1.4-.2-2-.5s-1-.8-1.3-1.4-.4-1.3-.5-2.1h9.5v-.8zm-9.5-1c0-.6.2-1.1.4-1.6.3-.6.7-1 1.3-1.4.5-.4 1.2-.5 1.9-.5s1.3.2 1.8.5.9.7 1.2 1.3c.3.5.4 1.1.4 1.8h-7zm-2.7 7.4c-1.2-2.3-2.1-4.1-2.9-5.7l-.2-.5c-.2-.5-.4-.9-.6-1.3 1-1.4 1.8-3.4 2.5-5.8l.1-.2h-2.9v.1c-.4 1.3-.8 2.4-1.3 3.3-1.3-1.3-3-1.4-4.1-1.1-.4.1-.6.1-.9.2V.7H94v17.9h2.6v-5.3c.4.2.8.3 1.1.3.6.1 1.8.1 3.2-.8l.5.9c.6 1.2 1.4 2.7 2.4 4.7l.1.1h3.1zm-7.2-7.8c-.5.4-1.1.6-1.6.6-.5-.1-.8-.4-.8-.6 0-.5.4-.6.7-.7h.4c.3-.1.8 0 1.3.7m-14.6 8.3V5.2h2.5v2.1h.1c.3-.7.7-1.3 1.3-1.7.7-.4 1.4-.6 2.2-.6h1.1v2.5c-.1 0-.3-.1-.6-.1s-.5-.1-.8-.1c-.6 0-1.2.1-1.6.4-.5.3-.9.6-1.1 1.1-.3.5-.4 1-.4 1.6v8.2zM52.3.7h3.3l5.7 13.9h.2L67.2.7h3.3v17.8h-2.6V5.6h-.2l-5.3 12.9h-2.1L55 5.6h-.2v12.9h-2.6V.7zm-9.1 18.1c-1.1 0-2-.3-2.9-.8-.8-.6-1.5-1.4-2-2.4s-.7-2.3-.7-3.7.2-2.7.7-3.7 1.2-1.8 2-2.4c.9-.5 1.8-.8 2.9-.8.8 0 1.5.1 2 .4s.9.6 1.2 1 .5.7.7 1h.2V.7h2.6v17.8h-2.5v-2.1H47c-.2.3-.4.6-.7 1s-.7.7-1.2 1c-.4.3-1.1.4-1.9.4m.6-2.2c.7 0 1.4-.2 1.9-.6s.9-1 1.2-1.7.4-1.5.4-2.5c0-.9-.1-1.7-.4-2.4s-.7-1.2-1.2-1.6-1.2-.6-1.9-.6c-.8 0-1.4.2-2 .6-.5.4-.9 1-1.2 1.7s-.4 1.5-.4 2.4.1 1.7.4 2.4.7 1.3 1.2 1.7 1.2.6 2 .6m-16.2-6v7.9H25V5.2h2.5v2.2h.2c.3-.7.8-1.3 1.4-1.7.7-.5 1.5-.7 2.5-.7q1.35 0 2.4.6c.7.4 1.2.9 1.6 1.7.4.7.5 1.6.5 2.7v8.5h-2.6v-8.2c0-1-.3-1.7-.8-2.3s-1.2-.8-2.1-.8c-.6 0-1.1.1-1.6.4s-.8.6-1.1 1.2q-.3.75-.3 1.8m-7.3 8V5.2h2.6v13.4zm1.4-15.5c-.5 0-.8-.2-1.2-.5-.3-.3-.5-.6-.5-1s.2-.8.5-1.1.7-.5 1.2-.5.8.2 1.2.5c.3.3.5.7.5 1.1s-.2.8-.5 1.1c-.4.3-.8.4-1.2.4M0 .7h3.3L9 14.6h.2L14.9.7h3.3v17.8h-2.6V5.6h-.2l-5.3 12.9H8L2.7 5.6h-.1v12.9H0zm77.8 4.1c-2.7 0-4.9 1.6-5.4 3.9v.2H75v-.1c.4-1.2 1.3-1.8 2.8-1.8 1.8 0 3 1 3 2.7v1.4c-.7-.5-2.1-.9-3.4-.9-3.2 0-5.5 1.8-5.5 4.3s2.3 4.4 5.4 4.4c1.5 0 2.8-.5 3.6-1.1v.8h2.6v-9c-.2-3-2.3-4.8-5.7-4.8m2.9 9v1.3c-.4.9-1.7 1.5-3.1 1.5-1.5 0-3.2-.7-3.2-2.2s1.6-2.2 3.2-2.2c1.4.1 2.7.7 3.1 1.6"></path>
               </svg>
            </span>
          </Link>

          {/* 2. 导航链接区域 */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            
            {/* 单个链接 */}
            <Link href="/services" className="text-[15px] font-medium text-slate-800 hover:text-morandi-green transition-colors">
              Services
            </Link>

            {/* 带下拉菜单: Methodology */}
            <div className="group h-full flex items-center cursor-pointer relative">
              <span className="text-[15px] font-medium text-slate-800 group-hover:text-morandi-green transition-colors flex items-center gap-1.5">
                Methodology
                <svg width="10" height="6" viewBox="0 0 10 6" className="transition-transform duration-300 group-hover:rotate-180 group-hover:stroke-morandi-green stroke-slate-800">
                  <path fill="none" strokeWidth="1.5" d="m1 1 4 4 4-4"></path>
                </svg>
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[800px] bg-white rounded-3xl shadow-xl border border-slate-100 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out p-6 flex gap-8">
                 <Link href="/methodology" className="relative block w-[260px] shrink-0 rounded-2xl overflow-hidden group/cta">
                    <img 
                      srcSet="https://www.datocms-assets.com/166003/1763390946-methodology3.webp?dpr=0.25&fit=crop&h=650&w=500 125w,https://www.datocms-assets.com/166003/1763390946-methodology3.webp?dpr=0.5&fit=crop&h=650&w=500 250w" 
                      sizes="20vw" 
                      alt="Methodology"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/cta:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                       <span className="text-white font-medium flex items-center gap-2">Methodology <span>→</span></span>
                    </div>
                 </Link>
                 <ul className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 py-2">
                   {[
                     { label: "Online Bulletin Boards", href: "/methodology/online-bulletin-board" },
                     { label: "Focus Groups, Dyads & Triads", href: "/methodology/focus-groups" },
                     { label: "Taste Testing", href: "/methodology/taste-testing-market-research" },
                     { label: "Central Location Testing", href: "/methodology/central-location-testing" },
                     { label: "Customer Intercept", href: "/methodology/customer-intercept-research" },
                     { label: "Online Diary", href: "/methodology/online-diary-research" },
                     { label: "Mystery Shopping", href: "/methodology/mystery-shopping" },
                     { label: "Shop-Along", href: "/methodology/shop-along-market-research" },
                     { label: "UX Research", href: "/methodology/ux-research" },
                     { label: "In-depth Interviews", href: "/methodology/in-depth-interviews" },
                     { label: "Ethnographic Research", href: "/methodology/ethnographic-research" },
                   ].map((item, idx) => (
                     <li key={idx}><Link href={item.href} className="text-sm text-slate-600 hover:text-morandi-green transition-colors">{item.label}</Link></li>
                   ))}
                 </ul>
              </div>
            </div>

            {/* 带下拉菜单: Industry Sectors */}
            <div className="group h-full flex items-center cursor-pointer relative">
              <span className="text-[15px] font-medium text-slate-800 group-hover:text-morandi-green transition-colors flex items-center gap-1.5">
                Industry Sectors
                <svg width="10" height="6" viewBox="0 0 10 6" className="transition-transform duration-300 group-hover:rotate-180 group-hover:stroke-morandi-green stroke-slate-800">
                  <path fill="none" strokeWidth="1.5" d="m1 1 4 4 4-4"></path>
                </svg>
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[800px] bg-white rounded-3xl shadow-xl border border-slate-100 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out p-6 flex gap-8">
                 <Link href="/sectors" className="relative block w-[260px] shrink-0 rounded-2xl overflow-hidden group/cta">
                    <img 
                      srcSet="https://www.datocms-assets.com/166003/1762640405-cb583115c9ccba35b1f0202185198c5911e960fa.png?crop=focalpoint&dpr=0.25&fit=crop&fp-x=0.61&fp-y=0.45&h=650&w=500 125w,https://www.datocms-assets.com/166003/1762640405-cb583115c9ccba35b1f0202185198c5911e960fa.png?crop=focalpoint&dpr=0.5&fit=crop&fp-x=0.61&fp-y=0.45&h=650&w=500 250w" 
                      sizes="20vw" 
                      alt="Industry Sectors"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/cta:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                       <span className="text-white font-medium flex items-center gap-2">Industry Sectors <span>→</span></span>
                    </div>
                 </Link>
                 <ul className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 py-2">
                   {[
                     { label: "Automotive", href: "/sectors/automotive-market-research" },
                     { label: "Technology", href: "/sectors/technology-market-research" },
                     { label: "Sports", href: "/sectors/sports-market-research" },
                     { label: "Gaming", href: "/sectors/gaming-market-research" },
                     { label: "FMCG", href: "/sectors/fmcg-market-research" },
                     { label: "Food & Beverage", href: "/sectors/food-beverage-market-research" },
                     { label: "Financial Services", href: "/sectors/financial-market-research" },
                     { label: "Beauty & Cosmetics", href: "/sectors/beauty-cosmetics" },
                     { label: "Crypto", href: "/sectors/crypto-market-research" },
                     { label: "Hospitality", href: "/sectors/hospitality-market-research" },
                     { label: "Consulting", href: "/sectors/consulting-firms" },
                     { label: "Pharmaceutical", href: "/sectors/pharmaceutical-medical-device-market-research" },
                   ].map((item, idx) => (
                     <li key={idx}><Link href={item.href} className="text-sm text-slate-600 hover:text-morandi-green transition-colors">{item.label}</Link></li>
                   ))}
                 </ul>
              </div>
            </div>

            <Link href="/network" className="text-[15px] font-medium text-slate-800 hover:text-morandi-green transition-colors">
              Network
            </Link>
          </nav>

          {/* 3. 汉堡菜单 (位于长胶囊最右侧) */}
          <div className="group h-full flex items-center cursor-pointer relative">
             <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200/70 transition-colors text-slate-800">
               <svg width="16" height="16" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                 <path d="M3 7h16M3 14h16"></path>
               </svg>
             </button>
             {/* 图片横排面板，由于汉堡菜单在最右侧，弹窗锚点使用 right-0 */}
             <div className="absolute top-full right-0 mt-4 w-[800px] bg-white rounded-3xl shadow-xl border border-slate-100 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out p-6 flex gap-4">
                {[
                  { title: "About Us", href: "/about-us", img: "https://www.datocms-assets.com/166003/1763456118-about-us-3.webp?dpr=0.5&fit=crop&h=650&w=500" },
                  { title: "Insights", href: "/articles", img: "https://www.datocms-assets.com/166003/1763458058-insight.webp?dpr=0.5&fit=crop&h=650&w=500" },
                  { title: "Contact", href: "/contact-us", img: "https://www.datocms-assets.com/166003/1763457633-contact4.webp?dpr=0.5&fit=crop&h=650&w=500" }
                ].map((card, idx) => (
                  <Link key={idx} href={card.href} className="relative block flex-1 h-[280px] rounded-2xl overflow-hidden group/cta">
                    <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/cta:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                       <span className="text-white font-medium flex items-center gap-2">{card.title} <span>→</span></span>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </div>

        {/* ================= 右侧短胶囊：独立的 CTA 按钮 ================= */}
        <div className="shrink-0 ml-4">
          <Link 
            href="/contact-us" 
            className="group flex items-center justify-center h-14 pl-6 pr-1.5 rounded bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors gap-3"
          >
            <span className="text-[15px] font-medium text-slate-800">Get a quote</span>
            {/* 圆形按钮包裹箭头 */}
            <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-morandi-green group-hover:text-white transition-colors duration-300">
               <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M5 10h10M11 5l5 5-5 5" />
               </svg>
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}