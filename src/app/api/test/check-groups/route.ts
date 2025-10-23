import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// Simple endpoint to check groups and their Telegram chat IDs (no auth required for debugging)
export async function GET(req: NextRequest) {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        telegramChatId: true,
        telegramGroupName: true,
        telegramInviteLink: true,
        users: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    console.log("🔍 Groups Check:", groups);

    return NextResponse.json({
      success: true,
      groups,
      totalGroups: groups.length,
      groupsWithTelegram: groups.filter(
        (g: { telegramChatId: string | null }) => g.telegramChatId
      ).length,
      message: "Groups checked successfully",
    });
  } catch (error) {
    console.error("Error checking groups:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check groups",
      },
      { status: 500 }
    );
  }
}
