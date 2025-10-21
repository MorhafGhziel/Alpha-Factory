import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Invoice reminder email interface
 */
export interface InvoiceReminderEmail {
  to: string;
  userName: string;
  reminderType: "3" | "7" | "10";
}

/**
 * Send invoice reminder email with retry mechanism
 */
export async function sendInvoiceReminderEmail(
  reminder: InvoiceReminderEmail
): Promise<boolean> {
  try {
    // Validate email format first
    if (!reminder.to || !reminder.to.includes("@")) {
      console.error(`❌ Invalid email format: ${reminder.to}`);
      return false;
    }

    console.log(
      `📧 Sending ${reminder.reminderType}-day invoice reminder to ${reminder.userName} at ${reminder.to}`
    );

    const titles = {
      "3": "تذكير بالفاتورة المستحقة - Alpha Factory",
      "7": "تذكير عاجل - فاتورة متأخرة - Alpha Factory",
      "10": "إشعار نهائي - تعليق الحساب - Alpha Factory",
    };

    const messages = {
      "3": "نود تذكيرك بضرورة تسديد الفاتورة في الوقت المحدد لضمان استمرار الخدمة دون أي انقطاع.",
      "7": "فاتورتك متأخرة منذ 7 أيام. يرجى التسديد فوراً لتجنب تعليق الحساب.",
      "10": "تم تعليق حسابك بسبب عدم تسديد الفاتورة خلال 10 أيام من تاريخ الاستحقاق.",
    };

    // Create simple HTML content
    const titleColor = reminder.reminderType === "10" ? "#ff4444" : "#E9CF6B";
    const borderStyle =
      reminder.reminderType === "10" ? "border-left: 4px solid #ff4444;" : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${titles[reminder.reminderType]}</title>
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
                  text-align: center;
                  margin-bottom: 40px;
              }
              .logo-text {
                  color: #ffffff;
                  font-size: 24px;
                  font-weight: bold;
              }
              .main-title {
                  color: ${titleColor};
                  font-size: 28px;
                  font-weight: bold;
                  text-align: center;
                  margin: 40px 0 30px 0;
              }
              .message-section {
                  background-color: #1a1a1a;
                  border-radius: 15px;
                  padding: 30px;
                  margin: 30px 0;
                  border: 1px solid #333;
                  ${borderStyle}
              }
              .message-text {
                  color: #ffffff;
                  font-size: 16px;
                  line-height: 1.6;
                  margin-bottom: 20px;
              }
              .timeline {
                  background-color: #0f0f0f;
                  border-radius: 10px;
                  padding: 20px;
                  margin: 20px 0;
              }
              .timeline-item {
                  color: #ffffff;
                  font-size: 14px;
                  margin: 10px 0;
                  padding-right: 15px;
              }
              .timeline-item.current {
                  color: ${titleColor};
                  font-weight: bold;
              }
              .footer {
                  text-align: center;
                  margin-top: 40px;
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
                  <div class="logo-text">Alpha Factory</div>
              </div>

              <div class="main-title">${titles[reminder.reminderType].replace(
                " - Alpha Factory",
                ""
              )}</div>

              <div class="message-section">
                  <div class="message-text">
                      عزيزي ${reminder.userName}،
                  </div>
                  <div class="message-text">
                      ${messages[reminder.reminderType]}
                  </div>

                  <div class="timeline">
                      <div class="timeline-item ${
                        reminder.reminderType === "3" ? "current" : ""
                      }">
                          • بعد 3 أيام من تاريخ الاستحقاق: تذكير أول بالدفع
                      </div>
                      <div class="timeline-item ${
                        reminder.reminderType === "7" ? "current" : ""
                      }">
                          • بعد 7 أيام من التأخير: تذكير عاجل وتحذير من التعليق
                      </div>
                      <div class="timeline-item ${
                        reminder.reminderType === "10" ? "current" : ""
                      }">
                          • بعد 10 أيام من التأخير: تعليق الحساب تلقائياً
                      </div>
                  </div>

                  ${
                    reminder.reminderType !== "10"
                      ? '<div class="message-text">نرجو منك تسديد الفاتورة في أسرع وقت ممكن لتجنب أي انقطاع في الخدمة.</div>'
                      : '<div class="message-text" style="color: #ff4444;">لإعادة تفعيل حسابك، يرجى التواصل مع فريق الدعم وتسديد المبلغ المستحق.</div>'
                  }
              </div>

              <div class="footer">
                  <div class="footer-text">
                      للاستفسار أو المساعدة في عملية السداد، يرجى التواصل معنا على:<br>
                      support@alphafactory.net
                  </div>
                  <div class="footer-text" style="margin-top: 20px;">
                      مع التقدير،<br>
                      فريق Alpha Factory
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    const textContent = `
${titles[reminder.reminderType]}

عزيزي ${reminder.userName}،

${messages[reminder.reminderType]}

الجدول الزمني للتذكيرات:
• بعد 3 أيام من تاريخ الاستحقاق: تذكير أول بالدفع ${
      reminder.reminderType === "3" ? "← أنت هنا" : ""
    }
• بعد 7 أيام من التأخير: تذكير عاجل وتحذير من التعليق ${
      reminder.reminderType === "7" ? "← أنت هنا" : ""
    }
• بعد 10 أيام من التأخير: تعليق الحساب تلقائياً ${
      reminder.reminderType === "10" ? "← أنت هنا" : ""
    }

${
  reminder.reminderType !== "10"
    ? "نرجو منك تسديد الفاتورة في أسرع وقت ممكن لتجنب أي انقطاع في الخدمة."
    : "لإعادة تفعيل حسابك، يرجى التواصل مع فريق الدعم وتسديد المبلغ المستحق."
}

للاستفسار أو المساعدة في عملية السداد، يرجى التواصل معنا على:
support@alphafactory.net

مع التقدير،
فريق Alpha Factory
    `.trim();

    const { data, error } = await resend.emails.send({
      from: "Alpha Factory <support@alphafactory.net>",
      to: [reminder.to],
      subject: titles[reminder.reminderType],
      html: htmlContent,
      text: textContent,
      headers: {
        "X-Entity-Ref-ID": `invoice-reminder-${
          reminder.reminderType
        }-${Date.now()}`,
        "List-Unsubscribe":
          "<mailto:support@alphafactory.net?subject=Unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        {
          name: "category",
          value: "invoice-reminder",
        },
        {
          name: "reminder-type",
          value: reminder.reminderType,
        },
      ],
    });

    if (error) {
      console.error(`❌ Resend API error for ${reminder.to}:`, error);
      return false;
    }

    console.log(
      `✅ Invoice reminder sent successfully to ${reminder.to}, ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Exception while sending invoice reminder to ${reminder.to}:`,
      error
    );
    return false;
  }
}
