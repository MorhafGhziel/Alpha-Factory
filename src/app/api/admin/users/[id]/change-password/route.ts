import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import prisma from "../../../../../../lib/prisma";
import { hash } from "bcryptjs";

// PUT - Change user password
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPassword } = await req.json();
    const userId = id;

    // Validate input
    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own password through this endpoint
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot change your own password through this method" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);

    // Update the password in the account table (better-auth stores passwords there)
    await prisma.account.updateMany({
      where: {
        userId: userId,
        providerId: "credential", // better-auth uses "credential" for email/password accounts
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Password changed successfully",
      userId: userId,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
