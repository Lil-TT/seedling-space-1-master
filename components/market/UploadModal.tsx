"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image"; // 我们引入 Image 组件来优化渲染

// 预设的卡通图标库 (文件名对应 public/assets/market-icons/ 下的图片)
const AVAILABLE_ICONS = [
  { id: "mystery-box", label: "神秘盲盒" },
  { id: "toy-robot", label: "机甲玩具" },
  { id: "magic-book", label: "奇幻书籍" },
  { id: "gamepad", label: "电子设备" },
  { id: "soccer-ball", label: "运动器材" },
  { id: "painting-brush", label: "文具画材" }
];

export default function UploadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  // formData 新增 selectedIcon 字段
  const [formData, setFormData] = useState({ title: "", desc: "", type: "IDLE", selectedIcon: "mystery-box" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -150 : 150;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useState(() => setMounted(true));

  const handleSubmit = async () => {
    if (!formData.title || !formData.desc) return alert("请填写完整哦！");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/market/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData) // 这里会将 selectedIcon 一起发给后端
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({ title: "", desc: "", type: "IDLE", selectedIcon: "mystery-box" });
        onClose();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("提交失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">

      <div className="relative w-full max-w-lg bg-[#F2F4F8] rounded-[3rem] p-8 md:p-10 border-t-[6px] border-l-[6px] border-white/60 shadow-[20px_20px_40px_rgba(170,182,204,0.5),-20px_-20px_40px_rgba(255,255,255,0.8)] overflow-hidden">

        {/* 背景装饰：一个隐约的发光圆 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10">
          <span className="text-4xl drop-shadow-md">📮</span> 投递你的期待
        </h2>

        {/* 3D 实体切换按钮 */}
        <div className="flex gap-4 mb-8 relative z-10">
          <button
            onClick={() => setFormData({ ...formData, type: "IDLE" })}
            className={`flex-1 py-4 text-lg font-black rounded-3xl transition-all duration-200 ${formData.type === "IDLE"
                ? "bg-emerald-500 text-white shadow-[inset_0px_6px_12px_rgba(0,0,0,0.2)] translate-y-1"
                : "bg-white text-slate-500 shadow-[6px_6px_15px_rgba(170,182,204,0.4),-6px_-6px_15px_rgba(255,255,255,1)] hover:-translate-y-1"
              }`}
          >
            🎁 分享闲置
          </button>
          <button
            onClick={() => setFormData({ ...formData, type: "WISH" })}
            className={`flex-1 py-4 text-lg font-black rounded-3xl transition-all duration-200 ${formData.type === "WISH"
                ? "bg-amber-400 text-amber-950 shadow-[inset_0px_6px_12px_rgba(0,0,0,0.2)] translate-y-1"
                : "bg-white text-slate-500 shadow-[6px_6px_15px_rgba(170,182,204,0.4),-6px_-6px_15px_rgba(255,255,255,1)] hover:-translate-y-1"
              }`}
          >
            🌠 许下心愿
          </button>
        </div>


          {/* =========================================================
            🚀 新增：马里奥赛车式 卡通图标选择器
            ========================================================= */}
          <div className="mb-8 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">选择一个代表它的徽章</h3>

            <div className="flex items-center gap-2">
              {/* 🎮 左侧街机按钮 */}
              <button
                onClick={(e) => { e.preventDefault(); scroll('left'); }}
                className="w-12 h-12 flex-shrink-0 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center text-slate-400 font-black text-xl hover:border-emerald-400 hover:text-emerald-500 active:bg-emerald-50 active:scale-95 transition-all shadow-[0_4px_0_rgba(226,232,240,1)] hover:shadow-[0_4px_0_rgba(52,211,153,1)] active:shadow-[0_0px_0_rgba(52,211,153,1)] active:translate-y-1 z-20"
              >
                &lt;
              </button>

              {/* 🌫️ 边缘渐隐遮罩层 (Mask) */}
              <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">

                {/* 滚动的容器 */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto pb-4 pt-2 px-4 snap-x hide-scrollbar scroll-smooth"
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={(e) => { e.preventDefault(); setFormData({ ...formData, selectedIcon: icon.id }); }}
                      className={`flex-shrink-0 snap-center relative w-24 h-24 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center gap-1
                      ${formData.selectedIcon === icon.id
                          ? 'border-emerald-500 bg-emerald-50 shadow-[0_8px_0_rgba(16,185,129,1)] -translate-y-2'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-1 shadow-sm'
                        }
                    `}
                    >
                      <Image
                        src={`/market-icons/${icon.id}.png`} // 读取数据库里存的路径 (比如 /market-icons/mystery-box.png)
                        alt={icon.label}
                        width={80}
                        height={80}
                        className="object-contain drop-shadow-md hover:scale-110 transition-transform"
                      />
                      <span className={`text-[10px] font-black ${formData.selectedIcon === icon.id ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {icon.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 🎮 右侧街机按钮 */}
              <button
                onClick={(e) => { e.preventDefault(); scroll('right'); }}
                className="w-12 h-12 flex-shrink-0 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center text-slate-400 font-black text-xl hover:border-emerald-400 hover:text-emerald-500 active:bg-emerald-50 active:scale-95 transition-all shadow-[0_4px_0_rgba(226,232,240,1)] hover:shadow-[0_4px_0_rgba(52,211,153,1)] active:shadow-[0_0px_0_rgba(52,211,153,1)] active:translate-y-1 z-20"
              >
                &gt;
              </button>
            </div>
          </div>

        {/* 凹陷感输入框 */}
        <div className="space-y-5 relative z-10">
          <input
            type="text"
            placeholder={formData.type === "IDLE" ? "你要分享什么神奇物品？" : "你渴望得到什么？"}
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-[#E8EDF2] text-slate-800 text-lg font-bold px-6 py-5 rounded-[2rem] border-none outline-none focus:ring-4 focus:ring-emerald-300/50 shadow-[inset_6px_6px_12px_rgba(170,182,204,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] placeholder:text-slate-400 placeholder:font-normal"
          />
          <textarea
            placeholder="描述一下它的故事，或者你为什么需要它..."
            value={formData.desc}
            onChange={e => setFormData({ ...formData, desc: e.target.value })}
            className="w-full bg-[#E8EDF2] text-slate-700 text-base font-medium px-6 py-5 rounded-[2rem] border-none outline-none focus:ring-4 focus:ring-emerald-300/50 shadow-[inset_6px_6px_12px_rgba(170,182,204,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] placeholder:text-slate-400 placeholder:font-normal h-32 resize-none"
          />
        </div>

        {/* 底部操作区 */}
        <div className="flex justify-end gap-4 mt-10 relative z-10">
          <button
            onClick={onClose}
            className="px-8 py-4 font-black text-slate-500 bg-white rounded-2xl shadow-[6px_6px_15px_rgba(170,182,204,0.4),-6px_-6px_15px_rgba(255,255,255,1)] active:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.1)] active:translate-y-1 transition-all"
          >
            下次一定
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-10 py-4 font-black text-xl text-emerald-950 bg-emerald-400 rounded-2xl border-4 border-emerald-600 shadow-[0_6px_0_rgba(5,150,105,1)] hover:bg-emerald-300 active:shadow-[0_0px_0_rgba(5,150,105,1)] active:translate-y-2 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? "打包中..." : "投递表单 🚀"}
          </button>
        </div>

      </div>

      {/* 隐藏滚动条的 CSS，你可以提取到 globals.css 中 */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>,
    document.body
  );
}