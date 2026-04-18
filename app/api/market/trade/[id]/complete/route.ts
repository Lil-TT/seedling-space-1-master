// app/api/market/trade/[id]/complete/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // 1. 将交易状态更新为 COMPLETED
    const trade = await prisma.trade.update({
      where: { id: resolvedParams.id },
      data: { status: "COMPLETED" }
    });

    // 2. 同步将对应的市场物品状态更新为 COMPLETED（这样它就会在市场里显示被换走了）
    await prisma.marketItem.update({
      where: { id: trade.itemId },
      data: { status: "COMPLETED" }
    });

    return NextResponse.json({ message: "击掌成功！交易圆满达成 👏" });
  } catch (error) {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}