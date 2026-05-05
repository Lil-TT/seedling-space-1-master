import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/** 家长可联系的教师（孩子所在班级的任课/班主任） */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "PARENT") {
      return NextResponse.json({ error: "仅家长可查询" }, { status: 403 });
    }

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          include: {
            class: {
              include: {
                teachers: { include: { user: { select: { id: true, name: true } } } },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "找不到家长档案" }, { status: 404 });
    }

    const map = new Map<string, { id: string; name: string | null }>();
    for (const s of parent.students) {
      const cls = s.class;
      if (!cls) continue;
      for (const t of cls.teachers) {
        map.set(t.user.id, { id: t.user.id, name: t.user.name });
      }
    }

    return NextResponse.json(Array.from(map.values()));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
