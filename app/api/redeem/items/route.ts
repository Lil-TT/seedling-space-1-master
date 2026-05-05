import { prisma } from "@/lib/prisma";
import { ensureDefaultRedeemItems } from "@/lib/redeem-defaults";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ensureDefaultRedeemItems();
    const items = await prisma.redeemableItem.findMany({
      where: { active: true },
      orderBy: { costCoins: "asc" },
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}
