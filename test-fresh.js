// Fresh test without dotenv caching
delete require.cache[require.resolve("dotenv")];
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

console.log("🔍 Fresh Telegram Test...\n");
console.log(
  "TELEGRAM_BOT_TOKEN:",
  TELEGRAM_BOT_TOKEN ? "✅ Set" : "❌ Missing"
);
console.log("ADMIN_TELEGRAM_CHAT_ID:", ADMIN_TELEGRAM_CHAT_ID);

// Test with the exact chat ID from your terminal output
const testChatId = "-1002545697513";
console.log("Using chat ID:", testChatId);

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

async function testBot() {
  try {
    console.log("\n🤖 Testing bot connection...");
    const botInfo = await bot.getMe();
    console.log("✅ Bot connected:", botInfo.username);

    console.log("\n🔗 Testing invite link creation...");
    const inviteLink = await bot.createChatInviteLink(testChatId, {
      name: "Alpha Factory Test",
      creates_join_request: false,
    });

    console.log("✅ SUCCESS! Invite link created:", inviteLink.invite_link);
    console.log("\n🎉 Telegram integration is working!");
  } catch (error) {
    console.log("\n❌ Error:", error.message);

    // Let's try to get chat info
    try {
      console.log("\n🔍 Trying to get chat info...");
      const chat = await bot.getChat(testChatId);
      console.log("Chat found:", chat.title, "Type:", chat.type);
    } catch (chatError) {
      console.log("Chat info error:", chatError.message);
    }
  }
}

testBot();
