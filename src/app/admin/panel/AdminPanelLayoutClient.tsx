"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/ui/SignOutButton";

interface AdminPanelLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminPanelLayoutClient({
  children,
}: AdminPanelLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/panel",
      icon: "📊",
      current: pathname === "/admin/panel",
    },
    {
      name: "Account Management",
      href: "/admin/panel/accounts",
      icon: "👥",
      current: pathname === "/admin/panel/accounts",
    },
    {
      name: "Role Management",
      href: "/admin/panel/roles",
      icon: "🔐",
      current: pathname === "/admin/panel/roles",
    },
    {
      name: "System Settings",
      href: "/admin/panel/settings",
      icon: "⚙️",
      current: pathname === "/admin/panel/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-lg font-semibold text-gray-900">Owner Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close sidebar</span>
              ✕
            </button>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  item.current
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Sign Out Button */}
          <div className="p-4 border-t border-gray-200">
            <SignOutButton 
              showText={true} 
              iconSize={20} 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow">
          <div className="flex h-16 items-center justify-center px-4">
            <h2 className="text-xl font-bold text-gray-900">Owner Panel</h2>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  item.current
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 p-4 space-y-2">
            <Link
              href="/admin"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Admin Dashboard
            </Link>
            
            {/* Desktop Sign Out Button */}
            <SignOutButton 
              showText={true} 
              iconSize={20} 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-10 bg-white shadow md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Open sidebar</span>
              ☰
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Owner Panel</h1>
            <div />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
