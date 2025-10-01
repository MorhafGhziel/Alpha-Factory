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
 * Email template for sending user credentials to clients (without Telegram group)
 */
function createClientCredentialsEmailTemplate(user: UserCredentials): string {
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

            <div class="main-title">مرحباً بك في Alpha Factory</div>
            <div class="subtitle">تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول إلى المنصة ومتابعة مشاريعك.</div>

            <!-- Platform Login -->
            <div class="action-section">
                <div class="action-number">تسجيل الدخول الى منصة ألفا فاكتوري</div>
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
 * Email template for sending user credentials to employees (with Telegram group)
 */
function createEmployeeCredentialsEmailTemplate(user: UserCredentials): string {
  // This is the original template with Telegram group for employees
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
 * Create plain text version of credentials email for clients (without Telegram)
 */
function createClientCredentialsEmailPlainText(user: UserCredentials): string {
  const roleArabic = {
    client: "عميل",
    editor: "محرر",
    designer: "مصمم",
    reviewer: "مُراجع",
  };

  return `
Alpha Factory - مرحباً بك في Alpha Factory

تحتاج الى مساعدة؟ تواصل معنا: support@alphafactory.net

مرحباً بك في Alpha Factory
تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول إلى المنصة ومتابعة مشاريعك.

تسجيل الدخول الى منصة ألفا فاكتوري:
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
 * Create plain text version of credentials email for employees (with Telegram)
 */
function createEmployeeCredentialsEmailPlainText(
  user: UserCredentials
): string {
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

    // Use different templates for clients vs employees
    const isClient = user.role === "client";
    const htmlTemplate = isClient
      ? createClientCredentialsEmailTemplate(user)
      : createEmployeeCredentialsEmailTemplate(user);
    const textTemplate = isClient
      ? createClientCredentialsEmailPlainText(user)
      : createEmployeeCredentialsEmailPlainText(user);

    const { data, error } = await resend.emails.send({
      from: "Alpha Factory <support@alphafactory.net>",
      to: [user.email],
      subject: isClient
        ? `مرحباً بك في Alpha Factory`
        : `معلومات حسابك - Alpha Factory`,
      html: htmlTemplate,
      text: textTemplate,
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
        const errorObj = error as unknown as Record<string, unknown>;
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
 * Client project notification data interface
 */
interface ClientProjectNotification {
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  projectType: string;
  status:
    | "created"
    | "filming_completed"
    | "editing_started"
    | "editing_completed"
    | "design_started"
    | "design_completed"
    | "review_started"
    | "review_completed"
    | "project_completed";
  updatedBy?: string;
  updatedByRole?: string;
  message?: string;
}

/**
 * Create client project notification email template
 */
function createClientProjectNotificationTemplate(
  notification: ClientProjectNotification
): string {
  const statusMessages = {
    created: {
      title: "تم استلام مشروعك بنجاح",
      message: "تم استلام مشروعك وسيبدأ فريقنا المتخصص في العمل عليه قريباً.",
      icon: "🎉",
    },
    filming_completed: {
      title: "تم استلام مشروعك بنجاح",
      message: "تم استلام مشروعك وسيبدأ فريقنا المتخصص في العمل عليه قريباً.",
      icon: "🎉",
    },
    editing_started: {
      title: "بدء مرحلة التحرير",
      message: "بدأ محرر الفيديو المتخصص في العمل على مشروعك.",
      icon: "✂️",
    },
    editing_completed: {
      title: "انتهاء مرحلة التحرير",
      message: "تم الانتهاء من تحرير مشروعك وسينتقل إلى المرحلة التالية.",
      icon: "✅",
    },
    design_started: {
      title: "بدء مرحلة التصميم",
      message: "بدأ مصمم الجرافيك في العمل على التصميمات الخاصة بمشروعك.",
      icon: "🎨",
    },
    design_completed: {
      title: "انتهاء مرحلة التصميم",
      message: "تم الانتهاء من تصميم مشروعك وسينتقل إلى المرحلة التالية.",
      icon: "✅",
    },
    review_started: {
      title: "بدء مرحلة المراجعة",
      message: "بدأ مراجع الجودة في فحص ومراجعة مشروعك للتأكد من الجودة.",
      icon: "👁️",
    },
    review_completed: {
      title: "انتهاء مرحلة المراجعة",
      message: "تم الانتهاء من مراجعة مشروعك وهو الآن جاهز للتسليم.",
      icon: "⭐",
    },
    project_completed: {
      title: "تم إنجاز مشروعك بنجاح",
      message: "تم إنجاز مشروعك بالكامل وهو جاهز للتسليم.",
      icon: "🎊",
    },
  };

  const statusInfo = statusMessages[notification.status];

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusInfo.title} - Alpha Factory</title>
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
            .logo-text {
                color: #ffffff;
                font-size: 24px;
                font-weight: bold;
            }
            .status-icon {
                font-size: 48px;
                text-align: center;
                margin: 20px 0;
            }
            .main-title {
                color: #E9CF6B;
                font-size: 28px;
                font-weight: bold;
                text-align: center;
                margin: 30px 0;
            }
            .project-info {
                background-color: #1a1a1a;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                border: 1px solid #333;
            }
            .info-item {
                margin: 15px 0;
                padding: 10px 0;
                border-bottom: 1px solid #333;
            }
            .info-label {
                color: #E9CF6B;
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 14px;
            }
            .info-value {
                color: #fff;
                font-size: 16px;
            }
            .message-box {
                background-color: #0f0f0f;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                border-right: 4px solid #E9CF6B;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #333;
                color: #888;
                font-size: 14px;
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

            <div class="status-icon">${statusInfo.icon}</div>
            <div class="main-title">${statusInfo.title}</div>
            
            <div class="message-box">
                <p style="color: #fff; font-size: 16px; line-height: 1.6; margin: 0;">
                    عزيزي ${notification.clientName}،<br><br>
                    ${statusInfo.message}
                </p>
            </div>

            <div class="project-info">
                <h3 style="color: #E9CF6B; text-align: center; margin-bottom: 20px;">تفاصيل المشروع</h3>
                
                <div class="info-item">
                    <div class="info-label">اسم المشروع:</div>
                    <div class="info-value">${notification.projectTitle}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">نوع المشروع:</div>
                    <div class="info-value">${notification.projectType}</div>
                </div>

                ${
                  notification.updatedBy
                    ? `
                <div class="info-item">
                    <div class="info-label">تم التحديث بواسطة:</div>
                    <div class="info-value">${notification.updatedBy} (${notification.updatedByRole})</div>
                </div>
                `
                    : ""
                }

                <div class="info-item" style="border-bottom: none;">
                    <div class="info-label">تاريخ التحديث:</div>
                    <div class="info-value">${new Date().toLocaleString(
                      "ar-EG"
                    )}</div>
                </div>
            </div>

            ${
              notification.message
                ? `
            <div class="message-box">
                <p style="color: #fff; font-size: 16px; line-height: 1.6; margin: 0;">
                    <strong>ملاحظة إضافية:</strong><br>
                    ${notification.message}
                </p>
            </div>
            `
                : ""
            }

            <div class="footer">
                <p>شكراً لك على ثقتك في Alpha Factory</p>
                <p>للاستفسارات: support@alphafactory.net</p>
                <p>هذا البريد الإلكتروني تم إرساله تلقائياً من فريق Alpha Factory</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Create plain text version of client project notification
 */
function createClientProjectNotificationPlainText(
  notification: ClientProjectNotification
): string {
  const statusMessages = {
    created:
      "تم استلام مشروعك بنجاح - سيبدأ فريقنا المتخصص في العمل عليه قريباً",
    filming_completed:
      "تم استلام مشروعك بنجاح - سيبدأ فريقنا المتخصص في العمل عليه قريباً",
    editing_started:
      "بدء مرحلة التحرير - بدأ محرر الفيديو المتخصص في العمل على مشروعك",
    editing_completed: "انتهاء مرحلة التحرير - تم الانتهاء من تحرير مشروعك",
    design_started: "بدء مرحلة التصميم - بدأ مصمم الجرافيك في العمل على مشروعك",
    design_completed: "انتهاء مرحلة التصميم - تم الانتهاء من تصميم مشروعك",
    review_started: "بدء مرحلة المراجعة - بدأ مراجع الجودة في فحص مشروعك",
    review_completed: "انتهاء مرحلة المراجعة - تم الانتهاء من مراجعة مشروعك",
    project_completed: "تم إنجاز مشروعك بنجاح - مشروعك جاهز للتسليم",
  };

  return `
Alpha Factory - تحديث حالة المشروع

عزيزي ${notification.clientName}،

${statusMessages[notification.status]}

تفاصيل المشروع:
اسم المشروع: ${notification.projectTitle}
نوع المشروع: ${notification.projectType}
${
  notification.updatedBy
    ? `تم التحديث بواسطة: ${notification.updatedBy} (${notification.updatedByRole})`
    : ""
}
تاريخ التحديث: ${new Date().toLocaleString("ar-EG")}

${notification.message ? `ملاحظة إضافية: ${notification.message}` : ""}

شكراً لك على ثقتك في Alpha Factory

للاستفسارات: support@alphafactory.net
هذا البريد الإلكتروني تم إرساله تلقائياً من فريق Alpha Factory
  `.trim();
}

/**
 * Send project status notification to client
 */
export async function sendClientProjectNotification(
  notification: ClientProjectNotification
): Promise<boolean> {
  try {
    // Validate email format first
    if (!isValidEmail(notification.clientEmail)) {
      console.error(
        `❌ Invalid client email format: ${notification.clientEmail}`
      );
      return false;
    }

    console.log(
      `📧 Sending project notification to client ${notification.clientName} at ${notification.clientEmail}`
    );

    const htmlTemplate = createClientProjectNotificationTemplate(notification);
    const textTemplate = createClientProjectNotificationPlainText(notification);

    const statusTitles = {
      created: "تم استلام مشروعك",
      filming_completed: "تم استلام مشروعك",
      editing_started: "بدء مرحلة التحرير",
      editing_completed: "انتهاء مرحلة التحرير",
      design_started: "بدء مرحلة التصميم",
      design_completed: "انتهاء مرحلة التصميم",
      review_started: "بدء مرحلة المراجعة",
      review_completed: "انتهاء مرحلة المراجعة",
      project_completed: "تم إنجاز مشروعك",
    };

    const { data, error } = await resend.emails.send({
      from: "Alpha Factory <support@alphafactory.net>",
      to: [notification.clientEmail],
      subject: `${statusTitles[notification.status]} - ${
        notification.projectTitle
      }`,
      html: htmlTemplate,
      text: textTemplate,
      headers: {
        "X-Entity-Ref-ID": `client-notification-${Date.now()}`,
        "List-Unsubscribe":
          "<mailto:support@alphafactory.net?subject=Unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        {
          name: "category",
          value: "client-project-notification",
        },
      ],
    });

    if (error) {
      console.error(`❌ Resend error for ${notification.clientEmail}:`, error);
      return false;
    }

    console.log(
      `✅ Client notification sent successfully to ${notification.clientEmail}, ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Exception while sending client notification to ${notification.clientEmail}:`,
      error
    );
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

// Password Change Email Functionality

interface PasswordChangeNotification {
  name: string;
  email: string;
  role: string;
  newPassword: string;
  changedBy: string; // Who changed the password (admin name)
}

/**
 * Email template for password change notification
 */
function createPasswordChangeEmailTemplate(
  data: PasswordChangeNotification
): string {
  const roleArabic = {
    client: "عميل",
    admin: "مدير",
    editor: "محرر",
    designer: "مصمم",
    reviewer: "مُراجع",
    owner: "مالك",
  };

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تغيير كلمة المرور - Alpha Factory</title>
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
            .subtitle {
                color: #888;
                font-size: 16px;
                text-align: center;
                margin-bottom: 50px;
                line-height: 1.6;
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
            .security-notice {
                background-color: #2a1f1f;
                border: 1px solid #d73027;
                color: #ffcdd2;
                padding: 20px;
                border-radius: 10px;
                margin: 30px 0;
                text-align: center;
            }
            .changed-by {
                background-color: #1a2a1a;
                border: 1px solid #4caf50;
                color: #c8e6c9;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-size: 14px;
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

            <div class="main-title">تم تغيير كلمة المرور</div>
            <div class="subtitle">تم تغيير كلمة المرور الخاصة بحسابك بنجاح. يرجى استخدام كلمة المرور الجديدة لتسجيل الدخول.</div>

            <div class="changed-by">
                <strong>تم التغيير بواسطة:</strong> ${data.changedBy}<br>
                <strong>تاريخ التغيير:</strong> ${new Date().toLocaleString(
                  "ar-SA",
                  {
                    timeZone: "Asia/Riyadh",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
            </div>

            <!-- Credentials Information -->
            <div class="credentials-info">
                <h3 style="color: #E9CF6B; text-align: center; margin-bottom: 20px;">كلمة المرور الجديدة</h3>
                
                <div class="credential-item">
                    <div class="credential-label">الاسم:</div>
                    <div class="credential-value">${data.name}</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">البريد الإلكتروني:</div>
                    <div class="credential-value">${data.email}</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">الدور:</div>
                    <div class="credential-value">${
                      roleArabic[data.role as keyof typeof roleArabic] ||
                      data.role
                    }</div>
                </div>

                <div class="credential-item">
                    <div class="credential-label">كلمة المرور الجديدة:</div>
                    <div class="credential-value" style="font-size: 18px; font-weight: bold; color: #4caf50;">${
                      data.newPassword
                    }</div>
                </div>
            </div>

            <div class="security-notice">
                <strong>⚠️ تنبيه أمني مهم</strong><br><br>
                إذا لم تطلب تغيير كلمة المرور، يرجى التواصل مع فريق الدعم فوراً.<br>
                احتفظ بكلمة المرور الجديدة في مكان آمن ولا تشاركها مع أحد.
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
 * Create plain text version of password change email
 */
function createPasswordChangeEmailPlainText(
  data: PasswordChangeNotification
): string {
  const roleArabic = {
    client: "عميل",
    admin: "مدير",
    editor: "محرر",
    designer: "مصمم",
    reviewer: "مُراجع",
    owner: "مالك",
  };

  return `
Alpha Factory - تم تغيير كلمة المرور

تحتاج الى مساعدة؟ تواصل معنا: support@alphafactory.net

تم تغيير كلمة المرور الخاصة بحسابك بنجاح. يرجى استخدام كلمة المرور الجديدة لتسجيل الدخول.

تم التغيير بواسطة: ${data.changedBy}
تاريخ التغيير: ${new Date().toLocaleString("ar-SA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}

كلمة المرور الجديدة:
الاسم: ${data.name}
البريد الإلكتروني: ${data.email}
الدور: ${roleArabic[data.role as keyof typeof roleArabic] || data.role}
كلمة المرور الجديدة: ${data.newPassword}

⚠️ تنبيه أمني مهم
إذا لم تطلب تغيير كلمة المرور، يرجى التواصل مع فريق الدعم فوراً.
احتفظ بكلمة المرور الجديدة في مكان آمن ولا تشاركها مع أحد.

إذا كان لديك أي استفسار، يرجى التواصل مع فريق الدعم على: support@alphafactory.net

---
هذا البريد الإلكتروني تم إرساله تلقائياً من فريق Alpha Factory
  `.trim();
}

/**
 * Send password change notification email
 */
async function sendPasswordChangeEmailOnce(
  data: PasswordChangeNotification
): Promise<boolean> {
  try {
    // Validate email format first
    if (!isValidEmail(data.email)) {
      console.error(`❌ Invalid email format: ${data.email}`);
      return false;
    }

    console.log(
      `📧 Sending password change notification to ${data.name} at ${data.email}`
    );

    const htmlTemplate = createPasswordChangeEmailTemplate(data);
    const textTemplate = createPasswordChangeEmailPlainText(data);

    const { data: emailData, error } = await resend.emails.send({
      from: "Alpha Factory <support@alphafactory.net>",
      to: [data.email],
      subject: `تم تغيير كلمة المرور - Alpha Factory`,
      html: htmlTemplate,
      text: textTemplate,
      headers: {
        "X-Entity-Ref-ID": `password-change-${Date.now()}`,
        "List-Unsubscribe":
          "<mailto:support@alphafactory.net?subject=Unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        {
          name: "category",
          value: "password-change",
        },
      ],
    });

    if (error) {
      console.error(`❌ Resend API error for ${data.email}:`, error);
      return false;
    }

    console.log(
      `✅ Password change email sent successfully to ${data.email}, ID: ${emailData?.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Exception while sending password change email to ${data.email}:`,
      error
    );
    return false;
  }
}

/**
 * Send password change notification email with retry mechanism
 */
export async function sendPasswordChangeEmail(
  data: PasswordChangeNotification
): Promise<boolean> {
  // Skip retry for invalid emails
  if (!isValidEmail(data.email)) {
    console.error(`❌ Invalid email format, skipping retry: ${data.email}`);
    return false;
  }

  // Use similar retry mechanism as credentials email
  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(
      `📧 Attempt ${attempt}/2 to send password change email to ${data.email}`
    );

    const success = await sendPasswordChangeEmailOnce(data);
    if (success) {
      return true;
    }

    if (attempt < 2) {
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
}
