// app/api/register/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role, classId, classIds, childEmail, gradeLevel } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "必填项缺失" }, { status: 400 });
    }

    // 1. 检查邮箱是否已占用
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
    }

    // 2. 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 使用 Prisma 事务保证原子性（要么全成功，要么全失败）
    const result = await prisma.$transaction(async (tx) => {
      // 创建基础用户
      const user = await tx.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
          // 建议在 User 模型添加 password String? 字段。
        }
      });

      // 根据角色处理档案
      if (role === "STUDENT") {
        const gl =
          gradeLevel === undefined || gradeLevel === null || gradeLevel === ""
            ? null
            : Number(gradeLevel);
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            classId: classId || null,
            seed: Math.random(),
            gradeLevel:
              gl != null && !isNaN(gl) ? Math.min(12, Math.max(1, gl)) : null,
          }
        });
      } 
      else if (role === "TEACHER") {
        await tx.teacherProfile.create({
          data: {
            userId: user.id,
            classes: {
              connect: classIds?.map((id: string) => ({ id })) || []
            }
          }
        });
      } 
      else if (role === "PARENT") {
        // 家长绑定逻辑：校验孩子是否存在
        const studentUser = await tx.user.findUnique({
          where: { email: childEmail },
          include: { studentProfile: true }
        });

        if (!studentUser || !studentUser.studentProfile) {
          throw new Error("找不到对应的孩子信息，请检查邮箱是否正确");
        }

        const parent = await tx.parentProfile.create({
          data: { userId: user.id }
        });

        // 反向绑定：更新孩子的 parentId
        await tx.studentProfile.update({
          where: { id: studentUser.studentProfile.id },
          data: { parentId: parent.id }
        });
      }

      return user;
    });

    return NextResponse.json({ message: "注册成功", userId: result.id });
  } catch (error: any) {
    console.error("注册错误:", error);
    return NextResponse.json({ error: error.message || "注册过程出错" }, { status: 500 });
  }
}