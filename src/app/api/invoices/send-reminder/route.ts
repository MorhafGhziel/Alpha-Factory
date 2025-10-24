import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { sendInvoiceReminderEmail } from "@/src/lib/invoice-email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reminderType, userEmail, userName } = await request.json();

    if (!reminderType || !userEmail || !userName) {
      return NextResponse.json(
        { error: "Missing required fields: reminderType, userEmail, userName" },
        { status: 400 }
      );
    }

    if (!["3", "7"].includes(reminderType)) {
      return NextResponse.json(
        { error: "Invalid reminderType. Must be '3' or '7'" },
        { status: 400 }
      );
    }

    // Send the actual email using our dedicated function
    console.log(
      `📧 Sending ${reminderType}-day reminder email to ${userEmail}`
    );

    const emailSent = await sendInvoiceReminderEmail({
      to: userEmail,
      userName: userName,
      reminderType: reminderType as "3" | "7",
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: "Invoice reminder email sent successfully",
        details: {
          to: userEmail,
          userName: userName,
          reminderType: reminderType,
          sentAt: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send reminder email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error sending invoice reminder email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
