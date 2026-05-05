// app/api/activities/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { studentCanJoinActivity } from "@/lib/activity-eligibility";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    const activities = await prisma.activity.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        participants: {
          include: {
            student: { include: { user: true } },
          },
        },
        targetClass: { select: { id: true, name: true } },
      },
    });

    if (!session?.user) {
      const publicActs = activities.filter(
        (a) =>
          !a.targetClassId && a.minGrade == null && a.maxGrade == null
      );
      return NextResponse.json(publicActs);
    }

    if (role !== "STUDENT") {
      return NextResponse.json(activities);
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { classId: true, gradeLevel: true },
    });

    if (!student) {
      return NextResponse.json([]);
    }

    const eligible = activities.filter((a) =>
      studentCanJoinActivity(a, {
        classId: student.classId,
        gradeLevel: student.gradeLevel,
      })
    );

    return NextResponse.json(eligible);
  } catch (error) {
    return NextResponse.json({ error: "获取活动列表失败" }, { status: 500 });
  }
}
