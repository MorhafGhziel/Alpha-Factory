"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../src/lib/auth-client";
import { User } from "../src/lib/auth";
import { getRoleDashboardPath } from "../src/lib/auth-middleware";


interface LoginProps {
  user?: User;
}

const Login = ({}: LoginProps = {}) => {
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const router = useRouter();

  const handleLoginClick = () => {
    setShowForm(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleOTPVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsVerifyingOTP(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail, 
          otp: otpCode 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "رمز التحقق غير صحيح");
        return;
      }

      // OTP verified successfully, proceed with login
      const { data, error } = await authClient.signIn.email({
        email: userEmail,
        password,
        callbackURL: "/api/auth/callback",
      });

      if (error) {
        setError(error.message || "حدث خطأ ما");
      } else if (data?.user && "role" in data.user) {
        const dashboardPath = getRoleDashboardPath(
          (data.user as { role: string }).role
        );
        router.push(dashboardPath);
      } else {
        router.refresh();
      }
    } catch {
      setError("حدث خطأ في التحقق من الرمز");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Helper function to check if input is email format
    const isEmail = (input: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    };

    try {
      let emailForAuth = username;

      // If the input is not an email format, find the user's email by username
      if (!isEmail(username)) {
        try {
          const response = await fetch('/api/auth/find-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier: username }),
          });

          if (!response.ok) {
            if (response.status === 404) {
              setError("اسم المستخدم غير موجود");
              return;
            }
            throw new Error('Failed to find user');
          }

          const userData = await response.json();
          emailForAuth = userData.email;
        } catch {
          setError("حدث خطأ في البحث عن المستخدم");
          return;
        }
      }

      // First verify credentials without logging in
      const verifyResponse = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: emailForAuth, 
          password 
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        setError(errorData.error || "بيانات الدخول غير صحيحة");
        return;
      }

      // Credentials are valid, send OTP
      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForAuth }),
      });

      if (!otpResponse.ok) {
        setError("حدث خطأ في إرسال رمز التحقق");
        return;
      }

      // Store email for OTP verification and show OTP form
      setUserEmail(emailForAuth);
      setShowOTP(true);
    } catch {
      setError("حدث خطأ في تسجيل الدخول");
    }
  };

  return (
    <div className="flex flex-col items-center relative min-h-screen overflow-hidden pt-10">
      {/* Fading glow overlay from top-right corner */}
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.03) 45%, transparent 75%)",
        }}
      ></div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 left-4 sm:top-12 sm:left-8 w-auto h-auto opacity-30"
        >
          <Image
            src="/icons/Picture.svg"
            alt="Picture"
            width={48}
            height={48}
            className="w-auto h-auto"
          />
        </motion.div>

        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 right-6 sm:top-20 sm:right-12 w-auto h-auto opacity-30"
        >
          <Image
            src="/icons/Folder.svg"
            alt="Folder"
            width={48}
            height={48}
            className="w-auto h-auto"
          />
        </motion.div>

        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/3 sm:top-32 sm:left-1/4 w-auto h-auto opacity-30"
        >
          <Image
            src="/icons/Genie Lamp.svg"
            alt="Genie"
            width={48}
            height={48}
            className="w-auto h-auto"
          />
        </motion.div>

        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-38 right-1/4 hidden md:block sm:top-40 sm:right-1/3 w-auto h-auto opacity-30"
        >
          <Image
            src="/icons/Idea.svg"
            alt="Idea"
            width={48}
            height={48}
            className="w-auto h-auto"
          />
        </motion.div>

        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-30 left-8 sm:bottom-32 sm:left-16 w-auto h-auto opacity-30"
        >
          <Image
            src="/icons/Document.svg"
            alt="Document"
            width={48}
            height={48}
            className="w-auto h-auto"
          />
        </motion.div>

        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-16 right-1/3 sm:bottom-20 sm:left-[1000px] w-auto h-auto opacity-30"
        >
          <Image
            src="/icons/WinRAR.svg"
            alt="WinRAR"
            width={48}
            height={48}
            className="w-auto h-auto"
          />
        </motion.div>

        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-30 left-2/3 sm:bottom-[340px] sm:left-[1400px] w-auto h-auto opacity-30"
        >
          <Image
            src="/icons/Clock.svg"
            alt="Clock"
            width={48}
            height={48}
            className="w-auto h-auto"
          />
        </motion.div>
      </div>

      <div className="max-w-md w-full relative">
        {/* Main golden glow for entire content */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 47% 30%, rgba(196,137,41,0.15) 5%, rgba(196,137,41,0.08) 25%, rgba(196,137,41,0.03) 45%, transparent 90%)",
          }}
        ></div>
        <div className="flex justify-center mt-10 relative">
          <Image
            src="/icons/Logo.svg"
            alt="Logo"
            width={100}
            height={88}
            className="w-auto h-auto relative z-10"
          />
        </div>

        <div className="text-center relative">
          <motion.div
            animate={showForm ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="space-y-20"
          >
            <div>
              <motion.h2
                className="text-[32px] text-white"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                اهــــلا بك
                <br /> في مصنع ألفا
              </motion.h2>
            </div>
            <div className="flex justify-center">
              <motion.button
                onClick={handleLoginClick}
                className="relative bg-gradient-to-r from-[#E9CF6B] to-[#C48929] text-[20px] font-bold text-[#1e1e1e] px-6 py-1 rounded-3xl cursor-pointer overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.05,
                }}
                transition={{
                  duration: 1,
                  delay: 1,
                  ease: "easeInOut",
                  scale: { duration: 0.2 },
                }}
              >
                {/* Lightning effect overla */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                />

                {/* Lightning bolt effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{
                    x: "100%",
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />

                <span className="relative z-10">تسجيل الدخول</span>
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 1000, opacity: 0 }}
            animate={showForm && !showOTP ? { x: 0, opacity: 1 } : { x: 1000, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Form fields */}
            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
              <div>
                <input
                  type="text"
                  placeholder="البريد الإلكتروني"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gradient-to-r from-[#C48829] to-[#EAD06C] text-[#1e1e1e] px-8 py-2 rounded-3xl placeholder-[#1e1e1e]/70 placeholder:text-[24px] placeholder:font-bold font-medium text-center focus:outline-none focus:border-[#a68857] focus:border-2 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gradient-to-r from-[#C48829] to-[#EAD06C] text-[#1e1e1e] px-8 py-2 rounded-3xl placeholder-[#1e1e1e]/70 placeholder:text-[24px] placeholder:font-bold font-medium text-center focus:outline-none focus:border-[#a68857] focus:border-2 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-20 top-1/2 transform -translate-y-1/2 text-[#1e1e1e] hover:text-[#8B4513] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  )}
                </button>
              </div>
              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#434343] to-[#A9A9A9] text-[#272727] text-[14px] py-1 px-4 rounded-3xl hover:scale-105 transition font-bold cursor-pointer"
              >
                الاستمرار
              </button>
            </form>
          </motion.div>

          {/* OTP Verification Form */}
          <motion.div
            initial={{ x: 1000, opacity: 0 }}
            animate={showOTP ? { x: 0, opacity: 1 } : { x: 1000, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="text-center mb-6">
              <h3 className="text-white text-xl mb-2">رمز التحقق</h3>
              <p className="text-white/70 text-sm">
                تم إرسال رمز التحقق إلى بريدك الإلكتروني
              </p>
            </div>
            
            <form onSubmit={handleOTPVerification} className="space-y-6 w-full max-w-sm">
              <div>
                <input
                  type="text"
                  placeholder="أدخل رمز التحقق"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="bg-gradient-to-r from-[#C48829] to-[#EAD06C] text-[#1e1e1e] px-8 py-2 rounded-3xl placeholder-[#1e1e1e]/70 placeholder:text-[24px] placeholder:font-bold font-medium text-center focus:outline-none focus:border-[#a68857] focus:border-2 transition-all w-full"
                  required
                  maxLength={6}
                />
              </div>
              
              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}
              
              <div className="flex space-x-4 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowOTP(false);
                    setOtpCode("");
                    setError("");
                  }}
                  className="bg-gradient-to-r from-[#6B6B6B] to-[#A9A9A9] text-[#272727] text-[14px] py-1 px-4 rounded-3xl hover:scale-105 transition font-bold cursor-pointer"
                >
                  رجوع
                </button>
                
                <button
                  type="submit"
                  disabled={isVerifyingOTP}
                  className="bg-gradient-to-r from-[#434343] to-[#A9A9A9] text-[#272727] text-[14px] py-1 px-4 rounded-3xl hover:scale-105 transition font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOTP ? "جاري التحقق..." : "تحقق"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
