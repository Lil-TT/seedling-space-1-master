import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** 教室一体机：返回班级列表（仅 id + name） */
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json(classes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "读取班级失败" }, { status: 500 });
  }
}
