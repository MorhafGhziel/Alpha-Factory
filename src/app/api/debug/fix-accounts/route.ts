import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

// POST - Fix broken accounts (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the user and their accounts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const fixes = [];

    // Find credential account
    const credentialAccount = user.accounts.find(
      (acc) => acc.providerId === "credential"
    );

    if (!credentialAccount) {
      fixes.push("No credential account found - this user cannot log in");
      return NextResponse.json({
        success: false,
        error: "No credential account found",
        fixes,
      });
    }

    // Determine what the auth email should be
    let correctAuthEmail = user.email;
    if (user.role === "client" && user.phone) {
      correctAuthEmail = `${user.phone.replace(
        /\D/g,
        ""
      )}@temp.alphafactory.com`;
    }

    // Check if there's an email mismatch
    const currentUserEmail = user.email;
    const needsEmailFix = currentUserEmail !== correctAuthEmail;

    if (needsEmailFix) {
      // Update the user's email to match what should be used for auth
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: correctAuthEmail,
        },
      });
      fixes.push(
        `Updated user email from "${currentUserEmail}" to "${correctAuthEmail}"`
      );
    }

    // Check if account has password
    if (!credentialAccount.password) {
      fixes.push("Account has no password - password needs to be set");
    }

    // Verify account consistency
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account analysis and fixes completed",
      fixes,
      before: {
        userEmail: currentUserEmail,
        expectedAuthEmail: correctAuthEmail,
        hasPassword: !!credentialAccount.password,
      },
      after: {
        userEmail: updatedUser?.email,
        hasPassword: !!updatedUser?.accounts.find(
          (acc) => acc.providerId === "credential"
        )?.password,
        accountsCount: updatedUser?.accounts.length,
      },
    });
  } catch (error) {
    console.error("Error fixing account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List all potentially broken accounts
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all users with potential issues
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["editor", "reviewer", "designer", "client"],
        },
      },
      include: {
        accounts: true,
      },
    });

    const problematicUsers = [];

    for (const user of users) {
      const credentialAccount = user.accounts.find(
        (acc) => acc.providerId === "credential"
      );

      const issues = [];

      if (!credentialAccount) {
        issues.push("No credential account");
      } else if (!credentialAccount.password) {
        issues.push("No password set");
      }

      // Check email consistency
      let expectedAuthEmail = user.email;
      if (user.role === "client" && user.phone) {
        expectedAuthEmail = `${user.phone.replace(
          /\D/g,
          ""
        )}@temp.alphafactory.com`;
      }

      if (user.email !== expectedAuthEmail) {
        issues.push(
          `Email mismatch: has "${user.email}", should be "${expectedAuthEmail}"`
        );
      }

      if (issues.length > 0) {
        problematicUsers.push({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          issues,
          accountsCount: user.accounts.length,
        });
      }
    }

    return NextResponse.json({
      totalUsers: users.length,
      problematicUsers: problematicUsers.length,
      users: problematicUsers,
    });
  } catch (error) {
    console.error("Error listing broken accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
