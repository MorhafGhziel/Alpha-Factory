"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate to addaccount route
    router.push("/admin/addaccount");
  }, [router]);

  return (
    <div>
      <h1 className="text-4xl font-bold">Admin</h1>
    </div>
  );
}
