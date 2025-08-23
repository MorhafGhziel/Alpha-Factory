"use client";

import { useState } from "react";
import { useTeam } from "../layout";

export default function ManageAccountPage() {
  const { teams, deleteTeam } = useTeam();
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المجموعة؟")) {
      deleteTeam(teamId);
    }
  };

  return (
    <div className="min-h-screen md:py-20 py-10">
      {/* Header */}
      <div className="bg-[#0f0f0f] rounded-3xl px-10 py-4 md:mb-34 mb-14 inline-block mx-auto">
        <h1 className="text-white text-2xl font-semibold text-center">
          ادارة الحسابات
        </h1>
      </div>

      {/* Teams Container */}
      <div className="max-w-6xl mx-auto px-4">
        {teams.length === 0 ? (
          <div className="text-center text-gray-400 text-lg">
            لا توجد مجموعات بعد. قم بإنشاء مجموعة جديدة من صفحة إضافة الحساب.
          </div>
        ) : (
          <div className="space-y-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-[#0f0f0f] rounded-3xl overflow-hidden"
              >
                {/* Team Header - Always Visible */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleTeam(team.id)}
                      className="flex items-center space-x-3 text-[#E9CF6B] text-lg font-semibold hover:text-white transition-colors"
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
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                    >
                      حذف الحسابات
                    </button>
                  </div>
                </div>

                {/* Team Details - Collapsible */}
                {expandedTeams.has(team.id) && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Client Section */}
                      <div className="space-y-3">
                        <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                          عميل
                        </h3>
                        <div className="space-y-2">
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Name:{" "}
                              <span className="text-gray-200">
                                {team.client.name}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Number:{" "}
                              <span className="text-gray-200">
                                {team.client.number}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Username:{" "}
                              <span className="text-gray-200">
                                {team.client.username}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Password:{" "}
                              <span className="text-gray-200">
                                {team.client.password}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Producer Section */}
                      <div className="space-y-3">
                        <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                          ممنتج
                        </h3>
                        <div className="space-y-2">
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Name:{" "}
                              <span className="text-gray-200">
                                {team.producer.name}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Token:{" "}
                              <span className="text-gray-200">
                                {team.producer.token}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              CHAT_ID:{" "}
                              <span className="text-gray-200">
                                {team.producer.chatId}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Username:{" "}
                              <span className="text-gray-200">
                                {team.producer.username}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Password:{" "}
                              <span className="text-gray-200">
                                {team.producer.password}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Designer Section */}
                      <div className="space-y-3">
                        <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                          مصمم
                        </h3>
                        <div className="space-y-2">
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Name:{" "}
                              <span className="text-gray-200">
                                {team.designer.name}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Token:{" "}
                              <span className="text-gray-200">
                                {team.designer.token}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              CHAT_ID:{" "}
                              <span className="text-gray-200">
                                {team.designer.chatId}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Username:{" "}
                              <span className="text-gray-200">
                                {team.designer.username}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Password:{" "}
                              <span className="text-gray-200">
                                {team.designer.password}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reviewer Section */}
                      <div className="space-y-3">
                        <h3 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                          مُراجع
                        </h3>
                        <div className="space-y-2">
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Name:{" "}
                              <span className="text-gray-200">
                                {team.reviewer.name}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Token:{" "}
                              <span className="text-gray-200">
                                {team.reviewer.token}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              CHAT_ID:{" "}
                              <span className="text-gray-200">
                                {team.reviewer.chatId}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Username:{" "}
                              <span className="text-gray-200">
                                {team.reviewer.username}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[#0B0B0B] rounded-lg px-3 py-2">
                            <div className="text-gray-400 text-sm">
                              Password:{" "}
                              <span className="text-gray-200">
                                {team.reviewer.password}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
