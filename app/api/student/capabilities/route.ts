import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SENIOR_GRADE_MIN } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({
        canPublishActivity: false,
        gradeLevel: null,
        classId: null,
      });
    }

    const sp = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { gradeLevel: true, classId: true },
    });

    const gradeLevel = sp?.gradeLevel ?? null;
    const canPublishActivity =
      gradeLevel != null && gradeLevel >= SENIOR_GRADE_MIN;

    return NextResponse.json({
      canPublishActivity,
      gradeLevel,
      classId: sp?.classId ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
