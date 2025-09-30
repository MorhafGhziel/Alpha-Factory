"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import MobileMenu from "@/components/ui/MobileMenu";
import Header from "@/components/ui/Header";
import ComingSoonModal from "@/components/ComingSoonModal";
import { ProjectProvider } from "@/contexts/ProjectContext";

export default function ClientLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openComingSoonModal = () => {
    setIsComingSoonModalOpen(true);
  };

  const closeComingSoonModal = () => {
    setIsComingSoonModalOpen(false);
  };

  return (
    <ProjectProvider>
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
              path: "/client/invoices",
              icon: "/icons/Card.svg",
              alt: "Invoices",
              text: "الفواتير",
            },
            {
              path: "/client/community",
              icon: "/icons/News.svg",
              alt: "Community",
              text: "المجتمع",
            },
            {
              path: "",
              icon: "/icons/Plus.svg",
              alt: "Coming Soon",
              text: "قريباً",
              onClick: openComingSoonModal,
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
              icon: "",
              alt: "Sign Out",
              text: "تسجيل الخروج",
              onClick: async () => {
                try {
                  const response = await fetch("/api/auth/signout", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (response.ok) {
                    window.location.href = "/";
                  }
                } catch (error) {
                  console.error("Error signing out:", error);
                }
              },
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
              path: "/client/invoices",
              icon: "/icons/Card.svg",
              alt: "Invoices",
              tooltip: "الفواتير",
            },
            {
              path: "/client/community",
              icon: "/icons/News.svg",
              alt: "Community",
              tooltip: "المجتمع",
            },
            {
              path: "",
              icon: "/icons/Plus.svg",
              alt: "Coming Soon",
              tooltip: "قريباً",
              onClick: openComingSoonModal,
            },
            {
              path: "",
              icon: "",
              alt: "",
              tooltip: "",
              isBorder: true,
            },
            {
              path: "",
              icon: "",
              alt: "Sign Out",
              tooltip: "تسجيل الخروج",
              onClick: async () => {
                try {
                  const response = await fetch("/api/auth/signout", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (response.ok) {
                    window.location.href = "/";
                  }
                } catch (error) {
                  console.error("Error signing out:", error);
                }
              },
            },
          ]}
          spacing="space-y-4"
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="text-center pt-16 lg:pt-0">{children}</div>
        </div>

        {/* Coming Soon Modal */}
        <ComingSoonModal
          isOpen={isComingSoonModalOpen}
          onClose={closeComingSoonModal}
        />
      </div>
    </ProjectProvider>
  );
}
