# Telegram Bot Integration Setup

This document explains how to set up the Telegram bot integration for Alpha Factory.

## Features

- **Automatic Group Creation**: When admin creates accounts in a group, a Telegram group is automatically created
- **Invite Links**: Users receive Telegram group invite links via email
- **Task Notifications**: Bot sends notifications when tasks are completed (e.g., editor finishes their part)
- **Admin Mentions**: Bot notifies admin when mentioned in messages
- **Project Updates**: Real-time updates about project status

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a conversation and use `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided by BotFather

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Telegram Bot Token from BotFather
TELEGRAM_BOT_TOKEN="your_bot_token_here"

# Admin Telegram Chat ID (for fallback group creation)
ADMIN_TELEGRAM_CHAT_ID="your_admin_chat_id_here"

# Optional: Webhook URL for production
TELEGRAM_WEBHOOK_URL="https://yourdomain.com/api/telegram/webhook"
```

### 3. Get Chat ID

To get your admin chat ID:

1. Create a group and add your bot as admin
2. Send a message to the group
3. Visit: `https://api.telegram.org/bot{BOT_TOKEN}/getUpdates`
4. Look for the `chat.id` in the response

### 4. Bot Permissions

Make sure your bot has these permissions in groups:

- Send messages
- Read messages
- Create invite links
- Add members (if needed)

## API Endpoints

### Notification API

`POST /api/notifications`

Send notifications to Telegram group:

```json
{
  "type": "task_completion",
  "taskType": "Video Editing",
  "message": "Optional message"
}
```

Types:

- `task_completion`: Notify admin when task is done
- `project_update`: General project update
- `admin_mention`: Request admin review

### Telegram Webhook

`POST /api/telegram/webhook`

Handles incoming Telegram messages and commands.

## Bot Commands

Users can use these commands in Telegram groups:

- `/start` - Welcome message
- `/status` - Show project status
- `/team` - Show team members
- `/help` - Show available commands
- `/notify_admin` - Notify admin directly

## Automatic Features

### Task Completion Detection

Bot automatically detects completion keywords in messages:

- Arabic: تم، انتهيت، أنجزت، اكتمل، انتهى
- English: finished, done, completed

### Admin Mentions

When users mention `@admin` in messages, the bot sends a notification.

## Database Schema

The system adds these fields to the `Group` model:

```prisma
model Group {
  // ... existing fields
  telegramChatId    String?  // Telegram group chat ID
  telegramInviteLink String? // Telegram group invite link
  telegramGroupName String?  // Telegram group name
}
```

## Email Integration

When accounts are created, users receive emails with:

- Login credentials
- Telegram group invite link
- Instructions to join the group

## Error Handling

- If Telegram bot is not configured, the system continues without Telegram features
- Failed group creation doesn't prevent account creation
- Email notifications include Telegram links only if available

## Production Deployment

1. Set up webhook URL in production
2. Configure bot webhook: `https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={WEBHOOK_URL}`
3. Ensure HTTPS is enabled for webhook endpoint

## Troubleshooting

### Bot not responding

- Check if bot token is correct
- Verify bot is admin in the group
- Check webhook URL is accessible

### Group creation fails

- Ensure bot has proper permissions
- Check if admin chat ID is correct
- Verify bot can create invite links

### Notifications not working

- Check user's group has Telegram configured
- Verify chat ID is valid
- Check bot permissions in group

## Security Notes

- Keep bot token secure
- Use HTTPS for webhook in production
- Validate all incoming webhook data
- Rate limit bot API calls
