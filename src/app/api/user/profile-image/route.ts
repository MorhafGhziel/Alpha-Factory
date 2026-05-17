import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isManagedAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith("/uploads/avatars/") || url.includes("/api/user/avatar/")
  );
}

async function deleteManagedAvatar(url: string) {
  try {
    if (url.startsWith("/uploads/avatars/")) {
      const filename = url.replace("/uploads/avatars/", "");
      const filepath = join(process.cwd(), "public", "uploads", "avatars", filename);
      if (existsSync(filepath)) await unlink(filepath);
      return;
    }

    const match = url.match(/\/api\/user\/avatar\/([^/?#]+)/);
    if (match?.[1]) {
      const filepath = join("/tmp", "avatars", match[1]);
      if (existsSync(filepath)) await unlink(filepath);
    }
  } catch {
    // Best-effort cleanup; ignore failures
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const uploadsDir = isProduction
      ? join("/tmp", "avatars")
      : join(process.cwd(), "public", "uploads", "avatars");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const ext = EXT_BY_MIME[file.type] ?? "jpg";
    const filename = `avatar_${session.user.id}_${Date.now()}.${ext}`;
    const filepath = join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const imageUrl = isProduction
      ? `/api/user/avatar/${filename}`
      : `/uploads/avatars/${filename}`;

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (isManagedAvatarUrl(existingUser?.image)) {
      await deleteManagedAvatar(existingUser!.image!);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload profile image",
      },
      { status: 500 },
    );
  }
}
