// app/market/UploadModal.tsx
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export default function UploadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({ title: "", desc: "", type: "IDLE" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 确保 Portal 只在客户端渲染
  useState(() => setMounted(true));

  const handleSubmit = async () => {
    if (!formData.title || !formData.desc) return alert("请填写完整哦！");
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/market/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        // alert(data.message); // 可以换成更温柔的 toast
        setFormData({ title: "", desc: "", type: "IDLE" });
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
      
      {/* 3D 拟物化卡片主体 */}
      <div className="relative w-full max-w-md bg-[#F2F4F8] rounded-[2.5rem] p-8 border-t-[6px] border-l-[6px] border-white/60 shadow-[20px_20px_40px_rgba(170,182,204,0.5),-20px_-20px_40px_rgba(255,255,255,0.8)]">
        
        <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
          📮 投递你的期待
        </h2>

        {/* 3D 实体切换按钮 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFormData({ ...formData, type: "IDLE" })}
            className={`flex-1 py-3 font-bold rounded-2xl transition-all duration-200 ${
              formData.type === "IDLE" 
                ? "bg-morandi-green text-white shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)] translate-y-1" 
                : "bg-white text-slate-500 shadow-[4px_4px_10px_rgba(170,182,204,0.4),-4px_-4px_10px_rgba(255,255,255,1)] hover:-translate-y-0.5"
            }`}
          >
            🎁 分享闲置
          </button>
          <button
            onClick={() => setFormData({ ...formData, type: "WISH" })}
            className={`flex-1 py-3 font-bold rounded-2xl transition-all duration-200 ${
              formData.type === "WISH" 
                ? "bg-morandi-yellow text-white shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)] translate-y-1" 
                : "bg-white text-slate-500 shadow-[4px_4px_10px_rgba(170,182,204,0.4),-4px_-4px_10px_rgba(255,255,255,1)] hover:-translate-y-0.5"
            }`}
          >
            🌠 许下心愿
          </button>
        </div>

        {/* 凹陷感输入框 */}
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder={formData.type === "IDLE" ? "你要分享什么神奇物品？" : "你渴望得到什么？"}
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-[#E8EDF2] text-slate-700 px-6 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-slate-300 shadow-[inset_4px_4px_8px_rgba(170,182,204,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] placeholder:text-slate-400"
          />
          <textarea 
            placeholder="描述一下它的故事，或者你为什么需要它..."
            value={formData.desc}
            onChange={e => setFormData({...formData, desc: e.target.value})}
            className="w-full bg-[#E8EDF2] text-slate-700 px-6 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-slate-300 shadow-[inset_4px_4px_8px_rgba(170,182,204,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] placeholder:text-slate-400 h-32 resize-none"
          />
        </div>

        {/* 底部操作区 */}
        <div className="flex justify-end gap-4 mt-8">
          <button 
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-500 bg-white rounded-xl shadow-[4px_4px_10px_rgba(170,182,204,0.4),-4px_-4px_10px_rgba(255,255,255,1)] active:shadow-[inset_0px_2px_4px_rgba(0,0,0,0.1)] active:translate-y-1 transition-all"
          >
            下次一定
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 font-bold text-white bg-slate-800 rounded-xl shadow-[4px_4px_10px_rgba(170,182,204,0.4)] hover:bg-slate-700 active:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.3)] active:translate-y-1 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "打包中..." : "投递表单"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}