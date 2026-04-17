// app/api/student/respond-trade/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tradeId, action } = await req.json(); // action: 'ACCEPT' or 'REJECT'
    
    // 1. 更新交易状态
    const status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    
    const trade = await prisma.trade.update({
      where: { id: tradeId },
      data: { status }
    });

    // 2. 如果接受了交易，同步更新物品状态为 TRADING (锁定物品)
    if (action === 'ACCEPT') {
      await prisma.marketItem.update({
        where: { id: trade.itemId },
        data: { status: "TRADING" }
      });
    }

    return NextResponse.json({ message: action === 'ACCEPT' ? "已接受请求，快去联系对方吧！" : "已婉拒该请求" });
  } catch (error) {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}