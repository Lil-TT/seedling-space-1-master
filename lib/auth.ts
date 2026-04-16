// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // @ts-ignore (跳过由于跳过 generate 导致的类型报错)
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // 使用 JWT 策略，非常适合 Vercel 等 Serverless 部署
  },
  providers: [
    CredentialsProvider({
      name: "测试账号登录",
      credentials: {
        email: { label: "邮箱 (如: teacher@test.com)", type: "email" },
        password: { label: "密码 (随便填)", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // 1. 在数据库中查找该用户
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 2. [仅供测试] 如果用户不存在，我们直接帮他自动注册一个！
        // 实际生产环境中这里应该校验密码并 return null
        if (!user) {
          // 根据测试邮箱的后缀自动分配角色体验
          let role = "STUDENT";
          if (credentials.email.includes("teacher")) role = "TEACHER";
          if (credentials.email.includes("parent")) role = "PARENT";
          if (credentials.email.includes("admin")) role = "SUPER_ADMIN";

          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              // @ts-ignore
              role: role 
            }
          });
        }

        return user;
      }
    })
  ],
  callbacks: {
    // 将数据库中的 Role 角色注入到 JWT Token 中
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role; 
        token.id = user.id;
      }
      return token;
    },
    // 将 Token 中的角色暴露给前端 Session
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    // 稍后我们可以自己写一个炫酷的登录页替换这里
    // signIn: '/login', 
  }
};