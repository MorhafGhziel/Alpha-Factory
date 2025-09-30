import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";
import { sendProjectUpdate } from "../../../../../lib/telegram";

interface AssignmentRequest {
  editorId?: string | null;
  designerId?: string | null;
  reviewerId?: string | null;
}

// PUT - Assign team members to a project
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only admins can assign team members
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can assign team members" },
        { status: 403 }
      );
    }

    const { editorId, designerId, reviewerId }: AssignmentRequest =
      await req.json();

    // Get the project
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        client: { select: { id: true, name: true } },
        group: { select: { id: true, name: true, telegramChatId: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate that assigned users exist and have correct roles
    const updates: {
      editorId?: string | null;
      designerId?: string | null;
      reviewerId?: string | null;
    } = {};
    const assignmentMessages: string[] = [];

    if (editorId !== undefined) {
      if (editorId) {
        const editor = await prisma.user.findUnique({
          where: { id: editorId },
          select: { id: true, name: true, role: true },
        });
        if (!editor || editor.role !== "editor") {
          return NextResponse.json(
            { error: "Invalid editor ID or user is not an editor" },
            { status: 400 }
          );
        }
        updates.editorId = editorId;
        assignmentMessages.push(`تم تعيين ${editor.name} كمحرر`);
      } else {
        updates.editorId = null;
        assignmentMessages.push("تم إلغاء تعيين المحرر");
      }
    }

    if (designerId !== undefined) {
      if (designerId) {
        const designer = await prisma.user.findUnique({
          where: { id: designerId },
          select: { id: true, name: true, role: true },
        });
        if (!designer || designer.role !== "designer") {
          return NextResponse.json(
            { error: "Invalid designer ID or user is not a designer" },
            { status: 400 }
          );
        }
        updates.designerId = designerId;
        assignmentMessages.push(`تم تعيين ${designer.name} كمصمم`);
      } else {
        updates.designerId = null;
        assignmentMessages.push("تم إلغاء تعيين المصمم");
      }
    }

    if (reviewerId !== undefined) {
      if (reviewerId) {
        const reviewer = await prisma.user.findUnique({
          where: { id: reviewerId },
          select: { id: true, name: true, role: true },
        });
        if (!reviewer || reviewer.role !== "reviewer") {
          return NextResponse.json(
            { error: "Invalid reviewer ID or user is not a reviewer" },
            { status: 400 }
          );
        }
        updates.reviewerId = reviewerId;
        assignmentMessages.push(`تم تعيين ${reviewer.name} كمراجع`);
      } else {
        updates.reviewerId = null;
        assignmentMessages.push("تم إلغاء تعيين المراجع");
      }
    }

    // Update the project with new assignments
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

    // Send Telegram notification about the assignment changes
    if (project.group?.telegramChatId && assignmentMessages.length > 0) {
      const message = `👥 **تحديث تعيينات المشروع**

📋 **المشروع:** ${project.title}
👤 **بواسطة:** ${user.name} (مدير)

🔄 **التغييرات:**
${assignmentMessages.map((msg) => `• ${msg}`).join("\n")}

⏰ **الوقت:** ${new Date().toLocaleString("ar-EG")}`;

      await sendProjectUpdate(
        project.group.telegramChatId,
        "تحديث التعيينات",
        message,
        project.group.name
      );
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Team members assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning team members:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to assign team members",
      },
      { status: 500 }
    );
  }
}
