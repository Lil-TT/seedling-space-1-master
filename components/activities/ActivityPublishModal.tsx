// components/activities/ActivityPublishModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type FormState = {
  title: string;
  desc: string;
  reward: string;
  kind: "GENERAL" | "PARENT_CHILD";
  targetClassId: string;
  minGrade: string;
  maxGrade: string;
};

export default function ActivityPublishModal({
  isOpen,
  onClose,
  onRefresh,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}) {
  const [formData, setFormData] = useState<FormState>({
    title: "",
    desc: "",
    reward: "10",
    kind: "GENERAL",
    targetClassId: "",
    minGrade: "",
    maxGrade: "",
  });
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setClasses(data));
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.reward) return alert("标题和赏金都要填哦！");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/activities/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          desc: formData.desc,
          reward: formData.reward,
          kind: formData.kind,
          targetClassId: formData.targetClassId || null,
          minGrade: formData.minGrade === "" ? null : Number(formData.minGrade),
          maxGrade: formData.maxGrade === "" ? null : Number(formData.maxGrade),
        }),
      });

      if (res.ok) {
        setFormData({
          title: "",
          desc: "",
          reward: "10",
          kind: "GENERAL",
          targetClassId: "",
          minGrade: "",
          maxGrade: "",
        });
        if (onRefresh) onRefresh();
        onClose();
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch {
      alert("发布失败，请检查网络");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#F0F4F2] rounded-[2.5rem] p-8 border-t-[6px] border-l-[6px] border-white/80 shadow-[20px_20px_40px_rgba(160,175,165,0.4),-20px_-20px_40px_rgba(255,255,255,0.9)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">
            🌿
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">发布成长悬赏</h2>
            <p className="text-emerald-700/60 text-xs font-bold uppercase tracking-widest">
              Growth Task Publisher
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2 ml-2">
              任务类型
            </label>
            <select
              value={formData.kind}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  kind: e.target.value as FormState["kind"],
                })
              }
              className="w-full bg-[#E6EBE8] text-slate-700 px-6 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-300 shadow-[inset_4px_4px_8px_rgba(160,175,165,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] font-medium"
            >
              <option value="GENERAL">普通悬赏</option>
              <option value="PARENT_CHILD">亲子小任务</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2 ml-2">
              限定班级（可选）
            </label>
            <select
              value={formData.targetClassId}
              onChange={(e) =>
                setFormData({ ...formData, targetClassId: e.target.value })
              }
              className="w-full bg-[#E6EBE8] text-slate-700 px-6 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-300 shadow-[inset_4px_4px_8px_rgba(160,175,165,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] font-medium"
            >
              <option value="">不限班级（年级筛选仍可生效）</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-2">
                最低年级
              </label>
              <input
                type="number"
                min={1}
                max={12}
                placeholder="空=不限"
                value={formData.minGrade}
                onChange={(e) =>
                  setFormData({ ...formData, minGrade: e.target.value })
                }
                className="w-full bg-[#E6EBE8] text-slate-700 px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-300 shadow-inner font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-2">
                最高年级
              </label>
              <input
                type="number"
                min={1}
                max={12}
                placeholder="空=不限"
                value={formData.maxGrade}
                onChange={(e) =>
                  setFormData({ ...formData, maxGrade: e.target.value })
                }
                className="w-full bg-[#E6EBE8] text-slate-700 px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-300 shadow-inner font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2 ml-2">
              任务名称
            </label>
            <input
              type="text"
              placeholder="例如：整理班级书架"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-[#E6EBE8] text-slate-700 px-6 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-300 shadow-[inset_4px_4px_8px_rgba(160,175,165,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2 ml-2">
              情绪币赏金 (Coins)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={formData.reward}
                onChange={(e) =>
                  setFormData({ ...formData, reward: e.target.value })
                }
                className="w-full bg-[#E6EBE8] text-emerald-600 font-black text-2xl px-6 py-4 rounded-2xl border-none outline-none shadow-[inset_4px_4px_8px_rgba(160,175,165,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]"
              />
              <span className="absolute right-6 text-emerald-500 font-bold">🪙</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2 ml-2">
              任务要求 (可选)
            </label>
            <textarea
              placeholder="描述一下任务的细节，让孩子们更清楚如何完成..."
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              className="w-full bg-[#E6EBE8] text-slate-700 px-6 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-300 shadow-[inset_4px_4px_8px_rgba(160,175,165,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] placeholder:text-slate-400 h-28 resize-none font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-500 bg-white rounded-xl shadow-[4px_4px_10px_rgba(160,175,165,0.3),-4px_-4px_10px_rgba(255,255,255,1)] active:shadow-none active:translate-y-1 transition-all"
          >
            取消
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 font-bold text-white bg-emerald-600 rounded-xl shadow-[4px_4px_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 active:shadow-none active:translate-y-1 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? "正在发布..." : "确认发布 🚀"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
