"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

type Thread = {
  id: string;
  parentUser: { id: string; name: string | null };
  teacherUser: { id: string; name: string | null };
  student: { user: { name: string | null } } | null;
  messages: { content: string; createdAt: string }[];
};

export default function ParentTeacherInbox({
  role,
}: {
  role: "PARENT" | "TEACHER";
}) {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: string; content: string; createdAt: string; sender: { name: string | null } }[]
  >([]);
  const [content, setContent] = useState("");
  const [teachers, setTeachers] = useState<{ id: string; name: string | null }[]>(
    []
  );
  const [newTeacherId, setNewTeacherId] = useState("");
  const [parentLookupEmail, setParentLookupEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const loadThreads = useCallback(() => {
    fetch("/api/messages/parent-teacher")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setThreads(d);
      });
  }, []);

  useEffect(() => {
    loadThreads();
    if (role === "PARENT") {
      fetch("/api/messages/parent-teacher/eligible")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) setTeachers(d);
        });
    }
  }, [loadThreads, role]);

  const openThread = async (id: string) => {
    setActiveId(id);
    const r = await fetch(`/api/messages/parent-teacher/${id}`);
    const data = await r.json();
    if (data.messages) setMessages(data.messages);
  };

  const send = async () => {
    if (!content.trim()) return;
    setBusy(true);
    try {
      const body: Record<string, string> = { content: content.trim() };
      if (activeId) body.threadId = activeId;
      else if (role === "PARENT") {
        if (!newTeacherId) {
          alert("请选择老师");
          setBusy(false);
          return;
        }
        body.teacherUserId = newTeacherId;
      } else {
        if (!parentLookupEmail.trim()) {
          alert("请填写家长注册邮箱以发起会话");
          setBusy(false);
          return;
        }
        const pr = await fetch(`/api/messages/resolve-parent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: parentLookupEmail.trim() }),
        });
        const pd = await pr.json();
        if (!pr.ok || !pd.parentUserId) {
          alert(pd.error || "找不到该家长");
          setBusy(false);
          return;
        }
        body.parentUserId = pd.parentUserId;
      }

      const res = await fetch("/api/messages/parent-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "发送失败");
        return;
      }
      setContent("");
      if (data.threadId) {
        setActiveId(data.threadId);
        await openThread(data.threadId);
      } else if (activeId) {
        await openThread(activeId);
      }
      loadThreads();
    } finally {
      setBusy(false);
    }
  };

  const peerLabel = (t: Thread) =>
    role === "PARENT"
      ? t.teacherUser.name || "老师"
      : t.parentUser.name || "家长";

  return (
    <div className="bg-white rounded-[2rem] border-4 border-slate-100 p-8 shadow-sm space-y-6">
      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <span>💬</span>{" "}
        {role === "PARENT" ? "与老师沟通" : "与家长沟通"}
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2 max-h-72 overflow-y-auto">
          {threads.length === 0 && (
            <p className="text-sm text-slate-400 font-bold">暂无会话</p>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => openThread(t.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 font-bold text-sm transition-colors ${
                activeId === t.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : "border-slate-100 hover:border-slate-200 text-slate-700"
              }`}
            >
              <span className="block truncate">{peerLabel(t)}</span>
              {t.student?.user?.name && (
                <span className="text-[10px] text-slate-400">
                  关联孩子 · {t.student.user.name}
                </span>
              )}
              {t.messages[0] && (
                <span className="block text-[10px] text-slate-400 truncate mt-1">
                  {t.messages[0].content}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex-1 min-h-[200px] max-h-72 overflow-y-auto rounded-2xl bg-slate-50 border-2 border-slate-100 p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-sm font-bold">
                选择左侧会话或发起新对话
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-4 py-2 text-sm max-w-[95%] ${
                    m.sender.name === session?.user?.name
                      ? "ml-auto bg-emerald-600 text-white"
                      : "bg-white border border-slate-200 text-slate-800"
                  }`}
                >
                  <p className="font-black text-[10px] opacity-70 mb-1">
                    {m.sender.name || "用户"}
                  </p>
                  <p className="leading-relaxed">{m.content}</p>
                </div>
              ))
            )}
          </div>

          {!activeId && role === "PARENT" && (
            <select
              value={newTeacherId}
              onChange={(e) => setNewTeacherId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold text-sm"
            >
              <option value="">选择孩子的班主任 / 任课老师</option>
              {teachers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.id}
                </option>
              ))}
            </select>
          )}

          {!activeId && role === "TEACHER" && (
            <input
              type="email"
              placeholder="家长注册邮箱（发起首次会话）"
              value={parentLookupEmail}
              onChange={(e) => setParentLookupEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-medium text-sm"
            />
          )}

          <div className="flex gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入留言…"
              rows={2}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium resize-none"
            />
            <button
              type="button"
              disabled={busy}
              onClick={send}
              className="px-6 rounded-xl bg-slate-900 text-white font-black text-sm disabled:opacity-40"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
