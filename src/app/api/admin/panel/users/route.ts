import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import { sendCredentialsEmail } from "../../../../../lib/email";
import { generateCredentials } from "../../../../../utils/credentials";

// GET all users (owner only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      (session.user.role !== "owner" && session.user.role !== "supervisor")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST create new user (owner only)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, role, password } = await req.json();

    // Validate input
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: "Name, email, role, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already taken" },
        { status: 409 }
      );
    }

    // Generate username for the user
    const { username } = generateCredentials(name, role);

    // Create user using better-auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        role,
        username,
      },
    });

    if (!signUpResult.user) {
      throw new Error("Failed to create user");
    }

    // Send email notification with credentials
    try {
      console.log("Sending credential email to new user...");
      await sendCredentialsEmail({
        name,
        email,
        username: username, // Use the generated username
        password,
        role,
        groupName: "No Group", // Single user creation without group
      });
      console.log("Credential email sent successfully");
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the account creation if email fails
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: signUpResult.user.id,
        name: signUpResult.user.name,
        email: signUpResult.user.email,
        role: role,
        createdAt: signUpResult.user.createdAt,
        emailVerified: signUpResult.user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 }
    );
  }
}
