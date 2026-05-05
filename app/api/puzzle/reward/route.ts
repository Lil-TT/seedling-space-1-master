import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

function utcDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "仅学生可领取拼图奖励" }, { status: 403 });
    }

    const today = utcDateKey();
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) {
      return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });
    }

    if (student.lastPuzzleRewardDate === today) {
      return NextResponse.json({
        message: "今天已经领过拼图奖励啦，明天再来～",
        coins: student.coins,
        alreadyClaimed: true,
      });
    }

    const bonus = 5;
    const updated = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        coins: { increment: bonus },
        lastPuzzleRewardDate: today,
      },
      select: { coins: true },
    });

    return NextResponse.json({
      message: `获得 ${bonus} 情绪币！`,
      coins: updated.coins,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
