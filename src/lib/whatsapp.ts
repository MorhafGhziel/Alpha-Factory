import axios from "axios";

// WhatsApp API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

export interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ClientCredentials {
  name: string;
  phone: string;
  username: string;
  password: string;
  groupName: string;
}

/**
 * Check if WhatsApp API is configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(
    WHATSAPP_API_URL &&
    WHATSAPP_ACCESS_TOKEN &&
    WHATSAPP_PHONE_NUMBER_ID
  );
}

/**
 * Send credentials to client via WhatsApp
 */
export async function sendClientCredentials(
  clientData: ClientCredentials
): Promise<WhatsAppMessageResult> {
  if (!isWhatsAppConfigured()) {
    console.warn("WhatsApp API not configured");
    return {
      success: false,
      error: "WhatsApp API not configured",
    };
  }

  try {
    // Format phone number (remove any non-digit characters and add country code if needed)
    let phoneNumber = clientData.phone.replace(/\D/g, "");

    // If phone doesn't start with country code, assume it's a local number
    // You may need to adjust this based on your region
    if (!phoneNumber.startsWith("966") && !phoneNumber.startsWith("+966")) {
      phoneNumber = "966" + phoneNumber.replace(/^0+/, ""); // Remove leading zeros and add Saudi Arabia code
    }

    const message = `🎉 مرحباً ${clientData.name}!

تم إنشاء حسابك في Alpha Factory بنجاح!

📋 **بيانات الدخول:**
👤 اسم المستخدم: \`${clientData.username}\`
🔐 كلمة المرور: \`${clientData.password}\`
🏢 المجموعة: ${clientData.groupName}

🔗 **رابط الموقع:**
https://alphafactory.com

⚠️ **مهم:** احتفظ بهذه البيانات في مكان آمن ولا تشاركها مع أحد.

للدعم الفني، تواصل معنا في أي وقت.

فريق Alpha Factory 🚀`;

    // Facebook WhatsApp Business API format
    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: {
        body: message,
      },
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    // Facebook WhatsApp API response format
    if (response.data && response.data.messages && response.data.messages[0]) {
      console.log(`WhatsApp message sent successfully to ${phoneNumber}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } else {
      throw new Error("Invalid response from WhatsApp API");
    }
  } catch (error: unknown) {
    console.error("Error sending WhatsApp message:", error);

    let errorMessage = "Failed to send WhatsApp message";
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          statusText: string;
          data?: { error?: { message?: string } };
        };
      };
      errorMessage = `WhatsApp API error: ${axiosError.response.status} - ${
        axiosError.response.data?.error?.message ||
        axiosError.response.statusText
      }`;
    } else if (error && typeof error === "object" && "request" in error) {
      errorMessage = "No response from WhatsApp API";
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as { message: string }).message || "Unknown error";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send project update to client via WhatsApp
 */
export async function sendProjectUpdateToClient(
  phone: string,
  clientName: string,
  updateMessage: string,
  projectName: string
): Promise<WhatsAppMessageResult> {
  if (!isWhatsAppConfigured()) {
    console.warn("WhatsApp API not configured");
    return {
      success: false,
      error: "WhatsApp API not configured",
    };
  }

  try {
    // Format phone number
    let phoneNumber = phone.replace(/\D/g, "");
    if (!phoneNumber.startsWith("966") && !phoneNumber.startsWith("+966")) {
      phoneNumber = "966" + phoneNumber.replace(/^0+/, "");
    }

    const message = `📢 **تحديث مشروع ${projectName}**

مرحباً ${clientName}،

${updateMessage}

لمتابعة تفاصيل أكثر، يرجى تسجيل الدخول إلى حسابك:
https://alphafactory.com

فريق Alpha Factory 🚀`;

    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: {
        body: message,
      },
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.messages && response.data.messages[0]) {
      console.log(
        `WhatsApp project update sent successfully to ${phoneNumber}`
      );
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } else {
      throw new Error("Invalid response from WhatsApp API");
    }
  } catch (error: unknown) {
    console.error("Error sending WhatsApp project update:", error);

    let errorMessage = "Failed to send WhatsApp message";
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          statusText: string;
          data?: { error?: { message?: string } };
        };
      };
      errorMessage = `WhatsApp API error: ${axiosError.response.status} - ${
        axiosError.response.data?.error?.message ||
        axiosError.response.statusText
      }`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Check if it's a valid Saudi phone number (9 digits after removing country code)
  // or international format (10+ digits)
  return cleanPhone.length >= 9 && cleanPhone.length <= 15;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");

  // If it's a Saudi number, format it nicely
  if (cleanPhone.startsWith("966")) {
    const localNumber = cleanPhone.substring(3);
    return `+966 ${localNumber.substring(0, 2)} ${localNumber.substring(
      2,
      5
    )} ${localNumber.substring(5)}`;
  } else if (cleanPhone.startsWith("0")) {
    // Local Saudi format
    const localNumber = cleanPhone.substring(1);
    return `0${localNumber.substring(0, 2)} ${localNumber.substring(
      2,
      5
    )} ${localNumber.substring(5)}`;
  }

  return phone; // Return as-is if we can't format it
}
