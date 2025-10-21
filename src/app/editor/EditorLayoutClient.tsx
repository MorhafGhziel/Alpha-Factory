"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import MobileMenu from "@/components/ui/MobileMenu";
import Header from "@/components/ui/Header";

export default function EditorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openSupport = () => {
    try {
      const mailto = `mailto:support@alphafactory.net?subject=${encodeURIComponent(
        "طلب دعم فني - Editor Panel - Alpha Factory"
      )}&body=${encodeURIComponent(
        "مرحباً فريق الدعم،\n\nأحتاج إلى مساعدة في لوحة التحرير:\n\n[يرجى وصف المشكلة أو الاستفسار هنا]\n\nشكراً لكم"
      )}`;
      window.open(mailto, "_blank");
    } catch {
      setToastType("error");
      setToastMsg("تعذر فتح تطبيق البريد، حاول مرة أخرى");
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Header
        title="Editor Panel"
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMenu={toggleMobileMenu}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        items={[
          {
            path: "/editor/profile",
            icon: "/icons/Profile.svg",
            alt: "Profile",
            text: "الملف الشخصي",
          },
          {
            path: "",
            icon: "",
            alt: "",
            text: "",
            isBorder: true,
          },
          {
            path: "/editor/tracking-board",
            icon: "/icons/Adjust.svg",
            alt: "Dashboard",
            text: "لوحة المتابعة",
          },
          {
            path: "/editor/community",
            icon: "/icons/News.svg",
            alt: "Community",
            text: "المجتمع",
          },
          {
            path: "",
            icon: "",
            alt: "",
            text: "",
            isBorder: true,
          },
          {
            path: "",
            icon: "/icons/Support.svg",
            alt: "Support",
            text: "الدعم",
            onClick: openSupport,
          },
          ]}
          animated={true}
        />

      <Sidebar
        items={[
          {
            path: "/editor/profile",
            icon: "/icons/Profile.svg",
            alt: "Profile",
            tooltip: "الملف الشخصي",
          },
          {
            path: "",
            icon: "",
            alt: "",
            tooltip: "",
            isBorder: true,
          },
          {
            path: "/editor/tracking-board",
            icon: "/icons/Adjust.svg",
            alt: "Dashboard",
            tooltip: "لوحة المتابعة",
          },
          {
            path: "/editor/community",
            icon: "/icons/News.svg",
            alt: "Community",
            tooltip: "المجتمع",
          },
          { path: "", icon: "", alt: "", tooltip: "", isSpacer: true },
          {
            path: "",
            icon: "/icons/Support.svg",
            alt: "Support",
            tooltip: "الدعم",
            onClick: openSupport,
          },
          ]}
        spacing="space-y-4"
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="text-center pt-16 lg:pt-0">{children}</div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg text-white ${
              toastType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}
