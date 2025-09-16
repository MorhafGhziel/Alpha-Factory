import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { generateCredentials } from "../../../../utils/credentials";
import { sendCredentialsEmails } from "../../../../lib/email";
import {
  createTelegramGroup,
  isTelegramConfigured,
} from "../../../../lib/telegram";
import {
  sendClientCredentials,
  isWhatsAppConfigured,
} from "../../../../lib/whatsapp";

interface UserData {
  name: string;
  email: string;
  phone?: string; // Phone number for clients
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
      (session.user.role !== "admin" && session.user.role !== "owner")
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

      // For clients, require both email and phone number
      if (user.role === "client") {
        if (!user.email || !user.phone) {
          return NextResponse.json(
            { error: "Email and phone number are required for clients" },
            { status: 400 }
          );
        }
      } else {
        // For other roles, require email
        if (!user.email) {
          return NextResponse.json(
            { error: "Email is required for non-client users" },
            { status: 400 }
          );
        }
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
              .map((u) => u.email)
              .join(", ")}`,
          },
          { status: 409 }
        );
      }
    }

    // Check if any phone number already exists (for client users)
    const clientUsers = users.filter((user) => user.role === "client");
    if (clientUsers.length > 0) {
      const existingPhones = await prisma.user.findMany({
        where: {
          phone: {
            in: clientUsers.map((user) => user.phone!),
          },
        },
        select: { phone: true },
      });

      if (existingPhones.length > 0) {
        return NextResponse.json(
          {
            error: `رقم الهاتف مستخدم مسبقاً: ${existingPhones
              .map((u) => u.phone)
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
      phone?: string;
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
          phone: userData.phone,
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

        // Update each user with groupId, username, and phone (for clients)
        for (let i = 0; i < createdUserIds.length; i++) {
          const userData = usersWithCredentials[i];
          const updateData: any = {
            groupId: group.id,
            username: userData.username,
          };

          // Add phone number for clients but DON'T change email after signup
          if (userData.role === "client" && userData.phone) {
            updateData.phone = userData.phone;
            // DON'T update email - it was already set correctly during signUpEmail
          }
          // For non-client users, DON'T update email either - it was set correctly during signUpEmail

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
            phone: true,
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

    // Send credentials to users (emails for all users now)
    const emailUsers = usersWithTelegram; // Send emails to all users including clients
    const clientUsersForWhatsApp = usersWithTelegram.filter(
      (user) => user.role === "client"
    );

    // Send emails to all users (including clients)
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

    // Send WhatsApp messages to clients (wrapped in try-catch to not affect email sending)
    let whatsappResults = { successful: 0, failed: 0 };
    try {
      if (isWhatsAppConfigured() && clientUsersForWhatsApp.length > 0) {
        console.log("📱 Sending WhatsApp messages to clients...");

        for (const client of clientUsersForWhatsApp) {
          if (client.phone) {
            try {
              const result = await sendClientCredentials({
                name: client.name,
                phone: client.phone,
                username: client.username,
                password: client.password,
                groupName: client.groupName,
              });

              if (result.success) {
                whatsappResults.successful++;
                console.log(
                  `✅ WhatsApp message sent successfully to ${client.name}`
                );
              } else {
                whatsappResults.failed++;
                console.error(
                  `❌ Failed to send WhatsApp to ${client.name}:`,
                  result.error
                );
              }
            } catch (error) {
              whatsappResults.failed++;
              console.error(
                `❌ Error sending WhatsApp to ${client.name}:`,
                error
              );
            }
          } else {
            whatsappResults.failed++;
            console.error(`❌ No phone number for client ${client.name}`);
          }
        }
      } else if (clientUsersForWhatsApp.length > 0) {
        console.log(
          "📱 WhatsApp not configured, skipping client notifications"
        );
        whatsappResults.failed = clientUsersForWhatsApp.length;
      }
    } catch (whatsappError) {
      console.error("❌ WhatsApp section failed completely:", whatsappError);
      whatsappResults.failed = clientUsersForWhatsApp.length;
    }

    return NextResponse.json({
      message: "Group and users created successfully",
      group: result.group,
      users: result.users,
      credentials: usersWithCredentials.map((u) => ({
        email: u.email,
        phone: u.phone,
        username: u.username,
        password: u.password,
        role: u.role,
      })),
      emailResults: {
        successful: emailResults.successful,
        failed: emailResults.failed,
      },
      whatsappResults: {
        configured: isWhatsAppConfigured(),
        successful: whatsappResults.successful,
        failed: whatsappResults.failed,
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
      (session.user.role !== "admin" && session.user.role !== "owner")
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
            phone: true,
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
