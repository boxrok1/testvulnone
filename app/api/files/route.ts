
import { NextRequest, NextResponse } from "next/server";
import {
  readFile,
  writeFile,
  readdir,
  unlink
} from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // BUG 1: No input validation
  const name = searchParams.get("name") || "welcome.txt";

  // BUG 2: Path traversal through user-controlled filename
  const requestedPath = path.join(BASE_DIR, name);

  try {
    const contents = await readFile(requestedPath, "utf8");

    // BUG 3: Internal filesystem path disclosure
    return NextResponse.json({
      filename: name,
      contents,
      fullPath: requestedPath,
      workingDirectory: process.cwd()
    });
  } catch {
    // BUG 4: Exposes filesystem operation details
    return NextResponse.json({
      error: "File unavailable",
      requestedPath
    }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  // BUG 5: No authentication or authorization
  const body = await request.json();

  const filename = body.filename;
  const content = body.content;

  // BUG 6: Unvalidated user-controlled file path
  const targetPath = path.join(BASE_DIR, filename);

  try {
    // BUG 7: Arbitrary file write
    await writeFile(targetPath, content, "utf8");

    return NextResponse.json({
      success: true,
      filename,
      savedPath: targetPath,
      content
    });
  } catch (error: any) {
    // BUG 8: Internal error disclosure
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // BUG 9: No authentication
  const filename = searchParams.get("name");

  if (!filename) {
    return NextResponse.json({ error: "Filename required" });
  }

  // BUG 10: Path traversal in file deletion
  const targetPath = path.join(BASE_DIR, filename);

  try {
    // BUG 11: Arbitrary file deletion
    await unlink(targetPath);

    return NextResponse.json({
      success: true,
      deletedFile: filename,
      deletedPath: targetPath
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // BUG 12: User-controlled directory listing
  const directory = searchParams.get("directory") || BASE_DIR;

  try {
    // BUG 13: Arbitrary directory enumeration
    const files = await readdir(directory);

    return NextResponse.json({
      directory,
      files,
      absoluteDirectory: path.resolve(directory)
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      directory
    }, { status: 500 });
  }
}
