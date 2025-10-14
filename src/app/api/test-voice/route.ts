import { NextRequest, NextResponse } from "next/server";
import { existsSync, readdirSync } from "fs";
import { join } from "path";

// GET - Test voice files accessibility
export async function GET(req: NextRequest) {
  try {
    const voiceDir = join(process.cwd(), "public", "uploads", "voice");

    if (!existsSync(voiceDir)) {
      return NextResponse.json(
        {
          error: "Voice directory does not exist",
          path: voiceDir,
        },
        { status: 404 }
      );
    }

    const files = readdirSync(voiceDir);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol =
      req.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") ? "http" : "https");

    const fileUrls = files.map((file) => ({
      filename: file,
      publicUrl: `/uploads/voice/${file}`,
      fullUrl: `${protocol}://${host}/uploads/voice/${file}`,
      exists: existsSync(join(voiceDir, file)),
    }));

    return NextResponse.json({
      success: true,
      voiceDirectory: voiceDir,
      files: fileUrls,
      totalFiles: files.length,
    });
  } catch (error) {
    console.error("Error testing voice files:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to test voice files",
      },
      { status: 500 }
    );
  }
}
