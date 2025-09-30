import TelegramBot from "node-telegram-bot-api";
import { createReadStream, existsSync } from "fs";
import { join } from "path";

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
    // Filter out client names from the team list
    const teamMembers = users
      .filter((user) => user.role !== "client") // Don't show client names
      .map((user) => `• ${user.name} - ${getRoleInArabic(user.role)}`)
      .join("\n");

    const welcomeMessage = `${addMessageSeparator()}🎉 مرحباً بكم في مجموعة Alpha Factory!

📋 **اسم المشروع:** ${removeLinks(groupName)}

👥 **أعضاء الفريق:**
${teamMembers || "• سيتم إضافة أعضاء الفريق قريباً"}

🤖 **أنا بوت Alpha Factory وسأقوم بإرسال التحديثات التالية:**
• إشعارات إنجاز المهام
• تحديثات حالة المشروع
• تنبيهات مهمة

🚀 بالتوفيق في مشروعكم!${addMessageSeparator()}`;

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
    const message = `${addMessageSeparator()}✅ **تم إنجاز مهمة جديدة!**

👤 **المنجز:** ${completedBy}
🎯 **الدور:** ${roleArabic}
📋 **نوع المهمة:** ${removeLinks(taskType)}
🏷️ **المشروع:** ${removeLinks(projectName)}
⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}

@admin يرجى مراجعة العمل المنجز.${addMessageSeparator()}`;

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
    const updateMessage = `${addMessageSeparator()}📢 **تحديث المشروع: ${removeLinks(
      projectName
    )}**

🔔 **نوع التحديث:** ${removeLinks(updateType)}
📝 **التفاصيل:** ${removeLinks(message)}
⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}${addMessageSeparator()}`;

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
 * Send voice note to Telegram chat
 */
export async function sendVoiceNote(
  chatId: string,
  voiceUrl: string,
  projectTitle: string
): Promise<boolean> {
  if (!bot) return false;

  try {
    console.log("Attempting to send voice note:", voiceUrl);

    // Extract filename from URL to check if it's a local file
    const urlParts = voiceUrl.split("/");
    const filename = urlParts[urlParts.length - 1];

    // Try to send from local file first (more reliable)
    const localFilePath = join(
      process.cwd(),
      "public",
      "uploads",
      "voice",
      filename
    );

    if (existsSync(localFilePath)) {
      console.log("Sending voice note from local file:", localFilePath);

      try {
        // Try as voice message first
        await bot.sendVoice(chatId, createReadStream(localFilePath), {
          caption: `🎤 **رسالة صوتية من العميل بخصوص المشروع:** ${removeLinks(
            projectTitle
          )}`,
          parse_mode: "Markdown",
        });
        console.log("Voice note sent successfully as voice message");
        return true;
      } catch (voiceError) {
        const errorMsg =
          voiceError instanceof Error ? voiceError.message : String(voiceError);
        console.log("Voice format failed, trying as audio:", errorMsg);

        // Fallback: Try as audio file
        try {
          await bot.sendAudio(chatId, createReadStream(localFilePath), {
            caption: `🎤 **رسالة صوتية من العميل بخصوص المشروع:** ${removeLinks(
              projectTitle
            )}`,
            parse_mode: "Markdown",
            title: "Voice Note",
          });
          console.log("Voice note sent successfully as audio file");
          return true;
        } catch (audioError) {
          const audioErrorMsg =
            audioError instanceof Error
              ? audioError.message
              : String(audioError);
          console.log(
            "Audio format failed, trying as document:",
            audioErrorMsg
          );

          // Final fallback: Send as document
          await bot.sendDocument(chatId, createReadStream(localFilePath), {
            caption: `🎤 **رسالة صوتية من العميل بخصوص المشروع:** ${removeLinks(
              projectTitle
            )}`,
            parse_mode: "Markdown",
          });
          console.log("Voice note sent successfully as document");
          return true;
        }
      }
    } else {
      // File doesn't exist locally, try using the URL
      console.log("Local file not found, trying URL:", voiceUrl);

      try {
        await bot.sendAudio(chatId, voiceUrl, {
          caption: `🎤 **رسالة صوتية من العميل بخصوص المشروع:** ${removeLinks(
            projectTitle
          )}`,
          parse_mode: "Markdown",
          title: "Voice Note",
        });
        console.log("Voice note sent successfully via URL");
        return true;
      } catch (urlError) {
        const urlErrorMsg =
          urlError instanceof Error ? urlError.message : String(urlError);
        console.error("Failed to send via URL:", urlErrorMsg);
        throw urlError;
      }
    }
  } catch (error) {
    console.error("Error sending voice note:", error);

    // Send error message
    try {
      await bot.sendMessage(
        chatId,
        `🎤 **تم إرفاق رسالة صوتية بالمشروع ولكن حدث خطأ في الإرسال**\n\n⚠️ **تفاصيل الخطأ:** ${
          error instanceof Error ? error.message : String(error)
        }\n📂 **الملف:** ${voiceUrl}`
      );
    } catch (msgError) {
      console.error("Failed to send error message:", msgError);
    }

    return false;
  }
}

/**
 * Send new project notification to the team
 */
export async function sendNewProjectNotification(
  chatId: string,
  projectData: {
    title: string;
    type: string;
    filmingStatus: string;
    date: string;
    clientName: string;
    notes?: string;
    fileLinks?: string;
    voiceNoteUrl?: string;
  }
): Promise<boolean> {
  if (!bot) return false;

  try {
    const message = `${addMessageSeparator()}🎬 **مشروع جديد متاح للعمل!**

📋 **العنوان:** ${removeLinks(projectData.title)}
🎥 **النوع:** ${removeLinks(projectData.type)}
📅 **التاريخ:** ${projectData.date}
📸 **حالة التصوير:** ${projectData.filmingStatus}

${projectData.notes ? `📝 **ملاحظات:** ${removeLinks(projectData.notes)}` : ""}

🚀 **الفريق جاهز للبدء في العمل!**
⏰ **تم الإنشاء:** ${new Date().toLocaleString(
      "ar-EG"
    )}${addMessageSeparator()}`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
    });

    // Send voice note if provided
    if (projectData.voiceNoteUrl) {
      await sendVoiceNote(chatId, projectData.voiceNoteUrl, projectData.title);
    }

    return true;
  } catch (error) {
    console.error("Error sending new project notification:", error);
    return false;
  }
}

/**
 * Send detailed project status update notification
 */
export async function sendProjectStatusUpdate(
  chatId: string,
  updateData: {
    projectTitle: string;
    updatedBy: string;
    userRole: string;
    fieldName: string;
    oldValue: string;
    newValue: string;
    fieldNameArabic: string;
  }
): Promise<boolean> {
  if (!bot) return false;

  try {
    const roleEmoji = getRoleEmoji(updateData.userRole);
    const fieldEmoji = getFieldEmoji(updateData.fieldName);

    const message = `${addMessageSeparator()}📊 **تحديث حالة المشروع**

🎬 **المشروع:** ${removeLinks(updateData.projectTitle)}
${roleEmoji} **المحدث بواسطة:** ${updateData.updatedBy} (${getRoleInArabic(
      updateData.userRole
    )})

${fieldEmoji} **المجال المحدث:** ${updateData.fieldNameArabic}
❌ **القيمة السابقة:** ${removeLinks(updateData.oldValue)}
✅ **القيمة الجديدة:** ${removeLinks(updateData.newValue)}

⏰ **وقت التحديث:** ${new Date().toLocaleString(
      "ar-EG"
    )}${addMessageSeparator()}`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
    });

    return true;
  } catch (error) {
    console.error("Error sending project status update:", error);
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
export function getRoleInArabic(role: string): string {
  const roleMap: { [key: string]: string } = {
    client: "عميل",
    editor: "محرر",
    designer: "مصمم",
    reviewer: "مُراجع",
    admin: "مدير",
    supervisor: "مشرف",
    owner: "مالك",
  };
  return roleMap[role] || role;
}

/**
 * Get role emoji
 */
function getRoleEmoji(role: string): string {
  const emojiMap: { [key: string]: string } = {
    client: "👤",
    editor: "✂️",
    designer: "🎨",
    reviewer: "👁️",
    admin: "👨‍💼",
    supervisor: "👨‍💼",
    owner: "👑",
  };
  return emojiMap[role] || "👤";
}

/**
 * Get field emoji based on field name
 */
function getFieldEmoji(fieldName: string): string {
  const emojiMap: { [key: string]: string } = {
    filmingStatus: "🎬",
    editMode: "✂️",
    designMode: "🎨",
    reviewMode: "👁️",
    verificationMode: "⭐",
    reviewLinks: "🔗",
    designLinks: "🔗",
    fileLinks: "📁",
    notes: "📝",
    title: "📋",
    type: "🎥",
    date: "📅",
  };
  return emojiMap[fieldName] || "📊";
}

/**
 * Remove URLs from text to avoid sharing links
 */
function removeLinks(text: string): string {
  if (!text) return text;
  // Remove URLs (http/https/ftp/www patterns)
  return text
    .replace(/https?:\/\/[^\s]+/gi, "[رابط محذوف]")
    .replace(/ftp:\/\/[^\s]+/gi, "[رابط محذوف]")
    .replace(/www\.[^\s]+/gi, "[رابط محذوف]")
    .replace(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi, "[رابط محذوف]");
}

/**
 * Add message separator
 */
function addMessageSeparator(): string {
  return "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
}

/**
 * Get field name in Arabic
 */
function getFieldNameInArabic(fieldName: string): string {
  const fieldMap: { [key: string]: string } = {
    filmingStatus: "حالة التصوير",
    editMode: "حالة التحرير",
    designMode: "حالة التصميم",
    reviewMode: "حالة المراجعة",
    verificationMode: "تقييم المشروع",
    reviewLinks: "روابط المراجعة",
    designLinks: "روابط التصميم",
    fileLinks: "ملفات المشروع",
    notes: "الملاحظات",
    title: "عنوان المشروع",
    type: "نوع المشروع",
    date: "تاريخ المشروع",
  };
  return fieldMap[fieldName] || fieldName;
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
