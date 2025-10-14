"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ClientCommunityPage() {
  const handleTelegramClick = () => {
    window.open("https://t.me/AlphaFactoryNet", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-30 py-20">
      <motion.div
        className="text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6,
        }}
      >
        <h1 className="text-3xl md:text-5xl bg-gradient-to-br from-[#FFFFFF] to-[#3B3B3B] bg-clip-text text-transparent ml-24 md:ml-84 p-3">
          انضــــم الى <span className="font-bold">مجتــــمع</span>
        </h1>
        <h2 className="text-3xl md:text-5xl bg-gradient-to-tl from-[#FFFFFF] to-[#3B3B3B] bg-clip-text text-transparent mr-30 md:mr-84 p-3">
          ألفـــا فاكـــــــتــوري
        </h2>
      </motion.div>

      <motion.div
        className="text-gray-400"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.3,
        }}
      >
        <Image
          src="/icons/Telegram.svg"
          alt="Telegram Icon"
          width={80}
          height={80}
          className="w-16 h-16 md:w-24 md:h-24"
        />
      </motion.div>

      <motion.button
        onClick={handleTelegramClick}
        className="px-10 bg-gradient-to-r from-[#E9CF6B] to-[#C48929] text-[#1B1A18] font-bold text-[20px] rounded-full border border-yellow-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative z-10 cursor-pointer"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.6,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        انضم الان
      </motion.button>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 70%, rgba(196,137,41,0.15) 5%, rgba(196,137,41,0.08) 25%, rgba(196,137,41,0.03) 45%, transparent 90%)",
        }}
      ></div>
    </div>
  );
}
