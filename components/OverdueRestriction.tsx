"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface OverdueStatus {
  overdueDays: number;
  accessLevel: "full" | "invoice_only" | "blocked";
  restrictionMessage: string;
  hasOverdueInvoices: boolean;
}

interface OverdueRestrictionProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export default function OverdueRestriction({ children, onRefresh }: OverdueRestrictionProps) {
  const [overdueStatus, setOverdueStatus] = useState<OverdueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkOverdueStatus() {
      try {
        const response = await fetch("/api/check-overdue-status");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOverdueStatus(data);
            
            // Handle restrictions based on access level
            if (data.accessLevel === "blocked") {
              // Complete block - redirect to a blocked page or show message
              if (!pathname.includes("/blocked")) {
                router.push("/client/blocked");
              }
            }
            // For invoice_only, we'll show a warning banner but allow access
          }
        }
      } catch (error) {
        console.error("Error checking overdue status:", error);
      } finally {
        setLoading(false);
      }
    }

    // Only check for client pages
    if (pathname.startsWith("/client")) {
      checkOverdueStatus();
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  // Show loading state
  if (loading && pathname.startsWith("/client")) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E9CF6B] mx-auto mb-4"></div>
          <p>جاري التحقق من حالة الحساب...</p>
        </div>
      </div>
    );
  }

  // Show restriction message for invoice_only access
  if (overdueStatus?.accessLevel === "invoice_only" && pathname !== "/client/invoices") {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-[#1a1a1a] rounded-lg border border-orange-500/20">
          <div className="text-orange-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">وصول محدود</h2>
          <p className="text-gray-300 mb-6">{overdueStatus.restrictionMessage}</p>
          <button
            onClick={() => router.push("/client/invoices")}
            className="bg-[#E9CF6B] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#d4b952] transition-colors"
          >
            الذهاب إلى صفحة الفواتير
          </button>
        </div>
      </div>
    );
  }

  // Show blocked message
  if (overdueStatus?.accessLevel === "blocked") {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-[#1a1a1a] rounded-lg border border-red-500/20">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-white mb-4">تم حظر الحساب</h2>
          <p className="text-gray-300 mb-6">{overdueStatus.restrictionMessage}</p>
          <div className="text-sm text-gray-400">
            للمساعدة: support@alphafactory.net
          </div>
        </div>
      </div>
    );
  }

  // Show warning banner for 3-day overdue (full access but with warning)
  return (
    <div>
      {overdueStatus?.hasOverdueInvoices && overdueStatus.accessLevel === "full" && (
        <div className="bg-yellow-900/20 border-b border-yellow-500/20 p-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-yellow-200 text-sm">{overdueStatus.restrictionMessage}</span>
            </div>
            <button
              onClick={() => router.push("/client/invoices")}
              className="text-yellow-400 hover:text-yellow-300 text-sm underline"
            >
              عرض الفواتير
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
