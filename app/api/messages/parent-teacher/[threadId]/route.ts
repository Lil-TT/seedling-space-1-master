import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { threadId } = await ctx.params;

    const thread = await prisma.parentTeacherThread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const allowed =
      thread.parentUserId === session.user.id ||
      thread.teacherUserId === session.user.id;

    if (!allowed) {
      return NextResponse.json({ error: "无权查看" }, { status: 403 });
    }

    return NextResponse.json(thread);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
