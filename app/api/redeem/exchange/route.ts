import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "仅学生可兑换" }, { status: 403 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: "缺少商品" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.studentProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!student) throw new Error("找不到学生档案");

      const item = await tx.redeemableItem.findFirst({
        where: { id: itemId, active: true },
      });
      if (!item) throw new Error("商品不存在或已下架");
      if (item.stock != null && item.stock <= 0) throw new Error("库存不足");

      if (student.coins < item.costCoins) {
        throw new Error("情绪币不足");
      }

      await tx.studentProfile.update({
        where: { id: student.id },
        data: { coins: { decrement: item.costCoins } },
      });

      if (item.stock != null) {
        await tx.redeemableItem.update({
          where: { id: item.id },
          data: { stock: { decrement: 1 } },
        });
      }

      await tx.redemption.create({
        data: {
          studentId: student.id,
          itemId: item.id,
          coinsSpent: item.costCoins,
        },
      });

      const updated = await tx.studentProfile.findUnique({
        where: { id: student.id },
        select: { coins: true },
      });

      return { item, coins: updated?.coins ?? 0 };
    });

    return NextResponse.json({
      message: `兑换成功：${result.item.title}`,
      coins: result.coins,
    });
  } catch (e: any) {
    const msg = e?.message || "兑换失败";
    if (msg === "找不到学生档案") {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (
      msg === "商品不存在或已下架" ||
      msg === "库存不足" ||
      msg === "情绪币不足"
    ) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
