import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's projects to calculate overdue invoices
    const projects = await prisma.project.findMany({
      where: {
        clientId: userId,
        filmingStatus: "تم الانتـــهاء مــنه",
        editMode: "تم الانتهاء منه",
        designMode: "تم الانتهاء منه",
        reviewMode: "تمت المراجعة",
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calculate overdue status for each project
    const now = new Date();
    let maxOverdueDays = 0;

    for (const project of projects) {
      // Invoice due date is 14 days after project completion
      const dueDate = new Date(project.updatedAt);
      dueDate.setDate(dueDate.getDate() + 14);

      const daysDiff = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const overdueDays = Math.max(0, daysDiff);

      if (overdueDays > maxOverdueDays) {
        maxOverdueDays = overdueDays;
      }
    }

    // Determine access level based on overdue days
    let accessLevel = "full"; // full, invoice_only, blocked
    let restrictionMessage = "";

    if (maxOverdueDays >= 14) {
      accessLevel = "blocked";
      restrictionMessage =
        "تم حظر حسابك بسبب عدم سداد الفواتير لأكثر من 14 يوم. يرجى التواصل مع الإدارة.";
    } else if (maxOverdueDays >= 7) {
      accessLevel = "invoice_only";
      restrictionMessage = `فاتورتك متأخرة منذ ${maxOverdueDays} أيام. يمكنك الوصول لصفحة الفواتير فقط حتى يتم السداد.`;
    } else if (maxOverdueDays >= 3) {
      accessLevel = "full";
      restrictionMessage = `لديك فاتورة متأخرة منذ ${maxOverdueDays} أيام. يرجى السداد في أقرب وقت.`;
    }

    return NextResponse.json({
      success: true,
      overdueDays: maxOverdueDays,
      accessLevel,
      restrictionMessage,
      hasOverdueInvoices: maxOverdueDays > 0,
    });
  } catch (error) {
    console.error("Error checking overdue status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
