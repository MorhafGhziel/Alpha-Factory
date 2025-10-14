import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

// GET - Get dashboard statistics (owner only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Unauthorized - Owner access required" },
        { status: 401 }
      );
    }

    // Get statistics
    const [
      totalUsers,
      totalGroups,
      totalProjects,
      adminUsers,
      clientUsers,
      editorUsers,
      designerUsers,
      reviewerUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.project.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { role: "client" } }),
      prisma.user.count({ where: { role: "editor" } }),
      prisma.user.count({ where: { role: "designer" } }),
      prisma.user.count({ where: { role: "reviewer" } }),
    ]);

    const stats = {
      totalUsers,
      totalGroups,
      totalProjects,
      adminUsers,
      clientUsers,
      editorUsers,
      designerUsers,
      reviewerUsers,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
