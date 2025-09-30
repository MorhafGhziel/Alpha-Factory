import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// POST - Upload voice recording
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // In production (Vercel), use /tmp directory as it's writable
    const isProduction = process.env.NODE_ENV === "production";
    const uploadsDir = isProduction
      ? join("/tmp", "voice")
      : join(process.cwd(), "public", "uploads", "voice");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const userId = session.user.id;
    const filename = `voice_${userId}_${timestamp}.webm`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the appropriate URL
    const publicUrl = isProduction
      ? `/api/voice-file/${filename}`
      : `/uploads/voice/${filename}`;

    // Get the full URL from the request headers
    const host = req.headers.get("host") || "localhost:3000";
    const protocol =
      req.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") ? "http" : "https");
    const fullUrl = `${protocol}://${host}${publicUrl}`;

    console.log("Voice file uploaded:", {
      filename,
      publicUrl,
      fullUrl,
      isProduction,
      uploadsDir,
    });

    return NextResponse.json({
      success: true,
      url: fullUrl,
      filename,
      publicUrl, // Also return relative URL as backup
      localPath: filepath, // For debugging
    });
  } catch (error) {
    console.error("Error uploading voice file:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload voice file",
      },
      { status: 500 }
    );
  }
}
