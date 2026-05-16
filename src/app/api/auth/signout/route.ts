import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

// POST - Sign out user (forwards Set-Cookie headers so session is fully cleared)
export async function POST(req: NextRequest) {
  try {
    return await auth.api.signOut({
      headers: req.headers,
      asResponse: true,
    });
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
