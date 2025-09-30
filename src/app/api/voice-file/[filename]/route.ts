import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET - Serve voice file from /tmp directory (production only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Validate filename to prevent directory traversal
    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Only allow .webm files
    if (!filename.endsWith(".webm")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Get file path from /tmp directory
    const filepath = join("/tmp", "voice", filename);

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(filepath);

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "audio/webm",
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving voice file:", error);
    return NextResponse.json(
      { error: "Failed to serve voice file" },
      { status: 500 }
    );
  }
}
