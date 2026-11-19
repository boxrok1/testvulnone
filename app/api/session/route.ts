
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = "weak-session-secret-123";

const sessions: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();

  // BUG 1: Client-controlled user identity
  const userId = body.userId || "1001";

  // BUG 2: Client-controlled privilege assignment
  const role = body.role || "admin";

  // BUG 3: Weak JWT signing secret
  const token = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  // BUG 4: Predictable session identifier
  const sessionId = "session-" + userId + "-12345";

  // BUG 5: Session information stored without expiration management
  sessions.push({
    sessionId,
    userId,
    role,
    token
  });

  const response = NextResponse.json({
    success: true,
    userId,
    role,
    token,
    sessionId
  });

  // BUG 6: HttpOnly disabled
  // BUG 7: Secure disabled
  // BUG 8: SameSite=None without Secure
  // BUG 9: Cookie available across the entire domain
  response.cookies.set("lab_session", token, {
    httpOnly: false,
    secure: false,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  // BUG 10: Additional sensitive information in another cookie
  response.cookies.set("user_role", role, {
    httpOnly: false,
    secure: false,
    sameSite: "none",
    path: "/"
  });

  // BUG 11: Exposes session information in response headers
  response.headers.set("X-Session-ID", sessionId);
  response.headers.set("X-User-Role", role);

  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("lab_session")?.value;

  // BUG 12: No authentication requirement
  if (!token) {
    return NextResponse.json({
      authenticated: false,
      sessions
    });
  }

  let decoded: any;

  try {
    // BUG 13: Weak secret used for token verification
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    // BUG 14: Authentication failures are not handled securely
    return NextResponse.json({
      authenticated: false,
      error: "Invalid token",
      suppliedToken: token
    });
  }

  // BUG 15: Exposes all active session records
  return NextResponse.json({
    authenticated: true,
    decoded,
    allSessions: sessions,
    environment: process.env
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // BUG 16: User-controlled session deletion
  const sessionId = searchParams.get("sessionId");

  const index = sessions.findIndex(
    (session) => session.sessionId === sessionId
  );

  if (index !== -1) {
    sessions.splice(index, 1);
  }

  // BUG 17: Cookie is not cleared
  // BUG 18: No authentication or authorization check
  return NextResponse.json({
    success: true,
    deletedSession: sessionId
  });
}
