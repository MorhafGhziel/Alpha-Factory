import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

// UPDATE user
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

    const { email, name, phone } = await req.json();
    const userId = id;

    // Validate input
    if (!email && !name && !phone) {
      return NextResponse.json(
        { error: "At least one field (email, name, or phone) is required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 409 }
        );
      }
    }

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phone,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Phone number is already taken" },
          { status: 409 }
        );
      }

      // Validate phone number format
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { error: "Invalid phone number format" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: { email?: string; name?: string; phone?: string } = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
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

    const userId = id;

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user (this will cascade delete sessions and accounts due to onDelete: Cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
