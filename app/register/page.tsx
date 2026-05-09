// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SchoolBadge from "@/components/brand/SchoolBadge";
import { SCHOOL_NAME } from "@/lib/school-brand";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "TEACHER",
    classId: "",
    classIds: [] as string[],
    childEmail: "",
    gradeLevel: "",
  });

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setClasses(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("注册成功！请登录");
        router.push("/api/auth/signin");
      } else {
        alert(data.error);
      }
    } catch {
      alert("提交失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8e7] flex items-center justify-center px-6 pb-10">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] border-4 border-slate-900 p-10 shadow-[8px_8px_0_#1e293b]">
        <div className="flex items-center gap-3 mb-6">
          <SchoolBadge size="sm" showCaption={false} />
          <div>
            <h1 className="text-2xl font-black text-slate-900">{SCHOOL_NAME}</h1>
            <p className="text-sm font-bold text-slate-500">老师 / 家长注册</p>
          </div>
        </div>
        <p className="text-xs font-bold text-amber-800 bg-amber-100 border-2 border-amber-300 rounded-xl px-3 py-2 mb-6">
          小朋友不需要在这里注册：请由家长在登录页右侧「花名册」点名登录。
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="称呼"
            required
            className="w-full px-6 py-4 rounded-2xl bg-amber-50 border-4 border-slate-900 font-bold focus:outline-none"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="邮箱"
            required
            className="w-full px-6 py-4 rounded-2xl bg-amber-50 border-4 border-slate-900 font-bold focus:outline-none"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="密码"
            required
            className="w-full px-6 py-4 rounded-2xl bg-amber-50 border-4 border-slate-900 font-bold focus:outline-none"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border-2 border-slate-900">
            {(["TEACHER", "PARENT"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFormData({ ...formData, role: r })}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  formData.role === r
                    ? "bg-white text-slate-900 shadow-sm border-2 border-slate-900"
                    : "text-slate-500"
                }`}
              >
                {r === "TEACHER" ? "老师" : "家长"}
              </button>
            ))}
          </div>

          {formData.role === "TEACHER" && (
            <div className="p-4 bg-amber-50 rounded-2xl border-4 border-slate-900">
              <p className="text-xs font-black text-slate-600 mb-3">选择管理的班级 (可多选)</p>
              <div className="grid grid-cols-2 gap-2">
                {classes.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 text-sm text-slate-700 font-bold cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const ids = e.target.checked
                          ? [...formData.classIds, c.id]
                          : formData.classIds.filter((id) => id !== c.id);
                        setFormData({ ...formData, classIds: ids });
                      }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.role === "PARENT" && (
            <input
              type="email"
              placeholder="输入孩子的注册邮箱进行绑定（孩子账号由学校开通）"
              required
              className="w-full px-6 py-4 rounded-2xl bg-amber-50 border-4 border-slate-900 font-bold focus:outline-none"
              onChange={(e) => setFormData({ ...formData, childEmail: e.target.value })}
            />
          )}

          <button
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black border-4 border-slate-900 shadow-[4px_4px_0_#f59e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? "正在同步..." : "立即注册 🌟"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-bold text-slate-600">
          已有账号？{" "}
          <Link href="/login" className="text-amber-700 underline decoration-4 decoration-amber-400">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
