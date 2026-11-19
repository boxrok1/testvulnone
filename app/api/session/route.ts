import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // INTENTIONAL VULNERABILITY: cookie lacks HttpOnly, Secure, and SameSite protections.
  response.cookies.set("lab_session", "demo-session-token", {
    httpOnly: false,
    secure: false,
    sameSite: "none",
    path: "/"
  });
  return response;
}
