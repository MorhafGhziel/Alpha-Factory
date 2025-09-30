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
  const router = useRouter();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    
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

  return (
    <button
      onClick={handleSignOut}
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
  );
}
