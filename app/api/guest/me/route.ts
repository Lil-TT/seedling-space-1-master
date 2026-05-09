import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyGuestSession, GUEST_COOKIE } from "@/lib/guest-cookie";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE)?.value;
  const payload = token ? verifyGuestSession(token) : null;
  if (!payload) {
    return NextResponse.json({ guest: false });
  }
  const invite = await prisma.guestInvite.findUnique({
    where: { id: payload.sub },
    select: { id: true, label: true, usedAt: true },
  });
  if (!invite?.usedAt) {
    return NextResponse.json({ guest: false });
  }
  return NextResponse.json({
    guest: true,
    label: invite.label,
    inviteId: invite.id,
  });
}
