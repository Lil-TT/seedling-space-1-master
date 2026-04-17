// app/api/activities/submit/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { participantId } = await req.json();

    // 将状态改为 SUBMITTED（待结算）
    await prisma.taskParticipant.update({
      where: { id: participantId },
      data: { status: "SUBMITTED" }
    });

    return NextResponse.json({ message: "成果已提交，等待老师检阅 ✨" });
  } catch (error) {
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}