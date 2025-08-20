"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const Login = () => {
  return (
    <div className="flex items-center justify-center relative">
      {/* Fading glow overlay from top-right corner */}
      <div
        className="fixed top-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.03) 45%, transparent 75%)",
        }}
      ></div>
      <div className="max-w-md w-full relative">
        {/* Main golden glow for entire content */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 47% 30%, rgba(196,137,41,0.15) 5%, rgba(196,137,41,0.08) 25%, rgba(196,137,41,0.03) 45%, transparent 90%)",
          }}
        ></div>
        <motion.div
          className="flex justify-center mt-10 relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Image
            src="/icons/Logo.svg"
            alt="Logo"
            width={100}
            height={88}
            className="w-auto h-auto relative z-10"
          />
        </motion.div>
        <div className="text-center space-y-20 relative">
          <div>
            <motion.h2
              className="text-[32px] text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              اهــــلا بك
              <br /> في مصنع ألفا
            </motion.h2>
          </div>
          <div className="flex justify-center">
            <motion.button
              className="relative bg-gradient-to-r from-[#E9CF6B] to-[#C48929] text-[20px] font-bold text-[#1e1e1e] px-6 py-1 rounded-3xl cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
              }}
              transition={{
                duration: 1,
                delay: 1,
                ease: "easeInOut",
                scale: { duration: 0.2 },
              }}
            >
              {/* Lightning effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              />

              {/* Lightning bolt effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{
                  x: "100%",
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />

              <span className="relative z-10">تسجيل الدخول</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
