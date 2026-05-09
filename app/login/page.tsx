"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SchoolBadge from "@/components/brand/SchoolBadge";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/school-brand";

type ClassRow = { id: string; name: string };
type RosterRow = { studentProfileId: string; name: string };

export default function LoginPage() {
  const router = useRouter();
  const [staffLoading, setStaffLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [rosterError, setRosterError] = useState("");

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState("");
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [pickId, setPickId] = useState<string | null>(null);
  const [rosterPin, setRosterPin] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    fetch("/api/roster/classes")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setClasses(d));
  }, []);

  useEffect(() => {
    if (!classId) {
      setRoster([]);
      return;
    }
    fetch(`/api/roster/students?classId=${encodeURIComponent(classId)}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setRoster(d));
  }, [classId]);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      setStaffError(res.error);
    } else {
      router.push("/profile");
      router.refresh();
    }
    setStaffLoading(false);
  };

  const handleRosterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickId) return;
    setStudentLoading(true);
    setRosterError("");

    const res = await signIn("credentials", {
      redirect: false,
      studentProfileId: pickId,
      rosterPin,
      email: "__roster__",
      password: "__roster__",
    });

    if (res?.error) {
      setRosterError(res.error);
    } else {
      router.push("/");
      router.refresh();
    }
    setStudentLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fff8e7] flex items-stretch justify-center px-4 md:px-8 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-300 blur-2xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-orange-300 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 text-8xl rotate-12">✏️</div>
        <div className="absolute bottom-1/4 left-1/4 text-7xl -rotate-6">📚</div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
        <div className="rounded-[2rem] border-4 border-slate-900 bg-white p-8 md:p-10 shadow-[8px_8px_0_#1e293b] flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <SchoolBadge size="md" showCaption={false} />
            <div>
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest">
                {SCHOOL_NAME}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">{SCHOOL_TAGLINE}</h1>
              <p className="text-sm font-bold text-slate-500 mt-1">老师 · 家长入口</p>
            </div>
          </div>

          {staffError && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 text-red-800 text-sm rounded-xl font-bold">
              {staffError}
            </div>
          )}

          <form onSubmit={handleStaffSubmit} className="space-y-4 flex-1 flex flex-col">
            <input
              type="email"
              placeholder="工作邮箱"
              required
              className="w-full px-5 py-4 rounded-2xl bg-amber-50 border-4 border-slate-900 font-bold focus:ring-0 focus:outline-none"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="密码"
              required
              className="w-full px-5 py-4 rounded-2xl bg-amber-50 border-4 border-slate-900 font-bold focus:ring-0 focus:outline-none"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              disabled={staffLoading}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-lg border-4 border-slate-900 shadow-[4px_4px_0_#f59e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            >
              {staffLoading ? "验证中…" : "登录 🍎"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm font-bold text-slate-600">
            老师/家长首次使用？{" "}
            <Link href="/register" className="text-amber-700 underline decoration-4 decoration-amber-400">
              去注册
            </Link>
          </p>
        </div>

        <div className="rounded-[2rem] border-4 border-slate-900 bg-gradient-to-br from-sky-200 via-pink-100 to-amber-100 p-6 md:p-8 shadow-[8px_8px_0_#1e293b] flex flex-col min-h-[420px]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-black text-pink-700 uppercase tracking-widest">小朋友入口</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                找到自己的名字 ✨
              </h2>
              <p className="text-sm font-bold text-slate-700 mt-2">
                先选班级，再点你的名字，输入班级口令就可以进去啦～
              </p>
            </div>
            <SchoolBadge size="sm" showCaption={false} />
          </div>

          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setPickId(null);
              setRosterPin("");
              setRosterError("");
            }}
            className="w-full mb-4 px-4 py-3 rounded-2xl border-4 border-slate-900 bg-white font-black text-slate-900"
          >
            <option value="">请选择班级 ▼</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex-1 overflow-y-auto rounded-2xl border-4 border-slate-900 bg-white/90 p-3 max-h-[240px] md:max-h-[280px]">
            {!classId ? (
              <p className="text-center text-slate-500 font-bold py-12">👆 先选一个班级哦</p>
            ) : roster.length === 0 ? (
              <p className="text-center text-slate-500 font-bold py-12">这个班还没有同学档案～</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roster.map((s) => (
                  <li key={s.studentProfileId}>
                    <button
                      type="button"
                      onClick={() => {
                        setPickId(s.studentProfileId);
                        setRosterError("");
                      }}
                      className={`w-full py-3 px-2 rounded-xl border-4 font-black text-sm transition-all ${
                        pickId === s.studentProfileId
                          ? "border-slate-900 bg-amber-300 text-slate-900 shadow-[3px_3px_0_#1e293b]"
                          : "border-slate-200 bg-amber-50 hover:border-slate-900 hover:bg-amber-100 text-slate-800"
                      }`}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleRosterLogin} className="mt-4 space-y-3">
            {rosterError && (
              <div className="p-3 bg-red-100 border-2 border-red-400 text-red-900 text-sm rounded-xl font-bold">
                {rosterError}
              </div>
            )}
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
              placeholder="班级口令（默认 1234，可用环境变量 DEFAULT_ROSTER_PIN）"
              value={rosterPin}
              onChange={(e) => setRosterPin(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-4 border-slate-900 bg-white font-black"
            />
            <button
              type="submit"
              disabled={!pickId || studentLoading}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-lg border-4 border-slate-900 shadow-[4px_4px_0_#1e293b] disabled:opacity-40 hover:bg-emerald-400 transition-colors"
            >
              {studentLoading ? "进门中…" : "出发！🚀"}
            </button>
          </form>

          <p className="text-[11px] font-bold text-slate-600 mt-3 text-center leading-relaxed">
            可在数据库为学生设置 rosterPinHash（bcrypt）实现一人一码；未设置则使用默认口令。
          </p>
        </div>
      </div>
    </div>
  );
}
