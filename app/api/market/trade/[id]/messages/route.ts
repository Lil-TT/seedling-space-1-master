// app/api/market/trade/[id]/messages/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 类型改为 Promise
) {
  try {
    const resolvedParams = await params; // 👈 必须 await 解包

    const messages = await prisma.tradeMessage.findMany({
      where: { tradeId: resolvedParams.id }, // 👈 使用解包后的 id
      include: { sender: { include: { user: true } } },
      orderBy: { createdAt: "asc" } 
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "无法读取纸条" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 类型改为 Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "未登录" }, { status: 403 });

    const { content } = await req.json();
    if (!content.trim()) return NextResponse.json({ error: "纸条不能是空的哦" }, { status: 400 });

    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) return NextResponse.json({ error: "找不到学生档案" }, { status: 404 });

    const resolvedParams = await params; // 👈 必须 await 解包

    const newMessage = await prisma.tradeMessage.create({
      data: {
        content,
        tradeId: resolvedParams.id, // 👈 使用解包后的 id
        senderId: student.id
      },
      include: { sender: { include: { user: true } } }
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ error: "投递失败" }, { status: 500 });
  }
}