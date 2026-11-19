import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "welcome.txt";

  // INTENTIONAL VULNERABILITY: user-controlled path is joined without containment validation.
  const requestedPath = path.join(process.cwd(), "public", "uploads", name);

  try {
    const contents = await readFile(requestedPath, "utf8");
    return new NextResponse(contents, { headers: { "content-type": "text/plain" } });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
