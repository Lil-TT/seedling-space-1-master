// app/page.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import RivePlayer from "@rive-app/react-canvas";

import { coreCardsData, achievementsData, assetConfigs } from "@/lib/dashboard-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

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
      // 2. 底层 Hero 视差与变暗动画 (匹配图2效果)
      // ====================================================
      // 缩放文字容器
      gsap.to(".hero-text-container", {
        scale: 0.85, // 缩小文字
        y: 50, // 稍微向下偏移，增加景深感
        ease: "none",
        scrollTrigger: {
          trigger: ".scrolling-content", // 触发器是滑上来的前景内容
          start: "top bottom", // 前景顶部进入屏幕底部时开始
          end: "top top",      // 前景顶部到达屏幕顶部时结束
          scrub: true,
        }
      });

      // 增加深色遮罩变暗
      gsap.to(".hero-overlay", {
        opacity: 0.4, // 背景变暗的程度
        ease: "none",
        scrollTrigger: {
          trigger: ".scrolling-content",
          start: "top bottom",
          end: "top top",
          scrub: true,
        }
      });

      // 3. SVG 路径滚动追踪动画
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
            trigger: ".scrolling-content",
            start: "top 10%", // 调整画线时机
            end: "bottom bottom",
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

      // 5. 大圆角卡片交错入场 (单独监听每个卡片，完美适配超长滚动)
      gsap.utils.toArray<HTMLElement>(".dashboard-card").forEach((card) => {
        gsap.from(card, {
          y: 150,
          scale: 0.95,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card, // 将每个卡片自己作为触发器
            start: "top 85%", // 当卡片顶部到达屏幕 85% 处时开始浮现
          },
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

      return () => {
        lenis.destroy();
        ticker.remove((time) => lenis.raf(time * 1000));
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative w-full bg-black">

      {/* =========================================================
          底层 (z-0)：固定的 Hero 文本区
          随着下方内容上滑，此区域会停在原地，并触发缩小、变暗
      ========================================================= */}
      <section className="sticky top-0 left-0 w-full h-screen z-0 flex flex-col items-center justify-center bg-background overflow-hidden" style={{ backgroundColor: "#8ED462" }}>

        {/* 用来控制变暗的黑色遮罩层 */}
        <div className="hero-overlay absolute inset-0 bg-black opacity-0 z-10 pointer-events-none"></div>

        {/* 文字容器 (包裹在 hero-text-container 中由 GSAP 缩放) */}
        <div className="hero-text-container relative z-0 text-center mt-[-10vh]">
          <h1 className="hero-text text-[15vw] md:text-[11vw] font-bold tracking-tighter text-slate-900 leading-[0.85] mb-6">
            Real human<br />insights
          </h1>
          <h2 className="hero-text text-2xl md:text-[3vw] text-slate-800 font-medium">
            One global partner
          </h2>
        </div>
      </section>

      {/* =========================================================
          前景顶层 (z-10)：随着鼠标滚动滑上来的所有内容
          包含 Rive人物、绿色底座、卡片、SVG线条等
      ========================================================= */}
      <div className="scrolling-content relative z-10 w-full mt-[-35vh] pb-32 overflow-hidden pointer-events-none ">

        {/* --- 顶部插画：绿色波浪底座 + Rive人物 --- */}
        {/* 这里使用负的 margin-top 使得初始状态下，人物的头部能在第一屏底部露出来 */}
        <div className="relative w-full flex justify-center items-end h-[60vh]">
          {/* Rive人物：由于他在 z-10 容器里，上滑时会完美覆盖在底层的文字上 */}
          <div className="relative z-10 w-[130%] md:w-[65%] max-w-[1000px] aspect-[522/373] translate-y-[20%]">
            <RivePlayer src="/rive/hero_animation.riv" className="w-full h-full" />
          </div>
        </div>

        {/* --- 下方的米色内容延续区 --- */}
        <div className="relative w-full bg-background pt-[20vh] pointer-events-auto shadow-[0_-30px_50px_rgba(245,245,243,1)] rounded-t-3xl">

          {/* SVG 背景追踪线条 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[100%] h-full z-[1] pointer-events-none svg-path">
            <svg
              className="w-full h-auto will-change-[transform]"
              viewBox="0 0 1378 2760"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMin meet"
            >
              <path
                ref={pathRef}
                d="M639.668 100C639.668 100 105.669 100 199.669 601.503C293.669 1103.01 1277.17 691.502 1277.17 1399.5C1277.17 2107.5 -155.332 1968 140.168 1438.5C435.669 909.002 1442.66 2093.5 713.168 2659.5"
                stroke="#8ED462"
                strokeWidth="450"
                strokeLinecap="round"
                className="opacity-90"
              />
            </svg>
          </div>

          {/* =========================================================
              核心卡片时间轴与视差资产
              完美还原：拉长容器、左右交错、留出呼吸空间
          ========================================================= */}
          <section className="container-1 w-full relative z-10 cards-grid">

            {/* 卡片布局：不再使用 Grid，改为垂直 Flex，并加持巨额间距 */}
            <div className="flex flex-col gap-y-[25vh] py-[15vh] max-w-5xl mx-auto relative z-30">
              {coreCardsData.map((card, index) => (
                <div
                  key={index}
                  // 奇数靠左，偶数靠右，卡片宽度限制在 70%，制造出错落有致的布局
                  className={`dashboard-card bg-${card.bgColor} p-12 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer w-full md:w-[70%] aspect-square md:aspect-[16/10] flex flex-col justify-between ${index % 2 === 0 ? 'self-start' : 'self-end'
                    }`}
                >
                  <div>
                    <h2 className={`text-4xl md:text-5xl font-bold text-${card.textColor} mb-4 tracking-tight`}>
                      {card.title}
                    </h2>
                    <p className={`text-${card.textColor}/90 text-lg md:text-xl leading-relaxed max-w-md`}>
                      {card.description}
                    </p>
                  </div>
                  <div className={`self-end ${card.textColor === 'white' ? 'bg-white/20' : 'bg-slate-800/10'} px-6 py-4 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors`}>
                    <span className={`text-${card.textColor} font-medium`}>{card.linkText}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 视差资产渲染：现在容器被卡片撑得非常高，百分比定位将完美展开！ */}
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

            {/* =========================================================
              时间轴结尾：完美重叠的三层视差绿地 (Timeline End)
              这部分专门负责将时间轴过渡到下方的 Callout
          ========================================================= */}
            <div className="relative w-full h-[30vh] md:h-[55vh] mt-[-10vh] pointer-events-none flex items-end overflow-hidden z-20">

              {/* 后景 (Back)：向反方向移动较快，营造最远的距离感 */}
              <div
                className="parallax-asset absolute bottom-0 left-0 w-full z-0 max-md:transform-none!"
                data-scroll-speed="-0.15"
              >
                <img src="/icons/timeline-end-green-back.svg" alt="Green Back" className="w-full h-auto object-cover object-bottom translate-y-[20%]" />
              </div>

              {/* 中景 (Middle)：移动速度中等 */}
              <div
                className="parallax-asset absolute bottom-0 left-0 w-full z-10 max-md:transform-none!"
                data-scroll-speed="-0.075"
              >
                <img src="/icons/timeline-end-green-middle.svg" alt="Green Middle" className="w-full h-auto object-cover object-bottom translate-y-[10%]" />
              </div>

              {/* 前景 (Front)：不给视差速度，作为视觉锚点与下方的绿色区块无缝衔接 */}
              <div className="absolute bottom-0 left-0 w-full z-20">
                <img src="/icons/timeline-end-green-front.svg" alt="Green Front" className="w-full h-auto object-cover object-bottom translate-y-[2px]" />
              </div>

            </div>
          </section>
        </div>

      </div>
    </div>
  );
}