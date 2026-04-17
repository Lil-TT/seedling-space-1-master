// app/api/activities/accept/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "只有学生勇士可以接取悬赏哦！" }, { status: 403 });
    }

    const { activityId } = await req.json();

    // 获取学生档案 ID
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });

    // 检查是否已经接取过这个任务
    const existing = await prisma.taskParticipant.findFirst({
      where: {
        studentId: student.id,
        activityId: activityId
      }
    });

    if (existing) {
      return NextResponse.json({ error: "你已经接取过这个任务啦，快去完成吧！" }, { status: 400 });
    }

    // 创建接取记录，初始状态为 ACCEPTED
    await prisma.taskParticipant.create({
      data: {
        studentId: student.id,
        activityId: activityId,
        status: "ACCEPTED"
      }
    });

    return NextResponse.json({ message: "接取成功！祝你好运勇士 🚀" });

  } catch (error) {
    console.error("接取任务失败:", error);
    return NextResponse.json({ error: "系统繁忙，请稍后再试" }, { status: 500 });
  }
}