import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// POST - Find user by username or email and return their email for authentication
export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json(
        { error: "Identifier is required" },
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
        select: { email: true, id: true },
      });
    } else {
      // If it's not an email, find user by username
      user = await prisma.user.findUnique({
        where: { username: identifier },
        select: { email: true, id: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ email: user.email });
  } catch (error) {
    console.error("Error finding user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
