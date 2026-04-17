// app/profile/TeacherDashboard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ApprovalDrawer from "./ApprovalDrawer";
import ActivityPublishModal from "@/components/activities/ActivityPublishModal";

interface StudentInfo {
  id: string;
  name: string;
  className: string;
  troubleCount: number;
  coins: number;
  leafCount: number;
}

export default function TeacherDashboard({
  students,
  pendingMarketCount = 0, // 赋个默认值防报错
  submittedTasks = []
}: {
  students: StudentInfo[],
  pendingMarketCount?: number,
  submittedTasks?: any[]
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 区分出危机学生（troubleCount >= 3）和普通学生
  const crisisStudents = students.filter(s => s.troubleCount >= 3);
  const normalStudents = students.filter(s => s.troubleCount < 3);

  const handleResolve = async (studentId: string) => {
    setLoadingId(studentId);
    try {
      const res = await fetch("/api/teacher/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
      if (res.ok) {
        // 刷新当前页面，重新从服务端获取最新数据
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleSettle = async (participantId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch("/api/activities/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, action })
      });

      const data = await res.json();
      if (res.ok) {
        // 成功后，刷新页面获取最新数据
        router.refresh();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("结算失败，请检查网络");
    }
  };

  return (
    <div className="mt-10 space-y-8">

      {/* 🟡 新增：童心市场待办通知模块 */}
      {pendingMarketCount > 0 && (
        <div className="flex-1 relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-100/50 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 group cursor-pointer hover:shadow-md transition-all duration-300" onClick={() => setIsDrawerOpen(true)}>

          {/* 背景光晕装饰 */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>

          <div className="flex items-center gap-4 relative z-10">
            {/* 柔和呼吸灯特效 */}
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 shadow-sm shadow-amber-500/50"></span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-amber-900">市场流转见证</h3>
              <p className="text-amber-700/80 text-sm mt-0.5">
                有 <span className="font-bold text-amber-600 text-base">{pendingMarketCount}</span> 件来自班级的心愿物品，正等待您的审批上架 ✨
              </p>
            </div>
          </div>

          <button
            // 这里我们暂时留空，之后点击触发沉浸式抽屉
            onClick={(e) => { e.stopPropagation(); setIsDrawerOpen(true); }}
            className="relative z-10 px-6 py-2.5 bg-amber-100 text-amber-800 font-bold text-sm rounded-xl hover:bg-amber-500 hover:text-white transition-colors shadow-sm"
          >
            去处理
          </button>
        </div>
      )}

      {/* 2. 新增：发布悬赏任务卡片 */}
      <div
        onClick={() => setIsPublishModalOpen(true)}
        className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100/50 rounded-[2rem] p-6 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            ➕
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900">发布新悬赏</h3>
            <p className="text-emerald-700/60 text-sm">发布任务，激励孩子们成长</p>
          </div>
        </div>
        <span className="text-emerald-300 group-hover:text-emerald-500 transition-colors">➜</span>
      </div>
      {/* 挂载弹窗 */}
      <ActivityPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* 老师工作台新增：待核发赏金 */}
      {submittedTasks.length > 0 && (
        <div className="bg-white rounded-[2rem] p-8 border-4 border-slate-800 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <span>💰</span> 待核发成长赏金
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submittedTasks.map((t: any) => (
              <div key={t.id} className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex flex-col justify-between">
                <div className="mb-4">
                  <p className="text-xs font-bold text-emerald-600 mb-1">@{t.student.user.name} 提交了：</p>
                  <h4 className="font-black text-slate-800">{t.activity.title}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSettle(t.id, 'REJECT')}
                    className="flex-1 py-2 bg-white text-slate-400 border-2 border-slate-200 rounded-xl font-bold text-xs"
                  >
                    驳回
                  </button>
                  <button
                    onClick={() => handleSettle(t.id, 'APPROVE')}
                    className="flex-1 py-2 bg-emerald-600 text-white border-2 border-emerald-900 rounded-xl font-black text-xs shadow-[2px_2px_0_rgba(0,0,0,0.2)]"
                  >
                    核发 {t.activity.reward} 币
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 挂载抽屉 */}
      <ApprovalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 🔴 危机红框看板 (仅在有危机学生时显示) */}
      {crisisStudents.length > 0 && (
        <div className="bg-red-50/80 border border-red-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
            <h2 className="text-xl font-bold text-red-900">情绪预警名单</h2>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              需紧急干预
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crisisStudents.map(student => (
              <div key={student.id} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-red-100 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">{student.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{student.className}</span>
                  </div>
                  <p className="text-sm text-red-600 font-medium">连续倾诉烦恼 {student.troubleCount} 次</p>
                </div>
                <button
                  onClick={() => handleResolve(student.id)}
                  disabled={loadingId === student.id}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loadingId === student.id ? "处理中..." : "标记已沟通"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 常规班级树林概况 */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">班级成长生态</h2>
        {normalStudents.length === 0 ? (
          <p className="text-slate-500 text-center py-10">当前班级暂无其他学生数据</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {normalStudents.map(student => (
              <div key={student.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-morandi-green transition-colors cursor-default">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-slate-700">{student.name}</span>
                  <span className="text-[10px] text-slate-400">{student.className}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">🍃 叶片: {student.leafCount}</span>
                  <span className="text-yellow-600 font-medium">💰 {student.coins}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}