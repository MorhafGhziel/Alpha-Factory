import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { generateCredentials } from "../../../../utils/credentials";
import {
  isTelegramConfigured,
  createTelegramGroup,
  sendNewMemberNotification,
} from "../../../../lib/telegram";
import { sendCredentialsEmails } from "../../../../lib/email";

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

      // Email is required for all users now (including clients)
      if (!user.email) {
        return NextResponse.json(
          { error: "Email is required for all users" },
          { status: 400 }
        );
      }
    }

    const createdUserIds: string[] = [];
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

        // Use the provided email for all users (including clients)
        const emailForAuth = userData.email;

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
            username: username,
          },
        });

        if (!signUpResult.user) {
          throw new Error(`Failed to create user ${userData.name}`);
        }

        // Update user with group and phone if needed
        const updateData: { groupId?: string; phone?: string } = {
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
          email: userData.email!, // We've already validated this exists
          phone: userData.phone,
          username: username,
          password: password,
          role: userData.role,
          groupName: targetGroup?.name || "Unknown Group",
        });
      }

      // Handle Telegram integration
      let telegramInviteLink = null;
      if (isTelegramConfigured() && targetGroup) {
        // Check if this is a new group (groupName provided) or existing group (groupId provided)
        if (groupName) {
          // Creating new group - create new Telegram group
          console.log("Creating Telegram group for new group...");
          try {
            const telegramResult = await createTelegramGroup(
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
                  telegramGroupName: targetGroup.name,
                  telegramChatId: telegramResult.chatId?.toString(),
                },
              });
              telegramInviteLink = telegramResult.inviteLink;
            }
          } catch (telegramError) {
            console.error("Telegram group creation failed:", telegramError);
            // Continue without failing the entire operation
          }
        } else if (groupId) {
          // Adding to existing group - use existing Telegram configuration
          console.log("Adding users to existing group with Telegram...");
          try {
            // Get the full group info including Telegram configuration
            const groupWithTelegram = await prisma.group.findUnique({
              where: { id: groupId },
              select: {
                telegramInviteLink: true,
                telegramChatId: true,
                name: true,
              },
            });

            if (groupWithTelegram?.telegramInviteLink) {
              telegramInviteLink = groupWithTelegram.telegramInviteLink;
              console.log("Using existing Telegram invite link for group");

              // Send notification to existing Telegram group about new members
              if (groupWithTelegram.telegramChatId) {
                await sendNewMemberNotification(
                  groupWithTelegram.telegramChatId,
                  usersWithCredentials.map((user) => ({
                    name: user.name,
                    role: user.role,
                  })),
                  groupWithTelegram.name
                );
              }
            } else {
              console.log("Existing group doesn't have Telegram configuration");
            }
          } catch (telegramError) {
            console.error(
              "Error handling existing group Telegram:",
              telegramError
            );
            // Continue without failing the entire operation
          }
        }
      }

      // Send email notifications to users
      try {
        console.log("Sending credential emails to users...");
        const emailResults = await sendCredentialsEmails(
          usersWithCredentials.map((user) => ({
            ...user,
            telegramInviteLink:
              user.role !== "client"
                ? telegramInviteLink || undefined
                : undefined,
          }))
        );
        console.log(
          `Email results: ${emailResults.successful} successful, ${emailResults.failed} failed`
        );
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        // Don't fail the account creation if email fails
      }

      return NextResponse.json({
        success: true,
        message: `Successfully created ${users.length} user(s)${
          groupName
            ? ` and group "${groupName}"`
            : groupId
            ? ` and added to existing group`
            : ""
        }`,
        credentials: usersWithCredentials,
        telegramInviteLink: telegramInviteLink,
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
