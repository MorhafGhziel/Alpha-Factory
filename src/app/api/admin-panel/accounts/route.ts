import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { generateCredentials } from "../../../../utils/credentials";
import {
  isTelegramConfigured,
  createTelegramGroup,
} from "../../../../lib/telegram";

interface CreateUserRequest {
  name: string;
  email?: string;
  phone?: string;
  role: string;
}

interface CreateAccountsRequest {
  users: CreateUserRequest[];
  groupName?: string; // For new group
  groupId?: string; // For existing group
  telegramChatId?: string;
}

// POST - Create accounts (owner only)
export async function POST(req: NextRequest) {
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

    const { users, groupName, groupId, telegramChatId }: CreateAccountsRequest =
      await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Users array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate that we have either groupName or groupId
    if (!groupName && !groupId) {
      return NextResponse.json(
        { error: "Either groupName or groupId is required" },
        { status: 400 }
      );
    }

    // If groupId is provided, verify the group exists
    let targetGroup = null;
    if (groupId) {
      targetGroup = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!targetGroup) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }
    }

    // Validate users data
    for (const user of users) {
      if (!user.name || !user.role) {
        return NextResponse.json(
          { error: "Name and role are required for all users" },
          { status: 400 }
        );
      }

      if (user.role === "client") {
        if (!user.phone) {
          return NextResponse.json(
            { error: "Phone is required for client users" },
            { status: 400 }
          );
        }
      } else {
        if (!user.email) {
          return NextResponse.json(
            { error: "Email is required for non-client users" },
            { status: 400 }
          );
        }
      }
    }

    let createdUserIds: string[] = [];
    let createdGroupId: string | null = null;

    try {
      // Create group if needed
      if (groupName) {
        const newGroup = await prisma.group.create({
          data: {
            name: groupName,
            telegramChatId: telegramChatId || null,
          },
        });
        createdGroupId = newGroup.id;
        targetGroup = newGroup;
      }

      // Create users
      const usersWithCredentials: Array<{
        name: string;
        email: string;
        phone?: string;
        username: string;
        password: string;
        role: string;
        groupName: string;
      }> = [];

      for (const userData of users) {
        // Generate random username and password
        const { username, password } = generateCredentials(
          userData.name,
          userData.role
        );

        // Determine email for authentication
        let emailForAuth = userData.email;
        if (userData.role === "client" && userData.phone) {
          // For clients, use phone-based email
          emailForAuth = `${userData.phone.replace(
            /\D/g,
            ""
          )}@temp.alphafactory.com`;
        }

        if (!emailForAuth) {
          throw new Error(
            `Failed to determine email for user ${userData.name}`
          );
        }

        const signUpResult = await auth.api.signUpEmail({
          body: {
            email: emailForAuth,
            password: password,
            name: userData.name,
            role: userData.role,
          },
        });

        if (!signUpResult.user) {
          throw new Error(`Failed to create user ${userData.name}`);
        }

        // Update user with group and phone if needed
        const updateData: any = {
          groupId: targetGroup?.id,
        };

        if (userData.phone) {
          updateData.phone = userData.phone;
        }

        await prisma.user.update({
          where: { id: signUpResult.user.id },
          data: updateData,
        });

        createdUserIds.push(signUpResult.user.id);

        // Store credentials for response
        usersWithCredentials.push({
          name: userData.name,
          email: userData.email || emailForAuth,
          phone: userData.phone,
          username: username,
          password: password,
          role: userData.role,
          groupName: targetGroup?.name || "Unknown Group",
        });
      }

      // Create Telegram group if configured
      let telegramResult = null;
      if (isTelegramConfigured() && targetGroup) {
        console.log("Creating Telegram group...");
        try {
          telegramResult = await createTelegramGroup(
            targetGroup.name,
            usersWithCredentials,
            telegramChatId
          );

          if (telegramResult.success && telegramResult.inviteLink) {
            // Update group with Telegram info
            await prisma.group.update({
              where: { id: targetGroup.id },
              data: {
                telegramInviteLink: telegramResult.inviteLink,
                telegramGroupName: telegramResult.groupName,
                telegramChatId: telegramResult.chatId?.toString(),
              },
            });
          }
        } catch (telegramError) {
          console.error("Telegram group creation failed:", telegramError);
          // Continue without failing the entire operation
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully created ${users.length} user(s)${
          groupName ? ` and group "${groupName}"` : ""
        }`,
        credentials: usersWithCredentials,
        telegram: telegramResult,
        groupId: targetGroup?.id,
      });
    } catch (error) {
      // Cleanup on error
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

      if (createdGroupId) {
        try {
          await prisma.group.delete({
            where: { id: createdGroupId },
          });
        } catch (cleanupError) {
          console.error("Failed to cleanup group after error:", cleanupError);
        }
      }

      throw error;
    }
  } catch (error) {
    console.error("Error creating accounts:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
