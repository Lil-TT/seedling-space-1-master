import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashGuestToken } from "@/lib/guest-token";
import {
  signGuestSession,
  GUEST_COOKIE,
  GUEST_SESSION_MAX_AGE_SEC,
} from "@/lib/guest-cookie";

export async function POST(req: Request) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const raw = (body.token || "").trim();
  if (!raw || raw.length < 8) {
    return NextResponse.json({ error: "请填写有效入场口令" }, { status: 400 });
  }
  const tokenHash = hashGuestToken(raw);

  const result = await prisma.$transaction(async (tx) => {
    const invite = await tx.guestInvite.findUnique({ where: { tokenHash } });
    if (!invite) return { err: "口令不存在或已失效" as const, code: 404 as const };
    if (invite.usedAt) return { err: "该口令已使用过（一次性）" as const, code: 410 as const };
    if (invite.expiresAt < new Date()) return { err: "口令已过期" as const, code: 410 as const };
    await tx.guestInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
    return { invite } as const;
  });

  if ("err" in result) {
    return NextResponse.json({ error: result.err }, { status: result.code });
  }

  const { invite } = result;
  const exp = Math.floor(Date.now() / 1000) + GUEST_SESSION_MAX_AGE_SEC;
  const signed = signGuestSession({ sub: invite.id, exp });

  const res = NextResponse.json({
    ok: true,
    label: invite.label,
  });
  res.cookies.set(GUEST_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_SESSION_MAX_AGE_SEC,
  });
  return res;
}
