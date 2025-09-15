import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        <title>بيانات الدخول الخاصة بك</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0f0f0f;
                color: #ffffff;
                margin: 0;
                padding: 20px;
                direction: rtl;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1a1a1a;
                border-radius: 20px;
                padding: 40px;
                border: 1px solid #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                background: linear-gradient(135deg, #E9CF6B, #C48829);
                color: #000;
                padding: 15px 30px;
                border-radius: 15px;
                font-size: 24px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 20px;
            }
            .welcome {
                color: #E9CF6B;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #aaa;
                font-size: 16px;
                margin-bottom: 30px;
            }
            .credentials-box {
                background-color: #0B0B0B;
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
                border: 1px solid #333;
            }
            .credential-item {
                margin: 15px 0;
                padding: 15px;
                background-color: #1f1f1f;
                border-radius: 10px;
                border-right: 4px solid #E9CF6B;
            }
            .credential-label {
                color: #E9CF6B;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .credential-value {
                color: #fff;
                font-size: 18px;
                font-family: 'Courier New', monospace;
                background-color: #0f0f0f;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #444;
            }
            .group-info {
                background-color: #2a2a2a;
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                text-align: center;
            }
            .role-badge {
                background: linear-gradient(135deg, #E9CF6B, #C48829);
                color: #000;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: bold;
                display: inline-block;
                margin: 10px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }
            .warning {
                background-color: #4a2c2a;
                border: 1px solid #d73027;
                color: #ffcdd2;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Alpha Factory</div>
                <div class="welcome">مرحباً ${user.name}!</div>
                <div class="subtitle">تم إنشاء حسابك بنجاح في النظام</div>
            </div>

            <div class="group-info">
                <h3 style="color: #E9CF6B; margin-bottom: 10px;">معلومات المجموعة</h3>
                <p style="margin: 5px 0;">المجموعة: <strong>${
                  user.groupName
                }</strong></p>
                <div class="role-badge">${
                  roleArabic[user.role as keyof typeof roleArabic] || user.role
                }</div>
            </div>

            <div class="credentials-box">
                <h3 style="color: #E9CF6B; text-align: center; margin-bottom: 20px;">بيانات الدخول الخاصة بك</h3>
                
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
            </div>

            ${
              user.telegramInviteLink
                ? `
            <div class="credentials-box" style="background: linear-gradient(135deg, #2196F3, #1976D2); border: none;">
                <h3 style="color: white; text-align: center; margin-bottom: 20px;">📱 انضم إلى مجموعة التليجرام</h3>
                
                <div style="text-align: center; margin: 20px 0;">
                    <p style="color: white; margin-bottom: 15px;">انضم إلى مجموعة فريق العمل على التليجرام للحصول على:</p>
                    <ul style="color: white; text-align: right; margin: 15px 0; padding-right: 20px;">
                        <li>تحديثات فورية عن المشروع</li>
                        <li>إشعارات إنجاز المهام</li>
                        <li>التواصل المباشر مع الفريق</li>
                        <li>تنبيهات مهمة من الإدارة</li>
                    </ul>
                    
                    <a href="${user.telegramInviteLink}" 
                       style="display: inline-block; background: white; color: #1976D2; padding: 12px 30px; 
                              border-radius: 25px; text-decoration: none; font-weight: bold; 
                              margin: 15px 0; font-size: 16px;">
                        🚀 انضم إلى المجموعة الآن
                    </a>
                    
                    <p style="color: white; font-size: 14px; margin-top: 15px;">
                        أو انسخ الرابط: <br>
                        <code style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 5px; 
                                     word-break: break-all; font-size: 12px;">${user.telegramInviteLink}</code>
                    </p>
                </div>
            </div>
            `
                : ""
            }

            <div class="warning">
                <strong>⚠️ تنبيه أمني مهم</strong><br>
                احتفظ بهذه المعلومات في مكان آمن ولا تشاركها مع أحد.<br>
                يُنصح بتغيير كلمة المرور عند أول تسجيل دخول.
            </div>

            <div class="footer">
                <p>إذا كان لديك أي استفسار، يرجى التواصل مع فريق الدعم على:</p>
                <p style="color: #E9CF6B; font-weight: bold;">support@alphafactory.net</p>
                <p style="margin-top: 20px; font-size: 12px;">
                    هذا البريد الإلكتروني تم إرساله تلقائياً من فريق Alpha Factory
                </p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
                    <p style="font-size: 11px; color: #666;">
                        لإلغاء الاشتراك في هذه الرسائل، يرجى 
                        <a href="mailto:support@alphafactory.net?subject=Unsubscribe" 
                           style="color: #E9CF6B; text-decoration: underline;">النقر هنا</a>
                        أو التواصل معنا مباشرة.
                    </p>
                    <p style="font-size: 10px; color: #555; margin-top: 10px;">
                        Alpha Factory - منصة إدارة المشاريع الإبداعية
                    </p>
                </div>
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
Alpha Factory - بيانات الدخول الخاصة بك

مرحباً ${user.name}!

تم إنشاء حسابك بنجاح في نظام Alpha Factory.

معلومات المجموعة:
المجموعة: ${user.groupName}
الدور: ${roleArabic[user.role as keyof typeof roleArabic] || user.role}

بيانات الدخول الخاصة بك:
البريد الإلكتروني: ${user.email}
اسم المستخدم: ${user.username}
كلمة المرور: ${user.password}

${
  user.telegramInviteLink
    ? `
انضم إلى مجموعة التليجرام:
${user.telegramInviteLink}

فوائد الانضمام:
- تحديثات فورية عن المشروع
- إشعارات إنجاز المهام
- التواصل المباشر مع الفريق
- تنبيهات مهمة من الإدارة
`
    : ""
}

تنبيه أمني مهم:
احتفظ بهذه المعلومات في مكان آمن ولا تشاركها مع أحد.
يُنصح بتغيير كلمة المرور عند أول تسجيل دخول.

إذا كان لديك أي استفسار، يرجى التواصل مع فريق الدعم على: support@alphafactory.net

---
Alpha Factory Team
هذا البريد الإلكتروني تم إرساله تلقائياً.

لإلغاء الاشتراك في هذه الرسائل، يرجى التواصل مع support@alphafactory.net
  `.trim();
}

/**
 * Send credentials email to user
 */
export async function sendCredentialsEmail(
  user: UserCredentials
): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Alpha Factory <support@alphafactory.net>",
      to: [user.email],
      subject: `بيانات الدخول الخاصة بك - ${user.name}`,
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
      console.error("Error sending email:", error);
      return false;
    }

    console.log("Email sent successfully:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send credentials emails to multiple users
 */
export async function sendCredentialsEmails(users: UserCredentials[]): Promise<{
  successful: number;
  failed: number;
  results: Array<{ email: string; success: boolean; error?: string }>;
}> {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const success = await sendCredentialsEmail(user);
      if (success) {
        successful++;
        results.push({ email: user.email, success: true });
      } else {
        failed++;
        results.push({
          email: user.email,
          success: false,
          error: "Failed to send email",
        });
      }
    } catch (error) {
      failed++;
      results.push({
        email: user.email,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { successful, failed, results };
}
