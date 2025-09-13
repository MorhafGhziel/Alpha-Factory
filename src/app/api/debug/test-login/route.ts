import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

// POST - Test login process step by step (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Both identifier and password are required" },
        { status: 400 }
      );
    }

    const testResults: any = {
      step1_findUser: null,
      step2_emailResolution: null,
      step3_authAttempt: null,
      step4_accountCheck: null,
    };

    // Step 1: Find user by identifier
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
        include: { accounts: true },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: identifier },
        include: { accounts: true },
      });
    }

    testResults.step1_findUser = {
      identifier,
      isEmail,
      userFound: !!user,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            accountsCount: user.accounts.length,
          }
        : null,
    };

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        testResults,
      });
    }

    // Step 2: Determine email for authentication
    let emailForAuth = user.email;
    if (!isEmail) {
      // If using username, we need to find the email
      emailForAuth = user.email;
    }

    testResults.step2_emailResolution = {
      originalEmail: user.email,
      emailForAuth,
      emailChanged: user.email !== emailForAuth,
    };

    // Step 3: Check accounts table for authentication data
    const credentialAccount = user.accounts.find(
      (acc) => acc.providerId === "credential"
    );

    testResults.step4_accountCheck = {
      hasCredentialAccount: !!credentialAccount,
      account: credentialAccount
        ? {
            id: credentialAccount.id,
            accountId: credentialAccount.accountId,
            providerId: credentialAccount.providerId,
            hasPassword: !!credentialAccount.password,
            passwordSet: credentialAccount.password ? "***SET***" : null,
            createdAt: credentialAccount.createdAt,
            updatedAt: credentialAccount.updatedAt,
          }
        : null,
    };

    // Step 4: Attempt authentication
    try {
      const signInResult = await auth.api.signInEmail({
        body: {
          email: emailForAuth,
          password: password,
        },
      });

      testResults.step3_authAttempt = {
        success: !!signInResult.user,
        error: signInResult.error?.message || null,
        user: signInResult.user
          ? {
              id: signInResult.user.id,
              email: signInResult.user.email,
              name: signInResult.user.name,
              role: signInResult.user.role,
            }
          : null,
      };
    } catch (authError) {
      testResults.step3_authAttempt = {
        success: false,
        error:
          authError instanceof Error ? authError.message : "Unknown auth error",
        user: null,
      };
    }

    return NextResponse.json({
      success: testResults.step3_authAttempt.success,
      testResults,
      recommendation: !credentialAccount
        ? "Missing credential account - user was not properly created"
        : !credentialAccount.password
        ? "Password not set in account table"
        : testResults.step3_authAttempt.success
        ? "Authentication successful"
        : "Authentication failed - check password or email mismatch",
    });
  } catch (error) {
    console.error("Error in login test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
