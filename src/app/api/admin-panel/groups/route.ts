import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma";

// GET - Get all groups with users (owner only)
export async function GET(req: NextRequest) {
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

    // Get all groups with users
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        telegramChatId: true,
        telegramGroupName: true,
        telegramInviteLink: true,
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
            suspended: true,
            suspendedAt: true,
            suspensionReason: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a group and all its users (owner only)
export async function DELETE(req: NextRequest) {
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
