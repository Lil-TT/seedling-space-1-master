// app/api/teacher/resolve/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "学生ID缺失" }, { status: 400 });
    }

    // 将该学生的烦恼计数清零，并奖励一点情绪币作为安抚
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { 
        troubleCount: 0,
        coins: { increment: 10 } // 危机解除，系统赠送 10 个情绪币
      }
    });

    return NextResponse.json({ message: "危机已解除" });
  } catch (error) {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}