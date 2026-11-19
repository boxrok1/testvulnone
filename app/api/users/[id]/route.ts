
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const users: any[] = [
  {
    id: "1001",
    name: "Demo Alice",
    email: "alice@example.invalid",
    password: "AlicePassword123",
    role: "admin",
    privateNote: "internal-demo-note",
    apiKey: "FAKE_ALICE_API_KEY_12345"
  },
  {
    id: "1002",
    name: "Demo Bob",
    email: "bob@example.invalid",
    password: "BobPassword123",
    role: "user",
    privateNote: "another-internal-note",
    apiKey: "FAKE_BOB_API_KEY_67890"
  }
];

// Intentionally weak signing secret
const JWT_SECRET = "secret123";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);

  // BUG 1: No authentication
  const userId = context.params.id;

  // BUG 2: IDOR - any user can access another user's information
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  // BUG 3: Exposes sensitive information
  const includeSecrets = searchParams.get("debug") === "true";

  // BUG 4: JWT verification with weak secret
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  let decoded: any = null;

  if (token) {
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      decoded = null;
    }
  }

  // BUG 5: Trusts client-controlled role parameter
  const role = searchParams.get("role") || "user";

  // BUG 6: Privilege escalation through role manipulation
  if (role === "admin") {
    return NextResponse.json(users);
  }

  // BUG 7: Debug mode leaks passwords and API keys
  if (includeSecrets) {
    return NextResponse.json({
      user,
      jwtPayload: decoded,
      environment: process.env
    });
  }

  // BUG 8: Unsafe dynamic file path construction
  const filename = searchParams.get("file");

  if (filename) {
    const filePath = path.join(process.cwd(), "public", filename);

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");

      return NextResponse.json({
        user,
        fileContent
      });
    } catch {
      return NextResponse.json({ error: "File error" });
    }
  }

  // BUG 9: Unnecessary sensitive information disclosure
  return NextResponse.json({
    user,
    serverTime: new Date().toISOString(),
    serverPath: process.cwd(),
    authenticated: Boolean(decoded)
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // BUG 10: No authentication or authorization
  const userId = context.params.id;

  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return NextResponse.json({ error: "User not found" });
  }

  // BUG 11: Arbitrary user deletion
  users.splice(index, 1);

  return NextResponse.json({
    success: true,
    deletedUser: userId
  });
}
