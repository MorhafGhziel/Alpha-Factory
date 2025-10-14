import { NextRequest, NextResponse } from "next/server";

/**
 * Daily cron job endpoint to check for overdue projects and send reminders
 * This endpoint should be called once per day by a cron service like Vercel Cron or external scheduler
 *
 * To set up with Vercel Cron, add this to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/daily-reminders",
 *       "schedule": "0 9 * * *"
 *     }
 *   ]
 * }
 *
 * This will run daily at 9:00 AM UTC
 */
export async function GET(req: NextRequest) {
  try {
    // Verify the request is from a cron job (optional security check)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log("❌ Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕒 Daily reminders cron job started");

    // Call the overdue projects check endpoint
    const baseUrl = req.nextUrl.origin;
    const checkUrl = `${baseUrl}/api/reminders/check-overdue-projects`;

    const response = await fetch(checkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to check overdue projects: ${response.statusText}`
      );
    }

    const result = await response.json();

    console.log("✅ Daily reminders cron job completed successfully");
    console.log("📊 Summary:", result.summary);

    return NextResponse.json({
      success: true,
      message: "Daily reminders cron job completed",
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("❌ Error in daily reminders cron job:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Cron job failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST method for flexibility
export async function POST(req: NextRequest) {
  return GET(req);
}
