"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "@/contexts/ProjectContext";
import CustomDropdown from "./CustomDropdown";
import VoiceRecorder from "./VoiceRecorder";

interface RequestImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (improvementData: {
    projectId: string;
    title: string;
    description: string;
    department: string;
    hasVoiceRecording?: boolean;
    isVerified?: boolean;
  }) => void;
}

export default function RequestImprovementModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestImprovementModalProps) {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [hasVoiceRecording, setHasVoiceRecording] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Auto-verification logic: verify when all fields are completed
  useEffect(() => {
    const allFieldsCompleted = selectedProjectId && description && department;
    if (allFieldsCompleted) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }, [selectedProjectId, description, department]);

  const handleVoiceRecorded = (hasRecording: boolean) => {
    setHasVoiceRecording(hasRecording);
  };

  const handleManualVerificationToggle = () => {
    setIsVerified(!isVerified);
  };

  const handleSubmit = () => {
    if (!selectedProjectId || !description || !department) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const selectedProject = projects.find((p) => p.id === selectedProjectId);
    if (!selectedProject) {
      alert("المشروع المحدد غير موجود");
      return;
    }

    onSubmit({
      projectId: selectedProjectId,
      title: selectedProject.title,
      description,
      department,
      hasVoiceRecording,
      isVerified,
    });

    setSelectedProjectId("");
    setDescription("");
    setDepartment("");
    setHasVoiceRecording(false);
    setIsVerified(false);
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
                <div className="text-white text-right mb-3 text-sm">
                  اختر المشروع:
                </div>
                {projects.length === 0 ? (
                  <div className="w-full bg-[#0B0B0B] text-gray-400 px-4 py-3 rounded-xl text-center border border-[#333336]">
                    لا توجد مشاريع متاحة. قم بإنشاء مشروع جديد أولاً.
                  </div>
                ) : (
                  <CustomDropdown
                    options={projects.map((project) => project.title)}
                    placeholder="اختر مشروع من القائمة"
                    selectedValue={
                      projects.find((p) => p.id === selectedProjectId)?.title ||
                      ""
                    }
                    onSelect={(selectedTitle) => {
                      const project = projects.find(
                        (p) => p.title === selectedTitle
                      );
                      if (project) {
                        setSelectedProjectId(project.id);
                      }
                    }}
                  />
                )}
              </div>

              <div>
                <div className="text-white text-right mb-3 text-sm">
                  وصف التحسين:
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-2xl focus:outline-none text-right resize-none border border-[#3F3F3F] focus:border-[#EAD06C]"
                  placeholder="اضف تحسيناتك"
                />

                {/* Voice Recording Section */}
                <VoiceRecorder
                  onVoiceRecorded={handleVoiceRecorded}
                  className="mt-3"
                />
              </div>

              {/* Verification Status */}
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#333336]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleManualVerificationToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      isVerified
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25"
                        : "bg-gray-500 hover:bg-gray-600 text-white shadow-lg shadow-gray-500/25"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {isVerified ? "تم التحقق" : "غير محقق"}
                  </button>

                  {isVerified && (
                    <div className="text-green-400 text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>جميع الحقول مكتملة</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  {isVerified ? "تلقائي" : "يدوي"}
                </div>
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
