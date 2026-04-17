// app/api/classes/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "获取班级失败" }, { status: 500 });
  }
}