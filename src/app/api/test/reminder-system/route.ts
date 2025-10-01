import { NextRequest, NextResponse } from "next/server";
import { sendProjectDeadlineReminder } from "../../../../lib/email";

/**
 * Test endpoint for the project deadline reminder system
 * This endpoint allows manual testing of the email reminder functionality
 *
 * Usage:
 * POST /api/test/reminder-system
 * Body: {
 *   "clientName": "Test Client",
 *   "clientEmail": "test@example.com",
 *   "projectTitle": "Test Project",
 *   "projectType": "Video Production",
 *   "projectDate": "2024-10-01",
 *   "daysOverdue": 1
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      clientName,
      clientEmail,
      projectTitle,
      projectType,
      projectDate,
      daysOverdue,
    } = await req.json();

    // Validate required fields
    if (
      !clientName ||
      !clientEmail ||
      !projectTitle ||
      !projectType ||
      !projectDate ||
      daysOverdue === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: clientName, clientEmail, projectTitle, projectType, projectDate, daysOverdue",
        },
        { status: 400 }
      );
    }

    console.log("🧪 Testing project deadline reminder system");
    console.log("📧 Test reminder data:", {
      clientName,
      clientEmail,
      projectTitle,
      projectType,
      projectDate,
      daysOverdue,
    });

    // Send test reminder
    const success = await sendProjectDeadlineReminder({
      clientName,
      clientEmail,
      projectTitle,
      projectType,
      projectDate,
      daysOverdue,
    });

    if (success) {
      console.log("✅ Test reminder sent successfully");
      return NextResponse.json({
        success: true,
        message: "Test reminder sent successfully",
        data: {
          clientName,
          clientEmail,
          projectTitle,
          projectType,
          projectDate,
          daysOverdue,
        },
      });
    } else {
      console.log("❌ Test reminder failed to send");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test reminder",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in test reminder system:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to show test instructions
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Project Deadline Reminder Test Endpoint",
    instructions: {
      method: "POST",
      endpoint: "/api/test/reminder-system",
      requiredFields: {
        clientName: "string - Name of the client",
        clientEmail: "string - Email address of the client",
        projectTitle: "string - Title of the project",
        projectType: "string - Type of the project",
        projectDate: "string - Original project date (YYYY-MM-DD format)",
        daysOverdue: "number - Number of days the project is overdue",
      },
      example: {
        clientName: "أحمد محمد",
        clientEmail: "ahmed@example.com",
        projectTitle: "فيديو ترويجي للشركة",
        projectType: "إنتاج فيديو",
        projectDate: "2024-10-01",
        daysOverdue: 1,
      },
    },
    notes: [
      "This endpoint sends a test reminder email using the same template as the production system",
      "Make sure to use a valid email address for testing",
      "The email will be sent using the configured Resend API",
    ],
  });
}
