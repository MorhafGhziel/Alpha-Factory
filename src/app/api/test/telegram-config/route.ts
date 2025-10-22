import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

// Test endpoint to check Telegram configuration
export async function GET(req: NextRequest) {
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

    // Check environment variables
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminTelegramChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

    const config = {
      hasTelegramBotToken: !!telegramBotToken,
      telegramBotTokenLength: telegramBotToken ? telegramBotToken.length : 0,
      telegramBotTokenPrefix: telegramBotToken
        ? telegramBotToken.substring(0, 10) + "..."
        : "Not set",
      hasAdminTelegramChatId: !!adminTelegramChatId,
      adminTelegramChatId: adminTelegramChatId || "Not set",
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    console.log("🔍 Telegram Configuration Check:", config);

    return NextResponse.json({
      success: true,
      config,
      message: "Telegram configuration checked successfully",
    });
  } catch (error) {
    console.error("Error checking Telegram configuration:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check configuration",
      },
      { status: 500 }
    );
  }
}
