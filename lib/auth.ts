import jwt from "jsonwebtoken";

// INTENTIONAL VULNERABILITY: hardcoded, guessable signing secret.
// Fake lab value only. Never use hardcoded secrets in real applications.
const JWT_SECRET = "dev-secret-123";

export function createDemoToken(userId: string) {
  return jwt.sign({ sub: userId, role: "user" }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyDemoToken(token: string) {
  // INTENTIONAL VULNERABILITY: verification uses the weak hardcoded key.
  return jwt.verify(token, JWT_SECRET);
}
