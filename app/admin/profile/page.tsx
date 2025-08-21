"use client";

import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center space-y-6 sm:space-y-8 px-4 sm:px-0 py-20 md:py-0">
      {/* Profile Picture */}
      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
        <div className="md:w-20 w-16 md:h-20 h-16 sm:w-24 sm:h-24 bg-[#222224] rounded-full flex items-center justify-center">
          <Image
            src="/icons/Profile.svg"
            alt="Profile"
            width={48}
            height={48}
            className="md:w-20 w-16 h-auto sm:w-24"
          />
        </div>
        <span className="text-gray-400 text-xs sm:text-sm text-center">
          تغيير صورة الملف الشخصي
        </span>
      </div>

      {/* Input Fields */}
      <div className="space-y-6 sm:space-y-8 w-full max-w-sm sm:max-w-md">
        {/* Account Name Input */}
        <div className="relative">
          <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 flex justify-end">
            اسم الحساب
          </p>
          <input
            type="text"
            value="Admin0e2"
            readOnly
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-[#222224] text-white rounded-full text-right focus:outline-none cursor-not-allowed opacity-75 text-sm sm:text-base"
          />
          <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-[-7px]">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
            </svg>
          </div>
        </div>

        {/* Username Input */}
        <div className="relative">
          <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 flex justify-end">
            كلمة المرور
          </p>
          <input
            type="text"
            value="Admin123"
            readOnly
            className="w-full sm:w-[400px] px-4 sm:px-5 py-2.5 sm:py-3 bg-[#1a1a1a] text-white rounded-full text-right focus:outline-none cursor-not-allowed opacity-75 text-sm sm:text-base"
          />
          <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-[-7px]">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
