"use client";

import { useState } from "react";
import Sidebar from "../../components/ui/Sidebar";
import MobileMenu from "../../components/ui/MobileMenu";
import Header from "../../components/ui/Header";

export default function EditorLayoutClient({
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
        ]}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="text-center pt-16 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
