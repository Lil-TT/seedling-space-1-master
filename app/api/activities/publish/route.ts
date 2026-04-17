// app/api/activities/publish/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // 权限守卫：只有老师和家长可以发悬赏
    if (!session?.user || (userRole !== "TEACHER" && userRole !== "PARENT")) {
      return NextResponse.json({ error: "权限不足，仅老师或家长可发布活动" }, { status: 403 });
    }

    const { title, desc, reward } = await req.json();

    if (!title || !reward || isNaN(Number(reward))) {
      return NextResponse.json({ error: "标题和赏金不能为空哦" }, { status: 400 });
    }

    // 创建活动
    const newActivity = await prisma.activity.create({
      data: {
        title,
        desc: desc || "",
        reward: Number(reward),
        initiatorId: session.user.id, // 记录是谁发的
        status: "OPEN"
      }
    });

    return NextResponse.json({ message: "悬赏发布成功！", activity: newActivity });
  } catch (error) {
    console.error("发布活动失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}