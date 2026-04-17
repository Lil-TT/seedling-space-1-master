// app/api/growth/water/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "权限不足，仅学生可灌溉" }, { status: 403 });
    }

    const userId = session.user.id;

    // 1. 获取该学生档案
    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!student) {
      return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });
    }

    // 2. 校验“每日一次”逻辑
    const now = new Date();
    if (student.lastWateredAt) {
      const lastWateredDate = new Date(student.lastWateredAt).toDateString();
      const todayDate = now.toDateString();
      
      if (lastWateredDate === todayDate) {
        return NextResponse.json({ error: "今天已经灌溉过啦，明天再来吧~" }, { status: 400 });
      }
    }

    // 3. 更新数据库：增加一片叶子，增加 5 个情绪币，记录灌溉时间
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        leafCount: { increment: 1 },
        coins: { increment: 5 },
        lastWateredAt: now
      }
    });

    return NextResponse.json({ 
      message: "灌溉成功", 
      leafCount: updatedStudent.leafCount,
      coins: updatedStudent.coins
    });

  } catch (error) {
    console.error("灌溉失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}