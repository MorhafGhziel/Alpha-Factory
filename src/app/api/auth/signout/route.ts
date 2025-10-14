import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

// POST - Sign out user
export async function POST(req: NextRequest) {
  try {
    // Sign out using better-auth
    await auth.api.signOut({
      headers: req.headers,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
