import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendNewProjectNotification } from "../../../../lib/telegram";

// Simulate project creation flow (no auth required for debugging)
export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Simulating project creation for client: ${clientId}`);

    // Get user with group information (same as in project creation)
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            telegramChatId: true,
            users: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`👤 User found:`, {
      id: user.id,
      name: user.name,
      role: user.role,
      groupId: user.groupId,
      groupName: user.group?.name,
      telegramChatId: user.group?.telegramChatId,
    });

    // Simulate the notification logic from project creation
    let notificationResult = null;
    if (user.group?.telegramChatId) {
      console.log(
        `📱 Attempting to send Telegram notification to chat ID: ${user.group.telegramChatId}`
      );

      try {
        const testProjectData = {
          title: "🧪 Simulated Project",
          type: "Test Project",
          filmingStatus: "تم الانتـــهاء مــنه",
          date: new Date().toLocaleDateString("ar-EG"),
          clientName: user.name,
          notes: "This is a simulated project creation test.",
        };

        const notificationSent = await sendNewProjectNotification(
          user.group.telegramChatId,
          testProjectData
        );

        if (notificationSent) {
          console.log(
            `✅ Telegram notification sent successfully for simulated project`
          );
          notificationResult = "SUCCESS";
        } else {
          console.error(
            `❌ Failed to send Telegram notification for simulated project`
          );
          notificationResult = "FAILED";
        }
      } catch (telegramError) {
        console.error("❌ Error sending Telegram notification:", telegramError);
        notificationResult = `ERROR: ${telegramError}`;
      }
    } else {
      console.log(
        `📱 No Telegram chat ID found for group. User group: ${
          user.group?.name || "No group"
        }, Group ID: ${user.groupId || "No groupId"}`
      );
      notificationResult = "NO_CHAT_ID";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        groupId: user.groupId,
      },
      group: user.group
        ? {
            id: user.group.id,
            name: user.group.name,
            telegramChatId: user.group.telegramChatId,
            userCount: user.group.users.length,
          }
        : null,
      notificationResult,
      message: "Project creation simulation completed",
    });
  } catch (error) {
    console.error("❌ Error in project simulation:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Simulation failed",
      },
      { status: 500 }
    );
  }
}
