import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

const PAYPAL_BASE_URL =
  PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token"); // PayPal order ID
    const payerId = searchParams.get("PayerID");

    if (!token) {
      return NextResponse.json(
        { error: "Missing PayPal token" },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Get order details first
    const orderResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${token}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error("PayPal Order Details Error:", orderData);
      return NextResponse.json(
        { error: "Failed to get order details", details: orderData },
        { status: 500 }
      );
    }

    // Capture the payment
    const captureResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error("PayPal Capture Error:", captureData);
      return NextResponse.json(
        { error: "Failed to capture payment", details: captureData },
        { status: 500 }
      );
    }

    // Check if payment was successful
    const captureStatus =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.status;

    if (captureStatus === "COMPLETED") {
      const transactionId =
        captureData.purchase_units[0].payments.captures[0].id;
      const amount = captureData.purchase_units[0].payments.captures[0].amount;
      const referenceId = captureData.purchase_units[0].reference_id;

      // Store payment in your existing invoice table
      if (referenceId && referenceId.startsWith("invoice_")) {
        try {
          const invoiceId = referenceId.replace("invoice_", "");

          // Try to find existing invoice first
          let invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId },
          });

          // If invoice doesn't exist, create it
          if (!invoice) {
            const now = new Date();
            invoice = await prisma.invoice.create({
              data: {
                id: invoiceId,
                invoiceNumber: `INV-${invoiceId}`,
                clientId: session.user.id,
                billingPeriodStart: now,
                billingPeriodEnd: now,
                dueDate: now,
                totalAmount: parseFloat(amount.value),
                status: "PAID",
                paidAt: now,
                paymentMethod: "PAYPAL",
                paymentReference: transactionId,
              },
            });

            // Create a basic invoice item for the payment
            await prisma.invoiceItem.create({
              data: {
                invoiceId: invoice.id,
                description: `Payment for invoice ${invoiceId}`,
                quantity: 1,
                unitPrice: parseFloat(amount.value),
                total: parseFloat(amount.value),
                workType: "Payment",
              },
            });

            console.log(
              `📄 Created new invoice ${invoiceId} with invoice item`
            );
          } else {
            // Update existing invoice with payment info
            await prisma.invoice.update({
              where: { id: invoiceId },
              data: {
                status: "PAID",
                paidAt: new Date(),
                paymentMethod: "PAYPAL",
                paymentReference: transactionId,
              },
            });
          }

          console.log(`✅ Payment recorded for invoice ${invoiceId}`);
        } catch (dbError) {
          console.error("Error storing payment in database:", dbError);
          // Continue with response even if DB storage fails
        }
      }

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        transactionId,
        amount,
        referenceId,
        payerId,
        orderData,
        captureData,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: captureStatus,
        captureData,
      });
    }
  } catch (error) {
    console.error("Error handling PayPal return:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
