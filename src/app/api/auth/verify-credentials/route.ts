import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("🔍 Verifying credentials for email:", email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    // Use better-auth's own authentication to verify credentials
    try {
      console.log("🔐 Attempting authentication with better-auth...");

      const signInResult = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });

      console.log("✅ Better-auth sign-in result:", !!signInResult.user);

      if (signInResult.user) {
        // Better-auth user object doesn't include role, so fetch it from database
        const userId = signInResult.user.id;
        console.log("👤 User ID:", userId);

        const userFromDb = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, email: true, name: true },
        });

        const userRole = userFromDb?.role;
        console.log("👤 User role from DB:", userRole);
        console.log("🔍 User role type:", typeof userRole);

        // Determine if OTP is required based on role
        const requiresOTP =
          userRole === "admin" ||
          userRole === "owner" ||
          userRole === "supervisor";
        console.log("🔐 OTP required:", requiresOTP);
        console.log(
          "🔍 Role comparison - admin:",
          userRole === "admin",
          "owner:",
          userRole === "owner"
        );

        // Credentials are valid, but we need to sign out immediately
        // since we don't want to create a persistent session yet (OTP might be pending)
        try {
          console.log("🚪 Signing out to prevent session creation...");
          await auth.api.signOut({
            headers: new Headers(),
          });
          console.log("✅ Successfully signed out");
        } catch (signOutError) {
          console.log("ℹ️ Sign out not needed or failed:", signOutError);
        }

        console.log("🎉 Credentials verified successfully via better-auth");
        return NextResponse.json({
          success: true,
          requiresOTP,
          userRole,
        });
      } else {
        console.log("❌ Better-auth sign-in failed - no user returned");
        return NextResponse.json(
          { error: "بيانات الدخول غير صحيحة" },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.log("⚠️ Better-auth verification failed:", authError);
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("💥 Error verifying credentials:", error);
    return NextResponse.json(
      { error: "حدث خطأ في التحقق من بيانات الدخول" },
      { status: 500 }
    );
  }
}
