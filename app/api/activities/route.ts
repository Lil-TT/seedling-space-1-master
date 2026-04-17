// app/api/activities/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 查出所有开放中的任务，以及已经接取了这些任务的学生记录
    const activities = await prisma.activity.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        participants: {
          include: {
            student: { include: { user: true } }
          }
        }
      }
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "获取活动列表失败" }, { status: 500 });
  }
}