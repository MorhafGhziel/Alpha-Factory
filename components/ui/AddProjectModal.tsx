"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "./VoiceRecorder";

export interface NewProjectFormData {
  title: string;
  type: string;
  fileLinks: string;
  designLinks: string;
  notes: string;
  hasThumbnail: boolean;
  hasPoster: boolean;
  ownerClientId: string;
  voiceNoteUrl?: string;
  submitType: "draft" | "production";
}

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: NewProjectFormData) => void;
}

interface GroupSeat {
  id: string;
  name: string;
  username?: string | null;
}

const PROJECT_TYPES = [
  "فيــــــــــــــديوهــــات طـــــــويلة",
  "فيــــــــــــــديوهــــات قـــــصيرة",
  "إعلانات / مقاطع فيديو ترويجية",
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="w-full bg-[#0B0B0B] border border-[#222224] rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 hover:border-[#444] focus-within:border-[#444] transition-colors">
      <span className="text-white text-sm sm:text-base text-right flex-1">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${
          checked ? "bg-[#C48829]" : "bg-[#333336]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white text-sm sm:text-base mb-2 text-right">{children}</p>
  );
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onAddProject,
}: AddProjectModalProps) {
  const [projectType, setProjectType] = useState("");
  const [isProjectTypeOpen, setIsProjectTypeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [fileLinks, setFileLinks] = useState("");
  const [designLinks, setDesignLinks] = useState("");
  const [notes, setNotes] = useState("");
  const [hasThumbnail, setHasThumbnail] = useState(false);
  const [hasPoster, setHasPoster] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState("");
  const [ownerClientId, setOwnerClientId] = useState("");
  const [isSeatOpen, setIsSeatOpen] = useState(false);
  const [seats, setSeats] = useState<GroupSeat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setProjectType("");
    setFileLinks("");
    setDesignLinks("");
    setNotes("");
    setHasThumbnail(false);
    setHasPoster(false);
    setVoiceNoteUrl("");
    setOwnerClientId("");
    setIsProjectTypeOpen(false);
    setIsSeatOpen(false);
  }, []);

  const loadSeats = useCallback(async () => {
    setLoadingSeats(true);
    try {
      const res = await fetch("/api/client/group-seats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list: GroupSeat[] = data.seats ?? [];
        setSeats(list);
        if (list.length > 0) {
          setOwnerClientId((prev) => prev || list[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load seats:", err);
    } finally {
      setLoadingSeats(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSeats();
    } else {
      resetForm();
    }
  }, [isOpen, loadSeats, resetForm]);

  const handleVoiceRecorded = (hasRecording: boolean, voiceUrl?: string) => {
    if (hasRecording && voiceUrl) {
      setVoiceNoteUrl(voiceUrl);
      setNotes((prev) => prev + (prev ? "\n" : "") + "🎤 [رسالة صوتية مسجلة]");
    } else if (hasRecording) {
      setNotes((prev) => prev + (prev ? "\n" : "") + "🎤 [رسالة صوتية مسجلة محلياً]");
    } else {
      setVoiceNoteUrl("");
      setNotes((prev) => prev.replace(/\n?🎤 \[رسالة صوتية مسجلة.*?\]/g, ""));
    }
  };

  const buildPayload = (submitType: "draft" | "production"): NewProjectFormData => ({
    title: title.trim(),
    type: projectType,
    fileLinks: fileLinks.trim(),
    designLinks: designLinks.trim(),
    notes: notes.trim(),
    hasThumbnail,
    hasPoster,
    ownerClientId: ownerClientId || seats[0]?.id || "",
    voiceNoteUrl: voiceNoteUrl || undefined,
    submitType,
  });

  const validate = () => {
    if (!title.trim()) {
      alert("يرجى إدخال عنوان المشروع");
      return false;
    }
    if (!projectType) {
      alert("يرجى تحديد نوع المشروع");
      return false;
    }
    if (!ownerClientId && seats.length > 0) {
      alert("يرجى تحديد صاحب المشروع");
      return false;
    }
    return true;
  };

  const handleSubmit = (submitType: "draft" | "production") => {
    if (!validate()) return;
    onAddProject(buildPayload(submitType));
  };

  const selectedSeat = seats.find((s) => s.id === ownerClientId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-[#0F0F0F] rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col border border-[#222224]"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <motion.div className="relative flex justify-between items-center flex-shrink-0 p-4 sm:p-6 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 text-gray-400 hover:text-white transition-colors z-10"
                aria-label="إغلاق"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex justify-end">
                <div className="text-base sm:text-lg lg:text-xl bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black px-5 sm:px-8 py-1 rounded-full font-medium">
                  مشروع جديد
                </div>
              </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-5">
              {/* Title */}
              <div>
                <FieldLabel>عنوان المشروع</FieldLabel>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#222224] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#444] text-right text-sm sm:text-base placeholder:text-gray-500"
                  placeholder="ادخل عنوان المشروع"
                />
              </div>

              {/* Project type */}
              <div>
                <FieldLabel>نوع المشروع</FieldLabel>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectTypeOpen(!isProjectTypeOpen);
                      setIsSeatOpen(false);
                    }}
                    className="w-full bg-[#0B0B0B] border border-[#222224] text-white px-4 py-2.5 rounded-xl focus:outline-none flex items-center  text-sm sm:text-base hover:border-[#444] transition-colors"
                  >
                  
                    <span className={`${projectType ? "text-white" : "text-gray-500"} text-right`}>
                      <span className="text-right">
                        {projectType || "حدد نوع المشروع"}
                      </span>
                    </span>
                    {/* <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isProjectTypeOpen ? "rotate-360" : ""} rotate-180`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg> */}
                  </button>
                  <AnimatePresence>
                    {isProjectTypeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#222224] rounded-xl z-20 overflow-hidden"
                      >
                        {PROJECT_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setProjectType(type);
                              setIsProjectTypeOpen(false);
                            }}
                            className="w-full text-right px-4 py-3 text-[#E9CF6B] hover:bg-[#222224] transition-colors text-sm sm:text-base"
                          >
                            {type}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Project links */}
              <motion.div>
                <FieldLabel>روابط المشروع</FieldLabel>
                <input
                  type="text"
                  value={fileLinks}
                  onChange={(e) => setFileLinks(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#222224] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#444] text-right text-sm sm:text-base placeholder:text-gray-500"
                  placeholder="أدخل روابط المشروع (Google Drive, Dropbox, WeTransfer ...)"
                />
              </motion.div>

              {/* Toggles */}
              <Toggle
                label="الصورة المصغرة"
                checked={hasThumbnail}
                onChange={setHasThumbnail}
              />
              <Toggle
                label="ملصق دعائي «بوستر»"
                checked={hasPoster}
                onChange={setHasPoster}
              />

              {/* Design links */}
              <div>
                <FieldLabel>روابط مشروع التصميم</FieldLabel>
                <input
                  type="text"
                  value={designLinks}
                  onChange={(e) => setDesignLinks(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#222224] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#444] text-right text-sm sm:text-base placeholder:text-gray-500"
                  placeholder="أدخل روابط المشروع (Google Drive, Dropbox, WeTransfer ...)"
                />
              </div>

              {/* Notes */}
              <div>
                <FieldLabel>الملاحظات</FieldLabel>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0B0B0B] border border-[#222224] text-white px-4 py-2.5 pl-12 rounded-xl focus:outline-none focus:border-[#444] text-right resize-none text-sm sm:text-base placeholder:text-gray-500"
                    placeholder="أضف أي ملاحظات أو تعليمات إضافية تخص المشروع..."
                  />
                  <div className="absolute left-3 top-3">
                    <VoiceRecorder
                      onVoiceRecorded={handleVoiceRecorded}
                      className="scale-90 origin-bottom-left"
                    />
                  </div>
                </div>
              </div>

              {/* Seat selection */}
              <div>
                <FieldLabel>تحديد المقعد</FieldLabel>
                <motion.div className="relative">
                  <button
                    type="button"
                    disabled={loadingSeats}
                    onClick={() => {
                      setIsSeatOpen(!isSeatOpen);
                      setIsProjectTypeOpen(false);
                    }}
                    className="w-full bg-[#0B0B0B] border border-[#222224] text-white px-4 py-2.5 rounded-xl focus:outline-none flex items-center text-sm sm:text-base hover:border-[#444] transition-colors disabled:opacity-50"
                  >
                    {/* <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isSeatOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg> */}
                    <span className={selectedSeat ? "text-white" : "text-gray-500"}>
                      {loadingSeats
                        ? "جاري التحميل..."
                        : selectedSeat?.name ||
                          "قم بتحديد من هو صاحب المشروع من المقاعد المضافة"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isSeatOpen && seats.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#222224] rounded-xl z-20 overflow-hidden max-h-48 overflow-y-auto"
                      >
                        {seats.map((seat) => (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => {
                              setOwnerClientId(seat.id);
                              setIsSeatOpen(false);
                            }}
                            className={`w-full text-right px-4 py-3 hover:bg-[#222224] transition-colors text-sm sm:text-base ${
                              ownerClientId === seat.id ? "text-[#E9CF6B]" : "text-white"
                            }`}
                          >
                            {seat.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Actions */}
              <div className="flex justify-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  className="px-6 py-2 hover:cursor-pointer rounded-full bg-[#222224] text-white text-sm sm:text-base hover:bg-[#333336] transition-colors"
                >
                  مسودة
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit("production")}
                  className="px-6 py-2  hover:cursor-pointer rounded-full bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black text-sm sm:text-base font-medium hover:opacity-90 transition-opacity"
                >
                  بدء الإنتاج
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
