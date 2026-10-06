import { NextResponse } from "next/server";
import { COOKIE_NAME, signToken } from "@/lib/jwt";
import type { User } from "@/db";

export async function sessionResponse(user: User, body: object, status = 200) {
  const token = await signToken({ userId: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName });
  const res = NextResponse.json(body, { status });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
