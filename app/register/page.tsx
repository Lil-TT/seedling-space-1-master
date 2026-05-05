// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  
  // 表单状态
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "STUDENT",
    classId: "",
    classIds: [] as string[],
    childEmail: "",
    gradeLevel: ""
  });

  // 获取班级数据
  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setClasses(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("注册成功！请登录");
        router.push("/api/auth/signin");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("提交失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">加入 Seedling</h1>
        <p className="text-slate-500 mb-8">开启你的情绪成长之旅</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 基础字段 */}
          <input 
            type="text" placeholder="称呼" required
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green"
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="邮箱" required
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="密码" required
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />

          {/* 角色选择 */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            {['STUDENT', 'TEACHER', 'PARENT'].map(r => (
              <button
                key={r} type="button"
                onClick={() => setFormData({...formData, role: r})}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  formData.role === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {r === 'STUDENT' ? '学生' : r === 'TEACHER' ? '老师' : '家长'}
              </button>
            ))}
          </div>

          {/* 角色特定逻辑 */}
          {formData.role === 'STUDENT' && (
            <>
              <select 
                required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green"
                onChange={e => setFormData({...formData, classId: e.target.value})}
              >
                <option value="">选择你的班级</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input
                type="number"
                min={1}
                max={12}
                placeholder="年级（1-12，用于活动匹配，可选）"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green"
                onChange={e => setFormData({ ...formData, gradeLevel: e.target.value })}
              />
            </>
          )}

          {formData.role === 'TEACHER' && (
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 mb-3">选择管理的班级 (可多选)</p>
              <div className="grid grid-cols-2 gap-2">
                {classes.map(c => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      onChange={e => {
                        const ids = e.target.checked 
                          ? [...formData.classIds, c.id]
                          : formData.classIds.filter(id => id !== c.id);
                        setFormData({...formData, classIds: ids});
                      }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.role === 'PARENT' && (
            <input 
              type="email" placeholder="输入孩子的注册邮箱进行绑定" required
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green"
              onChange={e => setFormData({...formData, childEmail: e.target.value})}
            />
          )}

          <button 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "正在同步数据库..." : "立即注册"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          已有账号？ <Link href="/api/auth/signin" className="text-slate-900 font-bold">去登录</Link>
        </p>
      </div>
    </div>
  );
}