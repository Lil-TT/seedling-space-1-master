// app/api/growth/status/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { growthStageFromStreak } from "@/lib/growth-stage";

export async function GET() {
  try {
    // #region agent log
    fetch("http://127.0.0.1:7596/ingest/28ec32d7-5d99-420d-9ef3-cefd93c43ba2", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "dfa5d2" }, body: JSON.stringify({ sessionId: "dfa5d2", runId: "run1", hypothesisId: "H1", location: "app/api/growth/status/route.ts:10", message: "growth status GET entry", data: { hasDatabaseUrl: Boolean(process.env.DATABASE_URL), dbHost: (() => { try { return new URL(process.env.DATABASE_URL || "").host; } catch { return "invalid-url"; } })() }, timestamp: Date.now() }) }).catch(() => { });
    // #endregion
    const session = await getServerSession(authOptions);
    // #region agent log
    fetch("http://127.0.0.1:7596/ingest/28ec32d7-5d99-420d-9ef3-cefd93c43ba2", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "dfa5d2" }, body: JSON.stringify({ sessionId: "dfa5d2", runId: "run1", hypothesisId: "H3", location: "app/api/growth/status/route.ts:13", message: "session resolved", data: { hasUser: Boolean(session?.user), role: (session?.user as any)?.role ?? null }, timestamp: Date.now() }) }).catch(() => { });
    // #endregion
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "未授权" }, { status: 403 });
    }

    const userId = session.user.id;

    // #region agent log
    fetch("http://127.0.0.1:7596/ingest/28ec32d7-5d99-420d-9ef3-cefd93c43ba2", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "dfa5d2" }, body: JSON.stringify({ sessionId: "dfa5d2", runId: "run1", hypothesisId: "H2", location: "app/api/growth/status/route.ts:21", message: "about to query studentProfile with moodStreak", data: { userIdPresent: Boolean(userId) }, timestamp: Date.now() }) }).catch(() => { });
    // #endregion
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      select: {
        leafCount: true,
        seed: true,
        coins: true,
        moodStreak: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });
    }

    // #region agent log
    fetch("http://127.0.0.1:7596/ingest/28ec32d7-5d99-420d-9ef3-cefd93c43ba2", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "dfa5d2" }, body: JSON.stringify({ sessionId: "dfa5d2", runId: "run1", hypothesisId: "H4", location: "app/api/growth/status/route.ts:39", message: "student query success", data: { hasStudent: Boolean(student), moodStreakType: typeof student.moodStreak }, timestamp: Date.now() }) }).catch(() => { });
    // #endregion
    return NextResponse.json({
      leafCount: student.leafCount,
      seed: student.seed,
      coins: student.coins,
      moodStreak: student.moodStreak,
      growthStage: growthStageFromStreak(student.moodStreak),
    });
  } catch (error) {
    const e = error as any;
    // #region agent log
    fetch("http://127.0.0.1:7596/ingest/28ec32d7-5d99-420d-9ef3-cefd93c43ba2", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "dfa5d2" }, body: JSON.stringify({ sessionId: "dfa5d2", runId: "run1", hypothesisId: "H5", location: "app/api/growth/status/route.ts:49", message: "growth status catch", data: { name: e?.name ?? null, code: e?.code ?? null, modelName: e?.meta?.modelName ?? null, column: e?.meta?.column ?? null, message: String(e?.message ?? "").slice(0, 180) }, timestamp: Date.now() }) }).catch(() => { });
    // #endregion
    console.error("获取成长状态失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
