// app/api/market/trade/[id]/complete/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // 1. 获取交易详情（为了拿到双方的 ID）
    const tradeData = await prisma.trade.findUnique({
      where: { id: resolvedParams.id },
      include: { initiator: true, receiver: true }
    });

    if (!tradeData) return NextResponse.json({ error: "交易不存在" }, { status: 404 });

    // 2. 将交易状态更新为 COMPLETED
    const trade = await prisma.trade.update({
      where: { id: resolvedParams.id },
      data: { status: "COMPLETED" }
    });

    // 3. 同步将对应的市场物品状态更新为 COMPLETED
    await prisma.marketItem.update({
      where: { id: trade.itemId },
      data: { status: "COMPLETED" }
    });

    // ==========================================
    // 🏆 游戏化引擎：发放徽章逻辑
    // ==========================================
    // 查找字典里是否有“交易完成”相关的徽章 (通过 condition 字段标识)
    const tradeBadge = await prisma.badge.findFirst({
      where: { condition: "TRADE_COMPLETED" }
    });

    if (tradeBadge) {
      // 提取双方的 userId (注意：UserBadge 关联的是 User 模型，而不是 StudentProfile)
      const userIds = [tradeData.initiator.userId, tradeData.receiver.userId];
      
      for (const uid of userIds) {
        // 使用 upsert 避免重复发放（@@unique([userId, badgeId]) 的保护机制）
        await prisma.userBadge.upsert({
          where: {
            userId_badgeId: { userId: uid, badgeId: tradeBadge.id }
          },
          update: {}, // 如果有了就不管
          create: { userId: uid, badgeId: tradeBadge.id }
        });
      }
    }

    return NextResponse.json({ message: "击掌成功！交易圆满达成 👏 (并解锁了新徽章!)" });
  } catch (error) {
    console.error("Complete trade error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}