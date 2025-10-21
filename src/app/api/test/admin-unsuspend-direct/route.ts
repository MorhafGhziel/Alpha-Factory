import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

/**
 * Direct test endpoint for admin unsuspend functionality
 * This simulates what an admin would do to remove suspension
 */
export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await req.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: "userEmail is required" },
        { status: 400 }
      );
    }

    console.log(`🔧 ADMIN TEST: Removing suspension for ${userEmail}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        suspendedAt: true,
        suspensionReason: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${userEmail} not found` },
        { status: 404 }
      );
    }

    const beforeStatus = {
      suspended: user.suspended,
      suspendedAt: user.suspendedAt,
      suspensionReason: user.suspensionReason,
    };

    let afterStatus = beforeStatus;
    let actionTaken = "none";

    // Remove suspension if user is suspended
    if (user.suspended) {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            suspended: false,
            suspendedAt: null,
            suspensionReason: null,
          },
        });

        afterStatus = {
          suspended: updatedUser.suspended,
          suspendedAt: updatedUser.suspendedAt,
          suspensionReason: updatedUser.suspensionReason,
        };

        actionTaken = "suspension_removed";
        console.log(`✅ Suspension removed for user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to remove suspension:`, error);
        return NextResponse.json(
          { error: "Failed to remove suspension" },
          { status: 500 }
        );
      }
    } else {
      actionTaken = "already_active";
      console.log(`ℹ️  User ${user.email} is already active`);
    }

    const testResults = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      adminAction: {
        type: "remove_suspension",
        actionTaken,
        timestamp: new Date().toISOString(),
      },
      statusChange: {
        before: beforeStatus,
        after: afterStatus,
      },
      simulatedAdminFlow: [
        "Admin logs into admin panel",
        "Admin navigates to Accounts Management",
        `Admin searches for user: ${user.email}`,
        "Admin views user details",
        user.suspended
          ? "Admin clicks 'إلغاء التعليق' (Remove Suspension) button"
          : "Admin sees user is already active",
        user.suspended
          ? "Admin confirms suspension removal in modal"
          : "No action needed - user is active",
        user.suspended
          ? "System updates database: suspended = false"
          : "System shows user is already active",
        user.suspended
          ? "Admin sees success message: 'تم إلغاء تعليق الحساب بنجاح'"
          : "Admin sees status: User is active",
      ],
    };

    return NextResponse.json({
      success: true,
      message:
        actionTaken === "suspension_removed"
          ? "Suspension removed successfully by admin"
          : "User is already active",
      results: testResults,
    });
  } catch (error) {
    console.error("❌ Error in admin unsuspend test:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Admin Unsuspend Test Endpoint",
    description: "Test admin's ability to remove user suspension",
    usage: "POST with { userEmail }",
    adminActions: [
      "View user suspension status",
      "Remove suspension if user is suspended",
      "Show appropriate message based on current status",
    ],
  });
}
