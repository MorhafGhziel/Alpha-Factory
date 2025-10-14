import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { notifyAdmin, sendProjectUpdate } from "../../../lib/telegram";
import prisma from "../../../lib/prisma";

interface NotificationRequest {
  type: "task_completion" | "project_update" | "admin_mention";
  taskType?: string;
  message?: string;
  projectId?: string;
}

// POST - Send notification to Telegram group
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      type,
      taskType,
      message,
      projectId: _projectId,
    }: NotificationRequest = await req.json();

    // Validate input
    if (!type) {
      return NextResponse.json(
        { error: "Notification type is required" },
        { status: 400 }
      );
    }

    // Get user's group information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            telegramChatId: true,
          },
        },
      },
    });

    if (!user || !user.group) {
      return NextResponse.json(
        { error: "User group not found" },
        { status: 404 }
      );
    }

    if (!user.group.telegramChatId) {
      return NextResponse.json(
        { error: "Telegram group not configured for this project" },
        { status: 400 }
      );
    }

    let notificationSent = false;

    switch (type) {
      case "task_completion":
        if (!taskType) {
          return NextResponse.json(
            {
              error: "Task type is required for task completion notifications",
            },
            { status: 400 }
          );
        }

        notificationSent = await notifyAdmin(
          user.group.telegramChatId,
          user.name,
          user.role || "unknown",
          taskType,
          user.group.name
        );
        break;

      case "project_update":
        if (!message) {
          return NextResponse.json(
            { error: "Message is required for project update notifications" },
            { status: 400 }
          );
        }

        notificationSent = await sendProjectUpdate(
          user.group.telegramChatId,
          "تحديث عام",
          message,
          user.group.name
        );
        break;

      case "admin_mention":
        notificationSent = await notifyAdmin(
          user.group.telegramChatId,
          user.name,
          user.role || "unknown",
          "طلب مراجعة",
          user.group.name
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    if (notificationSent) {
      return NextResponse.json({
        success: true,
        message: "Notification sent successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send notification",
      },
      { status: 500 }
    );
  }
}

// GET - Get notification history (optional feature)
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's group information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            telegramChatId: true,
            telegramInviteLink: true,
          },
        },
      },
    });

    if (!user || !user.group) {
      return NextResponse.json(
        { error: "User group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      group: {
        id: user.group.id,
        name: user.group.name,
        telegramConfigured: !!user.group.telegramChatId,
        telegramInviteLink: user.group.telegramInviteLink,
      },
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      availableNotifications: [
        {
          type: "task_completion",
          description: "إشعار إنجاز مهمة",
          requiredFields: ["taskType"],
        },
        {
          type: "project_update",
          description: "تحديث المشروع",
          requiredFields: ["message"],
        },
        {
          type: "admin_mention",
          description: "طلب مراجعة من الإدارة",
          requiredFields: [],
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching notification info:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification info" },
      { status: 500 }
    );
  }
}
