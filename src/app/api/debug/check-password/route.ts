import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, testPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user with accounts
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: {
            providerId: "credential",
          },
        },
      },
    });

    if (!user || user.accounts.length === 0) {
      return NextResponse.json(
        { error: "User or account not found" },
        { status: 404 }
      );
    }

    const account = user.accounts[0];

    const result: any = {
      email: user.email,
      name: user.name,
      role: user.role,
      accountId: account.id,
      providerId: account.providerId,
      hasPassword: !!account.password,
      hashInfo: account.password
        ? {
            length: account.password.length,
            startsWith: account.password.substring(0, 7),
            isBcrypt: account.password.startsWith("$2"),
          }
        : null,
    };

    if (testPassword && account.password) {
      const isValid = await compare(testPassword, account.password);
      result.passwordTest = {
        provided: testPassword,
        isValid,
        length: testPassword.length,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
