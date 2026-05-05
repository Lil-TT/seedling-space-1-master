import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "PARENT") {
      return NextResponse.json({ error: "仅家长可查看" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const studentProfileId = searchParams.get("studentProfileId");
    if (!studentProfileId) {
      return NextResponse.json({ error: "缺少 studentProfileId" }, { status: 400 });
    }

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      include: { students: { select: { id: true } } },
    });

    if (!parent?.students.some((s) => s.id === studentProfileId)) {
      return NextResponse.json({ error: "无权查看该孩子的评语" }, { status: 403 });
    }

    const comments = await prisma.teacherComment.findMany({
      where: {
        studentId: studentProfileId,
        visibleToParent: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        teacher: { select: { name: true } },
      },
    });

    return NextResponse.json(comments);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
