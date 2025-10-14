import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

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

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      amount,
      currency = "USD",
      description,
      invoiceId,
    } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create payment
    const paymentData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: invoiceId || `invoice_${Date.now()}`,
          description: description || "Alpha Factory Invoice Payment",
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${
          process.env.BETTER_AUTH_URL || "http://localhost:3000"
        }/paypal/success`,
        cancel_url: `${
          process.env.BETTER_AUTH_URL || "http://localhost:3000"
        }/paypal/cancel`,
        brand_name: "Alpha Factory",
        locale: "en-US",
        landing_page: "BILLING",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const order = await response.json();

    if (!response.ok) {
      console.error("PayPal API Error:", order);
      return NextResponse.json(
        { error: "Failed to create PayPal payment", details: order },
        { status: 500 }
      );
    }

    // Find the approval URL
    const approvalUrl = order.links?.find(
      (link: { rel: string; href: string }) => link.rel === "approve"
    )?.href;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl,
      order,
    });
  } catch (error) {
    console.error("Error creating PayPal payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
