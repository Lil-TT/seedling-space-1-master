import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "仅老师可提交评语" }, { status: 403 });
    }

    const { studentProfileId, content, visibleToParent = true } =
      await req.json();

    if (!studentProfileId || !content?.trim()) {
      return NextResponse.json({ error: "缺少学生或评语内容" }, { status: 400 });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: { classes: { select: { id: true } } },
    });

    if (!teacher) {
      return NextResponse.json({ error: "找不到老师档案" }, { status: 404 });
    }

    const classIds = teacher.classes.map((c) => c.id);

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { id: true, classId: true },
    });

    if (!student?.classId || !classIds.includes(student.classId)) {
      return NextResponse.json(
        { error: "该学生不在您管理的班级中" },
        { status: 403 }
      );
    }

    const comment = await prisma.teacherComment.create({
      data: {
        teacherUserId: session.user.id,
        studentId: student.id,
        content: content.trim(),
        visibleToParent: !!visibleToParent,
      },
    });

    return NextResponse.json({ ok: true, comment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
