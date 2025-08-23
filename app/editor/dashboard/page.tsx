"use client";

import { motion } from "framer-motion";

export default function EditorDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center space-y-6 sm:space-y-8 px-4 sm:px-0 py-20 md:py-0">
      <motion.div
        className="text-white text-4xl font-bold"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6,
        }}
      >
        Dashboard
      </motion.div>
    </div>
  );
}
