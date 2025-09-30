import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import {
  notifyAdmin,
  sendProjectUpdate,
  sendProjectStatusUpdate,
} from "../../../../lib/telegram";
import { sendClientProjectNotification } from "../../../../lib/email";

/**
 * Helper function to determine if a status change should notify the client
 */
function getClientNotificationStatus(
  fieldName: string,
  newValue: string,
  userRole: string
):
  | "editing_started"
  | "editing_completed"
  | "design_started"
  | "design_completed"
  | "review_started"
  | "review_completed"
  | "project_completed"
  | null {
  // Editor status changes
  if (fieldName === "editMode") {
    if (newValue === "قيد التنفيذ" && userRole === "editor") {
      return "editing_started";
    }
    if (newValue === "تم الانتهاء منه" && userRole === "editor") {
      return "editing_completed";
    }
  }

  // Designer status changes
  if (fieldName === "designMode") {
    if (newValue === "قيد التنفيذ" && userRole === "designer") {
      return "design_started";
    }
    if (newValue === "تم الانتهاء منه" && userRole === "designer") {
      return "design_completed";
    }
  }

  // Reviewer status changes
  if (fieldName === "reviewMode") {
    if (newValue === "قيد المراجعة" && userRole === "reviewer") {
      return "review_started";
    }
    if (newValue === "تمت المراجعة" && userRole === "reviewer") {
      return "review_completed";
    }
  }

  // Project completion (verification mode)
  if (fieldName === "verificationMode" && newValue === "تم الانتهاء منه") {
    return "project_completed";
  }

  return null;
}

interface UpdateProjectRequest {
  title?: string;
  type?: string;
  filmingStatus?: string;
  fileLinks?: string;
  notes?: string;
  date?: string;
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

    // Validate filming status update - cannot mark as done without file links
    if (
      updateData.filmingStatus === "تم الانتـــهاء مــنه" &&
      !existingProject.fileLinks &&
      !updateData.fileLinks
    ) {
      return NextResponse.json(
        {
          error:
            "يجب إضافة رابط الملفات قبل تغيير حالة التصوير إلى 'تم الانتهاء منه'",
        },
        { status: 400 }
      );
    }

    // Validate edit mode update - cannot mark as done without review links
    if (
      updateData.editMode === "تم الانتهاء منه" &&
      !existingProject.reviewLinks &&
      !updateData.reviewLinks
    ) {
      return NextResponse.json(
        {
          error:
            "يجب إضافة روابط المراجعة قبل تغيير حالة التحرير إلى 'تم الانتهاء منه'",
        },
        { status: 400 }
      );
    }

    // Validate design mode update - cannot mark as done without design links
    if (
      updateData.designMode === "تم الانتهاء منه" &&
      !existingProject.designLinks &&
      !updateData.designLinks
    ) {
      return NextResponse.json(
        {
          error:
            "يجب إضافة روابط التصميم قبل تغيير وضع التصميم إلى 'تم الانتهاء منه'",
        },
        { status: 400 }
      );
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

    // Special authorization check for rating (verificationMode) - only clients and admins can update ratings
    if (updateData.verificationMode !== undefined) {
      const canUpdateRating =
        user.role === "admin" || existingProject.clientId === user.id;

      if (!canUpdateRating) {
        return NextResponse.json(
          { error: "Only clients and admins can update project ratings" },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updates: any = {};

    // Parse date if provided
    if (updateData.date) {
      updates.startDate = new Date(updateData.date);
      updates.endDate = null; // Always set endDate to null
    }

    // Add other fields
    Object.keys(updateData).forEach((key) => {
      if (
        key !== "date" &&
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

    // Send detailed Telegram notifications for any changes
    if (
      existingProject.group?.telegramChatId &&
      Object.keys(updates).length > 0
    ) {
      // Send notification for each changed field
      for (const [fieldName, newValue] of Object.entries(updates)) {
        if (fieldName === "startDate" || fieldName === "endDate") continue; // Skip date objects

        const oldValue = (existingProject as any)[fieldName];

        // Only notify if the value actually changed
        if (oldValue !== newValue) {
          // For rating (verificationMode) updates, always send to specific group
          const targetChatId =
            fieldName === "verificationMode"
              ? "-1003191822981"
              : existingProject.group.telegramChatId;

          await sendProjectStatusUpdate(targetChatId, {
            projectTitle: existingProject.title,
            updatedBy: user.name || "Unknown User",
            userRole: user.role || "unknown",
            fieldName: fieldName,
            oldValue: String(oldValue || "غير محدد"),
            newValue: String(newValue || "غير محدد"),
            fieldNameArabic: getFieldNameInArabic(fieldName),
          });
        }
      }
    }

    // Send client email notifications for major status changes
    if (updatedProject.client && Object.keys(updates).length > 0) {
      for (const [fieldName, newValue] of Object.entries(updates)) {
        if (fieldName === "startDate" || fieldName === "endDate") continue; // Skip date objects

        const oldValue = (existingProject as any)[fieldName];

        // Only notify if the value actually changed and it's a significant status change
        if (oldValue !== newValue) {
          const clientNotificationStatus = getClientNotificationStatus(
            fieldName,
            String(newValue),
            user.role || "unknown"
          );

          if (clientNotificationStatus) {
            try {
              await sendClientProjectNotification({
                clientName: updatedProject.client.name,
                clientEmail: updatedProject.client.email,
                projectTitle: updatedProject.title,
                projectType: updatedProject.type,
                status: clientNotificationStatus,
                updatedBy: user.name,
                updatedByRole: getRoleInArabic(user.role || "unknown"),
              });
              console.log(
                `✅ Client notification sent for ${fieldName} change to ${newValue}`
              );
            } catch (emailError) {
              console.error(
                "❌ Error sending client notification:",
                emailError
              );
              // Don't fail the update if email fails
            }
          }
        }
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

// Helper function to get field name in Arabic
function getFieldNameInArabic(fieldName: string): string {
  const fieldMap: { [key: string]: string } = {
    filmingStatus: "حالة التصوير",
    editMode: "حالة التحرير",
    designMode: "حالة التصميم",
    reviewMode: "حالة المراجعة",
    verificationMode: "تقييم المشروع",
    reviewLinks: "روابط المراجعة",
    designLinks: "روابط التصميم",
    fileLinks: "ملفات المشروع",
    notes: "الملاحظات",
    title: "عنوان المشروع",
    type: "نوع المشروع",
    date: "تاريخ المشروع",
  };
  return fieldMap[fieldName] || fieldName;
}
