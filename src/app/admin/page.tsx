"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/addaccount");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#E9CF6B] mx-auto mb-4"></div>
        <p className="text-white text-lg">جاري التوجيه إلى اضافة حساب...</p>
      </div>
    </div>
  );
}