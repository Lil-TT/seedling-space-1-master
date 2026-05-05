// app/activities/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ActivitySlider from "@/components/activities/ActivitySlider";
import ActivityPublishModal from "@/components/activities/ActivityPublishModal";

export default function ActivitiesPage() {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canPublish, setCanPublish] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const loadActivities = useCallback(() => {
    setLoading(true);
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setActivities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as any)?.role;
    if (role === "STUDENT") {
      fetch("/api/student/capabilities")
        .then((r) => r.json())
        .then((d) => setCanPublish(!!d.canPublishActivity))
        .catch(() => setCanPublish(false));
    } else {
      setCanPublish(role === "TEACHER" || role === "PARENT");
    }
  }, [session, status]);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* 页面头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-3">
              ⚔️ 委托公会大厅
            </h1>
            <p className="text-slate-500 font-medium">在这里接取成长任务，赚取属于你的情绪币与荣耀。</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {canPublish && (
              <button
                type="button"
                onClick={() => setPublishOpen(true)}
                className="px-6 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black shadow-md hover:bg-emerald-500 transition-colors"
              >
                发布悬赏
              </button>
            )}
            <div className="px-6 py-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-3">
              <span className="text-2xl">🪙</span>
              <span className="text-sm font-bold text-slate-500">赏金池运作中</span>
            </div>
          </div>
        </div>

        <ActivityPublishModal
          isOpen={publishOpen}
          onClose={() => setPublishOpen(false)}
          onRefresh={loadActivities}
        />

        {/* 核心展示区：3D 悬赏轮播 */}
        {loading ? (
          <p className="text-center py-32 text-slate-400 font-bold">正在刷新公会委托板...</p>
        ) : activities.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-slate-100 shadow-sm">
            <span className="text-6xl block mb-6">📜</span>
            <p className="text-slate-500 font-bold text-lg">目前没有悬赏任务，老师们可能在酝酿大计划！</p>
          </div>
        ) : (
          <ActivitySlider items={activities} />
        )}

      </div>
    </div>
  );
}