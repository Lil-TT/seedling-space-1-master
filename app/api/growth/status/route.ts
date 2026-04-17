// app/api/growth/status/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "未授权" }, { status: 403 });
    }

    const userId = session.user.id;

    // 去数据库抓取该学生的真实叶子数量和专属种子
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { leafCount: true, seed: true } // 为了性能，只查这两个字段
    });

    if (!student) {
      return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });
    }

    return NextResponse.json({ 
      leafCount: student.leafCount, 
      seed: student.seed 
    });

  } catch (error) {
    console.error("获取成长状态失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}