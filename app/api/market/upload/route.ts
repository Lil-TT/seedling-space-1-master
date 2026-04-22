// app/api/market/upload/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "权限不足，仅学生可发布物品" }, { status: 403 });
    }

    // 接收前端新增的 selectedIcon 字段
    const { title, desc, type, selectedIcon } = await req.json();

    if (!title || !desc || !type) {
      return NextResponse.json({ error: "请填写完整的心愿信息" }, { status: 400 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: "未找到学生档案" }, { status: 404 });
    }

    // 创建市场物品
    await prisma.marketItem.create({
      data: {
        title,
        desc, // 如果你想把图标名字偷偷存在 desc 里也可以，但最好是用专门的字段
        type, 
        status: "PENDING",
        ownerId: student.id,
        // 如果你在数据库里加了 iconName，就解除下面的注释：
        iconName: selectedIcon ? `/market-icons/${selectedIcon}.png` : null
      }
    });

    return NextResponse.json({ message: "提交成功，等待老师温柔见证~" });
  } catch (error) {
    console.error("发布失败:", error);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}