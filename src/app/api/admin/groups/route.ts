import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { authClient } from "../../../../lib/auth-client";

interface UserData {
  name: string;
  email: string;
  username: string;
  password: string;
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
      if (
        !user.name ||
        !user.email ||
        !user.username ||
        !user.password ||
        !user.role
      ) {
        return NextResponse.json(
          { error: "All user fields are required" },
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
          error: `Email(s) already exist: ${existingEmails
            .map((u) => u.email)
            .join(", ")}`,
        },
        { status: 409 }
      );
    }

    // First, create all users using better-auth (outside transaction)
    const createdUserIds: string[] = [];

    try {
      for (const userData of users) {
        const signUpResult = await auth.api.signUpEmail({
          body: {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: userData.role,
          },
        });

        if (!signUpResult.user) {
          throw new Error(`Failed to create user ${userData.name}`);
        }

        createdUserIds.push(signUpResult.user.id);
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

    // Now create group and associate users in a fast transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // Create the group
        const group = await tx.group.create({
          data: {
            name: groupName,
          },
        });

        // Update all users with groupId in batch
        await tx.user.updateMany({
          where: {
            id: {
              in: createdUserIds,
            },
          },
          data: {
            groupId: group.id,
          },
        });

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
            role: true,
            createdAt: true,
            emailVerified: true,
          },
        });

        return { group, users: updatedUsers };
      },
      {
        timeout: 10000, // 10 seconds timeout for safety
      }
    );

    return NextResponse.json({
      message: "Group and users created successfully",
      group: result.group,
      users: result.users,
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
