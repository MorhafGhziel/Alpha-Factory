import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

/**
 * Direct test endpoint for invoice reminder system (bypasses auth for testing)
 * This simulates the exact behavior that would happen in production
 */
export async function POST(req: NextRequest) {
  try {
    const { userEmail, testDay } = await req.json();

    if (!userEmail || ![3, 7, 10].includes(testDay)) {
      return NextResponse.json(
        { error: "userEmail is required and testDay must be 3, 7, or 10" },
        { status: 400 }
      );
    }

    console.log(
      `🧪 DIRECT TEST: Invoice reminder for ${userEmail} at day ${testDay}`
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
      daysOverdue: testDay,
      actions: [] as Array<{
        type: string;
        description: string;
        status: string;
        emailSent?: boolean;
        userSuspended?: boolean;
        result?: Record<string, unknown>;
        error?: string;
        reason?: string;
      }>,
      emailContent: null as {
        to: string;
        subject: string;
        body: string;
      } | null,
    };

    // Generate the email content that would be sent
    const emailSubject = getEmailSubject(testDay);
    const emailBody = generateEmailBody(testDay, user.name);

    testResults.emailContent = {
      to: user.email,
      subject: emailSubject,
      body: emailBody,
    };

    // Simulate the actions based on test day
    if (testDay === 3) {
      testResults.actions.push({
        type: "first_reminder",
        description: "Send first reminder email about overdue payment",
        status: "simulated",
        emailSent: true,
      });
    } else if (testDay === 7) {
      testResults.actions.push({
        type: "suspension_warning",
        description: "Send suspension warning email",
        status: "simulated",
        emailSent: true,
      });
    } else if (testDay === 10) {
      testResults.actions.push({
        type: "final_notice",
        description: "Send final notice email",
        status: "simulated",
        emailSent: true,
      });

      // Actually perform auto-suspension for day 10 test
      if (!user.suspended) {
        try {
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              suspended: true,
              suspendedAt: new Date(),
              suspensionReason: `عدم سداد الفاتورة المستحقة خلال ${testDay} يوم من تاريخ الاستحقاق (اختبار تلقائي)`,
            },
          });

          testResults.actions.push({
            type: "auto_suspension",
            description: "Automatically suspend user account",
            status: "executed",
            result: {
              suspended: true,
              suspendedAt: updatedUser.suspendedAt,
              suspensionReason: updatedUser.suspensionReason,
            },
          });

          // Update test results with new suspension status
          testResults.user.suspended = true;
          testResults.user.suspendedAt = updatedUser.suspendedAt;
          testResults.user.suspensionReason = updatedUser.suspensionReason;
        } catch (error) {
          testResults.actions.push({
            type: "auto_suspension",
            description: "Automatically suspend user account",
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } else {
        testResults.actions.push({
          type: "auto_suspension",
          description: "User already suspended, skipping auto-suspension",
          status: "skipped",
          reason: "User is already suspended",
        });
      }
    }

    console.log("✅ Direct test completed");
    console.log(`📧 Email would be sent to: ${user.email}`);
    console.log(`🎬 Actions: ${testResults.actions.length}`);

    return NextResponse.json({
      success: true,
      message: `Direct invoice reminder test completed for day ${testDay}`,
      results: testResults,
    });
  } catch (error) {
    console.error("❌ Error in direct invoice reminder test:", error);
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

export async function GET() {
  return NextResponse.json({
    message: "Direct Invoice Reminder Test Endpoint",
    description: "Direct testing without authentication - for development only",
    usage: "POST with { userEmail, testDay }",
    testDays: [3, 7, 10],
  });
}
