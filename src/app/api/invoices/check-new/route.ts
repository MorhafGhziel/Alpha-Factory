import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the count of invoices for the authenticated user
    const invoiceCount = await prisma.invoice.count({
      where: {
        clientId: userId,
      },
    });

    // Get the most recent invoice creation date
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        clientId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      invoiceCount,
      latestInvoiceDate: latestInvoice?.createdAt || null,
    });
  } catch (error) {
    console.error("Error checking for new invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
