// app/api/market/approved/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await prisma.marketItem.findMany({
      where: { status: "APPROVED" },
      include: { owner: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}