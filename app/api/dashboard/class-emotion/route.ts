import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** 将灵感分数 -10..10 转为 0..100，越高越积极 */
function scoreFromEmotion(emotionScore: number) {
  return clamp(((emotionScore + 10) / 20) * 100, 0, 100);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "仅老师可查看" }, { status: 403 });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        classes: {
          include: {
            students: { select: { id: true } },
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "找不到老师档案" }, { status: 404 });
    }

    const studentIds = teacher.classes.flatMap((c) =>
      c.students.map((s) => s.id)
    );

    const since = new Date();
    since.setDate(since.getDate() - 60);

    const allStudentIds = (
      await prisma.studentProfile.findMany({ select: { id: true } })
    ).map((s) => s.id);

    const [inClassInspire, inClassConfess, gradeInspire, gradeConfess] =
      await Promise.all([
        prisma.inspiration.findMany({
          where: { studentId: { in: studentIds }, createdAt: { gte: since } },
          select: { emotionScore: true, emotionTags: true },
        }),
        prisma.confession.findMany({
          where: { studentId: { in: studentIds }, createdAt: { gte: since } },
          select: { sentiment: true },
        }),
        prisma.inspiration.findMany({
          where: { studentId: { in: allStudentIds }, createdAt: { gte: since } },
          select: { emotionScore: true, emotionTags: true },
        }),
        prisma.confession.findMany({
          where: { studentId: { in: allStudentIds }, createdAt: { gte: since } },
          select: { sentiment: true },
        }),
      ]);

    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN;

    const classEmotionStable = !isNaN(
      avg(inClassInspire.map((i) => scoreFromEmotion(i.emotionScore)))
    )
      ? avg(inClassInspire.map((i) => scoreFromEmotion(i.emotionScore)))
      : 58;

    const gradeEmotionStable = !isNaN(
      avg(gradeInspire.map((i) => scoreFromEmotion(i.emotionScore)))
    )
      ? avg(gradeInspire.map((i) => scoreFromEmotion(i.emotionScore)))
      : 58;

    const classStress = !isNaN(
      avg(inClassConfess.map((c) => (1 - c.sentiment) * 100))
    )
      ? avg(inClassConfess.map((c) => (1 - c.sentiment) * 100))
      : 52;

    const gradeStress = !isNaN(
      avg(gradeConfess.map((c) => (1 - c.sentiment) * 100))
    )
      ? avg(gradeConfess.map((c) => (1 - c.sentiment) * 100))
      : 52;

    const tagBoost = (tags: string[], needle: string) =>
      tags.some((t) => t.includes(needle)) ? 8 : 0;

    const peerClassExtras = inClassInspire.map((i) =>
      tagBoost(i.emotionTags || [], "朋友") +
      tagBoost(i.emotionTags || [], "同伴")
    );
    const peerClass =
      68 + (peerClassExtras.length ? avg(peerClassExtras) : 0);

    const peerGradeExtras = gradeInspire.map((i) =>
      tagBoost(i.emotionTags || [], "朋友") +
      tagBoost(i.emotionTags || [], "同伴")
    );
    const peerGrade =
      68 + (peerGradeExtras.length ? avg(peerGradeExtras) : 0);

    const selfClass =
      !isNaN(
        avg(
          inClassInspire.map((i) =>
            clamp(50 + i.emotionScore * 4, 25, 92)
          )
        )
      )
      ? avg(
          inClassInspire.map((i) =>
            clamp(50 + i.emotionScore * 4, 25, 92)
          )
        )
      : 62;

    const selfGrade =
      !isNaN(
        avg(
          gradeInspire.map((i) =>
            clamp(50 + i.emotionScore * 4, 25, 92)
          )
        )
      )
      ? avg(
          gradeInspire.map((i) =>
            clamp(50 + i.emotionScore * 4, 25, 92)
          )
        )
      : 62;

    const ruleClass =
      72 +
      (inClassConfess.length ? clamp(15 - inClassConfess.length / 3, -10, 12) : 0);
    const ruleGrade =
      72 +
      (gradeConfess.length ? clamp(15 - gradeConfess.length / 8, -10, 12) : 0);

    const radarData = [
      {
        dimension: "学业压力",
        classScore: Math.round(clamp(classStress, 15, 95)),
        gradeAvg: Math.round(clamp(gradeStress, 15, 95)),
        fullMark: 100,
      },
      {
        dimension: "同伴关系",
        classScore: Math.round(clamp(peerClass, 20, 98)),
        gradeAvg: Math.round(clamp(peerGrade, 20, 98)),
        fullMark: 100,
      },
      {
        dimension: "自我效能",
        classScore: Math.round(clamp(selfClass, 20, 98)),
        gradeAvg: Math.round(clamp(selfGrade, 20, 98)),
        fullMark: 100,
      },
      {
        dimension: "规则意识",
        classScore: Math.round(clamp(ruleClass, 25, 95)),
        gradeAvg: Math.round(clamp(ruleGrade, 25, 95)),
        fullMark: 100,
      },
      {
        dimension: "情绪稳定",
        classScore: Math.round(clamp(classEmotionStable, 20, 98)),
        gradeAvg: Math.round(clamp(gradeEmotionStable, 20, 98)),
        fullMark: 100,
      },
    ];

    return NextResponse.json({
      radarData,
      sampleSize: {
        classInspirations: inClassInspire.length,
        classConfessions: inClassConfess.length,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "系统错误" }, { status: 500 });
  }
}
