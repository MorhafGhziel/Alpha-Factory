import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is client
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For testing purposes, create a default invoice structure
    const testInvoice = {
      index: 1,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      dueDate: new Date(), // Due today
      items: [
        {
          id: "test-1",
          projectId: "test-project-1",
          projectName: "مشروع تجريبي - فيديو تسويقي",
          projectType: "فيديو تسويقي",
          unitPrice: 50,
          quantity: 1,
          total: 50,
          workDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "test-2",
          projectId: "test-project-2",
          projectName: "مشروع تجريبي - تصميم شعار",
          projectType: "تصميم شعار",
          unitPrice: 30,
          quantity: 1,
          total: 30,
          workDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
      grandTotal: 80,
    };

    return NextResponse.json({
      success: true,
      invoice: testInvoice,
      message: "Test invoice created for PayPal testing",
    });
  } catch (error) {
    console.error("Error creating test invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
