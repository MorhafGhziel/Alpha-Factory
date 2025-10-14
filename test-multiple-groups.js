#!/usr/bin/env node

/**
 * Test script for multiple Telegram groups functionality
 *
 * This script helps you test the new multiple chat ID feature.
 *
 * Usage:
 * 1. Create multiple Telegram groups manually
 * 2. Add your bot as admin to each group
 * 3. Get the chat IDs using this script
 * 4. Use these chat IDs when creating accounts
 */

require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

console.log("🔍 Testing Multiple Telegram Groups...\n");
console.log(
  "TELEGRAM_BOT_TOKEN:",
  TELEGRAM_BOT_TOKEN ? "✅ Set" : "❌ Missing"
);

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is missing from .env file");
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Test chat IDs - replace these with your actual group chat IDs
const testChatIds = [
  "-1002545697513", // Replace with your Group 1 chat ID
  // "-1001234567890",  // Replace with your Group 2 chat ID
  // "-1009876543210",  // Replace with your Group 3 chat ID
  // Add more chat IDs as needed
];

async function testMultipleGroups() {
  console.log("🧪 Testing multiple Telegram groups...\n");

  for (let i = 0; i < testChatIds.length; i++) {
    const chatId = testChatIds[i];
    console.log(`\n📋 Testing Group ${i + 1}: ${chatId}`);

    try {
      // Test 1: Get chat info
      const chat = await bot.getChat(chatId);
      console.log(`  ✅ Chat found: ${chat.title || chat.first_name}`);
      console.log(`  📊 Type: ${chat.type}`);
      console.log(
        `  👥 Members: ${
          chat.all_members_are_administrators ? "All admins" : "Mixed roles"
        }`
      );

      // Test 2: Create invite link
      const inviteLink = await bot.createChatInviteLink(chatId, {
        name: `Test Project ${i + 1}`,
        member_limit: 5,
        creates_join_request: false,
        expire_date: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      });

      console.log(`  🔗 Invite link created: ${inviteLink.invite_link}`);
      console.log(
        `  ⏰ Expires: ${new Date(
          inviteLink.expire_date * 1000
        ).toLocaleString()}`
      );

      // Test 3: Send test message
      const testMessage = await bot.sendMessage(
        chatId,
        `🧪 **Test Message for Group ${i + 1}**\n\n` +
          `This is a test of the new multiple groups feature.\n` +
          `Chat ID: ${chatId}\n` +
          `Time: ${new Date().toLocaleString()}\n\n` +
          `✅ Bot is working correctly in this group!`,
        { parse_mode: "Markdown" }
      );

      console.log(`  💬 Test message sent (ID: ${testMessage.message_id})`);
    } catch (error) {
      console.log(`  ❌ Error testing group ${i + 1}:`, error.message);

      if (error.message.includes("chat not found")) {
        console.log(`  💡 Make sure the chat ID ${chatId} is correct`);
      } else if (error.message.includes("bot is not a member")) {
        console.log(`  💡 Add the bot to group ${chatId} as an admin`);
      } else if (error.message.includes("not enough rights")) {
        console.log(`  💡 Give the bot admin permissions in group ${chatId}`);
      }
    }
  }

  console.log("\n🎯 Test Summary:");
  console.log(
    "✅ If you see invite links and test messages above, the groups are ready!"
  );
  console.log(
    "✅ Use these chat IDs in your admin panel when creating accounts:"
  );
  testChatIds.forEach((chatId, index) => {
    console.log(`   Group ${index + 1}: ${chatId}`);
  });

  console.log("\n📋 Next Steps:");
  console.log("1. Go to your admin panel (/admin/addaccount)");
  console.log("2. Fill in the group name and user details");
  console.log(
    "3. Enter one of the chat IDs above in the 'Telegram Chat ID' field"
  );
  console.log(
    "4. Create the accounts and check that users get the correct group invite link"
  );

  process.exit(0);
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});

// Run the test
testMultipleGroups().catch(console.error);
