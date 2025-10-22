import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: "userEmail is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${userEmail} not found` },
        { status: 404 }
      );
    }

    console.log(`🧹 Cleaning up test projects for ${userEmail}...`);

    // Delete all test projects for this user (projects with "Test" or "مشروع اختبار" in title)
    const deletedProjects = await prisma.project.deleteMany({
      where: {
        clientId: user.id,
        OR: [
          { title: { contains: "Test" } },
          { title: { contains: "مشروع اختبار" } },
          { title: { contains: "test" } },
        ],
      },
    });

    console.log(`✅ Deleted ${deletedProjects.count} test projects`);

    // Also unsuspend the user to start fresh
    await prisma.user.update({
      where: { id: user.id },
      data: {
        suspended: false,
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    console.log(`✅ User ${userEmail} unsuspended`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedProjects.count} test projects and unsuspended user`,
      deletedCount: deletedProjects.count,
    });
  } catch (error) {
    console.error("❌ Error cleaning up test projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
