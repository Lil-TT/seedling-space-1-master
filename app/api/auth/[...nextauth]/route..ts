// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // 确保你之前已经按照上一步创建了 lib/auth.ts

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };