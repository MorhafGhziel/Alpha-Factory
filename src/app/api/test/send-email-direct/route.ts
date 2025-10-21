import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceReminderEmail } from "@/src/lib/invoice-email";

export async function POST(request: NextRequest) {
  try {
    const { reminderType, userEmail, userName } = await request.json();

    if (!reminderType || !userEmail || !userName) {
      return NextResponse.json(
        { error: "Missing required fields: reminderType, userEmail, userName" },
        { status: 400 }
      );
    }

    if (!["3", "7", "10"].includes(reminderType)) {
      return NextResponse.json(
        { error: "Invalid reminderType. Must be '3', '7', or '10'" },
        { status: 400 }
      );
    }

    console.log(
      `🧪 Testing direct email send for ${userEmail} - ${reminderType} day reminder`
    );

    const emailSent = await sendInvoiceReminderEmail({
      to: userEmail,
      userName: userName,
      reminderType: reminderType as "3" | "7" | "10",
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `✅ ${reminderType}-day reminder email sent successfully to ${userEmail}`,
        details: {
          to: userEmail,
          userName: userName,
          reminderType: reminderType,
          sentAt: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send reminder email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error sending test email:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
