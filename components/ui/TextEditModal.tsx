"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "./VoiceRecorder";

interface TextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  title: string;
  initialContent: string;
  placeholder: string;
  isTextarea?: boolean;
  rows?: number;
  maxLength?: number;
  showVoiceRecorder?: boolean;
  readOnly?: boolean;
}

export default function TextEditModal({
  isOpen,
  onClose,
  onSave,
  title,
  initialContent,
  placeholder,
  isTextarea = false,
  rows = 4,
  maxLength = 1000,
  showVoiceRecorder = false,
  readOnly = false,
}: TextEditModalProps) {
  const [content, setContent] = useState(initialContent);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  const handleClose = () => {
    setContent(initialContent); // Reset to original content
    onClose();
  };

  const handleVoiceRecorded = (hasRecording: boolean) => {
    if (hasRecording) {
      setContent(
        (prev) => prev + (prev ? "\n" : "") + "🎤 [رسالة صوتية مسجلة]"
      );
    } else {
      setContent((prev) => prev.replace(/\n?🎤 \[رسالة صوتية مسجلة\]/g, ""));
    }
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
                onClick={handleClose}
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
                  {title}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
              <div className="space-y-4 sm:space-y-6 lg:space-y-10">
                <div>
                  {isTextarea ? (
                    <textarea
                      rows={rows}
                      value={content}
                      onChange={(e) => !readOnly && setContent(e.target.value)}
                      className={`w-full bg-[#0B0B0B] text-white px-3 sm:px-4 py-2 rounded-2xl focus:outline-none text-right resize-none text-sm sm:text-base border border-[#3F3F3F] ${!readOnly ? 'focus:border-[#EAD06C]' : ''} ${readOnly ? 'cursor-default' : ''}`}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      readOnly={readOnly}
                    />
                  ) : (
                    <input
                      type="text"
                      value={content}
                      onChange={(e) => !readOnly && setContent(e.target.value)}
                      className={`w-full bg-[#0B0B0B] text-white px-3 sm:px-4 py-2 rounded-full focus:outline-none text-right text-sm sm:text-base border border-[#3F3F3F] ${!readOnly ? 'focus:border-[#EAD06C]' : ''} ${readOnly ? 'cursor-default' : ''}`}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      readOnly={readOnly}
                    />
                  )}
                  {maxLength && (
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {content.length}/{maxLength}
                    </div>
                  )}

                  {/* Voice Recording Section - Only show when enabled and not read-only */}
                  {showVoiceRecorder && !readOnly && (
                    <VoiceRecorder
                      onVoiceRecorded={handleVoiceRecorded}
                      className="mt-3"
                    />
                  )}
                </div>

                <div className="pt-4">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleClose}
                      className="text-base sm:text-lg lg:text-[20px] bg-[#2A2A2A] text-white px-4 sm:px-6 lg:px-8 py-1 rounded-full hover:bg-[#3F3F3F] transition-colors border border-[#3F3F3F]"
                    >
                      {readOnly ? 'إغلاق' : 'إلغاء'}
                    </button>
                    {!readOnly && (
                      <button
                        onClick={handleSave}
                        className="text-base sm:text-lg lg:text-[20px] bg-gradient-to-r cursor-pointer from-[#EAD06C] to-[#C48829] text-black px-4 sm:px-6 lg:px-8 py-1 rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-colors"
                      >
                        حفظ
                      </button>
                    )}
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
