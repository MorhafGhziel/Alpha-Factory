import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendProjectDeadlineReminder } from "../../../../lib/email";

/**
 * Helper function to parse date string and calculate days difference
 */
function calculateDaysOverdue(dateString: string): number {
  try {
    // Parse the date string (assuming format like "2024-10-01" or similar)
    const projectDate = new Date(dateString);
    const today = new Date();

    // Set time to start of day for accurate comparison
    projectDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds, then convert to days
    const diffTime = today.getTime() - projectDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return 0;
  }
}

/**
 * Helper function to check if a project's filming is incomplete
 */
function isFilmingIncomplete(filmingStatus: string): boolean {
  // Filming is incomplete if status is NOT "تم الانتـــهاء مــنه"
  return filmingStatus !== "تم الانتـــهاء مــنه";
}

/**
 * Check for overdue projects and send reminders
 * This endpoint should be called by a cron job or scheduled task
 */
export async function POST(req: NextRequest) {
  try {
    console.log("🔍 Starting overdue projects check...");

    // Get all projects where filming is not completed
    const projects = await prisma.project.findMany({
      where: {
        filmingStatus: {
          not: "تم الانتـــهاء مــنه", // Not completed
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`📊 Found ${projects.length} projects with incomplete filming`);

    const overdueProjects = [];
    const remindersToSend = [];

    // Check each project for overdue status
    for (const project of projects) {
      const daysOverdue = calculateDaysOverdue(project.date);

      // Only consider projects that are exactly 1 day overdue for one-time reminder
      if (daysOverdue === 1) {
        overdueProjects.push({
          id: project.id,
          title: project.title,
          type: project.type,
          date: project.date,
          filmingStatus: project.filmingStatus,
          clientName: project.client.name,
          clientEmail: project.client.email,
          daysOverdue,
        });

        // Prepare reminder data
        remindersToSend.push({
          clientName: project.client.name,
          clientEmail: project.client.email,
          projectTitle: project.title,
          projectType: project.type,
          projectDate: project.date,
          daysOverdue,
        });
      }
    }

    console.log(
      `⏰ Found ${overdueProjects.length} projects that are exactly 1 day overdue`
    );

    // Send reminders
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const reminder of remindersToSend) {
      try {
        console.log(
          `📧 Sending reminder for project "${reminder.projectTitle}" to ${reminder.clientEmail}`
        );

        const success = await sendProjectDeadlineReminder(reminder);

        if (success) {
          successCount++;
          results.push({
            projectTitle: reminder.projectTitle,
            clientEmail: reminder.clientEmail,
            status: "sent",
          });
          console.log(
            `✅ Reminder sent successfully for project: ${reminder.projectTitle}`
          );
        } else {
          failureCount++;
          results.push({
            projectTitle: reminder.projectTitle,
            clientEmail: reminder.clientEmail,
            status: "failed",
            error: "Email sending failed",
          });
          console.log(
            `❌ Failed to send reminder for project: ${reminder.projectTitle}`
          );
        }
      } catch (error) {
        failureCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          projectTitle: reminder.projectTitle,
          clientEmail: reminder.clientEmail,
          status: "failed",
          error: errorMessage,
        });
        console.error(
          `❌ Exception sending reminder for project ${reminder.projectTitle}:`,
          error
        );
      }

      // Small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const summary = {
      totalProjectsChecked: projects.length,
      overdueProjectsFound: overdueProjects.length,
      remindersSent: successCount,
      remindersFailed: failureCount,
      results,
    };

    console.log("📋 Overdue projects check completed:", summary);

    return NextResponse.json({
      success: true,
      message: "Overdue projects check completed",
      summary,
    });
  } catch (error) {
    console.error("❌ Error checking overdue projects:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check overdue projects",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing or status check
 */
export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Manual overdue projects check (GET)...");

    // Get all projects where filming is not completed
    const projects = await prisma.project.findMany({
      where: {
        filmingStatus: {
          not: "تم الانتـــهاء مــنه", // Not completed
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const overdueProjects = [];

    // Check each project for overdue status
    for (const project of projects) {
      const daysOverdue = calculateDaysOverdue(project.date);

      if (daysOverdue > 0) {
        overdueProjects.push({
          id: project.id,
          title: project.title,
          type: project.type,
          date: project.date,
          filmingStatus: project.filmingStatus,
          clientName: project.client.name,
          clientEmail: project.client.email,
          daysOverdue,
          wouldSendReminder: daysOverdue === 1, // Only send for exactly 1 day overdue
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalProjectsChecked: projects.length,
      overdueProjectsFound: overdueProjects.length,
      projectsEligibleForReminder: overdueProjects.filter(
        (p) => p.wouldSendReminder
      ).length,
      overdueProjects,
    });
  } catch (error) {
    console.error("❌ Error checking overdue projects (GET):", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check overdue projects",
      },
      { status: 500 }
    );
  }
}
