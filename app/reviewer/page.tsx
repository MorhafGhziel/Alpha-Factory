"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReviewerPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/reviewer/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#E9CF6B] mx-auto mb-4"></div>
        <p className="text-white text-lg">جاري التوجيه إلى لوحة التحكم...</p>
      </div>
    </div>
  );
}
