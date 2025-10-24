import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

/**
 * Test endpoint to create overdue invoices for testing the reminder system
 * This creates a project with a specific updatedAt date to simulate overdue invoices
 */
export async function POST(req: NextRequest) {
  try {
    const { userEmail, daysOverdue, projectTitle } = await req.json();

    if (!userEmail || !daysOverdue || !projectTitle) {
      return NextResponse.json(
        { error: "userEmail, daysOverdue, and projectTitle are required" },
        { status: 400 }
      );
    }

    console.log(
      `🧪 Creating overdue invoice test for ${userEmail} - ${daysOverdue} days overdue`
    );

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        groupId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${userEmail} not found` },
        { status: 404 }
      );
    }

    // Calculate the updatedAt date to create an invoice that's X days overdue
    // Invoice due date = updatedAt + 7 days
    // To be X days overdue: due date should be X days ago
    // So: updatedAt = (today - X days) - 7 days = today - (X + 7) days
    const today = new Date();
    const daysBack = daysOverdue + 7; // 7 days for invoice period + overdue days
    const projectUpdatedAt = new Date(
      today.getTime() - daysBack * 24 * 60 * 60 * 1000
    );

    // Create a test project that will generate an overdue invoice
    const project = await prisma.project.create({
      data: {
        title: projectTitle,
        type: "فيديو تسويقي",
        filmingStatus: "تم الانتـــهاء مــنه", // Completed filming
        editMode: "تم الانتهاء منه", // Completed editing
        reviewMode: "تمت المراجعة", // Reviewed
        designMode: "تم الانتهاء منه", // Completed design
        verificationMode: "لا شيء",
        date: projectUpdatedAt.toISOString().split("T")[0], // Project date
        clientId: user.id,
        groupId: user.groupId,
        videoDuration: "5:30", // 5 minutes 30 seconds for pricing
        fileLinks: "https://example.com/completed-video.mp4",
        notes: `مشروع اختبار لنظام التذكير - ${daysOverdue} يوم متأخر`,
        createdAt: projectUpdatedAt,
        updatedAt: projectUpdatedAt, // This is key for invoice due date calculation
      },
    });

    // Calculate the invoice details
    const invoiceDueDate = new Date(
      projectUpdatedAt.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const daysUntilDue = Math.ceil(
      (invoiceDueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
    );
    const actualOverdue = Math.max(0, -daysUntilDue);

    const testResults = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      project: {
        id: project.id,
        title: project.title,
        type: project.type,
        status: "مكتمل",
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      invoice: {
        projectUpdateDate: projectUpdatedAt.toISOString(),
        invoiceDueDate: invoiceDueDate.toISOString(),
        daysUntilDue: daysUntilDue,
        daysOverdue: actualOverdue,
        status: actualOverdue > 0 ? "متأخر" : "في الموعد",
      },
      expectedBehavior: {
        willTriggerReminder: actualOverdue >= 3,
        reminderType:
          actualOverdue >= 10
            ? "final_notice_and_suspension"
            : actualOverdue >= 7
            ? "suspension_warning"
            : actualOverdue >= 3
            ? "first_reminder"
            : "none",
        emailWillBeSent: actualOverdue >= 3,
        suspensionWillOccur: actualOverdue >= 10,
      },
      instructions: [
        `1. User ${user.email} should now visit /client/invoices`,
        `2. They will see an invoice due on ${invoiceDueDate.toLocaleDateString()}`,
        `3. The invoice will be ${actualOverdue} days overdue`,
        actualOverdue >= 3
          ? `4. The system will automatically send a ${getEmailType(
              actualOverdue
            )} email`
          : "4. No email will be sent yet (less than 3 days overdue)",
        actualOverdue >= 10
          ? "5. The user account will be automatically suspended"
          : "5. No suspension will occur",
      ],
    };

    console.log(`✅ Test project created successfully`);
    console.log(`📅 Invoice due date: ${invoiceDueDate.toLocaleDateString()}`);
    console.log(`⏰ Days overdue: ${actualOverdue}`);
    console.log(`📧 Email will be sent: ${actualOverdue >= 3}`);

    return NextResponse.json({
      success: true,
      message: `Test project created - invoice is ${actualOverdue} days overdue`,
      results: testResults,
    });
  } catch (error) {
    console.error("❌ Error creating overdue invoice test:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 }
    );
  }
}

function getEmailType(daysOverdue: number): string {
  if (daysOverdue >= 7) return "final notice + suspension";
  if (daysOverdue >= 3) return "first reminder";
  return "none";
}

export async function GET() {
  return NextResponse.json({
    message: "Create Overdue Invoice Test Endpoint",
    description:
      "Creates a project that generates an overdue invoice for testing",
    usage: {
      method: "POST",
      body: {
        userEmail: "string - Email of the user to test",
        daysOverdue: "number - How many days overdue the invoice should be",
        projectTitle: "string - Title for the test project",
      },
    },
    examples: [
      {
        userEmail: "aghyadghziel@gmail.com",
        daysOverdue: 3,
        projectTitle: "مشروع اختبار - تذكير 3 أيام",
      },
      {
        userEmail: "aghyadghziel@gmail.com",
        daysOverdue: 7,
        projectTitle: "مشروع اختبار - تحذير 7 أيام",
      },
      {
        userEmail: "aghyadghziel@gmail.com",
        daysOverdue: 7,
        projectTitle: "مشروع اختبار - إيقاف 10 أيام",
      },
    ],
  });
}
