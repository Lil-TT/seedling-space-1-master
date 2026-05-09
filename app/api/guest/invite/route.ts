import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGuestRawToken, hashGuestToken } from "@/lib/guest-token";

export async function POST(req: Request) {
  const key = req.headers.get("x-guest-invite-admin-key");
  if (!key || !process.env.GUEST_INVITE_ADMIN_KEY || key !== process.env.GUEST_INVITE_ADMIN_KEY) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  let body: { label?: string; daysValid?: number };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const days = Math.min(Math.max(Number(body.daysValid) || 30, 1), 90);
  const raw = generateGuestRawToken();
  const tokenHash = hashGuestToken(raw);
  const expiresAt = new Date(Date.now() + days * 86400000);

  await prisma.guestInvite.create({
    data: {
      tokenHash,
      label: body.label?.trim() || null,
      expiresAt,
    },
  });

  const origin = new URL(req.url).origin;
  return NextResponse.json({
    token: raw,
    url: `${origin}/guest?t=${encodeURIComponent(raw)}`,
    expiresAt: expiresAt.toISOString(),
  });
}
