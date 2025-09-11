import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { generateCredentials } from "../../../../utils/credentials";
import { sendCredentialsEmails } from "../../../../lib/email";
import {
  createTelegramGroup,
  isTelegramConfigured,
} from "../../../../lib/telegram";

interface UserData {
  name: string;
  email: string;
  role: string;
}

interface CreateGroupRequest {
  groupName: string;
  users: UserData[];
}

// POST - Create a new group with users
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupName, users }: CreateGroupRequest = await req.json();

    // Validate input
    if (!groupName || !users || users.length === 0) {
      return NextResponse.json(
        { error: "Group name and users are required" },
        { status: 400 }
      );
    }

    // Validate that all users have required fields
    for (const user of users) {
      if (!user.name || !user.email || !user.role) {
        return NextResponse.json(
          { error: "Name, email, and role are required for all users" },
          { status: 400 }
        );
      }
    }

    // Check if any email already exists
    const existingEmails = await prisma.user.findMany({
      where: {
        email: {
          in: users.map((user) => user.email),
        },
      },
      select: { email: true },
    });

    if (existingEmails.length > 0) {
      return NextResponse.json(
        {
          error: `البريد الإلكتروني مستخدم مسبقاً: ${existingEmails
            .map((u) => u.email)
            .join(", ")}`,
        },
        { status: 409 }
      );
    }

    // Generate credentials and create users
    const createdUserIds: string[] = [];
    const usersWithCredentials: Array<{
      name: string;
      email: string;
      username: string;
      password: string;
      role: string;
      groupName: string;
    }> = [];

    try {
      for (const userData of users) {
        // Generate random username and password
        const { username, password } = generateCredentials(
          userData.name,
          userData.role
        );

        const signUpResult = await auth.api.signUpEmail({
          body: {
            email: userData.email,
            password: password,
            name: userData.name,
            role: userData.role,
          },
        });

        if (!signUpResult.user) {
          throw new Error(`Failed to create user ${userData.name}`);
        }

        createdUserIds.push(signUpResult.user.id);

        // Store credentials for email sending
        usersWithCredentials.push({
          name: userData.name,
          email: userData.email,
          username: username,
          password: password,
          role: userData.role,
          groupName: groupName,
        });
      }
    } catch (userCreationError) {
      // If user creation fails partway through, clean up any created users
      if (createdUserIds.length > 0) {
        try {
          await prisma.user.deleteMany({
            where: {
              id: {
                in: createdUserIds,
              },
            },
          });
        } catch (cleanupError) {
          console.error("Failed to cleanup users after error:", cleanupError);
        }
      }
      throw userCreationError;
    }

    // Create Telegram group if configured
    let telegramResult = null;
    if (isTelegramConfigured()) {
      console.log("Creating Telegram group...");
      telegramResult = await createTelegramGroup(
        groupName,
        usersWithCredentials.map((u) => ({
          name: u.name,
          email: u.email,
          role: u.role,
        }))
      );

      if (telegramResult.success) {
        console.log(
          "Telegram group created successfully:",
          telegramResult.chatId
        );
      } else {
        console.error("Failed to create Telegram group:", telegramResult.error);
      }
    } else {
      console.log("Telegram bot not configured, skipping group creation");
    }

    // Now create group and associate users in a fast transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // Create the group with Telegram information
        const group = await tx.group.create({
          data: {
            name: groupName,
            telegramChatId: telegramResult?.chatId || null,
            telegramInviteLink: telegramResult?.inviteLink || null,
            telegramGroupName: telegramResult?.success
              ? `Alpha Factory - ${groupName}`
              : null,
          },
        });

        // Update each user with groupId and username individually
        for (let i = 0; i < createdUserIds.length; i++) {
          await tx.user.update({
            where: { id: createdUserIds[i] },
            data: {
              groupId: group.id,
              username: usersWithCredentials[i].username,
            },
          });
        }

        // Fetch the updated users
        const updatedUsers = await tx.user.findMany({
          where: {
            id: {
              in: createdUserIds,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            emailVerified: true,
          },
        });

        return { group, users: updatedUsers };
      },
      {
        timeout: 15000, // 15 seconds timeout for safety (increased due to Telegram API)
      }
    );

    // Update users with Telegram invite link for email
    const usersWithTelegram = usersWithCredentials.map((user) => ({
      ...user,
      telegramInviteLink: telegramResult?.inviteLink || undefined,
    }));

    // Send credentials emails to all users
    const emailResults = await sendCredentialsEmails(usersWithTelegram);

    console.log(
      `Email sending results: ${emailResults.successful} successful, ${emailResults.failed} failed`
    );

    return NextResponse.json({
      message: "Group and users created successfully",
      group: result.group,
      users: result.users,
      credentials: usersWithCredentials.map((u) => ({
        email: u.email,
        username: u.username,
        password: u.password,
        role: u.role,
      })),
      emailResults: {
        successful: emailResults.successful,
        failed: emailResults.failed,
      },
      telegram: {
        configured: isTelegramConfigured(),
        groupCreated: telegramResult?.success || false,
        chatId: telegramResult?.chatId || null,
        inviteLink: telegramResult?.inviteLink || null,
        error: telegramResult?.error || null,
      },
    });
  } catch (error) {
    console.error("Error creating group and users:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create group and users",
      },
      { status: 500 }
    );
  }
}

// GET - Get all groups with their users
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            emailVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
