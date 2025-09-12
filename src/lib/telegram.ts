import TelegramBot from "node-telegram-bot-api";

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.warn(
    "TELEGRAM_BOT_TOKEN is not set. Telegram features will be disabled."
  );
}

let bot: TelegramBot | null = null;

// Initialize bot only if token is available
if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}

export interface TelegramGroupResult {
  success: boolean;
  chatId?: string;
  inviteLink?: string;
  error?: string;
}

export interface TelegramUser {
  name: string;
  email: string;
  role: string;
}

/**
 * Create a Telegram group for a project group
 */
export async function createTelegramGroup(
  groupName: string,
  users: TelegramUser[],
  chatId?: string
): Promise<TelegramGroupResult> {
  if (!bot) {
    return {
      success: false,
      error:
        "Telegram bot is not configured. Please set TELEGRAM_BOT_TOKEN environment variable.",
    };
  }

  try {
    // Use provided chatId or fallback to admin chat ID
    const targetChatId = chatId || process.env.ADMIN_TELEGRAM_CHAT_ID!;

    if (!targetChatId) {
      throw new Error("No chat ID provided and ADMIN_TELEGRAM_CHAT_ID not set");
    }

    // Create the group with a descriptive name
    const telegramGroupName = `Alpha Factory - ${groupName}`;

    // Create invite link for the specific group
    const chat = await bot.createChatInviteLink(targetChatId, {
      name: telegramGroupName,
      member_limit: users.length + 2, // Team members + admin buffer
      creates_join_request: false,
      expire_date: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year expiry
    });

    const result: TelegramGroupResult = {
      success: true,
      chatId: targetChatId,
      inviteLink: chat.invite_link,
    };

    // Set up the bot with welcome message and commands
    await setupGroupBot(result.chatId!, groupName, users);

    return result;
  } catch (error) {
    console.error("Error creating Telegram group:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create Telegram group",
    };
  }
}

/**
 * Set up bot commands and welcome message for the group
 */
async function setupGroupBot(
  chatId: string,
  groupName: string,
  users: TelegramUser[]
): Promise<void> {
  if (!bot) return;

  try {
    // Send welcome message to the group
    const welcomeMessage = `🎉 مرحباً بكم في مجموعة Alpha Factory!

📋 **اسم المشروع:** ${groupName}

👥 **أعضاء الفريق:**
${users
  .map((user) => `• ${user.name} - ${getRoleInArabic(user.role)}`)
  .join("\n")}

🤖 **أنا بوت Alpha Factory وسأقوم بإرسال التحديثات التالية:**
• إشعارات إنجاز المهام
• تحديثات حالة المشروع
• تنبيهات مهمة

📝 **الأوامر المتاحة:**
/status - عرض حالة المشروع
/help - عرض المساعدة
/team - عرض أعضاء الفريق

🚀 بالتوفيق في مشروعكم!`;

    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error setting up group bot:", error);
  }
}

/**
 * Send notification to admin when a task is completed
 */
export async function notifyAdmin(
  chatId: string,
  completedBy: string,
  role: string,
  taskType: string,
  projectName: string
): Promise<boolean> {
  if (!bot) return false;

  try {
    const roleArabic = getRoleInArabic(role);
    const message = `✅ **تم إنجاز مهمة جديدة!**

👤 **المنجز:** ${completedBy}
🎯 **الدور:** ${roleArabic}
📋 **نوع المهمة:** ${taskType}
🏷️ **المشروع:** ${projectName}
⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}

@admin يرجى مراجعة العمل المنجز.`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
    });

    return true;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return false;
  }
}

/**
 * Send general project update to the group
 */
export async function sendProjectUpdate(
  chatId: string,
  updateType: string,
  message: string,
  projectName: string
): Promise<boolean> {
  if (!bot) return false;

  try {
    const updateMessage = `📢 **تحديث المشروع: ${projectName}**

🔔 **نوع التحديث:** ${updateType}
📝 **التفاصيل:** ${message}
⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}`;

    await bot.sendMessage(chatId, updateMessage, {
      parse_mode: "Markdown",
    });

    return true;
  } catch (error) {
    console.error("Error sending project update:", error);
    return false;
  }
}

/**
 * Handle bot commands
 */
export function setupBotCommands(): void {
  if (!bot) return;

  // Status command
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    await bot!.sendMessage(
      chatId,
      "📊 **حالة المشروع:**\n\n🔄 المشروع قيد التطوير\n✅ جميع الأنظمة تعمل بشكل طبيعي",
      {
        parse_mode: "Markdown",
      }
    );
  });

  // Help command
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🤖 **مساعدة بوت Alpha Factory**

📝 **الأوامر المتاحة:**
/status - عرض حالة المشروع الحالية
/help - عرض هذه الرسالة
/team - عرض معلومات أعضاء الفريق

🔔 **الإشعارات التلقائية:**
• إشعارات إنجاز المهام
• تحديثات حالة المشروع
• تنبيهات مهمة للإدارة

💡 **نصائح:**
• استخدم @admin لطلب المراجعة
• تابع الإشعارات لمعرفة آخر التحديثات`;

    await bot!.sendMessage(chatId, helpMessage, {
      parse_mode: "Markdown",
    });
  });

  // Team command
  bot.onText(/\/team/, async (msg) => {
    const chatId = msg.chat.id;
    await bot!.sendMessage(
      chatId,
      "👥 **معلومات الفريق:**\n\nيتم جلب معلومات أعضاء الفريق...",
      {
        parse_mode: "Markdown",
      }
    );
  });
}

/**
 * Get role name in Arabic
 */
function getRoleInArabic(role: string): string {
  const roleMap: { [key: string]: string } = {
    client: "عميل",
    editor: "محرر",
    designer: "مصمم",
    reviewer: "مُراجع",
    admin: "مدير",
  };
  return roleMap[role] || role;
}

/**
 * Validate Telegram bot configuration
 */
export function isTelegramConfigured(): boolean {
  return !!TELEGRAM_BOT_TOKEN;
}

/**
 * Get bot instance (for advanced usage)
 */
export function getBotInstance(): TelegramBot | null {
  return bot;
}

// Initialize bot commands if bot is available
if (bot) {
  setupBotCommands();
}
