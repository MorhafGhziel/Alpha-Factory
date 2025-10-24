"use client";

import { useState, useEffect } from "react";
import { TeamGroup } from "../../types";
import { createNewTeam, removeTeamById, TeamContext } from "@/src/utils";
import Sidebar from "@/components/ui/Sidebar";
import MobileMenu from "@/components/ui/MobileMenu";
import Header from "@/components/ui/Header";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [teams, setTeams] = useState<TeamGroup[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const addTeam = (team: Omit<TeamGroup, "id" | "createdAt">) => {
    const newTeam = createNewTeam(team);
    setTeams((prev) => [...prev, newTeam]);
  };

  const deleteTeam = (teamId: string) => {
    setTeams((prev) => removeTeamById(prev, teamId));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openSupport = () => {
    try {
      const mailto = `mailto:support@alphafactory.net?subject=${encodeURIComponent(
        "طلب دعم فني - Admin Panel - Alpha Factory"
      )}&body=${encodeURIComponent(
        "مرحباً فريق الدعم،\n\nأحتاج إلى مساعدة في لوحة الإدارة:\n\n[يرجى وصف المشكلة أو الاستفسار هنا]\n\nشكراً لكم"
      )}`;
      window.open(mailto, "_blank");
    } catch {
      setToastType("error");
      setToastMsg("تعذر فتح تطبيق البريد، حاول مرة أخرى");
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  useEffect(() => {
    // Get user role to determine if admin panel link should be shown
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          const role = data.user?.role || null;
          setUserRole(role);
        }
      } catch (error) {
        // Handle error silently
      }
    };
    
    fetchUserRole();
  }, []);

  return (
    <TeamContext.Provider value={{ teams, addTeam, deleteTeam }}>
      <div className="min-h-screen flex">
        <Header
          title="Admin Panel"
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMenu={toggleMobileMenu}
        />

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          items={[
            {
              path: "/admin/profile",
              icon: "/icons/Profile.svg",
              alt: "Profile",
              text: "الملف الشخصي",
            },
            ...(userRole === "owner" ? [
              {
                path: "",
                icon: "",
                alt: "",
                text: "",
                isBorder: true,
              },
              {
                path: "/admin-panel",
                icon: "/icons/Adjust.svg",
                alt: "Admin Panel",
                text: "لوحة التحكم الرئيسية",
              }
            ] : []),
            {
              path: "",
              icon: "",
              alt: "",
              text: "",
              isBorder: true,
            },
            {
              path: "/admin/addaccount",
              icon: "/icons/Add.svg",
              alt: "Add Account",
              text: "اضافة حساب",
            },
            {
              path: "/admin/manageaccount",
              icon: "/icons/Manage.svg",
              alt: "Manage Account",
              text: "ادارة الحسابات",
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
          animated={false}
        />

        <Sidebar
          items={(() => {
            const baseItems = [
              {
                path: "/admin/profile",
                icon: "/icons/Profile.svg",
                alt: "Profile",
                tooltip: "الملف الشخصي",
              }
            ];
            
            const ownerItems = userRole === "owner" ? [
              {
                path: "",
                icon: "",
                alt: "",
                tooltip: "",
                isBorder: true,
              },
              {
                path: "/admin-panel",
                icon: "/icons/Adjust.svg",
                alt: "Admin Panel",
                tooltip: "لوحة التحكم الرئيسية",
              }
            ] : [];
            
            
            return [...baseItems, ...ownerItems,
              {
                path: "",
                icon: "",
                alt: "",
                tooltip: "",
                isBorder: true,
              },
              {
                path: "/admin/addaccount",
                icon: "/icons/Add.svg",
                alt: "Add Account",
                tooltip: "اضافة حساب",
              },
              {
                path: "/admin/manageaccount",
                icon: "/icons/Manage.svg",
                alt: "Manage Account",
                tooltip: "ادارة الحسابات",
              },
              { path: "", icon: "", alt: "", tooltip: "", isSpacer: true },
              {
                path: "",
                icon: "/icons/Support.svg",
                alt: "Support",
                tooltip: "الدعم",
                onClick: openSupport,
              }
            ];
          })()}
          width="w-20"
          bgColor="bg-[#0f0f0f]"
          iconSize={20}
          tooltipPosition="left"
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
    </TeamContext.Provider>
  );
}
