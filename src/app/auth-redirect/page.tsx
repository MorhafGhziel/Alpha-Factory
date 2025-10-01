"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { getRoleDashboardPath } from "../../lib/auth-middleware";
import Image from "next/image";

export default function AuthRedirectPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleRedirect = async () => {
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptRedirect = async (): Promise<void> => {
        try {
          // Progressive delay based on retry count
          const delay = 500 + (retryCount * 500);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Get the current session
          const sessionResult = await authClient.getSession();
          
          if (sessionResult?.data?.user?.role) {
            const dashboardPath = getRoleDashboardPath(sessionResult.data.user.role);
            console.log("🔄 Redirecting to:", dashboardPath, "after", retryCount, "retries");
            
            // Use window.location for Safari compatibility
            if (typeof window !== 'undefined') {
              window.location.href = dashboardPath;
            } else {
              router.push(dashboardPath);
            }
            return;
          } 
          
          // If no session and we haven't exhausted retries, try again
          if (retryCount < maxRetries) {
            retryCount++;
            console.log("🔄 No session found, retrying...", retryCount, "/", maxRetries);
            return attemptRedirect();
          }
          
          // No session after all retries, redirect to home
          console.log("❌ No session found after", maxRetries, "retries, redirecting to home");
          if (typeof window !== 'undefined') {
            window.location.href = "/";
          } else {
            router.push("/");
          }
        } catch (err) {
          console.error("Redirect error:", err);
          
          // If we haven't exhausted retries, try again
          if (retryCount < maxRetries) {
            retryCount++;
            console.log("🔄 Error occurred, retrying...", retryCount, "/", maxRetries);
            return attemptRedirect();
          }
          
          // Show error after all retries failed
          setError("حدث خطأ في إعادة التوجيه");
          setIsRedirecting(false);
          
          // Fallback redirect to home after error
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = "/";
            } else {
              router.push("/");
            }
          }, 2000);
        }
      };

      attemptRedirect();
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/icons/Logo.svg"
          alt="Logo"
          width={80}
          height={70}
          className="w-auto h-auto"
        />
      </div>

      {isRedirecting ? (
        <div className="text-center">
          {/* Loading spinner */}
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C48929] mx-auto"></div>
          </div>
          
          <h2 className="text-white text-xl mb-2">جاري إعادة التوجيه...</h2>
          <p className="text-white/70 text-sm">يرجى الانتظار بينما نقوم بتوجيهك إلى لوحة التحكم</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-red-400 text-xl mb-2">خطأ في إعادة التوجيه</h2>
          <p className="text-white/70 text-sm mb-4">{error}</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = "/";
              } else {
                router.push("/");
              }
            }}
            className="bg-gradient-to-r from-[#E9CF6B] to-[#C48929] text-[#1e1e1e] px-6 py-2 rounded-3xl font-bold hover:scale-105 transition-transform"
          >
            العودة للرئيسية
          </button>
        </div>
      )}
    </div>
  );
}
