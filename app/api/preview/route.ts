import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) return NextResponse.json({ error: "url is required" }, { status: 400 });

  // INTENTIONAL VULNERABILITY: server fetches an untrusted URL.
  // This can enable SSRF against internal services if deployed in a reachable environment.
  try {
    const response = await fetch(target, { cache: "no-store" });
    const body = await response.text();
    return NextResponse.json({ status: response.status, preview: body.slice(0, 500) });
  } catch {
    return NextResponse.json({ error: "Could not fetch URL" }, { status: 502 });
  }
}
