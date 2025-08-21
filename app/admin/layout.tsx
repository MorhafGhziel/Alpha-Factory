"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-20 bg-[#0f0f0f] flex flex-col items-center py-6 space-y-6">
        {/* Profile */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => router.push("/admin/profile")}
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Image
              src="/icons/Profile.svg"
              alt="Profile"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>

        {/* Gray Border */}
        <div className="w-8 h-px bg-[#222224]"></div>

        {/* Add Account */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => router.push("/admin/addaccount")}
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Image
              src="/icons/Add.svg"
              alt="Add Account"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>

        {/* Manage Account */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => router.push("/admin/manageaccount")}
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Image
              src="/icons/Manage.svg"
              alt="Manage Account"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-13.5 mx-auto">
        <div className="text-center">{children}</div>
      </div>
    </div>
  );
}
