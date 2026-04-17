// app/api/activities/settle/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { participantId, action } = await req.json(); // action: 'APPROVE' | 'REJECT'

    if (action === 'REJECT') {
      await prisma.taskParticipant.update({
        where: { id: participantId },
        data: { status: "ACCEPTED" } // 退回重新做
      });
      return NextResponse.json({ message: "已退回任务" });
    }

    // 👉 核心：使用事务处理金币发放
    await prisma.$transaction(async (tx) => {
      // 1. 获取任务详情
      const participant = await tx.taskParticipant.findUnique({
        where: { id: participantId },
        include: { activity: true }
      });

      if (!participant || participant.status !== "SUBMITTED") throw new Error("非法状态");

      // 2. 更新参与记录状态为 COMPLETED
      await tx.taskParticipant.update({
        where: { id: participantId },
        data: { status: "COMPLETED" }
      });

      // 3. 给学生发放金币
      await tx.studentProfile.update({
        where: { id: participant.studentId },
        data: { coins: { increment: participant.activity.reward } }
      });
    });

    return NextResponse.json({ message: "赏金已发放！💰" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "结算失败" }, { status: 500 });
  }
}