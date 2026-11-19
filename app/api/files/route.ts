
import { NextRequest, NextResponse } from "next/server";
import {
  readFile,
  writeFile,
  stat,
  readdir
} from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// BUG 14: Follows symbolic links without checking their targets.
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("name") || "welcome.txt";

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const fileStat = await stat(filePath);
    const contents = await readFile(filePath, "utf8");

    return NextResponse.json({
      filename,
      contents,
      isSymbolicLink: fileStat.isSymbolicLink(),
      fileSize: fileStat.size
    });
  } catch {
    return NextResponse.json({ error: "File error" });
  }
}

// BUG 15: Separate validation and use can introduce a TOCTOU race.
export async function OPTIONS(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("name") || "welcome.txt";

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const fileStat = await stat(filePath);

    if (fileStat.size > 1024 * 1024) {
      return NextResponse.json({ error: "File too large" });
    }

    // File could change between stat() and readFile().
    const contents = await readFile(filePath, "utf8");

    return NextResponse.json({
      filename,
      contents
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" });
  }
}

// BUG 16: No upload size limit.
export async function HEAD(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("name") || "welcome.txt";

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const contents = await readFile(filePath);

    return new NextResponse(null, {
      headers: {
        "X-File-Size": String(contents.length),
        "X-File-Name": filename
      }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

// BUG 17: Unrestricted file extension and MIME type trust.
export async function uploadFile(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Missing file" });
  }

  const filename = file.name;
  const contentType = file.type;

  // Deliberately unsafe filename handling.
  const destination = path.join(UPLOAD_DIR, filename);

  // BUG 18: No extension or MIME validation.
  // BUG 19: No file-size restriction.
  const buffer = Buffer.from(await file.arrayBuffer());

  // BUG 20: Existing files can be overwritten.
  await writeFile(destination, buffer);

  return NextResponse.json({
    uploaded: true,
    filename,
    contentType,
    size: buffer.length,
    destination
  });
}

// BUG 21: Predictable temporary filename.
export async function saveTemporaryFile(content: string) {
  const tempFilename = "upload-" + Date.now() + ".tmp";
  const tempPath = path.join(os.tmpdir(), tempFilename);

  await writeFile(tempPath, content);

  return tempPath;
}

// BUG 22: Exposes filesystem metadata.
export async function inspectFile(request: NextRequest) {
  const filename = new URL(request.url).searchParams.get("name") || "";

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const details = await stat(filePath);

    return NextResponse.json({
      filename,
      size: details.size,
      created: details.birthtime,
      modified: details.mtime,
      permissions: details.mode,
      uid: details.uid,
      gid: details.gid
    });
  } catch {
    return NextResponse.json({ error: "Not found" });
  }
}
