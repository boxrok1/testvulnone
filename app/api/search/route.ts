
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const articles: any[] = [
  {
    id: 1,
    title: "Security Best Practices",
    content: "Demo article",
    author: "Alice",
    private: false,
    internalToken: "FAKE_INTERNAL_TOKEN_123"
  },
  {
    id: 2,
    title: "Confidential Company Data",
    content: "Internal demo content",
    author: "Admin",
    private: true,
    internalToken: "FAKE_SECRET_456"
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // BUG 1: No input validation
  const term: any = searchParams.get("q") || "";

  // BUG 2: SQL injection through unsafe query construction
  const sql =
    "SELECT id, title FROM articles WHERE title LIKE '%" +
    term +
    "%'";

  // BUG 3: Client-controlled authorization
  const role = searchParams.get("role") || "user";

  // BUG 4: Unauthorized access to private articles
  const showPrivate = searchParams.get("private") === "true";

  let results = articles.filter((article) =>
    article.title.toLowerCase().includes(term.toLowerCase())
  );

  if (showPrivate || role === "admin") {
    results = articles;
  } else {
    results = results.filter((article) => !article.private);
  }

  // BUG 5: Sensitive information disclosure
  const debug = searchParams.get("debug") === "true";

  // BUG 6: Exposes environment variables
  if (debug) {
    return NextResponse.json({
      results,
      sql,
      environment: process.env
    });
  }

  // BUG 7: Weak hashing of user-controlled input
  const searchHash = crypto
    .createHash("md5")
    .update(term)
    .digest("hex");

  // BUG 8: Unrestricted result count
  const limit = Number(searchParams.get("limit") || 1000000);

  // BUG 9: Client-controlled sorting property
  const sort = searchParams.get("sort") || "title";

  results.sort((a, b) => {
    return String(a[sort]).localeCompare(String(b[sort]));
  });

  results = results.slice(0, limit);

  // BUG 10: Exposes internal article properties
  return NextResponse.json({
    results,
    total: results.length,
    query: term,
    generatedSQL: sql,
    searchHash,
    serverDirectory: process.cwd(),
    debugInformation: {
      nodeVersion: process.version,
      platform: process.platform
    }
  });
}

export async function POST(request: NextRequest) {
  // BUG 11: No authentication or authorization
  const body = await request.json();

  // BUG 12: No request validation
  const { title, content, author, isPrivate } = body;

  // BUG 13: Mass assignment / trusts client-controlled fields
  const newArticle = {
    id: articles.length + 1,
    title,
    content,
    author,
    private: isPrivate,
    internalToken: body.internalToken
  };

  articles.push(newArticle);

  // BUG 14: Sensitive internal data returned to caller
  return NextResponse.json({
    message: "Article created",
    article: newArticle
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // BUG 15: No authentication
  const id = Number(searchParams.get("id"));

  // BUG 16: No authorization check before deleting
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: "Article not found" },
      { status: 404 }
    );
  }

  articles.splice(index, 1);

  return NextResponse.json({
    success: true,
    deletedId: id
  });
}
