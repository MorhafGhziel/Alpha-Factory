"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useState, createContext, useContext } from "react";
import { TeamGroup } from "../../types";
import { createNewTeam, removeTeamById, updateTeamById } from "../../utils";

interface TeamContextType {
  teams: TeamGroup[];
  addTeam: (team: Omit<TeamGroup, "id" | "createdAt">) => void;
  deleteTeam: (teamId: string) => void;
  updateTeam: (teamId: string, updates: Partial<TeamGroup>) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [teams, setTeams] = useState<TeamGroup[]>([]);

  const addTeam = (teamData: Omit<TeamGroup, "id" | "createdAt">) => {
    const newTeam = createNewTeam(teamData);
    setTeams((prev) => [...prev, newTeam]);
  };

  const deleteTeam = (teamId: string) => {
    setTeams((prev) => removeTeamById(prev, teamId));
  };

  const updateTeam = (teamId: string, updates: Partial<TeamGroup>) => {
    setTeams((prev) => updateTeamById(prev, teamId, updates));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    closeMobileMenu();
  };

  return (
    <TeamContext.Provider value={{ teams, addTeam, deleteTeam, updateTeam }}>
      <div className="min-h-screen flex">
        {/* Mobile Header - Only visible on small screens */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-[#222224] px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-lg font-semibold">Admin Panel</h1>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-white hover:bg-[#222224] rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          >
            <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#0f0f0f] border-r border-[#222224] p-6">
              <div className="space-y-6">
                {/* Profile */}
                <div className="text-center">
                  <button
                    onClick={() => handleNavigation("/admin/profile")}
                    className={`w-full p-3 rounded-lg transition-colors cursor-pointer text-left ${
                      pathname === "/admin/profile"
                        ? "bg-[#222224] text-white"
                        : "text-gray-300 hover:bg-[#222224] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/icons/Profile.svg"
                        alt="Profile"
                        width={24}
                        height={24}
                        className="w-auto h-auto"
                      />
                      <span className="text-sm">الملف الشخصي</span>
                    </div>
                  </button>
                </div>

                {/* Gray Border */}
                <div className="w-full h-px bg-[#222224]"></div>

                {/* Add Account */}
                <div className="text-center">
                  <button
                    onClick={() => handleNavigation("/admin/addaccount")}
                    className={`w-full p-3 rounded-lg transition-colors cursor-pointer text-left ${
                      pathname === "/admin/addaccount"
                        ? "bg-[#222224] text-white"
                        : "text-gray-300 hover:bg-[#222224] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/icons/Add.svg"
                        alt="Add Account"
                        width={20}
                        height={20}
                        className="w-auto h-auto"
                      />
                      <span className="text-sm">اضافة حساب</span>
                    </div>
                  </button>
                </div>

                {/* Manage Account */}
                <div className="text-center">
                  <button
                    onClick={() => handleNavigation("/admin/manageaccount")}
                    className={`w-full p-3 rounded-lg transition-colors cursor-pointer text-left ${
                      pathname === "/admin/manageaccount"
                        ? "bg-[#222224] text-white"
                        : "text-gray-300 hover:bg-[#222224] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/icons/Manage.svg"
                        alt="Manage Account"
                        width={20}
                        height={20}
                        className="w-auto h-auto"
                      />
                      <span className="text-sm">ادارة الحسابات</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar - Only visible on large screens */}
        <div className="hidden lg:flex w-20 bg-[#0f0f0f] flex-col items-center py-6 space-y-6">
          {/* Profile */}
          <div className="relative group">
            <button
              onClick={() => router.push("/admin/profile")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                pathname === "/admin/profile"
                  ? "bg-[#222224]"
                  : "hover:bg-[#222224]"
              }`}
            >
              <Image
                src="/icons/Profile.svg"
                alt="Profile"
                width={34}
                height={34}
                className="w-auto h-auto"
              />
            </button>
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-[#222224] text-white text-sm rounded-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-lg border border-[#333336]">
              الملف الشخصي
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#222224] border-r border-t border-[#333336] rotate-45"></div>
            </div>
          </div>

          {/* Gray Border */}
          <div className="w-8 h-px bg-[#222224]"></div>

          {/* Add Account */}
          <div className="relative group">
            <button
              onClick={() => router.push("/admin/addaccount")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                pathname === "/admin/addaccount"
                  ? "bg-[#222224]"
                  : "hover:bg-[#222224]"
              }`}
            >
              <Image
                src="/icons/Add.svg"
                alt="Add Account"
                width={24}
                height={24}
                className="w-auto h-auto"
              />
            </button>
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-[#222224] text-white text-sm rounded-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-lg border border-[#333336]">
              اضافة حساب
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#222224] border-r border-t border-[#333336] rotate-45"></div>
            </div>
          </div>

          {/* Manage Account */}
          <div className="relative group">
            <button
              onClick={() => router.push("/admin/manageaccount")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                pathname === "/admin/manageaccount"
                  ? "bg-[#222224]"
                  : "hover:bg-[#222224]"
              }`}
            >
              <Image
                src="/icons/Manage.svg"
                alt="Manage Account"
                width={24}
                height={24}
                className="w-auto h-auto"
              />
            </button>
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-[#222224] text-white text-sm rounded-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-lg border border-[#333336]">
              ادارة الحسابات
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#222224] border-r border-t border-[#333336] rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="text-center pt-16 lg:pt-0">{children}</div>
        </div>
      </div>
    </TeamContext.Provider>
  );
}

export { useTeam };
