// app/api/growth/trouble/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    // 可选：接收前端传来的烦恼文本（以后可以在前端加个弹窗输入文本）
    // const { content } = await req.json().catch(() => ({ content: "未具名烦恼" }));

    const userId = session.user.id;

    // 1. 查找学生档案
    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!student) return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });

    // 2. 增加烦恼次数
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        troubleCount: { increment: 1 },
        lastTroubleAt: new Date()
      }
    });

    // 3. 判断是否触发了危机 (>= 3次)
    const isCrisis = updatedStudent.troubleCount >= 3;

    // 如果想把具体的烦恼文字存进数据库，可以在这里增加 prisma.confession.create(...)

    return NextResponse.json({ 
      message: "烦恼已倾倒", 
      troubleCount: updatedStudent.troubleCount,
      isCrisis: isCrisis
    });

  } catch (error) {
    console.error("倾诉烦恼失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}