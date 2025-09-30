import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../lib/auth";
import prisma from "../../../../../../../lib/prisma";
import { sendPasswordChangeEmail } from "../../../../../../../lib/email";

// PUT - Change user password (owner only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if user is authenticated and is owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "owner") {
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use better-auth's internal password hashing
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(newPassword);

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

    // Send email notification about password change
    try {
      console.log("Sending password change notification email...");
      await sendPasswordChangeEmail({
        name: user.name || "User",
        email: user.email,
        role: user.role || "user",
        newPassword: newPassword,
        changedBy: session.user.name || "Owner",
      });
      console.log("Password change email sent successfully");
    } catch (emailError) {
      console.error("Error sending password change email:", emailError);
      // Don't fail the password change if email fails
    }

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
