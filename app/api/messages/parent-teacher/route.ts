import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "PARENT" && role !== "TEACHER") {
      return NextResponse.json({ error: "无权查看" }, { status: 403 });
    }

    const threads =
      role === "PARENT"
        ? await prisma.parentTeacherThread.findMany({
            where: { parentUserId: session.user.id },
            orderBy: { updatedAt: "desc" },
            include: {
              teacherUser: { select: { id: true, name: true } },
              parentUser: { select: { id: true, name: true } },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              student: { include: { user: { select: { name: true } } } },
            },
          })
        : await prisma.parentTeacherThread.findMany({
            where: { teacherUserId: session.user.id },
            orderBy: { updatedAt: "desc" },
            include: {
              teacherUser: { select: { id: true, name: true } },
              parentUser: { select: { id: true, name: true } },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              student: { include: { user: { select: { name: true } } } },
            },
          });

    return NextResponse.json(threads);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "PARENT" && role !== "TEACHER") {
      return NextResponse.json({ error: "无权发送" }, { status: 403 });
    }

    const body = await req.json();
    const { content, threadId, teacherUserId, parentUserId, studentProfileId } =
      body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    let thread = threadId
      ? await prisma.parentTeacherThread.findUnique({
          where: { id: threadId },
        })
      : null;

    if (threadId && !thread) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    if (!thread) {
      if (role === "PARENT") {
        if (!teacherUserId) {
          return NextResponse.json({ error: "请选择老师" }, { status: 400 });
        }

        if (studentProfileId) {
          const ok = await prisma.studentProfile.findFirst({
            where: {
              id: studentProfileId,
              parent: { userId: session.user.id },
            },
          });
          if (!ok) {
            return NextResponse.json({ error: "孩子绑定无效" }, { status: 403 });
          }
        }

        thread = await prisma.parentTeacherThread.upsert({
          where: {
            parentUserId_teacherUserId: {
              parentUserId: session.user.id,
              teacherUserId,
            },
          },
          create: {
            parentUserId: session.user.id,
            teacherUserId,
            studentId: studentProfileId || null,
          },
          update: {
            studentId: studentProfileId || undefined,
          },
        });
      } else {
        if (!parentUserId) {
          return NextResponse.json({ error: "缺少家长账号" }, { status: 400 });
        }

        const taught = await prisma.teacherProfile.findFirst({
          where: {
            userId: session.user.id,
            classes: { some: { students: { some: { parent: { userId: parentUserId } } } } },
          },
        });

        if (!taught) {
          return NextResponse.json(
            { error: "仅能联系您班级家长" },
            { status: 403 }
          );
        }

        thread = await prisma.parentTeacherThread.upsert({
          where: {
            parentUserId_teacherUserId: {
              parentUserId,
              teacherUserId: session.user.id,
            },
          },
          create: {
            parentUserId,
            teacherUserId: session.user.id,
            studentId: studentProfileId || null,
          },
          update: {
            studentId: studentProfileId || undefined,
          },
        });
      }
    }

    if (!thread) {
      return NextResponse.json({ error: "无法创建会话" }, { status: 500 });
    }

    const allowed =
      thread.parentUserId === session.user.id ||
      thread.teacherUserId === session.user.id;

    if (!allowed) {
      return NextResponse.json({ error: "无权在此会话发言" }, { status: 403 });
    }

    await prisma.parentTeacherMessage.create({
      data: {
        threadId: thread.id,
        senderUserId: session.user.id,
        content: content.trim(),
      },
    });

    await prisma.parentTeacherThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, threadId: thread.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
