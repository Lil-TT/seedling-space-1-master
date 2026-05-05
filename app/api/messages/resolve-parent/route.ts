import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/** 老师根据家长邮箱解析 parent User.id（须为该家长的孩子所在班级的任教老师） */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "仅老师可使用" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "请填写邮箱" }, { status: 400 });
    }

    const parentUser = await prisma.user.findFirst({
      where: { email: email.trim(), role: "PARENT" },
      include: {
        parentProfile: {
          include: {
            students: { select: { classId: true } },
          },
        },
      },
    });

    if (!parentUser?.parentProfile) {
      return NextResponse.json({ error: "找不到该家长账号" }, { status: 404 });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: { classes: { select: { id: true } } },
    });

    const classIds = new Set(teacher?.classes.map((c) => c.id) ?? []);

    const linked = parentUser.parentProfile.students.some(
      (s) => s.classId && classIds.has(s.classId)
    );

    if (!linked) {
      return NextResponse.json(
        { error: "该家长的孩子不在您任教的班级中" },
        { status: 403 }
      );
    }

    return NextResponse.json({ parentUserId: parentUser.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
