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

  useEffect(() => {
    // Get user role to determine if admin panel link should be shown
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role || null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
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
              icon: "",
              alt: "Sign Out",
              text: "تسجيل الخروج",
              onClick: async () => {
                try {
                  const response = await fetch('/api/auth/signout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  if (response.ok) {
                    window.location.href = '/';
                  }
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              },
            },
          ]}
          animated={false}
        />

        <Sidebar
          items={[
            {
              path: "/admin/profile",
              icon: "/icons/Profile.svg",
              alt: "Profile",
              tooltip: "الملف الشخصي",
            },
            ...(userRole === "owner" ? [
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
            ] : []),
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
                  const response = await fetch('/api/auth/signout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  if (response.ok) {
                    window.location.href = '/';
                  }
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              },
            },
          ]}
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
      </div>
    </TeamContext.Provider>
  );
}
