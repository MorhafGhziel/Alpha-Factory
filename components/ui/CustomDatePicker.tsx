"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "اختر التاريخ",
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(date.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const dayNames = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative group">
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ""}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#0B0B0B] text-white px-3 sm:px-4 py-2 pr-12 rounded-full focus:outline-none text-right text-sm sm:text-base cursor-pointer"
          style={{ paddingRight: selectedDate ? "3rem" : "2.5rem" }}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-300 group-hover:scale-110 group-hover:brightness-110">
          <Image
            src="/icons/calendar.svg"
            alt="Calendar"
            width={20}
            height={20}
            className="transition-all duration-300"
          />
        </div>
        {!selectedDate && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-[#858585] text-sm sm:text-base pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-[#3F3F3F] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-[#0F0F0F] px-4 py-3 border-b border-[#3F3F3F]">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <h3 className="text-[#EAD06C] font-semibold text-lg">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </h3>

                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-gray-400 text-xs font-medium py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day ? (
                      <button
                        onClick={() => handleDateSelect(day)}
                        className={`w-full h-full rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAD06C]/20 ${
                          isSelected(day)
                            ? "bg-[#EAD06C] text-black"
                            : isToday(day)
                            ? "bg-[#EAD06C]/30 text-[#EAD06C]"
                            : "text-white hover:text-[#EAD06C]"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0F0F0F] px-4 py-3 border-t border-[#3F3F3F] flex justify-between">
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today);
                  handleDateSelect(today);
                }}
                className="px-3 py-1 text-sm text-[#EAD06C] hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
              >
                اليوم
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-400 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
