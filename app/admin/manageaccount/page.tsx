"use client";

import { useState } from "react";
import { useTeam } from "../../../utils";
import { motion, AnimatePresence } from "framer-motion";
import { TeamGroup } from "../../../types";

export default function ManageAccountPage() {
  const { teams, deleteTeam } = useTeam();
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    teamId: string;
    teamName: string;
  } | null>(null);

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    setDeleteConfirm({ show: true, teamId, teamName });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteTeam(deleteConfirm.teamId);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen md:py-20 py-10">
      {/* Header */}
      <motion.div
        className="bg-[#0f0f0f] rounded-3xl px-10 py-4 md:mb-34 mb-14 inline-block mx-auto"
        initial={{ y: -50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6,
        }}
      >
        <h1 className="text-white text-2xl font-semibold text-center">
          ادارة الحسابات
        </h1>
      </motion.div>

      {/* Teams Container */}
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2,
          duration: 0.6,
        }}
      >
        {teams.length === 0 ? (
          <motion.div
            className="text-center text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            لا توجد مجموعات بعد. قم بإنشاء مجموعة جديدة من صفحة إضافة الحساب.
          </motion.div>
        ) : (
          <div className="space-y-6">
            {teams.map((team: TeamGroup, index: number) => (
              <motion.div
                key={team.id}
                className="bg-[#0f0f0f] rounded-3xl overflow-hidden"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.3 + index * 0.1,
                  duration: 0.6,
                }}
              >
                {/* Team Header - Always Visible */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleTeam(team.id)}
                      className="flex cursor-pointer items-center space-x-3 text-[#E9CF6B] text-lg font-semibold hover:text-white transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          expandedTeams.has(team.id) ? "" : "rotate-180"
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
                      <span> {team.name}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors text-sm"
                    >
                      حذف الحسابات
                    </button>
                  </div>
                </div>

                {/* Team Details - Collapsible */}
                <AnimatePresence>
                  {expandedTeams.has(team.id) && (
                    <motion.div
                      className="px-6 pb-6 overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.3, ease: "easeInOut" },
                          opacity: { duration: 0.2, ease: "easeInOut" },
                        },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.4,
                      }}
                    >
                      <motion.div
                        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          y: -10,
                          transition: { duration: 0.2, ease: "easeInOut" },
                        }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        {/* Client Section */}
                        <motion.div
                          className="space-y-3"
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                            عميل
                          </h3>
                          <div className="space-y-2">
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Name:{" "}
                                <span className="text-gray-200">
                                  {team.client.name}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Number:{" "}
                                <span className="text-gray-200">
                                  {team.client.number}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.5, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Username:{" "}
                                <span className="text-gray-200">
                                  {team.client.username}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Password:{" "}
                                <span className="text-gray-200">
                                  {team.client.password}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Producer Section */}
                        <motion.div
                          className="space-y-3"
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                        >
                          <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                            ممنتج
                          </h3>
                          <div className="space-y-2">
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Name:{" "}
                                <span className="text-gray-200">
                                  {team.producer.name}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.5, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Token:{" "}
                                <span className="text-gray-200">
                                  {team.producer.token}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                CHAT_ID:{" "}
                                <span className="text-gray-200">
                                  {team.producer.chatId}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.7, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Username:{" "}
                                <span className="text-gray-200">
                                  {team.producer.username}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.8, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Password:{" "}
                                <span className="text-gray-200">
                                  {team.producer.password}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Designer Section */}
                        <motion.div
                          className="space-y-3"
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                        >
                          <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                            مصمم
                          </h3>
                          <div className="space-y-2">
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.5, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Name:{" "}
                                <span className="text-gray-200">
                                  {team.designer.name}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Token:{" "}
                                <span className="text-gray-200">
                                  {team.designer.token}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.7, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                CHAT_ID:{" "}
                                <span className="text-gray-200">
                                  {team.designer.chatId}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.8, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Username:{" "}
                                <span className="text-gray-200">
                                  {team.designer.username}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.9, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Password:{" "}
                                <span className="text-gray-200">
                                  {team.designer.password}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Reviewer Section */}
                        <motion.div
                          className="space-y-3"
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                        >
                          <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                            مُراجع
                          </h3>
                          <div className="space-y-2">
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Name:{" "}
                                <span className="text-gray-200">
                                  {team.reviewer.name}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.7, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Token:{" "}
                                <span className="text-gray-200">
                                  {team.reviewer.token}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.8, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                CHAT_ID:{" "}
                                <span className="text-gray-200">
                                  {team.reviewer.chatId}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.9, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Username:{" "}
                                <span className="text-gray-200">
                                  {team.reviewer.username}
                                </span>
                              </div>
                            </motion.div>
                            <motion.div
                              className="bg-[#0B0B0B] rounded-lg px-3 py-2"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 1.0, duration: 0.2 }}
                            >
                              <div className="text-gray-400 text-sm">
                                Password:{" "}
                                <span className="text-gray-200">
                                  {team.reviewer.password}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 backdrop-blur-2xl bg-black/20 bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-[#0f0f0f] rounded-3xl p-8 text-center"
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
            >
              <h3 className="text-white text-xl font-semibold mb-4">
                تأكيد الحذف
              </h3>
              <p className="text-gray-300 mb-6">
                هذا الاجراء غير قابل للتراجع , هل أنت متأكد من حذف المجموعة{" "}
                <br />
                {deleteConfirm.teamName}&quot; ؟&quot;
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDelete}
                  className="bg-[#E9CF6B] cursor-pointer text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  تأكيد الحذف
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-700 cursor-pointer text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
