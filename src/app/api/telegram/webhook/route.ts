import { NextRequest, NextResponse } from "next/server";
import { getBotInstance } from "../../../../lib/telegram";
import prisma from "../../../../lib/prisma";

// Telegram webhook handler
export async function POST(req: NextRequest) {
  try {
    const bot = getBotInstance();
    if (!bot) {
      return NextResponse.json(
        { error: "Telegram bot not configured" },
        { status: 503 }
      );
    }

    const update = await req.json();

    // Process the update
    await processUpdate(update);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function processUpdate(update: any) {
  const bot = getBotInstance();
  if (!bot) return;

  // Handle text messages
  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const userId = update.message.from.id;
    const userName =
      update.message.from.first_name || update.message.from.username;

    // Handle commands
    if (text.startsWith("/")) {
      await handleCommand(chatId, text, userId, userName);
    } else {
      // Handle regular messages
      await handleMessage(chatId, text, userId, userName);
    }
  }

  // Handle callback queries (inline keyboard buttons)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  }
}

async function handleCommand(
  chatId: number,
  command: string,
  userId: number,
  userName: string
) {
  const bot = getBotInstance();
  if (!bot) return;

  switch (command.toLowerCase()) {
    case "/start":
      await bot.sendMessage(
        chatId,
        `مرحباً ${userName}! 🎉\n\nأنا بوت Alpha Factory. أقوم بإرسال تحديثات المشاريع وإشعارات إنجاز المهام.\n\nاستخدم /help لمعرفة الأوامر المتاحة.`
      );
      break;

    case "/status":
      await sendProjectStatus(chatId);
      break;

    case "/help":
      await sendHelpMessage(chatId);
      break;

    case "/team":
      await sendTeamInfo(chatId);
      break;

    case "/notify_admin":
      await handleAdminNotification(chatId, userId, userName);
      break;

    default:
      await bot.sendMessage(
        chatId,
        `أمر غير معروف: ${command}\n\nاستخدم /help لمعرفة الأوامر المتاحة.`
      );
  }
}

async function handleMessage(
  chatId: number,
  text: string,
  userId: number,
  userName: string
) {
  const bot = getBotInstance();
  if (!bot) return;

  // Check if message mentions admin
  if (text.includes("@admin")) {
    await notifyAdminMention(chatId, text, userName);
  }

  // Check for task completion keywords
  const completionKeywords = [
    "تم",
    "انتهيت",
    "أنجزت",
    "اكتمل",
    "انتهى",
    "finished",
    "done",
    "completed",
  ];
  const hasCompletionKeyword = completionKeywords.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );

  if (hasCompletionKeyword) {
    await handleTaskCompletion(chatId, text, userName);
  }
}

async function handleCallbackQuery(callbackQuery: any) {
  const bot = getBotInstance();
  if (!bot) return;

  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // Handle different callback actions
  switch (data) {
    case "confirm_completion":
      await bot.sendMessage(
        chatId,
        "✅ تم تأكيد إنجاز المهمة! سيتم إشعار الإدارة."
      );
      break;

    case "request_review":
      await bot.sendMessage(
        chatId,
        "📋 تم طلب المراجعة. سيتم إشعار المراجع المختص."
      );
      break;

    default:
      await bot.sendMessage(chatId, "إجراء غير معروف.");
  }

  // Answer the callback query to remove the loading state
  await bot.answerCallbackQuery(callbackQuery.id);
}

async function sendProjectStatus(chatId: number) {
  const bot = getBotInstance();
  if (!bot) return;

  try {
    // Get group information from database
    const group = await prisma.group.findFirst({
      where: {
        telegramChatId: chatId.toString(),
      },
      include: {
        users: {
          select: {
            name: true,
            role: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!group) {
      await bot.sendMessage(chatId, "❌ لم يتم العثور على معلومات المشروع.");
      return;
    }

    const statusMessage = `📊 **حالة المشروع: ${group.name}**

👥 **أعضاء الفريق:** ${group.users.length}
${group.users
  .map((user) => `• ${user.name} - ${getRoleInArabic(user.role || "")}`)
  .join("\n")}

📅 **تاريخ الإنشاء:** ${group.createdAt.toLocaleDateString("ar-EG")}
🔄 **آخر تحديث:** ${group.updatedAt.toLocaleDateString("ar-EG")}

✅ **الحالة:** نشط`;

    await bot.sendMessage(chatId, statusMessage, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error sending project status:", error);
    await bot.sendMessage(chatId, "❌ حدث خطأ في جلب حالة المشروع.");
  }
}

async function sendHelpMessage(chatId: number) {
  const bot = getBotInstance();
  if (!bot) return;

  const helpMessage = `🤖 **مساعدة بوت Alpha Factory**

📝 **الأوامر المتاحة:**
/status - عرض حالة المشروع الحالية
/team - عرض معلومات أعضاء الفريق
/help - عرض هذه الرسالة
/notify_admin - إشعار الإدارة بشكل مباشر

🔔 **الإشعارات التلقائية:**
• عند ذكر @admin في الرسائل
• عند استخدام كلمات الإنجاز (تم، أنجزت، اكتمل)
• تحديثات حالة المشروع

💡 **نصائح:**
• استخدم @admin لطلب المراجعة
• اكتب "تم إنجاز [اسم المهمة]" لإشعار الفريق
• تابع الإشعارات لمعرفة آخر التحديثات`;

  await bot.sendMessage(chatId, helpMessage, {
    parse_mode: "Markdown",
  });
}

async function sendTeamInfo(chatId: number) {
  const bot = getBotInstance();
  if (!bot) return;

  try {
    const group = await prisma.group.findFirst({
      where: {
        telegramChatId: chatId.toString(),
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!group) {
      await bot.sendMessage(chatId, "❌ لم يتم العثور على معلومات الفريق.");
      return;
    }

    const teamMessage = `👥 **فريق المشروع: ${group.name}**

${group.users
  .map(
    (user, index) => `
**${index + 1}. ${user.name}**
🎯 الدور: ${getRoleInArabic(user.role || "")}
📧 البريد: ${user.email}
✅ التحقق: ${user.emailVerified ? "محقق" : "غير محقق"}
📅 انضم في: ${user.createdAt.toLocaleDateString("ar-EG")}
`
  )
  .join("\n")}

📊 **إحصائيات:**
• إجمالي الأعضاء: ${group.users.length}
• المحققين: ${group.users.filter((u) => u.emailVerified).length}
• غير المحققين: ${group.users.filter((u) => !u.emailVerified).length}`;

    await bot.sendMessage(chatId, teamMessage, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error sending team info:", error);
    await bot.sendMessage(chatId, "❌ حدث خطأ في جلب معلومات الفريق.");
  }
}

async function handleAdminNotification(
  chatId: number,
  userId: number,
  userName: string
) {
  const bot = getBotInstance();
  if (!bot) return;

  const message = `🔔 **إشعار للإدارة**

👤 **المرسل:** ${userName}
📱 **معرف المستخدم:** ${userId}
⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}
💬 **الرسالة:** طلب مراجعة أو مساعدة من الإدارة

@admin يرجى التحقق من الطلب.`;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
  });
}

async function notifyAdminMention(
  chatId: number,
  text: string,
  userName: string
) {
  const bot = getBotInstance();
  if (!bot) return;

  const message = `📢 **تم ذكر الإدارة**

👤 **بواسطة:** ${userName}
💬 **الرسالة:** ${text}
⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}

@admin تم ذكرك في الرسالة أعلاه.`;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
  });
}

async function handleTaskCompletion(
  chatId: number,
  text: string,
  userName: string
) {
  const bot = getBotInstance();
  if (!bot) return;

  // Create inline keyboard for confirmation
  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ تأكيد الإنجاز", callback_data: "confirm_completion" },
        { text: "📋 طلب مراجعة", callback_data: "request_review" },
      ],
    ],
  };

  const message = `🎉 **تم رصد إنجاز مهمة!**

👤 **المنجز:** ${userName}
💬 **التفاصيل:** ${text}
⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}

يرجى تأكيد الإنجاز أو طلب المراجعة:`;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
}

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

// GET endpoint for webhook verification (if needed)
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: "Telegram webhook endpoint is active" });
}
