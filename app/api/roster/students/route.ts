import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** 花名册：按班级列出学生展示名（不含邮箱） */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    if (!classId) {
      return NextResponse.json({ error: "缺少 classId" }, { status: 400 });
    }

    const students = await prisma.studentProfile.findMany({
      where: { classId },
      orderBy: { user: { name: "asc" } },
      select: {
        id: true,
        user: { select: { name: true } },
      },
    });

    const list = students.map((s) => ({
      studentProfileId: s.id,
      name: s.user?.name || "同学",
    }));

    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "读取花名册失败" }, { status: 500 });
  }
}
