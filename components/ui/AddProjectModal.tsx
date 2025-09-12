"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [endDate, setEndDate] = useState<string>("");

  const calculateProjectDuration = (videoType: string): number => {
    switch (videoType) {
      case "فيــــــــــــــديوهــــات طـــــــويلة":
        return 365;
      case "فيــــــــــــــديوهــــات قـــــصيرة":
        return 90;
      case "إعلانات / مقاطع فيديو ترويجية":
        return 30;
      default:
        return 90;
    }
  };

  const calculateProjectDates = (
    videoType: string
  ): { startDate: string; endDate: string } => {
    if (!videoType) return { startDate: "", endDate: "" };

    const today = new Date();
    const start = new Date(today);
    const duration = calculateProjectDuration(videoType);
    const end = new Date(today);
    end.setDate(today.getDate() + duration);

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const handleProjectTypeChange = (type: string) => {
    setProjectType(type);
    const dates = calculateProjectDates(type);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  const handleSubmit = () => {
    if (!title || !projectType || !filmingStatus || !startDate) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const dateRange = `${startDate} - ${endDate}`;

    onAddProject({
      title,
      type: projectType,
      filmingStatus,
      fileLinks,
      notes,
      date: dateRange,
    });

    setTitle("");
    setProjectType("");
    setFilmingStatus("");
    setFileLinks("");
    setNotes("");
    setStartDate("");
    setEndDate("");
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
                <div className="text-[26px] bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black px-8 py-1 rounded-full">
                  اضــافـــة مـشــــــروع
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="text-sm text-gray-500 text-right">
                  اختر نوع الفيديو لتغيير المدة تلقائياً
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 text-right">
                      تاريخ النهاية
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      readOnly
                      className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-full focus:outline-none text-right cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 text-right">
                      تاريخ البداية
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      readOnly
                      className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-full focus:outline-none text-right cursor-not-allowed opacity-70"
                    />
                  </div>
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
                <div className="relative z-10">
                  <button
                    onClick={() => setIsProjectTypeOpen(!isProjectTypeOpen)}
                    className="w-full bg-[#0B0B0B] cursor-pointer hover:bg-[#333336] transition-all duration-300 text-white px-4 py-2 rounded-full focus:outline-none flex items-center justify-between"
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
                              className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-4 py-3 mt-4 rounded-lg text-center hover:bg-[#333336] transition-colors"
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
                              className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-4 py-3 rounded-lg text-center hover:bg-[#333336] transition-colors"
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
                              className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-4 py-3 rounded-lg text-center hover:bg-[#333336] transition-colors"
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
                  className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-full focus:outline-none text-right"
                  placeholder="روابط الملفات (الصور, الفيديوهات الخ..)"
                />
              </div>

              <div>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-2xl focus:outline-none text-right resize-none"
                  placeholder="الملاحـــــــظات"
                />
              </div>

              <div>
                <div className="relative z-10">
                  <button
                    onClick={() => setIsFilmingStatusOpen(!isFilmingStatusOpen)}
                    className="w-full bg-[#0B0B0B] cursor-pointer hover:bg-[#333336] transition-all duration-300 text-white px-4 py-2 rounded-full focus:outline-none flex items-center justify-between"
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
                              className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-4 py-3 mt-4 rounded-lg text-center hover:bg-[#333336] transition-colors"
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
                              className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-4 py-3 rounded-lg text-center hover:bg-[#333336] transition-colors"
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
                    className="text-[20px] bg-gradient-to-r cursor-pointer from-[#EAD06C] to-[#C48829] text-black px-8 py-1 rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-colors"
                  >
                    حفظ و ارسال
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
