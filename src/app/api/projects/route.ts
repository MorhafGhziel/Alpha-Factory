import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { sendNewProjectNotification } from "../../../lib/telegram";
import { sendClientProjectNotification } from "../../../lib/email";

interface CreateProjectRequest {
  title: string;
  type: string;
  filmingStatus?: string;
  fileLinks?: string;
  designLinks?: string;
  notes?: string;
  date?: string;
  voiceNoteUrl?: string;
  hasThumbnail?: boolean;
  hasPoster?: boolean;
  ownerClientId?: string;
  submitType?: "draft" | "production";
  // Optional status overrides for enhancement projects
  editMode?: string;
  designMode?: string;
  reviewMode?: string;
  verificationMode?: string;
}

// POST - Create a new project
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      type,
      filmingStatus: filmingStatusInput,
      fileLinks,
      designLinks,
      notes,
      date: dateInput,
      voiceNoteUrl,
      hasThumbnail = false,
      hasPoster = false,
      ownerClientId,
      submitType = "production",
      editMode,
      designMode,
      reviewMode,
      verificationMode,
    }: CreateProjectRequest = await req.json();

    // Validate required fields
    if (!title?.trim() || !type?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: title, type" },
        { status: 400 },
      );
    }

    const isDraft = submitType === "draft";
    const filmingStatus =
      filmingStatusInput ||
      (isDraft ? "مسودة" : "لم يتم الانتهاء منه");
    const date =
      dateInput || new Date().toISOString().split("T")[0];

    // Get user with group information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            telegramChatId: true,
            users: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only clients can create projects
    if (user.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can create projects" },
        { status: 403 }
      );
    }

    // Resolve project owner (seat) — must be a client in the same group
    let projectClientId = user.id;
    if (ownerClientId && ownerClientId !== user.id) {
      if (!user.groupId) {
        return NextResponse.json(
          { error: "Cannot assign project to another seat without a group" },
          { status: 400 },
        );
      }
      const seatOwner = await prisma.user.findFirst({
        where: {
          id: ownerClientId,
          groupId: user.groupId,
          role: "client",
        },
        select: { id: true },
      });
      if (!seatOwner) {
        return NextResponse.json(
          { error: "Invalid seat selection" },
          { status: 400 },
        );
      }
      projectClientId = seatOwner.id;
    }

    const parsedStartDate = date ? new Date(date) : null;

    // Create the project
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        type: type.trim(),
        filmingStatus,
        fileLinks: fileLinks?.trim() || null,
        designLinks: designLinks?.trim() || null,
        notes: notes?.trim() || null,
        hasThumbnail: Boolean(hasThumbnail),
        hasPoster: Boolean(hasPoster),
        date,
        startDate: parsedStartDate,
        endDate: null,
        clientId: projectClientId,
        groupId: user.groupId,
        // Use provided status overrides or fall back to defaults
        editMode: editMode || undefined, // Will use database default if not provided
        designMode: designMode || undefined,
        reviewMode: reviewMode || undefined,
        verificationMode: verificationMode || undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            telegramChatId: true,
          },
        },
      },
    });

    // Auto-assign team members if group exists
    if (user.group) {
      const editors = user.group.users.filter(
        (u: { role: string | null }) => u.role === "editor"
      );
      const designers = user.group.users.filter(
        (u: { role: string | null }) => u.role === "designer"
      );
      const reviewers = user.group.users.filter(
        (u: { role: string | null }) => u.role === "reviewer"
      );

      // Auto-assign first available team members (you can implement more sophisticated logic)
      const updates: {
        editorId?: string;
        designerId?: string;
        reviewerId?: string;
      } = {};
      if (editors.length > 0) updates.editorId = editors[0].id;
      if (designers.length > 0) updates.designerId = designers[0].id;
      if (reviewers.length > 0) updates.reviewerId = reviewers[0].id;

      if (Object.keys(updates).length > 0) {
        await prisma.project.update({
          where: { id: project.id },
          data: updates,
        });
      }
    }

    // Send Telegram notification to the group (skip for drafts)
    if (!isDraft && user.group?.telegramChatId) {
      console.log(
        `📱 Attempting to send Telegram notification to chat ID: ${user.group.telegramChatId}`
      );
      try {
        const ownerUser = await prisma.user.findUnique({
          where: { id: projectClientId },
          select: { name: true },
        });

        const notificationSent = await sendNewProjectNotification(
          user.group.telegramChatId,
          {
            title,
            type,
            filmingStatus,
            date,
            clientName: ownerUser?.name || user.name,
            notes: [
              notes,
              hasThumbnail ? "✅ مطلوب: صورة مصغرة" : null,
              hasPoster ? "✅ مطلوب: ملصق دعائي (بوستر)" : null,
              designLinks ? `روابط التصميم: ${designLinks}` : null,
            ]
              .filter(Boolean)
              .join("\n"),
            fileLinks,
            voiceNoteUrl,
          }
        );

        if (notificationSent) {
          console.log(
            `✅ Telegram notification sent successfully for project: ${title}`
          );
        } else {
          console.error(
            `❌ Failed to send Telegram notification for project: ${title}`
          );
        }
      } catch (telegramError) {
        console.error("❌ Error sending Telegram notification:", telegramError);
      }
    } else {
      console.log(
        `📱 No Telegram chat ID found for group. User group: ${
          user.group?.name || "No group"
        }, Group ID: ${user.groupId || "No groupId"}`
      );
    }

    // Send email notification to client only if filming is completed (not drafts)
    if (
      !isDraft &&
      filmingStatus === "تم الانتـــهاء مــنه"
    ) {
      try {
        await sendClientProjectNotification({
          clientName: user.name,
          clientEmail: user.email,
          projectTitle: title,
          projectType: type,
          status: "created",
          message: notes ? `ملاحظات المشروع: ${notes}` : undefined,
        });
        console.log(
          `✅ Client notification sent for project: ${title} (filming completed)`
        );
      } catch (emailError) {
        console.error("❌ Error sending client notification:", emailError);
        // Don't fail project creation if email fails
      }
    } else {
      console.log(
        `📝 Project created but no email sent - filming status: ${filmingStatus}`
      );
    }

    return NextResponse.json({
      success: true,
      project,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create project",
      },
      { status: 500 }
    );
  }
}

// GET - Get projects (filtered by user role)
export async function GET(req: NextRequest) {
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

    let projects;

    switch (user.role) {
      case "client":
        // Clients see only their own projects
        projects = await prisma.project.findMany({
          where: { clientId: user.id },
          include: {
            client: { select: { id: true, name: true, email: true } },
            editor: { select: { id: true, name: true, email: true } },
            designer: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true, email: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "editor":
        // Editors see projects assigned to them or in their group
        projects = await prisma.project.findMany({
          where: {
            OR: [{ editorId: user.id }, { groupId: user.groupId }],
          },
          include: {
            client: { select: { id: true, name: true, email: true } },
            editor: { select: { id: true, name: true, email: true } },
            designer: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true, email: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "designer":
        // Designers see projects assigned to them or in their group
        projects = await prisma.project.findMany({
          where: {
            OR: [{ designerId: user.id }, { groupId: user.groupId }],
          },
          include: {
            client: { select: { id: true, name: true, email: true } },
            editor: { select: { id: true, name: true, email: true } },
            designer: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true, email: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "reviewer":
        // Reviewers see projects assigned to them or in their group
        projects = await prisma.project.findMany({
          where: {
            OR: [{ reviewerId: user.id }, { groupId: user.groupId }],
          },
          include: {
            client: { select: { id: true, name: true, email: true } },
            editor: { select: { id: true, name: true, email: true } },
            designer: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true, email: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "admin":
        // Admins see all projects
        projects = await prisma.project.findMany({
          include: {
            client: { select: { id: true, name: true, email: true } },
            editor: { select: { id: true, name: true, email: true } },
            designer: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true, email: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 403 }
        );
    }

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}
