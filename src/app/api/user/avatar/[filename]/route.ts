import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    if (!/^avatar_[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const filepath = join("/tmp", "avatars", filename);

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPE_BY_EXT[ext] ?? "image/jpeg",
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving avatar:", error);
    return NextResponse.json(
      { error: "Failed to serve avatar" },
      { status: 500 },
    );
  }
}
