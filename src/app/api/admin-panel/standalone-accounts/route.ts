import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { generateCredentials } from "../../../../utils/credentials";
import { sendCredentialsEmails } from "../../../../lib/email";

interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
}

interface CreateStandaloneAccountsRequest {
  users: CreateUserRequest[];
}

// POST - Create standalone accounts (owner only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      (session.user.role !== "owner" && session.user.role !== "supervisor")
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Owner or Supervisor access required" },
        { status: 401 }
      );
    }

    const { users }: CreateStandaloneAccountsRequest = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Users array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate users data
    const allowedRoles = [
      "admin",
      "supervisor",
      "editor",
      "designer",
      "reviewer",
    ];

    for (const user of users) {
      if (!user.name || !user.role) {
        return NextResponse.json(
          { error: "Name and role are required for all users" },
          { status: 400 }
        );
      }

      // Only allow admin-type roles for standalone accounts
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          {
            error:
              "Only admin, supervisor, editor, designer, and reviewer roles are allowed for standalone accounts",
          },
          { status: 400 }
        );
      }

      if (!user.email) {
        return NextResponse.json(
          { error: "Email is required for all standalone users" },
          { status: 400 }
        );
      }
    }

    let createdUserIds: string[] = [];

    try {
      // Create users
      const usersWithCredentials: Array<{
        name: string;
        email: string;
        username: string;
        password: string;
        role: string;
      }> = [];

      for (const userData of users) {
        // Generate random username and password
        const { username, password } = generateCredentials(
          userData.name,
          userData.role
        );

        // Use the provided email for authentication
        const emailForAuth = userData.email!;

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

        // No additional updates needed for standalone accounts (no group assignment)

        createdUserIds.push(signUpResult.user.id);

        // Store credentials for response
        usersWithCredentials.push({
          name: userData.name,
          email: userData.email!,
          username: username,
          password: password,
          role: userData.role,
        });
      }

      // Send email notifications
      try {
        console.log("Sending credential emails to users...");
        const emailResults = await sendCredentialsEmails(
          usersWithCredentials.map((user) => ({
            ...user,
            groupName: "Standalone Account", // Since these are standalone accounts
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
        message: `Successfully created ${users.length} standalone account(s)`,
        credentials: usersWithCredentials,
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

      throw error;
    }
  } catch (error) {
    console.error("Error creating standalone accounts:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
