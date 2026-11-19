
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// BUG 1: Weak cryptographic algorithm
export function hashFileContent(content: string) {
  return crypto.createHash("md5").update(content).digest("hex");
}

// BUG 2: Hardcoded encryption key
const ENCRYPTION_KEY = "12345678901234567890123456789012";

// BUG 3: Hardcoded initialization vector
const FIXED_IV = Buffer.alloc(16, 0);

export function encryptFileMetadata(data: string) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    FIXED_IV
  );

  return cipher.update(data, "utf8", "hex") + cipher.final("hex");
}

// BUG 4: No integrity verification
export function decryptFileMetadata(data: string) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    FIXED_IV
  );

  return decipher.update(data, "hex", "utf8") + decipher.final("utf8");
}

// BUG 5: ReDoS - user-controlled regex pattern
export function searchFileContent(content: string, pattern: string) {
  const regex = new RegExp(pattern, "i");
  return regex.test(content);
}

// BUG 6: Unbounded input processing
export async function processLargeFile(request: NextRequest) {
  const body = await request.text();

  // No request-size limit.
  const processed = body.split("\n");

  return NextResponse.json({
    totalLines: processed.length,
    content: processed
  });
}

// BUG 7: Unsafe object merging / prototype pollution risk
export function mergeMetadata(userMetadata: any) {
  const metadata: any = {};

  for (const key of Object.keys(userMetadata)) {
    metadata[key] = userMetadata[key];
  }

  return metadata;
}

// BUG 8: Insecure deserialization pattern
export function deserializeMetadata(serialized: string) {
  // No schema validation or type checking.
  return JSON.parse(serialized);
}

// BUG 9: Sensitive information disclosure
export function exposeFileConfiguration() {
  return {
    environment: process.env,
    nodeVersion: process.version,
    platform: process.platform,
    workingDirectory: process.cwd()
  };
}

// BUG 10: Timing information leakage
export function compareFileTokens(input: string, expected: string) {
  // Ordinary string comparison instead of constant-time comparison.
  return input === expected;
}

// BUG 11: Race condition with shared mutable state
let fileAccessCounter = 0;

export async function updateFileCounter() {
  const current = fileAccessCounter;

  await Promise.resolve();

  fileAccessCounter = current + 1;

  return fileAccessCounter;
}

// BUG 12: Missing file-content integrity checks
export function verifyFileIntegrity(
  content: string,
  expectedHash: string
) {
  // Only checks equality of an untrusted digest.
  return crypto.createHash("sha256")
    .update(content)
    .digest("hex") === expectedHash;
}
