"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { authClient } from "../../../lib/auth-client";
import { useEffect, useState } from "react";

export default function ReviewerProfilePage() {
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center space-y-6 sm:space-y-8 px-4 sm:px-0 py-20 md:py-0">
      {/* Profile Picture */}
      <motion.div
        className="flex flex-col items-center space-y-3 sm:space-y-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6,
        }}
      >
        <motion.div
          className="md:w-20 w-16 md:h-20 h-16 sm:w-24 sm:h-24 bg-[#222224] rounded-full flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2,
            duration: 0.8,
          }}
        >
          <Image
            src="/icons/Profile.svg"
            alt="Profile"
            width={48}
            height={48}
            className="md:w-20 w-16 h-auto sm:w-24"
          />
        </motion.div>
      </motion.div>

      {/* Input Fields */}
      <motion.div
        className="space-y-6 sm:space-y-8 w-full max-w-sm sm:max-w-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.4,
          duration: 0.6,
        }}
      >
        {/* Account Name Input */}
        <motion.div
          className="relative"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 flex justify-end">
            البريد الاكتروني
          </p>
          <input
            type="text"
            value={(session as { data?: { user?: { email?: string } } })?.data?.user?.email || "No email available"}
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
        </motion.div>

        {/* Password Input */}
        <motion.div
          className="relative"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 flex justify-end">
            الدور
          </p>
          <input
            type="text"
            value={(session as { data?: { user?: { role?: string } } })?.data?.user?.role || "No role available"}
            readOnly
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-[#1a1a1a] text-white rounded-full text-right focus:outline-none cursor-not-allowed opacity-75 text-sm sm:text-base"
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
        </motion.div>
      </motion.div>
    </div>
  );
}
