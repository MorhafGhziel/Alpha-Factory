import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owners and admins can suspend users
    if (!["owner", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, reason } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user suspension status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        suspended: true,
        suspendedAt: new Date(),
        suspensionReason: reason || "عدم سداد الفاتورة المستحقة",
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تعليق الحساب بنجاح",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owners and admins can remove suspension
    if (!["owner", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Remove user suspension
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        suspended: false,
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إلغاء تعليق الحساب بنجاح",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error removing suspension:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
