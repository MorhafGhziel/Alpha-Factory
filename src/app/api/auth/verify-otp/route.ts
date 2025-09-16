import { NextRequest, NextResponse } from "next/server";
import otpService from "../../../../lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "البريد الإلكتروني ورمز التحقق مطلوبان" },
        { status: 400 }
      );
    }

    // Verify OTP using the service
    const result = otpService.verifyOTP(email, otp);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      { error: "حدث خطأ في التحقق من الرمز" },
      { status: 500 }
    );
  }
}
