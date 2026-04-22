import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const { bottleId, content } = await req.json();

        if (!bottleId || !content) {
            return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
        }

        // 获取当前用户及其档案(为了查余额)
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { studentProfile: true }
        });

        if (!currentUser || !currentUser.studentProfile) {
            return NextResponse.json({ error: "仅限学生身份参与" }, { status: 403 });
        }

        if (currentUser.studentProfile.coins < 1) {
            return NextResponse.json({ error: "你的情绪币不足哦！" }, { status: 400 });
        }

        // 获取这个瓶子的主人信息
        const bottle = await prisma.driftBottle.findUnique({
            where: { id: bottleId },
            include: { author: { include: { studentProfile: true } } }
        });

        if (!bottle) {
            return NextResponse.json({ error: "瓶子已经漂远啦~" }, { status: 404 });
        }

        // 🚀 核心事务操作 (Transaction)：要么全成功，要么全失败
        const transaction = await prisma.$transaction([
            // 1. 扣除发送者的情绪币
            prisma.studentProfile.update({
                where: { id: currentUser.studentProfile.id },
                data: { coins: { decrement: 1 } }
            }),

            // 2. 创建回声记录
            prisma.echo.create({
                data: {
                    content,
                    costCoins: 1,
                    senderId: currentUser.id,
                    bottleId: bottle.id,
                }
            }),

            // 3. (可选) 给瓶子的主人增加 1 个情绪币作为心理慰藉
            ...(bottle.author.studentProfile ? [
                prisma.studentProfile.update({
                    where: { id: bottle.author.studentProfile.id },
                    data: { coins: { increment: 1 } }
                })
            ] : [])
        ]);

        return NextResponse.json({ message: "抱抱传递成功！", echo: transaction[1] });
    } catch (error) {
        console.error("Send echo error:", error);
        return NextResponse.json({ error: "回声传递失败，请稍后再试" }, { status: 500 });
    }
}