// app/api/market/trade/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // 权限校验
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "只有学生可以发起交换请求" }, { status: 403 });
    }

    const { itemId } = await req.json();
    const initiatorUserId = session.user.id;

    // 1. 获取发起者的学生档案
    const initiator = await prisma.studentProfile.findUnique({
      where: { userId: initiatorUserId }
    });

    // 2. 获取目标物品信息
    const targetItem = await prisma.marketItem.findUnique({
      where: { id: itemId },
      include: { owner: true }
    });

    if (!targetItem || !initiator) {
      return NextResponse.json({ error: "物品或用户信息不存在" }, { status: 404 });
    }

    // 3. 安全校验：不能跟自己的物品交换
    if (targetItem.ownerId === initiator.id) {
      return NextResponse.json({ error: "这是你自己的心愿，去看看别人的吧~" }, { status: 400 });
    }

    // 4. 幂等校验：检查是否已经存在针对该物品的活跃交易（防止连点）
    const existingTrade = await prisma.trade.findFirst({
      where: {
        itemId: itemId,
        initiatorId: initiator.id,
        status: "PENDING"
      }
    });

    if (existingTrade) {
      return NextResponse.json({ error: "请求已发送，请等待对方回应" }, { status: 400 });
    }

    // 5. 创建交易记录
    const trade = await prisma.trade.create({
      data: {
        itemId: itemId,
        initiatorId: initiator.id,
        receiverId: targetItem.ownerId,
        status: "PENDING"
      }
    });

    return NextResponse.json({ 
      message: "请求已送达！去‘我的市场’看看进度吧",
      tradeId: trade.id 
    });

  } catch (error) {
    console.error("发起交换失败:", error);
    return NextResponse.json({ error: "系统繁忙，请稍后再试" }, { status: 500 });
  }
}