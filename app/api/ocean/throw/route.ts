import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // 假设你的 auth 配置在这里
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { content, isAnonymous = true } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "瓶子里不能空着哦！" }, { status: 400 });
    }

    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    // 创建漂流瓶
    const bottle = await prisma.driftBottle.create({
      data: {
        content,
        isAnonymous,
        authorId: user.id,
      },
    });

    return NextResponse.json({ message: "扔出成功！", bottle });
  } catch (error) {
    console.error("Throw bottle error:", error);
    return NextResponse.json({ error: "海洋似乎遇到了一点风浪..." }, { status: 500 });
  }
}