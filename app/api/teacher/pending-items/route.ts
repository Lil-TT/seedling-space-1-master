// app/api/teacher/pending-items/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "TEACHER") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { classes: { include: { students: true } } }
  });

  const studentIds = teacher?.classes.flatMap(c => c.students.map(s => s.id)) || [];

  const items = await prisma.marketItem.findMany({
    where: {
      ownerId: { in: studentIds },
      status: "PENDING"
    },
    include: { owner: { include: { user: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(items);
}