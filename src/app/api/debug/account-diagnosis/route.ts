import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

// GET - Comprehensive account diagnosis (admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin or owner
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "owner")
    ) {
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
        include: {
          accounts: true,
          sessions: true,
        },
      });
    } else {
      // If it's not an email, find user by username
      user = await prisma.user.findUnique({
        where: { username: identifier },
        include: {
          accounts: true,
          sessions: true,
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

    // Get all users with same email to check for duplicates
    const duplicateUsers = await prisma.user.findMany({
      where: {
        email: user.email,
        NOT: {
          id: user.id,
        },
      },
      include: {
        accounts: true,
      },
    });

    // Check account details
    const accountAnalysis = user.accounts.map(
      (account: {
        id: string;
        accountId: string;
        providerId: string;
        password?: string | null;
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        id: account.id,
        accountId: account.accountId,
        providerId: account.providerId,
        hasPassword: !!account.password,
        passwordLength: account.password?.length || 0,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })
    );

    // Try to find what email would be used for authentication
    let authEmail = user.email;
    if (user.role === "client" && user.phone) {
      authEmail = `${user.phone.replace(/\D/g, "")}@temp.alphafactory.com`;
    }

    // Check if there's a user with the auth email
    const authEmailUser = await prisma.user.findUnique({
      where: { email: authEmail },
      include: { accounts: true },
    });

    return NextResponse.json({
      diagnosis: {
        searchedFor: identifier,
        searchType: isEmail ? "email" : "username",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accounts: accountAnalysis,
        sessions: user.sessions.map(
          (session: { id: string; expiresAt: Date; createdAt: Date }) => ({
            id: session.id,
            expiresAt: session.expiresAt,
            createdAt: session.createdAt,
          })
        ),
        duplicateUsers: duplicateUsers.length,
        duplicateDetails: duplicateUsers.map(
          (dup: {
            id: string;
            name: string;
            email: string;
            username: string | null;
            role: string | null;
            accounts: { id: string; accountId: string; providerId: string }[];
          }) => ({
            id: dup.id,
            name: dup.name,
            email: dup.email,
            username: dup.username,
            role: dup.role,
            accountsCount: dup.accounts.length,
          })
        ),
        authenticationAnalysis: {
          expectedAuthEmail: authEmail,
          authEmailMatchesUserEmail: authEmail === user.email,
          authEmailUser: authEmailUser
            ? {
                id: authEmailUser.id,
                name: authEmailUser.name,
                email: authEmailUser.email,
                username: authEmailUser.username,
                role: authEmailUser.role,
                accountsCount: authEmailUser.accounts.length,
              }
            : null,
          isSameUser: authEmailUser?.id === user.id,
        },
        potentialIssues: [],
      },
    });
  } catch (error) {
    console.error("Error in account diagnosis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
