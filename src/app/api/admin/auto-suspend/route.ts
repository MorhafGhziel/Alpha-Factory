import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

// Function to calculate days until a date
function daysUntil(date: Date): number {
  const now = new Date();
  const diff = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, invoiceDueDate } = await request.json();

    if (!userId || !invoiceDueDate) {
      return NextResponse.json(
        { error: "User ID and invoice due date are required" },
        { status: 400 }
      );
    }

    const dueDate = new Date(invoiceDueDate);
    const daysOverdue = Math.max(0, -daysUntil(dueDate));

    // Auto-suspend if 7 days overdue
    if (daysOverdue >= 7) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && !user.suspended) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            suspended: true,
            suspendedAt: new Date(),
            suspensionReason: `عدم سداد الفاتورة المستحقة خلال ${daysOverdue} يوم من تاريخ الاستحقاق`,
          },
        });

        return NextResponse.json({
          success: true,
          message: "تم تعليق الحساب تلقائياً بسبب عدم السداد",
          suspended: true,
          daysOverdue,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "لا يوجد حاجة للتعليق حالياً",
      suspended: false,
      daysOverdue,
    });
  } catch (error) {
    console.error("Error in auto-suspend:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
