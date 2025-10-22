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

    // When admin removes suspension, clear all overdue invoices by updating project dates
    const completedProjects = await prisma.project.findMany({
      where: {
        clientId: userId,
        filmingStatus: "تم الانتـــهاء مــنه",
        editMode: "تم الانتهاء منه",
        designMode: "تم الانتهاء منه",
        reviewMode: "تمت المراجعة",
      },
    });

    // Update all completed projects to have recent updatedAt (making invoices appear current)
    const recentDate = new Date();
    await prisma.project.updateMany({
      where: {
        clientId: userId,
        filmingStatus: "تم الانتـــهاء مــنه",
        editMode: "تم الانتهاء منه",
        designMode: "تم الانتهاء منه",
        reviewMode: "تمت المراجعة",
      },
      data: {
        updatedAt: recentDate,
      },
    });

    console.log(
      `✅ Admin unsuspended user ${updatedUser.email} and cleared ${completedProjects.length} overdue invoices`
    );

    return NextResponse.json({
      success: true,
      message: `تم إلغاء تعليق الحساب وإزالة ${completedProjects.length} فاتورة متأخرة`,
      user: updatedUser,
      clearedInvoices: completedProjects.length,
    });
  } catch (error) {
    console.error("Error removing suspension:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
