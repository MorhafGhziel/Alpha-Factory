import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Retry mechanism for email sending
 */
async function retryEmailSend(
  user: UserCredentials,
  maxRetries: number = 2
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(
      `📧 Attempt ${attempt}/${maxRetries} to send email to ${user.email}`
    );

    const success = await sendCredentialsEmailOnce(user);
    if (success) {
      return true;
    }

    if (attempt < maxRetries) {
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
}

interface UserCredentials {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  groupName: string;
  telegramInviteLink?: string;
}

/**
 * Email template for sending user credentials
 */
function createCredentialsEmailTemplate(user: UserCredentials): string {
  const roleArabic = {
    client: "عميل",
    editor: "محرر",
    designer: "مصمم",
    reviewer: "مُراجع",
  };

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>معلومات حسابك - Alpha Factory</title>
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
                max-width: 800px;
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
            .logo {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            .logo-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #E9CF6B, #C48829);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #000;
                font-size: 20px;
            }
            .logo-text {
                color: #ffffff;
                font-size: 24px;
                font-weight: bold;
            }
            .beta-badge {
                background-color: #333;
                color: #fff;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                margin-right: 10px;
            }
            .main-title {
                color: #ffffff;
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                margin: 40px 0 30px 0;
            }
            .subtitle {
                color: #888;
                font-size: 16px;
                text-align: center;
                margin-bottom: 50px;
                line-height: 1.6;
            }
            .action-section {
                background-color: transparent;
                margin: 30px 0;
                text-align: center;
            }
            .action-number {
                color: #E9CF6B;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .action-description {
                color: #ffffff;
                font-size: 16px;
                margin-bottom: 25px;
                line-height: 1.5;
            }
            .btn {
                display: inline-block;
                padding: 15px 40px;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                margin: 10px 0;
                transition: all 0.3s ease;
                 color: #ffffff;
            }
            .btn-blue {
                background: #039BE5;
                color: #ffffff;
            }
            .btn-gold {
                background: linear-gradient(135deg, #E9CF6B, #C48829);
                color: #000000;
            }
            .credentials-info {
                background-color: #1a1a1a;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                border: 1px solid #333;
            }
            .credential-item {
                margin: 15px 0;
                padding: 15px;
                background-color: #0f0f0f;
                border-radius: 10px;
                border-right: 4px solid #E9CF6B;
            }
            .credential-label {
                color: #E9CF6B;
                font-weight: bold;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .credential-value {
                color: #fff;
                font-size: 16px;
                font-family: 'Courier New', monospace;
                background-color: #000;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #444;
                word-break: break-all;
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
                    <div class="logo">
                    
                        <span class="logo-text">Alpha Factory</span>
                    
                    </div>
                </div>
            </div>

            <div class="main-title">معلومات حسابك</div>
           

            <!-- Step 1: Telegram Group -->
            <div class="action-section">
                <div class="action-number">١. الانضمام الى مجموعة تليجرام لمتابعة التحديثات والاشعارات بشكل فوري</div>
                
                ${
                  user.telegramInviteLink
                    ? `<a href="${user.telegramInviteLink}" class="btn btn-blue">الانضمام</a>`
                    : '<div style="color: #666; font-style: italic;">رابط المجموعة غير متوفر حالياً</div>'
                }
            </div>

            <!-- Step 2: Platform Login -->
            <div class="action-section">
                <div class="action-number">٢. تسجيل الدخول الى منصة ألفا فاكتوري لبدء العمل</div>
                
                <a href="https://alphafactory.net/login" class="btn btn-gold">تسجيل دخول</a>
            </div>

            <!-- Credentials Information -->
            <div class="credentials-info">
                <h3 style="color: #E9CF6B; text-align: center; margin-bottom: 20px;">بيانات الدخول الخاصة بك</h3>
                
                <div class="credential-item">
                    <div class="credential-label">الاسم:</div>
                    <div class="credential-value">${user.name}</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">البريد الإلكتروني:</div>
                    <div class="credential-value">${user.email}</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">اسم المستخدم:</div>
                    <div class="credential-value">${user.username}</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">كلمة المرور:</div>
                    <div class="credential-value">${user.password}</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">المجموعة:</div>
                    <div class="credential-value">${user.groupName}</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">الدور:</div>
                    <div class="credential-value">${
                      roleArabic[user.role as keyof typeof roleArabic] ||
                      user.role
                    }</div>
                </div>
            </div>

            <div style="background-color: #2a1f1f; border: 1px solid #d73027; color: #ffcdd2; padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center;">
                <strong>⚠️ تنبيه أمني مهم</strong><br><br>
                احتفظ بهذه المعلومات في مكان آمن ولا تشاركها مع أحد.<br>
            </div>

            <div style="text-align: center; margin-top: 40px; color: #666; font-size: 14px; border-top: 1px solid #333; padding-top: 20px;">
                <p>إذا كان لديك أي استفسار، يرجى التواصل مع فريق الدعم على:</p>
                <p style="color: #E9CF6B; font-weight: bold;">support@alphafactory.net</p>
                <p style="margin-top: 20px; font-size: 12px;">
                    هذا البريد الإلكتروني تم إرساله تلقائياً من فريق Alpha Factory
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Create plain text version of credentials email
 */
function createCredentialsEmailPlainText(user: UserCredentials): string {
  const roleArabic = {
    client: "عميل",
    editor: "محرر",
    designer: "مصمم",
    reviewer: "مُراجع",
  };

  return `
Alpha Factory BETA - معلومات حسابك

تحتاج الى مساعدة؟ تواصل معنا: support@alphafactory.net

معلومات حسابك

بعد نسخ معلومات حسابك أعلاه، سيُطلب منك إكمال الخطوات التالية:

١. الانضمام الى مجموعة تليجرام لمتابعة التحديثات والاشعارات بشكل فوري
${
  user.telegramInviteLink
    ? user.telegramInviteLink
    : "رابط المجموعة غير متوفر حالياً"
}

٢. تسجيل الدخول الى منصة ألفا فاكتوري لبدء العمل
https://alphafactory.net/login

بيانات الدخول الخاصة بك:
الاسم: ${user.name}
البريد الإلكتروني: ${user.email}
اسم المستخدم: ${user.username}
كلمة المرور: ${user.password}
المجموعة: ${user.groupName}
الدور: ${roleArabic[user.role as keyof typeof roleArabic] || user.role}

⚠️ تنبيه أمني مهم
احتفظ بهذه المعلومات في مكان آمن ولا تشاركها مع أحد.


إذا كان لديك أي استفسار، يرجى التواصل مع فريق الدعم على: support@alphafactory.net

---
هذا البريد الإلكتروني تم إرساله تلقائياً من فريق Alpha Factory
  `.trim();
}

/**
 * Send credentials email to user (single attempt)
 */
async function sendCredentialsEmailOnce(
  user: UserCredentials
): Promise<boolean> {
  try {
    // Validate email format first
    if (!isValidEmail(user.email)) {
      console.error(`❌ Invalid email format: ${user.email}`);
      return false;
    }

    console.log(`📧 Sending email to ${user.name} at ${user.email}`);

    const { data, error } = await resend.emails.send({
      from: "Alpha Factory <support@alphafactory.net>",
      to: [user.email],
      subject: `معلومات حسابك - Alpha Factory`,
      html: createCredentialsEmailTemplate(user),
      text: createCredentialsEmailPlainText(user),
      headers: {
        "X-Entity-Ref-ID": `user-credentials-${Date.now()}`,
        "List-Unsubscribe":
          "<mailto:support@alphafactory.net?subject=Unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        {
          name: "category",
          value: "user-credentials",
        },
      ],
    });

    if (error) {
      console.error(`❌ Resend API error for ${user.email}:`, error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Log specific error information
      if (error.message) {
        console.error(`Error message: ${error.message}`);
      }
      if (error.name) {
        console.error(`Error name: ${error.name}`);
      }

      // Check for specific error types
      if (typeof error === "object" && error !== null) {
        const errorObj = error as any;
        if (errorObj.code) {
          console.error(`Error code: ${errorObj.code}`);
        }
        if (errorObj.type) {
          console.error(`Error type: ${errorObj.type}`);
        }
        if (errorObj.details) {
          console.error(`Error details: ${JSON.stringify(errorObj.details)}`);
        }
      }

      return false;
    }

    console.log(`✅ Email sent successfully to ${user.email}, ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Exception while sending email to ${user.email}:`, error);
    return false;
  }
}

/**
 * Send credentials email to user with retry mechanism
 */
export async function sendCredentialsEmail(
  user: UserCredentials
): Promise<boolean> {
  // Skip retry for invalid emails
  if (!isValidEmail(user.email)) {
    console.error(`❌ Invalid email format, skipping retry: ${user.email}`);
    return false;
  }

  return await retryEmailSend(user);
}

/**
 * Send credentials emails to multiple users
 */
export async function sendCredentialsEmails(users: UserCredentials[]): Promise<{
  successful: number;
  failed: number;
  results: Array<{ email: string; success: boolean; error?: string }>;
}> {
  console.log(
    `Starting to send emails to ${users.length} users:`,
    users.map((u) => ({ name: u.name, email: u.email, role: u.role }))
  );

  const results = [];
  let successful = 0;
  let failed = 0;

  for (const user of users) {
    console.log(`Attempting to send email to ${user.name} (${user.email})`);

    try {
      const success = await sendCredentialsEmail(user);
      if (success) {
        successful++;
        results.push({ email: user.email, success: true });
        console.log(
          `✅ Email sent successfully to ${user.name} (${user.email})`
        );
      } else {
        failed++;
        results.push({
          email: user.email,
          success: false,
          error: `Failed to send email - ${
            !isValidEmail(user.email)
              ? "Invalid email format"
              : "Check Resend API response in logs"
          }`,
        });
        console.error(
          `❌ Failed to send email to ${user.name} (${user.email}) - sendCredentialsEmail returned false`
        );
      }
    } catch (error) {
      failed++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      results.push({
        email: user.email,
        success: false,
        error: errorMessage,
      });
      console.error(
        `❌ Exception while sending email to ${user.name} (${user.email}):`,
        errorMessage
      );
    }

    // Add a small delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `Email sending completed: ${successful} successful, ${failed} failed`
  );
  console.log("Detailed results:", results);

  return { successful, failed, results };
}
