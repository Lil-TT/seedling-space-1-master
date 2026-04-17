// app/api/teacher/approve-item/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { itemId, action } = await req.json(); // action: 'APPROVE' or 'REJECT'
  
  const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  
  await prisma.marketItem.update({
    where: { id: itemId },
    data: { status }
  });

  return NextResponse.json({ message: "操作成功" });
}