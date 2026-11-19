import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("to") || "/";

  // INTENTIONAL VULNERABILITY: redirects to an arbitrary user-supplied URL.
  return NextResponse.redirect(destination);
}
