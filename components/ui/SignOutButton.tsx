"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignOutButtonProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  text?: string;
}

export default function SignOutButton({
  className = "",
  iconSize = 24,
  showText = false,
  text = "تسجيل الخروج",
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleSignOutClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    setShowConfirmation(false);
    
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to home page after successful sign out
        router.push('/');
        router.refresh();
      } else {
        console.error('Failed to sign out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleCancelSignOut = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleSignOutClick}
        disabled={isSigningOut}
        className={`flex items-center justify-center transition-colors cursor-pointer ${
          isSigningOut ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600/20'
        } ${className}`}
        title={text}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${isSigningOut ? 'animate-pulse' : ''}`}
        >
          <path
            d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17L21 12L16 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {showText && (
          <span className="ml-2 text-sm">{isSigningOut ? "جاري الخروج..." : text}</span>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md mx-4 border border-[#333]">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                تأكيد تسجيل الخروج
              </h3>
              <p className="text-gray-300 mb-6">
                هل أنت متأكد من أنك تريد تسجيل الخروج؟
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelSignOut}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmSignOut}
                  disabled={isSigningOut}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSigningOut ? "جاري الخروج..." : "تسجيل الخروج"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
