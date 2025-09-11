"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RequestImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (improvementData: {
    title: string;
    description: string;
    department: string;
  }) => void;
}

export default function RequestImprovementModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestImprovementModalProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [department, setDepartment] = useState<string>("");

  const handleSubmit = () => {
    if (!title || !description || !department) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    onSubmit({
      title,
      description,
      department,
    });

    setTitle("");
    setDescription("");
    setDepartment("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#0F0F0F] rounded-2xl p-8 w-full max-w-2xl mx-4"
          >
            <div className="relative mb-8">
              <button
                onClick={onClose}
                className="absolute top-0 left-0 cursor-pointer text-gray-400 hover:text-gray-600 font-bold transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="flex justify-center">
                <div className="text-[26px] bg-gradient-to-r from-[#242424] to-[#363636] text-white px-8 py-1 rounded-full">
                  طلب تحسين
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <div className="text-white text-right mb-3 text-sm">
                  :اختر القسم
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDepartment("editing")}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
                      department === "editing"
                        ? "bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black shadow-lg shadow-yellow-500/25"
                        : "bg-[#0B0B0B] text-white border border-[#333336] hover:bg-[#1a1a1a] hover:border-[#555555]"
                    }`}
                  >
                    قسم الإنتاج
                  </button>
                  <button
                    onClick={() => setDepartment("design")}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
                      department === "design"
                        ? "bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black shadow-lg shadow-yellow-500/25"
                        : "bg-[#0B0B0B] text-white border border-[#333336] hover:bg-[#1a1a1a] hover:border-[#555555]"
                    }`}
                  >
                    قسم التصميم
                  </button>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-full focus:outline-none text-right"
                  placeholder="عنوان المشروع"
                />
              </div>

              <div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-2xl focus:outline-none text-right resize-none"
                  placeholder="اضف تحسيناتك"
                />
              </div>

              <div className="pt-4">
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    className="text-[20px] bg-gradient-to-r cursor-pointer from-[#EAD06C] to-[#C48829] text-black px-8 py-1 rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-colors"
                  >
                    ارسال
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
