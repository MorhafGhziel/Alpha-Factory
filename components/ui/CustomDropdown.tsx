"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface CustomDropdownProps {
  options: string[];
  placeholder: string;
  selectedValue: string;
  onSelect: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  optionClassName?: string;
}

export default function CustomDropdown({
  options,
  placeholder,
  selectedValue,
  onSelect,
  className = "",
  buttonClassName = "",
  optionClassName = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`w-full bg-[#0B0B0B] cursor-pointer hover:bg-[#333336] transition-all duration-300 text-white px-4 py-2 rounded-full focus:outline-none flex items-center justify-between min-w-[200px] ${buttonClassName}`}
      >
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
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
            selectedValue ? "text-white" : "text-gray-400"
          }`}
        >
          {selectedValue || placeholder}
        </span>
        <div className="w-4"></div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#222224] rounded-3xl shadow-2xl origin-top"
            style={{
              zIndex: 99999,
              position: "fixed",
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              minWidth: "200px",
            }}
          >
            <div className="p-4">
              <div className="space-y-2">
                {options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{
                      delay: 0.1 * (index + 1),
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                    onClick={() => handleSelect(option)}
                    className={`w-full bg-[#0B0B0B] text-[#E9CF6B] px-4 py-3 rounded-lg text-center hover:bg-[#333336] transition-colors text-sm flex items-center justify-center cursor-pointer ${
                      selectedValue === option ? "ring-2 ring-blue-500" : ""
                    } ${optionClassName}`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
