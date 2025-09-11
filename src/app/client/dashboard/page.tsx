"use client";

import { useState } from "react";
import SummaryCard from "@/components/ui/SummaryCard";
import AddProjectModal from "@/components/ui/AddProjectModal";
import RequestImprovementModal from "@/components/ui/RequestImprovementModal";
import { useProjects, Project } from "@/contexts/ProjectContext";

export default function ClientDashboardPage() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isRequestImprovementModalOpen, setIsRequestImprovementModalOpen] =
    useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("جميع الحالات");

  const { projects, addProject } = useProjects();

  const openAddProjectModal = () => {
    setIsAddProjectModalOpen(true);
  };

  const closeAddProjectModal = () => {
    setIsAddProjectModalOpen(false);
  };

  const openRequestImprovementModal = () => {
    setIsRequestImprovementModalOpen(true);
  };

  const closeRequestImprovementModal = () => {
    setIsRequestImprovementModalOpen(false);
  };

  const handleAddProject = (projectData: Omit<Project, "id">) => {
    addProject(projectData);
    closeAddProjectModal();
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const selectFilter = (filter: string) => {
    setSelectedFilter(filter);
    setIsFilterDropdownOpen(false);
  };

  const handleRequestImprovement = (improvementData: {
    title: string;
    description: string;
    department: string;
  }) => {
    console.log("Improvement request:", improvementData);
    // Here you can add logic to send the request to the appropriate department
    closeRequestImprovementModal();
  };

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="flex-1"></div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <button
              onClick={openRequestImprovementModal}
              className="group relative cursor-pointer text-sm sm:text-base lg:text-[20px] font-bold bg-[#0F0F0F] text-white px-8 sm:px-16 lg:px-24 py-3 sm:py-4 rounded-2xl border border-[#333336] hover:bg-[#1a1a1a] hover:border-[#555555] hover:shadow-lg hover:shadow-black/50 transition-all duration-300 w-full sm:w-auto transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">طلــــب تحــــسيــــن</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </button>
            <button
              onClick={openAddProjectModal}
              className="group relative cursor-pointer text-sm sm:text-base lg:text-[20px] font-bold bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black px-8 sm:px-16 lg:px-24 py-3 sm:py-4 rounded-2xl hover:from-[#F5D76E] hover:to-[#D4A02A] hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 w-full sm:w-auto transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">
                مشــــــــــــــــروع جـــــــديد
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 w-full">
          <SummaryCard
            icon="/icons/CheckedUserMale.svg"
            iconAlt="Person"
            title="المشاريع الموثقة"
            value={projects.length}
          />
          <SummaryCard
            icon="/icons/Eye.svg"
            iconAlt="Eye"
            title="بانتظار المراجعة"
            value={
              projects.filter((p) => p.filmingStatus === "لم يتم الانتهاء منه")
                .length
            }
          />
          <SummaryCard
            icon="/icons/PaintPalette.svg"
            iconAlt="Palette"
            title="التصاميم المكتملة"
            value={
              projects.filter((p) => p.filmingStatus === "تم الانتـــهاء مــنه")
                .length
            }
          />
          <SummaryCard
            icon="/icons/VideoTrimming.svg"
            iconAlt="Scissors"
            title="المشاريع المحررة"
            value="0"
          />
          <SummaryCard
            icon="/icons/Documentary.svg"
            iconAlt="Camera"
            title="المشاريع المصورة"
            value="0"
          />
          <SummaryCard
            icon="/icons/Video.svg"
            iconAlt="Total"
            title="إجمالي المـــشاريع"
            value={projects.length}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-center mb-6 sm:mb-8 bg-[#101010] p-3 sm:p-4 rounded-2xl">
        <div className="relative flex-shrink-0">
          <button
            onClick={toggleFilterDropdown}
            className="bg-[#0B0B0B] text-white cursor-pointer px-3 sm:px-4 py-2 rounded-3xl flex items-center gap-2 hover:bg-[#333336] transition-colors whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isFilterDropdownOpen ? "rotate-180" : ""
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
            <span className="text-sm sm:text-base">{selectedFilter}</span>
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-[#0F0F0F] rounded-xl  z-10 min-w-[200px]">
              <div className="p-2">
                <div
                  onClick={() => selectFilter("جميع الحالات")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-3xl cursor-pointer text-center justify-center ${
                    selectedFilter === "جميع الحالات"
                      ? "bg-[#0B0B0B] text-[#EAD06C]"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {selectedFilter === "جميع الحالات" && (
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
                    )}
                  </div>
                  جميع الحالات
                </div>
                <div
                  onClick={() => selectFilter("في الانتظار")}
                  className={`px-3 py-1 rounded-3xl cursor-pointer text-center justify-center ${
                    selectedFilter === "في الانتظار"
                      ? "bg-[#0B0B0B] text-[#EAD06C]"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  في الانتظار
                </div>
                <div
                  onClick={() => selectFilter("قيد التقدم")}
                  className={`px-3 py-1 rounded-3xl cursor-pointer text-center justify-center ${
                    selectedFilter === "قيد التقدم"
                      ? "bg-[#0B0B0B] text-[#EAD06C]"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  قيد التقدم
                </div>
                <div
                  onClick={() => selectFilter("مكتمل")}
                  className={`px-3 py-1 rounded-3xl cursor-pointer text-center justify-center ${
                    selectedFilter === "مكتمل"
                      ? "bg-[#0B0B0B] text-[#EAD06C]"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  مكتمل
                </div>
                <div
                  onClick={() => selectFilter("مراجعة")}
                  className={`px-3 py-1 rounded-3xl cursor-pointer text-center justify-center ${
                    selectedFilter === "مراجعة"
                      ? "bg-[#0B0B0B] text-[#EAD06C]"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  مراجعة
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-[#0B0B0B] px-3 sm:px-4 py-2 rounded-3xl flex-1 min-w-0">
          <input
            type="text"
            placeholder="...البحث في المشاريع"
            className="bg-transparent text-white placeholder-[#747474] outline-none flex-1 text-right text-sm sm:text-base min-w-0"
          />
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-[#747474] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-white mb-4 sm:mb-6 text-right">
          المـــــشــاريع
        </h2>

        {projects.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 text-base sm:text-lg mb-4">
              لا توجد مشاريع بعد
            </div>
            <div className="text-gray-500 text-sm sm:text-base">
              اضغط على &quot;مشروع جديد&quot; لإضافة مشروعك الأول
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            style={{ direction: "rtl" }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#0F0F0F] p-3 sm:p-4 rounded-lg w-full"
              >
                <div className="mb-3 sm:mb-4">
                  <div className="text-white font-semibold text-base sm:text-lg text-right break-words">
                    {project.title}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 text-right">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-300 text-sm sm:text-base">
                      التاريخ:
                    </span>
                    <span className="text-white text-sm sm:text-base">
                      {project.date}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-300 text-sm sm:text-base">
                      النوع:
                    </span>
                    <span className="text-[#E9CF6B] text-sm sm:text-base break-words">
                      {project.type}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-300 text-sm sm:text-base">
                      حالة التصوير:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm w-fit ${
                        project.filmingStatus === "تم الانتـــهاء مــنه"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {project.filmingStatus}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-300 text-sm sm:text-base">
                      حالة التحرير:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm w-fit ${
                        project.editMode === "تم الانتهاء منه"
                          ? "bg-green-500 text-white"
                          : project.editMode === "قيد التنفيذ"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {project.editMode || "لم يبدأ"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-300 text-sm sm:text-base">
                      المراجعة:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm w-fit ${
                        project.reviewMode === "تمت المراجعة"
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {project.reviewMode || "في الانتظار"}
                    </span>
                  </div>

                  {project.fileLinks && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-gray-300 text-sm sm:text-base">
                        الملفات:
                      </span>
                      <span className="text-white text-xs sm:text-sm break-all">
                        {project.fileLinks}
                      </span>
                    </div>
                  )}

                  {project.notes && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-gray-300 text-sm sm:text-base">
                        ملاحظة:
                      </span>
                      <span className="text-white text-xs sm:text-sm break-words">
                        {project.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={closeAddProjectModal}
        onAddProject={handleAddProject}
      />

      <RequestImprovementModal
        isOpen={isRequestImprovementModalOpen}
        onClose={closeRequestImprovementModal}
        onSubmit={handleRequestImprovement}
      />
    </div>
  );
}
