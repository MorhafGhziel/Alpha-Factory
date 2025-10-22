import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userEmail, reason } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: "userEmail is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${userEmail} not found` },
        { status: 404 }
      );
    }

    console.log(`🔒 Manually suspending user ${userEmail}...`);

    // Suspend the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        suspended: true,
        suspendedAt: new Date(),
        suspensionReason: reason || "تم التعليق يدوياً لأغراض الاختبار",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        suspendedAt: true,
        suspensionReason: true,
      },
    });

    console.log(`✅ User ${userEmail} suspended successfully`);

    return NextResponse.json({
      success: true,
      message: `User ${userEmail} suspended successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error suspending user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
