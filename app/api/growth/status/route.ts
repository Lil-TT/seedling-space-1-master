// app/api/growth/status/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { growthStageFromStreak } from "@/lib/growth-stage";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "未授权" }, { status: 403 });
    }

    const userId = session.user.id;

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

    return NextResponse.json({
      leafCount: student.leafCount,
      seed: student.seed,
      coins: student.coins,
      moodStreak: student.moodStreak,
      growthStage: growthStageFromStreak(student.moodStreak),
    });
  } catch (error) {
    console.error("获取成长状态失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
