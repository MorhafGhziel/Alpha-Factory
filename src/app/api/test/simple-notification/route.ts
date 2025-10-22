import { NextRequest, NextResponse } from "next/server";
import { sendNewProjectNotification } from "../../../../lib/telegram";

// Simple endpoint to test Telegram notification (no auth required for debugging)
export async function POST(req: NextRequest) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing notification to chat ID: ${chatId}`);

    // Send test notification
    const testProjectData = {
      title: "🧪 Test Project - Debug",
      type: "Test",
      filmingStatus: "تم الانتـــهاء مــنه",
      date: new Date().toLocaleDateString("ar-EG"),
      clientName: "Test Client",
      notes: "This is a debug test notification.",
    };

    const notificationSent = await sendNewProjectNotification(
      chatId,
      testProjectData
    );

    console.log(
      `🧪 Notification result: ${notificationSent ? "SUCCESS" : "FAILED"}`
    );

    return NextResponse.json({
      success: notificationSent,
      message: notificationSent
        ? "Test notification sent successfully"
        : "Failed to send test notification",
      chatId,
      testData: testProjectData,
    });
  } catch (error) {
    console.error("❌ Error in simple notification test:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send test notification",
      },
      { status: 500 }
    );
  }
}
