"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import RivePlayer from "@rive-app/react-canvas";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import StarrySky from "@/components/scene/StarrySky"; // 引入星空组件

import { coreCardsData, achievementsData, assetConfigs, numbersData, articlesData, brandsRow1, brandsRow2 } from "@/lib/dashboard-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  
  // ==========================================
  // 新增：拉取全校学生活跃数据，供星空渲染
  // ==========================================
  const [studentStars, setStudentStars] = useState<any[]>([]);

  useEffect(() => {
    // 准备一些有趣的假动作库
    const actionPool = [
      "刚刚点亮了灵感 💡",
      "在童心市场闲逛 🛍️",
      "浇灌了情绪小树苗 🍃",
      "接取了班级悬赏 ⚔️",
      "完成了一次秘密交易 🤝",
      "正在太空中遨游 🚀"
    ];

    const mockStudents = Array.from({ length: 40 }).map((_, i) => {
      const isRecentlyActive = Math.random() > 0.6; // 40% 的活跃率
      return {
        id: `stu-${i}`,
        // 给点可爱的假名字
        name: ["李子涵", "王楚然", "张浩宇", "陈欣怡", "刘明博", "赵雪", "周杰"][Math.floor(Math.random() * 7)] + i,
        isRecentlyActive,
        // 如果活跃，随机分配一个动作
        action: isRecentlyActive ? actionPool[Math.floor(Math.random() * actionPool.length)] : ""
      };
    });
    setStudentStars(mockStudents);
  }, []);

  useGSAP(
    () => {
      // 1. 初始化 Lenis 平滑滚动
      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);

      const ticker = gsap.ticker;
      ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      ticker.lagSmoothing(0);

      // ====================================================
      // 2. 底层 Hero 视差与变暗动画
      // ====================================================
      gsap.to(".hero-text-container", {
        scale: 0.85,
        y: 50,
        ease: "none",
        scrollTrigger: {
          trigger: ".scrolling-content",
          start: "top bottom",
          end: "top top",
          scrub: true,
        }
      });

      // 增加深色遮罩变暗 (因为我们换成了星空，变暗幅度可以稍微调高一点，比如到 0.7，让上滑的内容更清晰)
      gsap.to(".hero-overlay", {
        opacity: 0.7, 
        ease: "none",
        scrollTrigger: {
          trigger: ".scrolling-content",
          start: "top bottom",
          end: "top top",
          scrub: true,
        }
      });

      // ====================================================
      // 3. SVG 路径滚动追踪动画
      // ====================================================
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".svg-path",
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        });
      }

      // 4. 巨型 Hero 文本交错入场
      gsap.from(".hero-text", {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power3.out',
        delay: 2.2
      });

      // 5. 大圆角卡片交错入场 
      gsap.utils.toArray<HTMLElement>(".dashboard-card").forEach((card) => {
        gsap.from(card, {
          y: 150,
          scale: 0.95,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 75%",
          },
        });

        // 5.5 SVG 激活态联动
        ScrollTrigger.create({
          trigger: card,
          start: "top center",
          end: "bottom center",
          onEnter: () => gsap.to(pathRef.current, { stroke: "#4199eb", strokeWidth: 500, duration: 0.4, ease: "power2.out" }),
          onLeave: () => gsap.to(pathRef.current, { stroke: "#8ED462", strokeWidth: 450, duration: 0.4, ease: "power2.out" }),
          onEnterBack: () => gsap.to(pathRef.current, { stroke: "#4199eb", strokeWidth: 500, duration: 0.4, ease: "power2.out" }),
          onLeaveBack: () => gsap.to(pathRef.current, { stroke: "#8ED462", strokeWidth: 450, duration: 0.4, ease: "power2.out" }),
        });
      });

      // 6. 资产视差微交互逻辑
      gsap.utils.toArray<HTMLElement>(".parallax-asset").forEach(asset => {
        const speed = parseFloat(asset.dataset.scrollSpeed || "0") * 100;
        gsap.to(asset, {
          y: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: ".scrolling-content",
            scrub: true,
            start: "top bottom",
            end: "bottom top"
          }
        });
      });

      // 7. 数据里程碑卡片入场动画
      gsap.utils.toArray<HTMLElement>(".number-card").forEach((card) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          }
        });
      });

      return () => {
        lenis.destroy();
        ticker.remove((time) => lenis.raf(time * 1000));
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative w-full bg-slate-950">

      {/* =========================================================
          底层 (z-0)：固定的 Hero 文本区 + 3D 星空
          随着下方内容上滑，此区域会停在原地，并触发缩小、变暗
      ========================================================= */}
      <section className="sticky top-0 left-0 w-full h-screen z-0 flex flex-col items-center justify-center overflow-hidden">
        
        {/* 🌌 [核心替换] 引入 3D 微光星空，替换掉原本死板的绿色背景 */}
        <div className="absolute inset-0 z-0">
           <StarrySky students={studentStars} />
        </div>

        {/* 用来控制变暗的黑色遮罩层 */}
        <div className="hero-overlay absolute inset-0 bg-slate-950 opacity-0 z-10 pointer-events-none"></div>

        {/* 文字容器 (为了配合深色星空，将文字颜色改为白色/发光质感) */}
        <div className="hero-text-container relative z-20 text-center mt-[-10vh] mix-blend-screen">
          <h1 className="hero-text text-[15vw] md:text-[11vw] font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] leading-[0.85] mb-6">
            流转星球<span className="text-emerald-400">.</span>
          </h1>
          <h2 className="hero-text text-2xl md:text-[3vw] text-slate-300 font-medium tracking-widest mt-4">
            — 全校 <span className="text-white font-bold">{studentStars.length}</span> 位伙伴的微光汇聚于此 —
          </h2>
        </div>
      </section>

      {/* =========================================================
          前景顶层 (z-10)：随着鼠标滚动滑上来的所有内容
          (保持原样不变！)
      ========================================================= */}
      <div className="scrolling-content relative z-10 w-full mt-[-35vh] pointer-events-none ">

        {/* --- 顶部插画：绿色波浪底座 + Rive人物 --- */}
        <div className="relative w-full flex justify-center items-end h-[60vh]">
          <div className="relative z-10 w-[130%] md:w-[65%] max-w-[1000px] aspect-[522/373] translate-y-[20%] drop-shadow-2xl">
            <RivePlayer src="/rive/hero_animation.riv" className="w-full h-full" />
          </div>
        </div>

        {/* --- 下方的米色内容延续区 --- */}
        <div className="relative w-full bg-background pt-[20vh] pointer-events-auto shadow-[0_-30px_50px_rgba(245,245,243,1)] rounded-t-[4rem]">
          {/* SVG 背景追踪线条 */}
          <div className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none svg-path">
            <svg
              className="w-full h-full will-change-[transform]"
              viewBox="0 0 1400 6000"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                ref={pathRef}
                d="M700 0 C700 400 200 600 200 1000 C200 1400 1200 1600 1200 2000 C1200 2400 200 2600 200 3000 C200 3400 1200 3600 1200 4000 C1200 4400 200 4600 200 5000 C200 5400 700 5600 700 6000"
                stroke="#8ED462"
                strokeWidth="24"
                strokeLinecap="round"
                className="opacity-80"
              />
            </svg>
          </div>

          {/* 核心卡片时间轴与视差资产 */}
          <section className="container-1 w-full relative z-10 cards-grid">
            <div className="flex flex-col gap-y-[25vh] py-[15vh] max-w-5xl mx-auto relative z-30">
              {coreCardsData.map((card, index) => (
                <div
                  key={index}
                  className={`dashboard-card bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:bg-white/20 hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.15)] transition-all duration-500 cursor-pointer w-full md:w-[70%] aspect-square md:aspect-[16/10] flex flex-col justify-between p-12 rounded-[2.5rem] relative overflow-hidden ${index % 2 === 0 ? 'self-start' : 'self-end'
                    }`}
                >
                  <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10">
                    <h2 className={`text-4xl md:text-5xl font-bold text-${card.textColor} mb-4 tracking-tight`}>
                      {card.title}
                    </h2>
                    <p className={`text-${card.textColor}/90 text-lg md:text-xl leading-relaxed max-w-md`}>
                      {card.description}
                    </p>
                  </div>
                  
                  <Link 
                    href={card.href || "#"} 
                    className={`relative z-10 self-end ${card.textColor === 'white' ? 'bg-white/20' : 'bg-slate-800/10'} px-6 py-4 rounded-full backdrop-blur-md hover:scale-105 hover:bg-white/40 transition-all duration-300`}
                  >
                    <span className={`text-${card.textColor} font-medium tracking-wide`}>{card.linkText}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* 视差资产渲染 */}
            {assetConfigs
              .filter((asset) => !asset.name.includes("timeline-end-green"))
              .map((asset, index) => (
                <div
                  key={index}
                  className={`parallax-asset ${asset.className || ''}`}
                  data-scroll-speed={asset.speed || 0}
                >
                  {asset.type === 'riv' ? (
                    asset.name === 'pop_up_girl' ? (
                      <RivePlayer src={`/rive/${asset.name}.riv`} className="pop-up-girl w-full h-full aspect-[1979/1570]" />
                    ) : (
                      <RivePlayer src={`/rive/${asset.name}.riv`} className="w-full h-full" />
                    )
                  ) : (
                    <img src={`/icons/${asset.name}.svg`} alt="" className="w-full h-full object-contain" />
                  )}
                </div>
              ))}

            {/* 时间轴结尾：完美重叠的三层视差绿地 */}
            <div className="relative w-full h-[30vh] md:h-[55vh] mt-[-10vh] pointer-events-none flex items-end overflow-hidden z-20">
              <div
                className="parallax-asset absolute bottom-0 left-0 w-full z-0 max-md:transform-none!"
                data-scroll-speed="-0.15"
              >
                <img src="/icons/timeline-end-green-back.svg" alt="Green Back" className="w-full h-auto object-cover object-bottom translate-y-[20%]" />
              </div>
              <div
                className="parallax-asset absolute bottom-0 left-0 w-full z-10 max-md:transform-none!"
                data-scroll-speed="-0.075"
              >
                <img src="/icons/timeline-end-green-middle.svg" alt="Green Middle" className="w-full h-auto object-cover object-bottom translate-y-[10%]" />
              </div>
              <div className="absolute bottom-0 left-0 w-full z-20">
                <img src="/icons/timeline-end-green-front.svg" alt="Green Front" className="w-full h-auto object-cover object-bottom translate-y-[2px]" />
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================
              数据里程碑 (Numbers Stack)
          ========================================================= */}
        <section className="mx-auto px-6 py-32 relative z-20 bg-background pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 relative h-full">
              <div className="sticky top-[30vh]">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  见证每一次成长的 <strong className="text-morandi-red">数字里程碑</strong>
                </h2>
                <p className="text-lg text-slate-600 max-w-md font-medium leading-relaxed">
                  这些不仅仅是数字，它们代表了孩子们倾诉的每一次烦恼、完成的每一次委托、以及在童心世界里传递的每一份温暖与价值。
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-8">
              {numbersData.map((item, idx) => (
                <div key={idx} className={`number-card bg-${item.color} p-10 md:p-14 rounded-[2.5rem] shadow-sm`}>
                  <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-8 backdrop-blur-md">
                    <svg width="32" height="32" viewBox="0 0 66 66" fill="white">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <p className={`text-6xl md:text-7xl font-bold mb-4 ${item.color === 'morandi-yellow' ? 'text-slate-800' : 'text-white'}`}>
                    {item.num}
                  </p>
                  <p className={`text-xl leading-relaxed ${item.color === 'morandi-yellow' ? 'text-slate-700' : 'text-white/90'}`}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 精选文章 */}
        <section className="mx-auto px-6 py-20 relative z-20" style={{ backgroundColor: "#f7f7dd" }}>
          {/* ... (保持不变) ... */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articlesData.map((article, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative w-full aspect-[16/10] rounded-[2rem] overflow-hidden mb-6">
                  <img
                    src={article.img}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    {article.tags.map(tag => (
                      <span key={tag} className="bg-white/90 backdrop-blur text-slate-800 text-xs font-medium px-4 py-2 rounded-full shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-morandi-green transition-colors leading-snug pr-4">
                  {article.title}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* 合作品牌 */}
        <section className="py-24 overflow-hidden relative z-20 bg-background">
          <div className="container mx-auto px-6 mb-16">
            <h2 className="text-3xl font-bold text-slate-900 text-center tracking-wide">
              共同守护童心世界的共创伙伴
            </h2>
          </div>

          <div className="flex w-[200%] animate-marquee mb-8 gap-8 items-center">
            {[...brandsRow1, ...brandsRow1].map((brand, idx) => (
              <div key={idx} className="flex-shrink-0 w-[200px] flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <img src={brand.src} alt={brand.name} className="max-h-12 w-auto object-contain" />
              </div>
            ))}
          </div>

          <div className="flex w-[200%] animate-marquee-reverse gap-8 items-center">
            {[...brandsRow2, ...brandsRow2].map((brand, idx) => (
              <div key={idx} className="flex-shrink-0 w-[200px] flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <img src={brand.src} alt={brand.name} className="max-h-12 w-auto object-contain" />
              </div>
            ))}
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
}