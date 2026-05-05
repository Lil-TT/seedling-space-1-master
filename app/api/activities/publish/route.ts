// app/api/activities/publish/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { SENIOR_GRADE_MIN } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      desc,
      reward,
      kind = "GENERAL",
      targetClassId,
      minGrade,
      maxGrade,
    } = body;

    if (!title || !reward || isNaN(Number(reward))) {
      return NextResponse.json({ error: "标题和赏金不能为空哦" }, { status: 400 });
    }

    if (userRole === "STUDENT") {
      const sp = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        select: { gradeLevel: true },
      });
      if (
        sp?.gradeLevel == null ||
        sp.gradeLevel < SENIOR_GRADE_MIN
      ) {
        return NextResponse.json(
          { error: `仅 ${SENIOR_GRADE_MIN} 年级及以上的学生可发布活动` },
          { status: 403 }
        );
      }
    } else if (userRole !== "TEACHER" && userRole !== "PARENT") {
      return NextResponse.json(
        { error: "权限不足，仅老师、家长或高年级学生可发布活动" },
        { status: 403 }
      );
    }

    const k = kind === "PARENT_CHILD" ? "PARENT_CHILD" : "GENERAL";
    const minG =
      minGrade === undefined || minGrade === null || minGrade === ""
        ? null
        : Number(minGrade);
    const maxG =
      maxGrade === undefined || maxGrade === null || maxGrade === ""
        ? null
        : Number(maxGrade);
    const classId =
      targetClassId === undefined ||
      targetClassId === null ||
      targetClassId === ""
        ? null
        : String(targetClassId);

    if (classId) {
      const exists = await prisma.class.findUnique({ where: { id: classId } });
      if (!exists) {
        return NextResponse.json({ error: "所选班级不存在" }, { status: 400 });
      }
    }

    const newActivity = await prisma.activity.create({
      data: {
        title,
        desc: desc || "",
        reward: Number(reward),
        initiatorId: session.user.id,
        status: "OPEN",
        kind: k,
        targetClassId: classId,
        minGrade: minG != null && !isNaN(minG) ? minG : null,
        maxGrade: maxG != null && !isNaN(maxG) ? maxG : null,
      },
    });

    return NextResponse.json({ message: "悬赏发布成功！", activity: newActivity });
  } catch (error) {
    console.error("发布活动失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
