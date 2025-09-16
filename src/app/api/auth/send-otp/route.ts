import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import otpService from "../../../../lib/otp";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    console.log("📧 Sending OTP to email:", email);

    if (!email) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    // Generate and store OTP
    const otpCode = otpService.generateOTP();
    console.log("🔢 Generated OTP:", otpCode);
    otpService.storeOTP(email, otpCode, 5); // 5 minutes expiration
    console.log("💾 OTP stored successfully");

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Send OTP via email
    try {
      console.log("📤 Attempting to send email via Resend...");
      const emailResult = await resend.emails.send({
        from: "Alpha Factory <support@alphafactory.net>",
        to: email,
        subject: "رمز التحقق - مصنع ألفا",
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>رمز التحقق - Alpha Factory</title>
              <style>
                  body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      background-color: #0B0B0B;
                      color: #ffffff;
                      margin: 0;
                      padding: 20px;
                      direction: rtl;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #0B0B0B;
                      border-radius: 0;
                      padding: 40px;
                  }
                  .header {
                      position: relative;
                      margin-bottom: 60px;
                  }
                  .help-link {
                      position: absolute;
                      top: 0;
                      left: 0;
                      color: #4A9EFF;
                      text-decoration: underline;
                      font-size: 14px;
                  }
                  .logo-container {
                      text-align: center;
                      margin-bottom: 40px;
                  }
                  .logo-text {
                      color: #ffffff;
                      font-size: 24px;
                      font-weight: bold;
                  }
                  .main-title {
                      color: #ffffff;
                      font-size: 32px;
                      font-weight: bold;
                      text-align: center;
                      margin: 40px 0 30px 0;
                  }
                  .otp-section {
                      background-color: #1a1a1a;
                      border-radius: 15px;
                      padding: 40px;
                      margin: 30px 0;
                      border: 1px solid #333;
                      text-align: center;
                  }
                  .otp-label {
                      color: #E9CF6B;
                      font-weight: bold;
                      margin-bottom: 20px;
                      font-size: 18px;
                  }
                  .otp-code {
                      background: linear-gradient(135deg, #E9CF6B, #C48829);
                      color: #000000;
                      font-size: 36px;
                      font-weight: bold;
                      letter-spacing: 8px;
                      padding: 20px 30px;
                      border-radius: 15px;
                      margin: 20px 0;
                      display: inline-block;
                      font-family: 'Courier New', monospace;
                  }
                  .instructions {
                      color: #ffffff;
                      font-size: 16px;
                      margin: 30px 0;
                      line-height: 1.6;
                  }
                  .warning {
                      background-color: #0f0f0f;
                      border-radius: 10px;
                      padding: 20px;
                      margin: 30px 0;
                      border-right: 4px solid #E9CF6B;
                  }
                  .warning-text {
                      color: #E9CF6B;
                      font-weight: bold;
                      font-size: 14px;
                      margin-bottom: 10px;
                  }
                  .warning-desc {
                      color: #ffffff;
                      font-size: 14px;
                  }
                  .footer {
                      text-align: center;
                      margin-top: 50px;
                      padding-top: 30px;
                      border-top: 1px solid #333;
                  }
                  .footer-text {
                      color: #666;
                      font-size: 12px;
                      line-height: 1.5;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <a href="mailto:support@alphafactory.net" class="help-link">
                          <span style="color: white;">تحتاج الى مساعدة؟</span> 
                          <span style="color: #4A9EFF;">تواصل معنا</span>
                      </a>
                      
                      <div class="logo-container">
                          <div class="logo-text">Alpha Factory</div>
                      </div>
                  </div>

                  <div class="main-title">رمز التحقق</div>

                  <div class="instructions">
                      لإكمال تسجيل الدخول إلى حسابك، يرجى استخدام رمز التحقق التالي:
                  </div>

                  <div class="otp-section">
                      <div class="otp-label">رمز التحقق الخاص بك</div>
                      <div class="otp-code">${otpCode}</div>
                  </div>

                  <div class="warning">
                      <div class="warning-text">⚠️ مهم:</div>
                      <div class="warning-desc">
                          • هذا الرمز صالح لمدة 5 دقائق فقط<br>
                          • لا تشارك هذا الرمز مع أي شخص آخر<br>
                          • إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد
                      </div>
                  </div>

                  <div class="footer">
                      <div class="footer-text">
                          هذا البريد الإلكتروني تم إرساله تلقائياً من فريق Alpha Factory<br>
                          إذا كان لديك أي استفسار، يرجى التواصل معنا على: support@alphafactory.net
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `,
      });

      console.log("✅ Email sent successfully:", emailResult);
      console.log("📧 Email ID:", emailResult.data?.id);

      return NextResponse.json({ success: true });
    } catch (emailError) {
      console.error("❌ Error sending OTP email:", emailError);
      console.error(
        "📋 Email error details:",
        JSON.stringify(emailError, null, 2)
      );
      return NextResponse.json(
        { error: "حدث خطأ في إرسال رمز التحقق" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إرسال رمز التحقق" },
      { status: 500 }
    );
  }
}
