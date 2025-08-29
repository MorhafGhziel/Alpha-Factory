"use client";

import { useState } from "react";
import Sidebar from "../../components/ui/Sidebar";
import MobileMenu from "../../components/ui/MobileMenu";
import Header from "../../components/ui/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex">
      <Header
        title="Client Panel"
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMenu={toggleMobileMenu}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        items={[
          {
            path: "/client/profile",
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
            path: "/client/dashboard",
            icon: "/icons/Manage.svg",
            alt: "Dashboard",
            text: "لوحة التحكم",
          },
          {
            path: "/client/tracking-board",
            icon: "/icons/Adjust.svg",
            alt: "Tracking Board",
            text: "لوحة المتابعة",
          },
          {
            path: "/client/community",
            icon: "/icons/News.svg",
            alt: "Community",
            text: "المجتمع",
          },
          {
            path: "/client/comingsoon",
            icon: "/icons/Plus.svg",
            alt: "Comingsoon",
            text: "قريباً",
          },
        ]}
        animated={true}
      />

      <Sidebar
        items={[
          {
            path: "/client/profile",
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
            path: "/client/dashboard",
            icon: "/icons/Manage.svg",
            alt: "Dashboard",
            tooltip: "لوحة التحكم",
          },
          {
            path: "/client/tracking-board",
            icon: "/icons/Adjust.svg",
            alt: "Tracking Board",
            tooltip: "لوحة المتابعة",
          },
          {
            path: "/client/community",
            icon: "/icons/News.svg",
            alt: "Community",
            tooltip: "المجتمع",
          },
          {
            path: "/client/comingsoon",
            icon: "/icons/Plus.svg",
            alt: "Comingsoon",
            tooltip: "قريباً",
          },
        ]}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="text-center pt-16 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
