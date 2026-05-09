import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyGuestSession, GUEST_COOKIE } from "@/lib/guest-cookie";

export type GuestSession = {
  inviteId: string;
  label: string | null;
};

export async function getGuestSession(): Promise<GuestSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE)?.value;
  const payload = token ? verifyGuestSession(token) : null;
  if (!payload) return null;
  const invite = await prisma.guestInvite.findUnique({
    where: { id: payload.sub },
    select: { id: true, label: true, usedAt: true },
  });
  if (!invite?.usedAt) return null;
  return { inviteId: invite.id, label: invite.label };
}
