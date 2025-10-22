import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { createTelegramGroup } from "../../../../lib/telegram";

// Simple endpoint to add Telegram to existing groups (no auth required for debugging)
export async function POST(req: NextRequest) {
  try {
    const { groupId, telegramChatId } = await req.json();

    if (!groupId || !telegramChatId) {
      return NextResponse.json(
        { error: "Both groupId and telegramChatId are required" },
        { status: 400 }
      );
    }

    console.log(`🔧 Adding Telegram to group: ${groupId}`);
    console.log(`📱 Using chat ID: ${telegramChatId}`);

    // Get the existing group
    const existingGroup = await prisma.group.findUnique({
      where: { id: groupId },
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
      `📋 Group found: ${existingGroup.name} with ${existingGroup.users.length} users`
    );

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

    console.log("✅ Telegram configuration created successfully");
    console.log(`🔗 Invite link: ${telegramResult.inviteLink}`);

    // Update the group with Telegram information
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        telegramChatId: telegramResult.chatId,
        telegramInviteLink: telegramResult.inviteLink,
        telegramGroupName: `Alpha Factory - ${existingGroup.name}`,
      },
    });

    console.log("✅ Group updated in database successfully");

    return NextResponse.json({
      success: true,
      message: "Telegram configuration added successfully",
      group: {
        id: updatedGroup.id,
        name: updatedGroup.name,
        telegramChatId: updatedGroup.telegramChatId,
        telegramInviteLink: updatedGroup.telegramInviteLink,
        telegramGroupName: updatedGroup.telegramGroupName,
      },
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
