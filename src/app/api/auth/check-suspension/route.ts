import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        suspended: true,
        suspendedAt: true,
        suspensionReason: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.suspended) {
      return NextResponse.json({
        suspended: true,
        suspendedAt: user.suspendedAt,
        suspensionReason: user.suspensionReason,
        message:
          "حسابك معلق حالياً. للحصول على المساعدة، يرجى التواصل مع الدعم الفني.",
      });
    }

    return NextResponse.json({
      suspended: false,
      message: "الحساب نشط",
    });
  } catch (error) {
    console.error("Error checking suspension status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
