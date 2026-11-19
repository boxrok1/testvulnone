import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q") || "";

  // INTENTIONAL VULNERABILITY PATTERN: unsafe SQL string construction.
  // Kept as a string-building example; no database is connected or queried.
  const sql = "SELECT id, title FROM articles WHERE title LIKE '%" + term + "%'";

  return NextResponse.json({
    query: term,
    generatedQuery: sql,
    note: "Lab demonstration only; query is not executed."
  });
}
