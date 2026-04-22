import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "未登录" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

        // 核心逻辑：找出所有不是我写的，且我还没回复过 (没有我的 Echo) 的瓶子
        const availableBottles = await prisma.driftBottle.findMany({
            where: {
                authorId: { not: user.id }, // 不是我写的
                echos: {
                    none: { senderId: user.id }, // 我没有给它发过回声
                },
            },
            // 为了性能，只取最新的 50 个来做随机
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                author: { select: { name: true } } // 哪怕匿名，前端也可以选择性展示“某位同学”
            }
        });

        if (availableBottles.length === 0) {
            return NextResponse.json({ error: "这片海域目前空空如也，等风来吧~" }, { status: 404 });
        }

        // 随机选一个
        const randomIndex = Math.floor(Math.random() * availableBottles.length);
        const randomBottle = availableBottles[randomIndex];

        return NextResponse.json({ bottle: randomBottle });
    } catch (error) {
        console.error("Salvage bottle error:", error);
        return NextResponse.json({ error: "捞取失败，请稍后再试" }, { status: 500 });
    }
}