import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { notifyAdmin, sendProjectUpdate } from "../../../../lib/telegram";

interface UpdateProjectRequest {
  title?: string;
  type?: string;
  filmingStatus?: string;
  fileLinks?: string;
  notes?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  editMode?: string;
  reviewMode?: string;
  designMode?: string;
  verificationMode?: string;
  reviewLinks?: string;
  designLinks?: string;
  documentation?: string;
}

// GET - Get a specific project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        groupId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        editor: { select: { id: true, name: true, email: true } },
        designer: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true, telegramChatId: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user has access to this project
    const hasAccess =
      user.role === "admin" ||
      project.clientId === user.id ||
      project.editorId === user.id ||
      project.designerId === user.id ||
      project.reviewerId === user.id ||
      project.groupId === user.groupId;

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this project" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch project",
      },
      { status: 500 }
    );
  }
}

// PUT - Update a project
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        name: true,
        groupId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: UpdateProjectRequest = await req.json();

    // Get the current project
    const existingProject = await prisma.project.findUnique({
      where: { id: id },
      include: {
        client: { select: { id: true, name: true } },
        group: { select: { id: true, name: true, telegramChatId: true } },
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check permissions based on user role
    const canUpdate =
      user.role === "admin" ||
      existingProject.clientId === user.id ||
      (user.role === "editor" &&
        (existingProject.editorId === user.id ||
          existingProject.groupId === user.groupId)) ||
      (user.role === "designer" &&
        (existingProject.designerId === user.id ||
          existingProject.groupId === user.groupId)) ||
      (user.role === "reviewer" &&
        (existingProject.reviewerId === user.id ||
          existingProject.groupId === user.groupId));

    if (!canUpdate) {
      return NextResponse.json(
        { error: "Access denied to update this project" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updates: any = {};

    // Parse dates if provided
    if (updateData.startDate)
      updates.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updates.endDate = new Date(updateData.endDate);

    // Add other fields
    Object.keys(updateData).forEach((key) => {
      if (
        key !== "startDate" &&
        key !== "endDate" &&
        updateData[key as keyof UpdateProjectRequest] !== undefined
      ) {
        updates[key] = updateData[key as keyof UpdateProjectRequest];
      }
    });

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: updates,
      include: {
        client: { select: { id: true, name: true, email: true } },
        editor: { select: { id: true, name: true, email: true } },
        designer: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true, telegramChatId: true } },
      },
    });

    // Send Telegram notifications for status changes
    if (existingProject.group?.telegramChatId) {
      let notificationSent = false;

      // Check for completion status changes and notify admin
      if (
        updateData.editMode === "تم الانتهاء منه" &&
        existingProject.editMode !== "تم الانتهاء منه"
      ) {
        await notifyAdmin(
          existingProject.group.telegramChatId,
          user.name,
          user.role || "unknown",
          "تحرير الفيديو",
          existingProject.title
        );
        notificationSent = true;
      }

      if (
        updateData.designMode === "تم الانتهاء منه" &&
        existingProject.designMode !== "تم الانتهاء منه"
      ) {
        await notifyAdmin(
          existingProject.group.telegramChatId,
          user.name,
          user.role || "unknown",
          "التصميم",
          existingProject.title
        );
        notificationSent = true;
      }

      if (
        updateData.reviewMode === "تمت المراجعة" &&
        existingProject.reviewMode !== "تمت المراجعة"
      ) {
        await notifyAdmin(
          existingProject.group.telegramChatId,
          user.name,
          user.role || "unknown",
          "المراجعة",
          existingProject.title
        );
        notificationSent = true;
      }

      // Send general project update if no specific completion notification was sent
      if (!notificationSent && Object.keys(updates).length > 0) {
        const updateMessage = `تم تحديث المشروع بواسطة ${
          user.name
        } (${getRoleInArabic(user.role || "")})`;
        await sendProjectUpdate(
          existingProject.group.telegramChatId,
          "تحديث المشروع",
          updateMessage,
          existingProject.title
        );
      }
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update project",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        clientId: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only admins and project owners can delete projects
    if (user.role !== "admin" && project.clientId !== user.id) {
      return NextResponse.json(
        { error: "Access denied to delete this project" },
        { status: 403 }
      );
    }

    await prisma.project.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      { status: 500 }
    );
  }
}

// Helper function to get role name in Arabic
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
