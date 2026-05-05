// app/api/activities/accept/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { studentCanJoinActivity } from "@/lib/activity-eligibility";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "只有学生勇士可以接取悬赏哦！" }, { status: 403 });
    }

    const { activityId } = await req.json();

    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity || activity.status !== "OPEN") {
      return NextResponse.json({ error: "任务不存在或已关闭" }, { status: 400 });
    }

    if (
      !studentCanJoinActivity(activity, {
        classId: student.classId,
        gradeLevel: student.gradeLevel,
      })
    ) {
      return NextResponse.json(
        { error: "该任务对你的年级或班级不可见，无法接取" },
        { status: 403 }
      );
    }

    const existing = await prisma.taskParticipant.findFirst({
      where: {
        studentId: student.id,
        activityId: activityId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "你已经接取过这个任务啦，快去完成吧！" }, { status: 400 });
    }

    await prisma.taskParticipant.create({
      data: {
        studentId: student.id,
        activityId: activityId,
        status: "ACCEPTED",
      },
    });

    return NextResponse.json({ message: "接取成功！祝你好运勇士 🚀" });
  } catch (error) {
    console.error("接取任务失败:", error);
    return NextResponse.json({ error: "系统繁忙，请稍后再试" }, { status: 500 });
  }
}
