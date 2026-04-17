// app/api/market/upload/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "权限不足，仅学生可发布物品" }, { status: 403 });
    }

    const { title, desc, type } = await req.json();

    if (!title || !desc || !type) {
      return NextResponse.json({ error: "请填写完整的心愿信息" }, { status: 400 });
    }

    // 找到当前学生的档案 ID
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: "未找到学生档案" }, { status: 404 });
    }

    // 创建市场物品，初始状态为 PENDING
    await prisma.marketItem.create({
      data: {
        title,
        desc,
        type, // 'WISH' 或 'IDLE'
        status: "PENDING",
        ownerId: student.id
      }
    });

    return NextResponse.json({ message: "提交成功，等待老师温柔见证~" });
  } catch (error) {
    console.error("发布失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}