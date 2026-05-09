// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        studentProfileId: { label: "StudentProfileId", type: "text" },
        rosterPin: { label: "RosterPin", type: "password" },
      },
      async authorize(credentials) {
        const rosterId = credentials?.studentProfileId?.trim();
        const rosterPin = credentials?.rosterPin ?? "";

        if (rosterId) {
          const sp = await prisma.studentProfile.findUnique({
            where: { id: rosterId },
            include: { user: true },
          });

          if (!sp?.user || sp.user.role !== "STUDENT") {
            throw new Error("找不到这位同学哦");
          }

          const defaultPin = process.env.DEFAULT_ROSTER_PIN?.trim() || "1234";

          if (sp.rosterPinHash) {
            const ok = await bcrypt.compare(rosterPin, sp.rosterPinHash);
            if (!ok) throw new Error("口令不对，问问老师～");
          } else {
            if (rosterPin !== defaultPin) {
              throw new Error("口令不对，问问老师～");
            }
          }

          return {
            id: sp.user.id,
            email: sp.user.email,
            name: sp.user.name,
            role: sp.user.role,
          };
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("未找到该用户，请先注册");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("密码错误");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
