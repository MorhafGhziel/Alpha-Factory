import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { Prisma } from "../../../../generated/prisma";
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
  telegramChatId?: string; // Optional specific chat ID for this group
}

// POST - Create a new group with users
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      (session.user.role !== "admin" &&
        session.user.role !== "owner" &&
        session.user.role !== "supervisor")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupName, users, telegramChatId }: CreateGroupRequest =
      await req.json();

    // Validate input
    if (!groupName || !users || users.length === 0) {
      return NextResponse.json(
        { error: "Group name and users are required" },
        { status: 400 }
      );
    }

    // Validate that all users have required fields
    for (const user of users) {
      if (!user.name || !user.role) {
        return NextResponse.json(
          { error: "Name and role are required for all users" },
          { status: 400 }
        );
      }

      // For all roles, require email
      if (!user.email) {
        return NextResponse.json(
          { error: "Email is required for all users" },
          { status: 400 }
        );
      }
    }

    // Check if any email already exists (for all users now)
    const allEmails = users.map((user) => user.email).filter(Boolean);
    if (allEmails.length > 0) {
      const existingEmails = await prisma.user.findMany({
        where: {
          email: {
            in: allEmails,
          },
        },
        select: { email: true },
      });

      if (existingEmails.length > 0) {
        return NextResponse.json(
          {
            error: `البريد الإلكتروني مستخدم مسبقاً: ${existingEmails
              .map((u: { email: string }) => u.email)
              .join(", ")}`,
          },
          { status: 409 }
        );
      }
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

        // Use the actual email for all users including clients
        const emailForAuth = userData.email;

        const signUpResult = await auth.api.signUpEmail({
          body: {
            email: emailForAuth,
            password: password,
            name: userData.name,
            role: userData.role,
            username: username,
          },
        });

        if (!signUpResult.user) {
          throw new Error(`Failed to create user ${userData.name}`);
        }

        createdUserIds.push(signUpResult.user.id);

        // Store credentials for sending (email for employees, WhatsApp for clients)
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
        })),
        telegramChatId // Pass the specific chat ID if provided
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
      async (tx: Prisma.TransactionClient) => {
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

        // Update each user with groupId, username, and phone (for clients)
        for (let i = 0; i < createdUserIds.length; i++) {
          const userData = usersWithCredentials[i];
          const updateData: {
            groupId: string;
            username: string;
            phone?: string;
          } = {
            groupId: group.id,
            username: userData.username,
          };

          // DON'T update email - it was already set correctly during signUpEmail

          await tx.user.update({
            where: { id: createdUserIds[i] },
            data: updateData,
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

    // Send credentials to all users via email (including clients)
    const emailUsers = usersWithTelegram;

    console.log(
      `📧 About to send emails to ${emailUsers.length} users (including clients)`
    );
    const emailResults = await sendCredentialsEmails(emailUsers);

    console.log(
      `📊 Email sending results: ${emailResults.successful} successful, ${emailResults.failed} failed`
    );

    // Log detailed email results
    emailResults.results.forEach((result) => {
      if (result.success) {
        console.log(`✅ Email delivered to: ${result.email}`);
      } else {
        console.error(
          `❌ Email failed for: ${result.email}, Error: ${result.error}`
        );
      }
    });

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

    if (
      !session?.user ||
      (session.user.role !== "admin" &&
        session.user.role !== "owner" &&
        session.user.role !== "supervisor")
    ) {
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

// DELETE - Delete a group and all its users (admin/owner only)
export async function DELETE(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin or owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      (session.user.role !== "admin" &&
        session.user.role !== "owner" &&
        session.user.role !== "supervisor")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Check if group exists and get user count
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const userCount = group.users.length;
    const groupName = group.name;

    try {
      // Use transaction to ensure data consistency
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // First, delete all user accounts (from better-auth accounts table)
        for (const user of group.users) {
          await tx.account.deleteMany({
            where: { userId: user.id },
          });
        }

        // Then delete all users in the group
        await tx.user.deleteMany({
          where: { groupId: groupId },
        });

        // Finally, delete the group itself
        await tx.group.delete({
          where: { id: groupId },
        });
      });

      console.log(
        `Successfully deleted group "${groupName}" with ${userCount} users`
      );

      return NextResponse.json({
        success: true,
        message: `Successfully deleted group "${groupName}" and ${userCount} user(s)`,
        deletedGroup: {
          id: groupId,
          name: groupName,
          userCount,
        },
      });
    } catch (deleteError) {
      console.error("Error during group deletion transaction:", deleteError);
      throw new Error("Failed to delete group and users");
    }
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
