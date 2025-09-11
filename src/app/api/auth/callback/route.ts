import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { getRoleDashboardPath } from "@/src/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    // Get the session to check user role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user?.role) {
      // Redirect to role-based dashboard
      const dashboardPath = getRoleDashboardPath(session.user.role);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // If no role or session, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
