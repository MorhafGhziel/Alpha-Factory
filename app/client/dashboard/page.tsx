"use client";

import { useState } from "react";
import SummaryCard from "../../../components/ui/SummaryCard";
import AddProjectModal from "../../../components/ui/AddProjectModal";

interface Project {
  id: string;
  title: string;
  type: string;
  filmingStatus: string;
  fileLinks: string;
  notes: string;
  date: string;
}

export default function ClientDashboardPage() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("جميع الحالات");

  const openAddProjectModal = () => {
    setIsAddProjectModalOpen(true);
  };

  const closeAddProjectModal = () => {
    setIsAddProjectModalOpen(false);
  };

  const handleAddProject = (projectData: Omit<Project, "id">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
    };
    setProjects([...projects, newProject]);
    closeAddProjectModal();
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const selectFilter = (filter: string) => {
    setSelectedFilter(filter);
    setIsFilterDropdownOpen(false);
  };

  return (
    <div className="min-h-screen text-white px-8 py-16">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1"></div>
          <div className="flex gap-4">
            <button className="cursor-pointer text-[20px] bg-[#0F0F0F] text-white px-24 py-2 rounded-xl hover:bg-[#333336] transition-colors">
              طلــــب تحــــسيــــن
            </button>
            <button
              onClick={openAddProjectModal}
              className="cursor-pointer text-[20px] bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black px-24 py-2 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-colors"
            >
              مشــــــــــــــــروع جـــــــديد
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6 w-full">
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

      <div className="flex gap-5 items-center mb-8 bg-[#101010] p-4 rounded-2xl">
        <div className="relative">
          <button
            onClick={toggleFilterDropdown}
            className="bg-[#0B0B0B] text-white cursor-pointer px-4 py-2 rounded-3xl flex items-center gap-2 hover:bg-[#333336] transition-colors whitespace-nowrap"
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
            {selectedFilter}
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-[#0B0B0B] rounded-xl  z-10 min-w-[200px]">
              <div className="p-2">
                <div
                  onClick={() => selectFilter("جميع الحالات")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                    selectedFilter === "جميع الحالات"
                      ? "bg-yellow-500 text-black"
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
                  className={`px-3 py-2 rounded-lg cursor-pointer ${
                    selectedFilter === "في الانتظار"
                      ? "bg-yellow-500 text-black"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  في الانتظار
                </div>
                <div
                  onClick={() => selectFilter("قيد التقدم")}
                  className={`px-3 py-2 rounded-lg cursor-pointer ${
                    selectedFilter === "قيد التقدم"
                      ? "bg-yellow-500 text-black"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  قيد التقدم
                </div>
                <div
                  onClick={() => selectFilter("مكتمل")}
                  className={`px-3 py-2 rounded-lg cursor-pointer ${
                    selectedFilter === "مكتمل"
                      ? "bg-yellow-500 text-black"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  مكتمل
                </div>
                <div
                  onClick={() => selectFilter("مراجعة")}
                  className={`px-3 py-2 rounded-lg cursor-pointer ${
                    selectedFilter === "مراجعة"
                      ? "bg-yellow-500 text-black"
                      : "text-white hover:bg-[#333336]"
                  }`}
                >
                  مراجعة
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-[#0B0B0B] px-4 py-2 rounded-3xl flex-1">
          <input
            type="text"
            placeholder="...البحث في المشاريع"
            className="bg-transparent text-white placeholder-[#747474] outline-none flex-1 text-right"
          />
          <svg
            className="w-6 h-6 text-[#747474]"
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
        <h2 className="text-[40px] font-bold text-white mb-6 text-right">
          المـــــشــاريع
        </h2>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">لا توجد مشاريع بعد</div>
            <div className="text-gray-500 text-sm">
              اضغط على &quot;مشروع جديد&quot; لإضافة مشروعك الأول
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-8" style={{ direction: "rtl" }}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#0F0F0F] p-4 rounded-lg w-80"
              >
                <div className="mb-4">
                  <div className="text-white font-semibold text-lg text-right">
                    {project.title}
                  </div>
                </div>

                <div className="space-y-3 text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">التاريخ:</span>
                    <span className="text-white">{project.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">النوع:</span>
                    <span className="text-[#E9CF6B]">{project.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">حالة التصوير:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        project.filmingStatus === "تم الانتـــهاء مــنه"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {project.filmingStatus}
                    </span>
                  </div>

                  {project.fileLinks && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">الملفات:</span>
                      <span className="text-white text-sm truncate">
                        {project.fileLinks}
                      </span>
                    </div>
                  )}

                  {project.notes && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">ملاحظة:</span>
                      <span className="text-white text-sm">
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

      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none">
        <svg viewBox="0 0 128 128" className="w-full h-full">
          <path
            d="M128 128 Q 64 64 0 128"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={closeAddProjectModal}
        onAddProject={handleAddProject}
      />
    </div>
  );
}
