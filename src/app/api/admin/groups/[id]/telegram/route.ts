import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import prisma from "../../../../../../lib/prisma";
import { createTelegramGroup } from "../../../../../../lib/telegram";

// PUT - Add or update Telegram configuration for an existing group
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check if user is authenticated and is admin/owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      (session.user.role !== "admin" &&
        session.user.role !== "owner" &&
        session.user.role !== "supervisor")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { telegramChatId } = await req.json();

    if (!telegramChatId) {
      return NextResponse.json(
        { error: "Telegram chat ID is required" },
        { status: 400 }
      );
    }

    // Get the existing group
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    console.log(
      `🔧 Adding Telegram configuration to group: ${existingGroup.name}`
    );
    console.log(`📱 Using chat ID: ${telegramChatId}`);

    // Create Telegram group configuration
    const telegramResult = await createTelegramGroup(
      existingGroup.name,
      existingGroup.users.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role || "member", // Fallback for null roles
      })),
      telegramChatId
    );

    if (!telegramResult.success) {
      console.error(
        "❌ Failed to create Telegram configuration:",
        telegramResult.error
      );
      return NextResponse.json(
        { error: `Failed to configure Telegram: ${telegramResult.error}` },
        { status: 500 }
      );
    }

    // Update the group with Telegram information
    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        telegramChatId: telegramResult.chatId,
        telegramInviteLink: telegramResult.inviteLink,
        telegramGroupName: `Alpha Factory - ${existingGroup.name}`,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            emailVerified: true,
          },
        },
      },
    });

    console.log("✅ Telegram configuration added successfully");

    return NextResponse.json({
      success: true,
      message: "Telegram configuration added successfully",
      group: updatedGroup,
      telegram: {
        chatId: telegramResult.chatId,
        inviteLink: telegramResult.inviteLink,
        groupName: `Alpha Factory - ${existingGroup.name}`,
      },
    });
  } catch (error) {
    console.error("❌ Error adding Telegram configuration:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add Telegram configuration",
      },
      { status: 500 }
    );
  }
}
