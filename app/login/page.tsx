// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 调用 NextAuth 的真实登录接口
    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // 登录成功，顺滑跳转回主页或个人中心
      router.push("/profile");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center p-6 relative overflow-hidden">
      {/* 简单的背景装饰 */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-morandi-green/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-morandi-blue/20 rounded-full blur-3xl"></div>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">欢迎回来</h1>
        <p className="text-slate-500 mb-8">继续你的情绪探索之旅</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="email" placeholder="注册邮箱" required
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green transition-all"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="密码" required
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 ring-morandi-green transition-all"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />

          <button 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "验证中..." : "登 录"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          还没有账号？ <Link href="/register" className="text-slate-900 font-bold hover:underline">去注册</Link>
        </p>
      </div>
    </div>
  );
}