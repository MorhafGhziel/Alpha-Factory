import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { sendNewProjectNotification } from "../../../../lib/telegram";
import prisma from "../../../../lib/prisma";

// Test endpoint to send a test Telegram notification
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin/owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "owner")
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Admin/Owner access required" },
        { status: 401 }
      );
    }

    const { chatId, groupId } = await req.json();

    let targetChatId = chatId;

    // If groupId is provided, get the chat ID from the group
    if (groupId && !chatId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { telegramChatId: true, name: true },
      });

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      if (!group.telegramChatId) {
        return NextResponse.json(
          { error: `Group "${group.name}" does not have a Telegram chat ID` },
          { status: 400 }
        );
      }

      targetChatId = group.telegramChatId;
    }

    if (!targetChatId) {
      return NextResponse.json(
        { error: "Either chatId or groupId is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing Telegram notification to chat ID: ${targetChatId}`);

    // Send test notification
    const testProjectData = {
      title: "Test Project - Telegram Configuration",
      type: "Test",
      filmingStatus: "تم الانتـــهاء مــنه",
      date: new Date().toLocaleDateString("ar-EG"),
      clientName: "Test Client",
      notes:
        "This is a test notification to verify Telegram integration is working properly.",
    };

    const notificationSent = await sendNewProjectNotification(
      targetChatId,
      testProjectData
    );

    if (notificationSent) {
      console.log("✅ Test Telegram notification sent successfully");
      return NextResponse.json({
        success: true,
        message: "Test notification sent successfully",
        chatId: targetChatId,
      });
    } else {
      console.error("❌ Failed to send test Telegram notification");
      return NextResponse.json(
        { error: "Failed to send test notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test Telegram notification:", error);
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
