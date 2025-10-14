# Project Deadline Reminder System

## Overview

This system automatically sends email reminders to clients when their project deadlines have passed and the filming status is still incomplete. The reminder is sent exactly **one day** after the project date has passed, ensuring it's a one-time notification.

## How It Works

### 1. **Automatic Detection**

- The system checks all projects where `filmingStatus` is NOT "تم الانتـــهاء مــنه" (not completed)
- It calculates how many days have passed since the project's scheduled date
- Only projects that are exactly 1 day overdue receive a reminder

### 2. **Email Template**

- Uses the same styling as other Alpha Factory emails (dark theme, Arabic RTL layout)
- Includes project details (title, type, original date, days overdue)
- Provides a direct link to the client tracking board for easy status updates
- Professional and polite tone in Arabic

### 3. **One-Time Reminder**

- Reminders are sent only when a project is exactly 1 day overdue
- No database schema changes required - the timing ensures one-time delivery
- No spam or repeated reminders

## API Endpoints

### 1. Check Overdue Projects

```
POST /api/reminders/check-overdue-projects
GET /api/reminders/check-overdue-projects (for testing)
```

**Purpose**: Checks for overdue projects and sends reminders
**Usage**: Called by the daily cron job

### 2. Daily Cron Job

```
GET /api/cron/daily-reminders
```

**Purpose**: Scheduled endpoint that runs daily at 9:00 AM UTC
**Configuration**: Set up in `vercel.json` with Vercel Cron

### 3. Test Endpoint

```
POST /api/test/reminder-system
GET /api/test/reminder-system (for instructions)
```

**Purpose**: Manual testing of the reminder email system

## Setup Instructions

### 1. **Environment Variables**

Make sure these are configured in your environment:

- `RESEND_API_KEY`: Your Resend API key for sending emails
- `CRON_SECRET` (optional): Secret token for securing cron endpoints

### 2. **Cron Job Configuration**

The system is configured to run daily at 9:00 AM UTC via Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 3. **Testing the System**

#### Manual Test (Single Email)

```bash
curl -X POST https://your-domain.com/api/test/reminder-system \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "أحمد محمد",
    "clientEmail": "test@example.com",
    "projectTitle": "فيديو ترويجي للشركة",
    "projectType": "إنتاج فيديو",
    "projectDate": "2024-10-01",
    "daysOverdue": 1
  }'
```

#### Check Overdue Projects (No Emails Sent)

```bash
curl https://your-domain.com/api/reminders/check-overdue-projects
```

#### Trigger Full Check (Sends Actual Emails)

```bash
curl -X POST https://your-domain.com/api/reminders/check-overdue-projects
```

## Email Content

### Subject Line

```
تذكير بموعد المشروع - [Project Title]
```

### Key Features

- **Clock icon** (⏰) for visual recognition
- **Project details** clearly displayed
- **Days overdue** highlighted in red
- **Action button** linking to client tracking board
- **Professional Arabic messaging**
- **Support contact** information

### Sample Content

```
عزيزي [Client Name]،

نود تذكيرك بأن موعد مشروعك قد تجاوز التاريخ المحدد بـ 1 يوم،
ولم يتم الانتهاء من مرحلة التصوير بعد. يرجى إكمال التصوير وتحديث حالة المشروع
في أقرب وقت ممكن لضمان سير العمل بسلاسة.
```

## Technical Details

### Date Handling

- Projects store dates in both `date` (string) and `startDate` (DateTime) fields
- The system uses the `date` field for calculations
- Supports various date formats and handles parsing errors gracefully

### Filming Status Detection

- Incomplete filming: Any status except "تم الانتـــهاء مــنه"
- The system specifically checks for this Arabic text to determine completion

### Email Delivery

- Uses Resend API for reliable email delivery
- Includes retry mechanism (2 attempts with exponential backoff)
- Proper error handling and logging
- Rate limiting protection (100ms delay between emails)

### Security

- Optional CRON_SECRET for securing automated endpoints
- Email validation before sending
- Proper error handling to prevent system crashes

## Monitoring and Logs

### Console Logs

The system provides detailed logging:

- `🔍 Starting overdue projects check...`
- `📊 Found X projects with incomplete filming`
- `⏰ Found X projects that are exactly 1 day overdue`
- `📧 Sending reminder for project "Title" to email@example.com`
- `✅ Reminder sent successfully for project: Title`
- `❌ Failed to send reminder for project: Title`

### Response Format

```json
{
  "success": true,
  "message": "Overdue projects check completed",
  "summary": {
    "totalProjectsChecked": 10,
    "overdueProjectsFound": 2,
    "remindersSent": 2,
    "remindersFailed": 0,
    "results": [...]
  }
}
```

## Maintenance

### Regular Checks

1. Monitor cron job execution logs
2. Verify email delivery rates
3. Check for any failed reminders
4. Ensure date parsing works correctly for different formats

### Troubleshooting

1. **No emails sent**: Check Resend API key and configuration
2. **Wrong dates**: Verify project date format in database
3. **Cron not running**: Check Vercel Cron configuration
4. **Arabic text issues**: Ensure proper UTF-8 encoding

## Future Enhancements

Possible improvements (if needed):

1. **Multiple reminder intervals** (3 days, 7 days overdue)
2. **Database tracking** of sent reminders
3. **Email preferences** for clients
4. **Telegram notifications** integration
5. **Dashboard** for monitoring reminder statistics

---

**Note**: This system is designed to be simple, reliable, and non-intrusive. It sends exactly one reminder per project when it becomes 1 day overdue, helping maintain client communication without being spammy.
