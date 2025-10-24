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

    // Get all invoices for the authenticated user from your existing table
    const invoices = await prisma.invoice.findMany({
      where: {
        clientId: userId,
      },
      include: {
        invoice_item: true, // Include invoice items
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceNumber, startDate, dueDate, totalAmount, items } =
      await req.json();

    if (!invoiceNumber || !dueDate || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Create invoice in your existing table
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: userId,
        billingPeriodStart: startDate ? new Date(startDate) : new Date(),
        billingPeriodEnd: dueDate ? new Date(dueDate) : new Date(),
        dueDate: new Date(dueDate),
        totalAmount: parseFloat(totalAmount),
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Add invoice items if provided
    if (items && Array.isArray(items)) {
      await Promise.all(
        items.map((item: any) =>
          prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              projectId: item.projectId || null,
              description: item.description || "",
              quantity: parseFloat(item.quantity || 1),
              unitPrice: parseFloat(item.unitPrice || 0),
              total: parseFloat(item.total || 0),
              workType: item.workType || null,
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
