import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ensureDefaultRedeemItems } from "@/lib/redeem-defaults";

/** 首页大卡片区：公开可展示的活动 / 市场 / 兑换摘要（无敏感字段） */
export async function GET() {
  try {
    await ensureDefaultRedeemItems();

    const [activities, marketItems, redeemItems] = await Promise.all([
      prisma.activity.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          reward: true,
          kind: true,
        },
      }),
      prisma.marketItem.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
        },
      }),
      prisma.redeemableItem.findMany({
        where: { active: true },
        orderBy: { costCoins: "asc" },
        take: 4,
        select: {
          title: true,
          costCoins: true,
          iconEmoji: true,
        },
      }),
    ]);

    return NextResponse.json({ activities, marketItems, redeemItems });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "读取预览失败" }, { status: 500 });
  }
}
