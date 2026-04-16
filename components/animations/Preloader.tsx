// components/animations/Preloader.tsx
"use client"; // 必须声明为客户端组件，因为 GSAP 需要操作 DOM

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // 1. 主路径 SVG 描边动画 (Stroke drawing)
      tl.fromTo(
        "[data-main-path]",
        { strokeDashoffset: 1590 },
        { strokeDashoffset: 0, duration: 1.8, ease: "power3.inOut" }
      )
        // 2. 阴影和渐变色的层次淡入
        .fromTo(
          "[data-shadow-path-1], [data-shadow-path-2], [data-path-circle]",
          { opacity: 0 },
          { opacity: 1, duration: 0.8, stagger: 0.15 },
          "-=0.8" // 提前插入，让动画更紧凑
        )
        // 3. 页面加载完毕后，整体淡出并移出 DOM
        .to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
              if (containerRef.current) {
                containerRef.current.style.display = "none";
              }
            },
          },
          "+=0.4" // 稍作停留后淡出
        );
    },
    { scope: containerRef } // 作用域限定，防止类名冲突，自动处理组件卸载时的内存清理
  );

  return (
    <div
      ref={containerRef}
      // 固定在屏幕最上层，背景使用咱们刚刚配置好的莫兰迪背景色
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
    >
      <div className="w-[150px] md:w-[220px]">
        {/* React 化的 SVG 代码 */}
        <svg
          className="w-full h-full"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 442 377"
          xmlSpace="preserve"
        >
          <g id="Layer_1">
            <path
              data-main-path=""
              style={{
                fill: "none",
                stroke: "rgb(142, 212, 98)",
                strokeWidth: 42.2489,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeDasharray: "1590.02px",
              }}
              d="M42.6,355.3 c-92.6-276.8,143.8-378.4,157-219.2c11.7,140.3-70.9,161.3-70.9,91.4s65.6-147.7,134.4-119.8c76.5,31.1,50.4,215.9-7,195.3 c-41.9-15-1.4-119,58.6-148c83-40.1,153.7,60.2,62.5,200.2"
            />
            <linearGradient
              id="SVGID_1_"
              gradientUnits="userSpaceOnUse"
              x1="182.0984"
              y1="140.9491"
              x2="174.7973"
              y2="225.863"
              gradientTransform="matrix(1 0 0 -1 0 378)"
            >
              <stop offset="0" style={{ stopColor: "#8ED462" }} />
              <stop offset="1" style={{ stopColor: "#368D32" }} />
            </linearGradient>
            <path
              data-shadow-path-1=""
              style={{ fill: 'url("#SVGID_1_")' }}
              d="M158.4,286.7c-9.4,0-17.9-6.3-20.4-15.8 c-3-11.3,3.8-22.8,15.1-25.8c2.5-0.7,10.5-6.1,17.2-23.3c5.1-13,10.4-35.2,9.1-70c0,0,6.8-7.6,17.2-14.7c9.6-6.6,23-12.2,23-12.2 c5.6,47.5,0.6,85.3-9.9,112.3C199.3,263.6,183,281,163.8,286C162,286.5,160.2,286.7,158.4,286.7z"
            />
            <linearGradient
              id="SVGID_2_"
              gradientUnits="userSpaceOnUse"
              x1="286.8518"
              y1="80.6815"
              x2="276.47"
              y2="215.998"
              gradientTransform="matrix(1 0 0 -1 0 378)"
            >
              <stop offset="0.141" style={{ stopColor: "#8ED462" }} />
              <stop offset="1" style={{ stopColor: "#368D32" }} />
            </linearGradient>
            <path
              data-shadow-path-2=""
              style={{ fill: 'url("#SVGID_2_")' }}
              d="M265,325.8c-5.3,0-10.6-0.9-16-2.9c-11-3.9-16.7-16-12.8-27c3.9-11,16-16.7,27-12.8c1.3,0.5,2.5,0.9,5.6-1.9 c12.3-11.3,21.3-44.3,20.6-77.8c0,0,5-7.5,18.4-17.9c12.8-9.9,20.9-13.5,20.9-13.5c9.6,53.2-3.6,115-31.3,140.4 C287.7,321.2,276.5,325.8,265,325.8z"
            />
            <path
              data-path-circle=""
              style={{ fill: "rgb(142, 212, 98)" }}
              d="M279,67.9c18.7,0,33.9-15.2,33.9-33.9S297.7,0,279,0C260.2,0,245,15.2,245,33.9S260.2,67.9,279,67.9 z"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}