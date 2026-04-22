"use client";

import React from "react";

// 预设的假数据（模拟全校的高频活跃态）
const mockBroadcasts = [
  "🎉 3分钟前，二年级小明同学成功交换了《奥特曼卡片》！",
  "🌟 刚刚，琪琪老师发布了新悬赏【整理班级图书角】！",
  "🏆 10分钟前，李华完成了【一周情绪记录】，获得了 50 情绪币！",
  "✨ 欢迎三年二班的同学们加入流转星球！",
  "🚀 5分钟前，子涵在童心市场投递了一个神秘盲盒！",
  "🍃 1分钟前，有一颗情绪小树苗被成功浇水啦！"
];

export default function GlobalMarquee() {
  return (
    // z-[200] 确保它在整个屏幕的最上层，比 Navbar 的 z-[100] 还要高
    <div className="fixed top-0 left-0 w-full h-8 bg-amber-300 border-b-2 border-amber-500 z-[200] flex items-center overflow-hidden shadow-sm">
      
      {/* 滚动容器：通过 CSS 动画实现无缝轮播 */}
      <div className="flex whitespace-nowrap animate-marquee">
        {/* 我们渲染两遍数组，这样在滚动时第一遍结束能无缝衔接第二遍 */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center">
            {mockBroadcasts.map((text, j) => (
              <span 
                key={j} 
                className="text-amber-900 font-bold text-xs md:text-sm mx-6 flex items-center tracking-wide"
              >
                {text}
                {/* 消息之间的星星分隔符 */}
                <span className="text-amber-600/50 ml-12 text-[10px]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* 内联 CSS 实现无缝滚动的关键帧，无需去 globals.css 里配置 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        /* 鼠标悬停时暂停滚动，方便用户看清字 */
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}