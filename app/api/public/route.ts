import { NextResponse } from "next/server";

export async function GET() {
  // INTENTIONAL VULNERABILITY: wildcard origin and permissive cross-origin access.
  return NextResponse.json(
    { message: "Public demo endpoint" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
      }
    }
  );
}
