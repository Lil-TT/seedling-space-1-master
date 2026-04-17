// app/api/student/received-trades/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });

  // 查出所有发给我的、待处理的交易请求
  const trades = await prisma.trade.findMany({
    where: {
      receiverId: student.id,
      status: "PENDING"
    },
    include: {
      item: true, // 对方想要的物品信息
      initiator: { include: { user: true } } // 发起请求的学生信息
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(trades);
}