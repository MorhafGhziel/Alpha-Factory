import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";

// PUT - Update user (owner only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Unauthorized - Owner access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updateData = await req.json();

    // Validate the update data
    const allowedFields = ["name", "email", "phone", "role"];
    const filteredData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = value;
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent updating owner role
    if (
      existingUser.role === "owner" &&
      filteredData.role &&
      filteredData.role !== "owner"
    ) {
      return NextResponse.json(
        { error: "Cannot change owner role" },
        { status: 403 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: filteredData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        groupId: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Unauthorized - Owner access required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting owner
    if (existingUser.role === "owner") {
      return NextResponse.json(
        { error: "Cannot delete owner account" },
        { status: 403 }
      );
    }

    // Prevent deleting self
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
