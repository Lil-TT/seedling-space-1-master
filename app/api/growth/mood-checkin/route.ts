import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { growthStageFromStreak } from "@/lib/growth-stage";

const MOODS = ["great", "good", "ok", "low", "sad"] as const;

function utcDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function yesterdayKey() {
  const y = new Date();
  y.setUTCDate(y.getUTCDate() - 1);
  return utcDateKey(y);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "仅学生可打卡" }, { status: 403 });
    }

    const { moodKey } = await req.json();
    if (!MOODS.includes(moodKey)) {
      return NextResponse.json({ error: "心情选项无效" }, { status: 400 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) {
      return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });
    }

    const today = utcDateKey();

    const existingToday = await prisma.moodCheckIn.findUnique({
      where: {
        studentId_dateKey: { studentId: student.id, dateKey: today },
      },
    });

    if (existingToday) {
      return NextResponse.json({
        message: "今日已打卡",
        moodStreak: student.moodStreak,
        growthStage: growthStageFromStreak(student.moodStreak),
        alreadyChecked: true,
      });
    }

    const yKey = yesterdayKey();
    const hadYesterday = await prisma.moodCheckIn.findUnique({
      where: {
        studentId_dateKey: { studentId: student.id, dateKey: yKey },
      },
    });

    const newStreak = hadYesterday ? student.moodStreak + 1 : 1;

    await prisma.$transaction([
      prisma.moodCheckIn.create({
        data: {
          studentId: student.id,
          dateKey: today,
          moodKey,
        },
      }),
      prisma.studentProfile.update({
        where: { id: student.id },
        data: { moodStreak: newStreak },
      }),
    ]);

    return NextResponse.json({
      message: "打卡成功",
      moodStreak: newStreak,
      growthStage: growthStageFromStreak(newStreak),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
