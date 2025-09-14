"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomDatePicker from "./CustomDatePicker";
import VoiceRecorder from "./VoiceRecorder";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: {
    title: string;
    type: string;
    filmingStatus: string;
    fileLinks: string;
    notes: string;
    date: string;
  }) => void;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onAddProject,
}: AddProjectModalProps) {
  const [projectType, setProjectType] = useState<string>("");
  const [filmingStatus, setFilmingStatus] = useState<string>("");
  const [isProjectTypeOpen, setIsProjectTypeOpen] = useState<boolean>(false);
  const [isFilmingStatusOpen, setIsFilmingStatusOpen] =
    useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [fileLinks, setFileLinks] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");

  const handleProjectTypeChange = (type: string) => {
    setProjectType(type);
  };

  const handleVoiceRecorded = (hasRecording: boolean) => {
    if (hasRecording) {
      setNotes((prev) => prev + (prev ? "\n" : "") + "🎤 [رسالة صوتية مسجلة]");
    } else {
      setNotes((prev) => prev.replace(/\n?🎤 \[رسالة صوتية مسجلة\]/g, ""));
    }
  };

  const handleSubmit = () => {
    if (!title || !projectType || !filmingStatus || !startDate) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    onAddProject({
      title,
      type: projectType,
      filmingStatus,
      fileLinks,
      notes,
      date: startDate,
    });

    setTitle("");
    setProjectType("");
    setFilmingStatus("");
    setFileLinks("");
    setNotes("");
    setStartDate("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#0F0F0F] rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col"
          >
            <div className="relative mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 lg:p-8 flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-2 left-2 sm:top-4 sm:left-4 cursor-pointer text-gray-400 hover:text-gray-600 font-bold transition-colors z-10"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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
                <div className="text-lg sm:text-xl lg:text-[26px] bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black px-4 sm:px-6 lg:px-8 py-1 rounded-full">
                  اضــافـــة مـشــــــروع
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
              <div className="space-y-4 sm:space-y-6 lg:space-y-10">
                <div>
                  <CustomDatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="تاريخ بداية المشروع"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0B0B0B] text-white px-3 sm:px-4 py-2 rounded-full focus:outline-none text-right text-sm sm:text-base"
                    placeholder="عنوان المشروع"
                  />
                </div>

                <div>
                  <div className="relative z-10">
                    <button
                      onClick={() => setIsProjectTypeOpen(!isProjectTypeOpen)}
                      className="w-full bg-[#0B0B0B] cursor-pointer hover:bg-[#333336] transition-all duration-300 text-white px-3 sm:px-4 py-2 rounded-full focus:outline-none flex items-center justify-between text-sm sm:text-base"
                    >
                      <svg
                        className={`w-7 h-7 transition-transform ${
                          isProjectTypeOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span
                        className={`flex-1 text-center ${
                          projectType ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {projectType || "نـــــــوع الــــمـــــشــــــــروع"}
                      </span>
                      <div className="w-4"></div>
                    </button>

                    <AnimatePresence>
                      {isProjectTypeOpen && (
                        <motion.div
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0 }}
                          transition={{
                            duration: 0.25,
                            ease: "easeOut",
                          }}
                          className="absolute top-1 left-0 right-0 mt-2 bg-[#222224] rounded-3xl z-[-100] origin-top"
                        >
                          <div className="p-4">
                            <div className="flex items-center mb-4">
                              <button
                                onClick={() => setIsProjectTypeOpen(false)}
                                className="text-gray-400 hover:text-white mr-2"
                              ></button>
                            </div>
                            <div className="space-y-2">
                              <motion.button
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{
                                  delay: 0.3,
                                  duration: 0.3,
                                  ease: "easeOut",
                                }}
                                onClick={() => {
                                  handleProjectTypeChange(
                                    "فيــــــــــــــديوهــــات طـــــــويلة"
                                  );
                                  setIsProjectTypeOpen(false);
                                }}
                                className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-3 sm:px-4 py-2 sm:py-3 mt-2 sm:mt-4 rounded-lg text-center hover:bg-[#333336] transition-colors text-sm sm:text-base"
                              >
                                فيــــــــــــــديوهــــات طـــــــويلة
                              </motion.button>
                              <motion.button
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{
                                  delay: 0.4,
                                  duration: 0.3,
                                  ease: "easeOut",
                                }}
                                onClick={() => {
                                  handleProjectTypeChange(
                                    "فيــــــــــــــديوهــــات قـــــصيرة"
                                  );
                                  setIsProjectTypeOpen(false);
                                }}
                                className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-center hover:bg-[#333336] transition-colors text-sm sm:text-base"
                              >
                                فيــــــــــــــديوهــــات قـــــصيرة
                              </motion.button>
                              <motion.button
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{
                                  delay: 0.5,
                                  duration: 0.3,
                                  ease: "easeOut",
                                }}
                                onClick={() => {
                                  handleProjectTypeChange(
                                    "إعلانات / مقاطع فيديو ترويجية"
                                  );
                                  setIsProjectTypeOpen(false);
                                }}
                                className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-center hover:bg-[#333336] transition-colors text-sm sm:text-base"
                              >
                                إعلانات / مقاطع فيديو ترويجية
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={fileLinks}
                    onChange={(e) => setFileLinks(e.target.value)}
                    className="w-full bg-[#0B0B0B] text-white px-3 sm:px-4 py-2 rounded-full focus:outline-none text-right text-sm sm:text-base"
                    placeholder="روابط الملفات (الصور, الفيديوهات الخ..)"
                  />
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0B0B0B] text-white px-3 sm:px-4 py-2 rounded-2xl focus:outline-none text-right resize-none text-sm sm:text-base"
                    placeholder="الملاحـــــــظات"
                  />

                  {/* Voice Recording Section */}
                  <VoiceRecorder
                    onVoiceRecorded={handleVoiceRecorded}
                    className="mt-3"
                  />
                </div>

                <div>
                  <div className="relative z-10">
                    <button
                      onClick={() =>
                        setIsFilmingStatusOpen(!isFilmingStatusOpen)
                      }
                      className="w-full bg-[#0B0B0B] cursor-pointer hover:bg-[#333336] transition-all duration-300 text-white px-3 sm:px-4 py-2 rounded-full focus:outline-none flex items-center justify-between text-sm sm:text-base"
                    >
                      <svg
                        className={`w-7 h-7 transition-transform ${
                          isFilmingStatusOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span
                        className={`flex-1 text-center ${
                          filmingStatus ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {filmingStatus || "وضع التصوير"}
                      </span>
                      <div className="w-4"></div>
                    </button>

                    <AnimatePresence>
                      {isFilmingStatusOpen && (
                        <motion.div
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0 }}
                          transition={{
                            duration: 0.25,
                            ease: "easeOut",
                          }}
                          className="absolute top-1 left-0 right-0 mt-2 bg-[#222224] rounded-3xl z-[-100] origin-top"
                        >
                          <div className="p-4">
                            <div className="flex items-center mb-4">
                              <button
                                onClick={() => setIsFilmingStatusOpen(false)}
                                className="text-gray-400 hover:text-white mr-2"
                              ></button>
                            </div>
                            <div className="space-y-2">
                              <motion.button
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{
                                  delay: 0.3,
                                  duration: 0.3,
                                  ease: "easeOut",
                                }}
                                onClick={() => {
                                  setFilmingStatus("لم يتم الانتهاء منه");
                                  setIsFilmingStatusOpen(false);
                                }}
                                className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-3 sm:px-4 py-2 sm:py-3 mt-2 sm:mt-4 rounded-lg text-center hover:bg-[#333336] transition-colors text-sm sm:text-base"
                              >
                                لم يتم الانتهاء منه
                              </motion.button>
                              <motion.button
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{
                                  delay: 0.4,
                                  duration: 0.3,
                                  ease: "easeOut",
                                }}
                                onClick={() => {
                                  setFilmingStatus("تم الانتـــهاء مــنه");
                                  setIsFilmingStatusOpen(false);
                                }}
                                className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-center hover:bg-[#333336] transition-colors text-sm sm:text-base"
                              >
                                تم الانتـــهاء مــنه
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex justify-center">
                    <button
                      onClick={handleSubmit}
                      className="text-base sm:text-lg lg:text-[20px] bg-gradient-to-r cursor-pointer from-[#EAD06C] to-[#C48829] text-black px-4 sm:px-6 lg:px-8 py-1 rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-colors"
                    >
                      حفظ و ارسال
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
