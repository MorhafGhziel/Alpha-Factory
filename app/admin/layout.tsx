"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-20 bg-[#0f0f0f] flex flex-col items-center py-6 space-y-6">
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

      <div className="mx-auto">
        <div className="text-center">{children}</div>
      </div>
    </div>
  );
}
