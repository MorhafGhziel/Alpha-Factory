// Shared OTP storage and utilities
class OTPService {
  private storage: Map<string, { code: string; expires: number }>;

  constructor() {
    // Use global storage to persist across module reloads in development
    if (typeof global !== "undefined") {
      if (!global.otpStorage) {
        global.otpStorage = new Map();
      }
      this.storage = global.otpStorage;
    } else {
      this.storage = new Map();
    }
  }

  // Generate random 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP with expiration
  storeOTP(email: string, code: string, expirationMinutes: number = 5): void {
    const expires = Date.now() + expirationMinutes * 60 * 1000;
    this.storage.set(email, { code, expires });
  }

  // Verify OTP
  verifyOTP(email: string, code: string): { success: boolean; error?: string } {
    const storedOTP = this.storage.get(email);

    if (!storedOTP) {
      return {
        success: false,
        error: "رمز التحقق غير موجود أو منتهي الصلاحية",
      };
    }

    if (Date.now() > storedOTP.expires) {
      this.storage.delete(email);
      return { success: false, error: "رمز التحقق منتهي الصلاحية" };
    }

    if (storedOTP.code !== code) {
      return { success: false, error: "رمز التحقق غير صحيح" };
    }

    // OTP is valid, remove it from storage
    this.storage.delete(email);
    return { success: true };
  }

  // Clean up expired OTPs
  cleanup(): void {
    const now = Date.now();
    this.storage.forEach((otp, email) => {
      if (otp.expires < now) {
        this.storage.delete(email);
      }
    });
  }
}

// Create singleton instance
const otpService = new OTPService();

// Clean up expired OTPs every minute
setInterval(() => {
  otpService.cleanup();
}, 60000);

export default otpService;
