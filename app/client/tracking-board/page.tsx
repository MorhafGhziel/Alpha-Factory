"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientTrackingBoardPage() {
  const [selectedTypes, setSelectedTypes] = useState<{ [key: number]: string }>(
    {}
  );
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: number]: boolean;
  }>({});

  const projectTypes = [
    "فيديوهات طويلة",
    "فيديوهات قصيرة",
    "إعلانات / مقاطع فيديو ترويجية",
  ];

  const handleTypeChange = (rowIndex: number, type: string) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [rowIndex]: type,
    }));
  };

  const toggleDropdown = (rowIndex: number) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };
  return (
    <div className="flex flex-col items-center min-h-screen w-full md:py-20 py-10">
      <div className="w-full text-center md:mb-34 mb-14">
        <h1 className="text-3xl">لوحــــــة المــــــتابــــعة</h1>
      </div>

      <div className="w-[95%] md:w-[90%]">
        <div className="bg-[#1a1a1a] rounded-[24px] overflow-hidden border border-[#3F3F3F]">
          <div className="overflow-x-auto">
            <table className="border-collapse w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#3F3F3F]">
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التـــاريخ
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    اســم المشـــــروع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الــــــــــنوع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابـــــط
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الملاحظات
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة التصوير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    وضع التحرير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    المراجعة
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابـــــط
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة التصميم
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابـــــط
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التوثيق
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    تقييم المشروع
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(15)].map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#3F3F3F] hover:bg-[#141414] transition-colors"
                  >
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(index)}
                          className="w-full bg-[#0B0B0B] cursor-pointer hover:bg-[#333336] transition-all duration-300 text-white px-4 py-2 rounded-full focus:outline-none flex items-center justify-between min-w-[200px]"
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              openDropdowns[index] ? "rotate-180" : ""
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
                            className={`flex-1 text-center text-sm ${
                              selectedTypes[index]
                                ? "text-white"
                                : "text-gray-400"
                            }`}
                          >
                            {selectedTypes[index] || "نوع المشروع"}
                          </span>
                          <div className="w-4"></div>
                        </button>

                        <AnimatePresence>
                          {openDropdowns[index] && (
                            <motion.div
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              exit={{ opacity: 0, scaleY: 0 }}
                              transition={{
                                duration: 0.25,
                                ease: "easeOut",
                              }}
                              className="absolute top-full left-0 right-0 mt-2 bg-[#222224] rounded-3xl shadow-2xl z-[9999] origin-top"
                              style={{ zIndex: 9999 }}
                            >
                              <div className="p-4">
                                <div className="space-y-2">
                                  {projectTypes.map((type, typeIndex) => (
                                    <motion.button
                                      key={typeIndex}
                                      initial={{ opacity: 0, x: -30 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 30 }}
                                      transition={{
                                        delay: 0.1 * (typeIndex + 1),
                                        duration: 0.3,
                                        ease: "easeOut",
                                      }}
                                      onClick={() => {
                                        handleTypeChange(index, type);
                                        toggleDropdown(index);
                                      }}
                                      className="w-full bg-[#0B0B0B] text-[#E9CF6B] px-4 py-3 rounded-lg text-center hover:bg-[#333336] transition-colors text-sm flex items-center justify-center cursor-pointer"
                                    >
                                      {type}
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
