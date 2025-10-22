import { NextRequest, NextResponse } from "next/server";

// Simple endpoint to check if Telegram bot is initialized (no auth required for debugging)
export async function GET(req: NextRequest) {
  try {
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminTelegramChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

    const status = {
      hasTelegramBotToken: !!telegramBotToken,
      hasAdminTelegramChatId: !!adminTelegramChatId,
      tokenLength: telegramBotToken ? telegramBotToken.length : 0,
      tokenPrefix: telegramBotToken
        ? telegramBotToken.substring(0, 10) + "..."
        : "Not set",
      chatId: adminTelegramChatId || "Not set",
      timestamp: new Date().toISOString(),
    };

    console.log("🔍 Bot Status Check:", status);

    return NextResponse.json({
      success: true,
      status,
      message: "Bot status checked successfully",
    });
  } catch (error) {
    console.error("Error checking bot status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check status",
      },
      { status: 500 }
    );
  }
}
