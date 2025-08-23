"use client";

import { useState } from "react";
import { TeamGroup } from "../../types";
import { createNewTeam, removeTeamById, TeamContext } from "../../utils";
import Sidebar from "../../components/ui/Sidebar";
import MobileMenu from "../../components/ui/MobileMenu";
import Header from "../../components/ui/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [teams, setTeams] = useState<TeamGroup[]>([]);

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
          ]}
          width="w-20"
          bgColor="bg-[#0f0f0f]"
          iconSize={34}
          tooltipPosition="left"
          spacing="space-y-6"
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="text-center pt-16 lg:pt-0">{children}</div>
        </div>
      </div>
    </TeamContext.Provider>
  );
}
