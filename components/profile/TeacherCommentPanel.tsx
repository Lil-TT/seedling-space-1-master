"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TeacherCommentPanel({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  if (students.length === 0) return null;

  const submit = async () => {
    if (!studentId || !content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/teacher/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId: studentId,
          content: content.trim(),
          visibleToParent: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setContent("");
        router.refresh();
      } else {
        alert(data.error || "发送失败");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border-4 border-indigo-100 p-8 shadow-sm space-y-4">
      <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
        <span>💌</span> 给孩子一句鼓励（家长可见）
      </h3>
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="md:w-56 px-4 py-3 rounded-xl border-2 border-indigo-100 font-bold text-sm bg-white"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下真诚的鼓励…"
          rows={3}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-100 text-sm font-medium resize-none"
        />
      </div>
      <button
        type="button"
        disabled={sending}
        onClick={submit}
        className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-md hover:bg-indigo-500 disabled:opacity-40"
      >
        {sending ? "发送中…" : "发送评语"}
      </button>
    </div>
  );
}
