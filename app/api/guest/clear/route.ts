import { NextResponse } from "next/server";
import { GUEST_COOKIE } from "@/lib/guest-constants";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GUEST_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
