import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

/**
 * Test endpoint for the invoice reminder system
 * This endpoint simulates what happens at 3, 7, and 10 days overdue
 *
 * Usage:
 * POST /api/test/invoice-reminders
 * Body: {
 *   "userEmail": "aghyadghziel@gmail.com",
 *   "testDay": 3 | 7 | 10
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin or owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      !["admin", "owner"].includes(session.user.role || "")
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Admin/Owner only" },
        { status: 401 }
      );
    }

    const { userEmail, testDay } = await req.json();

    if (!userEmail || ![3, 7, 10].includes(testDay)) {
      return NextResponse.json(
        { error: "userEmail is required and testDay must be 3, 7, or 10" },
        { status: 400 }
      );
    }

    console.log(
      `🧪 Testing invoice reminder system for ${userEmail} at day ${testDay}`
    );

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${userEmail} not found` },
        { status: 404 }
      );
    }

    console.log("👤 User found:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      suspended: user.suspended,
    });

    // Create a test invoice due date based on the test day
    const testDueDate = new Date();
    testDueDate.setDate(testDueDate.getDate() - testDay); // Set due date to X days ago

    const testResults = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        suspended: user.suspended,
        suspendedAt: user.suspendedAt,
        suspensionReason: user.suspensionReason,
      },
      testDay,
      testDueDate: testDueDate.toISOString(),
      daysOverdue: testDay,
      actions: [] as Array<{
        type: string;
        subject?: string;
        message?: string;
        status: string;
        description?: string;
        userSuspended?: boolean;
        result?: Record<string, unknown>;
        error?: string;
        reason?: string;
      }>,
      emailPreview: null as {
        to: string;
        subject: string;
        body: string;
      } | null,
    };

    // Simulate the actions based on the test day
    if (testDay === 3) {
      testResults.actions.push({
        type: "email_reminder",
        subject: "تذكير بالفاتورة المستحقة - Alpha Factory",
        message: "تذكير بضرورة تسديد الفاتورة في الوقت المحدد",
        status: "would_send",
      });
    } else if (testDay === 7) {
      testResults.actions.push({
        type: "suspension_warning",
        subject: "تحذير: تعليق الحساب - Alpha Factory",
        message: "تم تعليق حسابك مؤقتاً بسبب عدم تسديد الفاتورة",
        status: "would_send",
      });
    } else if (testDay === 10) {
      testResults.actions.push({
        type: "final_notice",
        subject: "إشعار نهائي: إيقاف الحساب - Alpha Factory",
        message: "تم إيقاف حسابك نهائياً بسبب عدم السداد",
        status: "would_send",
      });

      // Test auto-suspension
      if (!user.suspended) {
        try {
          const suspensionResult = await fetch(
            `${req.nextUrl.origin}/api/admin/auto-suspend`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...Object.fromEntries(req.headers.entries()),
              },
              body: JSON.stringify({
                userId: user.id,
                invoiceDueDate: testDueDate.toISOString(),
              }),
            }
          );

          const suspensionData = await suspensionResult.json();

          testResults.actions.push({
            type: "auto_suspension",
            status: suspensionResult.ok ? "executed" : "failed",
            result: suspensionData,
          });

          // Fetch updated user status
          const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              suspended: true,
              suspendedAt: true,
              suspensionReason: true,
            },
          });

          testResults.user.suspended = updatedUser?.suspended || false;
          testResults.user.suspendedAt = updatedUser?.suspendedAt || null;
          testResults.user.suspensionReason =
            updatedUser?.suspensionReason || null;
        } catch (error) {
          testResults.actions.push({
            type: "auto_suspension",
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } else {
        testResults.actions.push({
          type: "auto_suspension",
          status: "skipped",
          reason: "User is already suspended",
        });
      }
    }

    // Simulate email sending (we'll use the same email structure as the real system)
    const emailBody = generateEmailBody(testDay, user.name);
    testResults.emailPreview = {
      to: user.email,
      subject: getEmailSubject(testDay),
      body: emailBody,
    };

    console.log("✅ Test completed successfully");
    console.log("📧 Email would be sent to:", user.email);
    console.log("🔄 Actions performed:", testResults.actions.length);

    return NextResponse.json({
      success: true,
      message: `Invoice reminder test completed for day ${testDay}`,
      results: testResults,
    });
  } catch (error) {
    console.error("❌ Error in invoice reminder test:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 }
    );
  }
}

function getEmailSubject(day: number): string {
  switch (day) {
    case 3:
      return "تذكير بالفاتورة المستحقة - Alpha Factory";
    case 7:
      return "تحذير: تعليق الحساب - Alpha Factory";
    case 10:
      return "إشعار نهائي: إيقاف الحساب - Alpha Factory";
    default:
      return "إشعار من Alpha Factory";
  }
}

function generateEmailBody(day: number, clientName: string): string {
  switch (day) {
    case 3:
      return `عزيزي ${clientName}

نود تذكيرك بضرورة تسديد الفاتورة في الوقت المحدد لضمان استمرار الخدمة دون أي انقطاع:

• بعد 3 أيام من تاريخ الاستحقاق: سيتم إرسال تذكير إضافي بالدفع
• بعد 7 أيام من التأخير: سيتم تعليق الحساب بشكل مؤقت
• بعد 10 أيام من التأخير: سيتوقف الحساب بشكل كامل

نرجوا منك تجاوز عملية الدفع في أسرع وقت ممكن. ولأي استفسار أو مساعدة في عملية السداد، يرجى التواصل مع فريق الدعم.

مع التقدير،
فريق Alpha Factory`;

    case 7:
      return `عزيزي ${clientName}،

نود إعلامك بأنه تم تعليق حسابك مؤقتاً بسبب عدم تسديد الفاتورة المستحقة خلال المدة المحددة.
يمكنك إعادة تفعيل الحساب فوراً عن طريق إتمام عملية الدفع

نرجو منك الإسراع في السداد لتفادي انتقال الحساب إلى الإيقاف الكامل بعد مرور 10 أيام

مع الشكر والتقدير،
فريق Alpha Factory`;

    case 10:
      return `عزيزي ${clientName}

نود إعلامك أنه قد تم إيقاف حسابك نهائياً بسبب عدم تسديد الفاتورة المستحقة خلال الفترة المحددة (10 أيام من تاريخ الاستحقاق)

يرجى ملاحظة ما يلي:
• لا يمكن إعادة تفعيل الحساب عبر الدفع المباشر.
• لمتابعة الإجراءات وتسوية المبالغ المستحقة، يجب التواصل مع فريق الدعم حصراً.

للتواصل مع الدعم، الرجاء مراسلتنا عبر البريد: support@alphafactory.net

في حال عدم التواصل خلال فترة وجيزة، تحتفظ الشركة بحقها في اتخاذ أي خطوات إضافية بخصوص المبلغ غير المسدد.

مع التحية،
إدارة Alpha Factory`;

    default:
      return `عزيزي ${clientName}، هذا إشعار تجريبي من Alpha Factory.`;
  }
}

/**
 * GET endpoint to show test instructions
 */
export async function GET() {
  return NextResponse.json({
    message: "Invoice Reminder System Test Endpoint",
    description: "Test the 3-day, 7-day, and 10-day invoice reminder system",
    instructions: {
      method: "POST",
      endpoint: "/api/test/invoice-reminders",
      authentication: "Admin or Owner role required",
      requiredFields: {
        userEmail:
          "string - Email of the user to test (e.g., aghyadghziel@gmail.com)",
        testDay: "number - Day to test (3, 7, or 10)",
      },
      examples: [
        {
          userEmail: "aghyadghziel@gmail.com",
          testDay: 3,
          description: "Test 3-day reminder (first reminder email)",
        },
        {
          userEmail: "aghyadghziel@gmail.com",
          testDay: 7,
          description: "Test 7-day reminder (suspension warning)",
        },
        {
          userEmail: "aghyadghziel@gmail.com",
          testDay: 10,
          description: "Test 10-day reminder (final notice + auto-suspension)",
        },
      ],
    },
    testFlow: {
      day3: "Sends reminder email about upcoming payment deadline",
      day7: "Sends suspension warning email",
      day10:
        "Sends final notice email + automatically suspends the user account",
    },
  });
}
