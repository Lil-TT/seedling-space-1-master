// app/api/growth/inspire/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "权限不足，仅学生可记录灵感" }, { status: 403 });
    }

    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "灵感内容不能为空哦" }, { status: 400 });
    }

    const userId = session.user.id;

    // 获取学生档案 ID
    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!student) {
      return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });
    }

    // 将灵感存入高度私密的 Inspiration 表
    await prisma.inspiration.create({
      data: {
        content: content.trim(),
        studentId: student.id,
      }
    });

    // 记录灵感也可以适当给予情绪币奖励
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: { coins: { increment: 2 } }
    });

    return NextResponse.json({ message: "灵感已珍藏" });

  } catch (error) {
    console.error("记录灵感失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}