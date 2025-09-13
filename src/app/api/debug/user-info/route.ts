import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

// GET - Debug user information (admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier");

    if (!identifier) {
      return NextResponse.json(
        { error: "Identifier (username or email) is required" },
        { status: 400 }
      );
    }

    // Check if identifier is an email format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    let user;

    if (isEmail) {
      // If it's an email, find user by email
      user = await prisma.user.findUnique({
        where: { email: identifier },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          phone: true,
          accounts: {
            select: {
              providerId: true,
              password: true,
            },
          },
        },
      });
    } else {
      // If it's not an email, find user by username
      user = await prisma.user.findUnique({
        where: { username: identifier },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          phone: true,
          accounts: {
            select: {
              providerId: true,
              password: true,
            },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
          searchedFor: identifier,
          searchType: isEmail ? "email" : "username",
        },
        { status: 404 }
      );
    }

    // Mask password for security
    const maskedUser = {
      ...user,
      accounts: user.accounts.map((acc) => ({
        ...acc,
        password: acc.password ? "***MASKED***" : null,
      })),
    };

    return NextResponse.json({
      user: maskedUser,
      searchedFor: identifier,
      searchType: isEmail ? "email" : "username",
    });
  } catch (error) {
    console.error("Error finding user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
