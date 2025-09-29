import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { sendNewProjectNotification } from "../../../lib/telegram";
import { sendClientProjectNotification } from "../../../lib/email";

interface CreateProjectRequest {
  title: string;
  type: string;
  filmingStatus: string;
  fileLinks?: string;
  notes?: string;
  date: string;
  voiceNoteUrl?: string;
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
      filmingStatus,
      fileLinks,
      notes,
      date,
      voiceNoteUrl,
    }: CreateProjectRequest = await req.json();

    // Validate required fields
    if (!title || !type || !filmingStatus || !date) {
      return NextResponse.json(
        { error: "Missing required fields: title, type, filmingStatus, date" },
        { status: 400 }
      );
    }

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

    // Parse date if provided
    const parsedStartDate = date ? new Date(date) : null;

    // Create the project
    const project = await prisma.project.create({
      data: {
        title,
        type,
        filmingStatus,
        fileLinks,
        notes,
        date,
        startDate: parsedStartDate,
        endDate: null,
        clientId: user.id,
        groupId: user.groupId,
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
      const editors = user.group.users.filter((u) => u.role === "editor");
      const designers = user.group.users.filter((u) => u.role === "designer");
      const reviewers = user.group.users.filter((u) => u.role === "reviewer");

      // Auto-assign first available team members (you can implement more sophisticated logic)
      const updates: any = {};
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

    // Send Telegram notification to the group
    if (user.group?.telegramChatId) {
      await sendNewProjectNotification(user.group.telegramChatId, {
        title,
        type,
        filmingStatus,
        date,
        clientName: user.name,
        notes,
        fileLinks,
        voiceNoteUrl,
      });
    }

    // Send email notification to client
    try {
      await sendClientProjectNotification({
        clientName: user.name,
        clientEmail: user.email,
        projectTitle: title,
        projectType: type,
        status: "created",
        message: notes ? `ملاحظات المشروع: ${notes}` : undefined,
      });
      console.log(`✅ Client notification sent for project: ${title}`);
    } catch (emailError) {
      console.error("❌ Error sending client notification:", emailError);
      // Don't fail project creation if email fails
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
