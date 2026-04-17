// app/profile/TeacherDashboard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StudentInfo {
  id: string;
  name: string;
  className: string;
  troubleCount: number;
  coins: number;
  leafCount: number;
}

export default function TeacherDashboard({ students }: { students: StudentInfo[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  return (
    <div className="mt-10 space-y-8">
      
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