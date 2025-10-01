"use client";

import { useState, useEffect } from "react";
import SummaryCard from "@/components/ui/SummaryCard";
import AddProjectModal from "@/components/ui/AddProjectModal";
import RequestImprovementModal from "@/components/ui/RequestImprovementModal";
import { Project } from "../../../types";

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export default function ClientDashboardPage() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // Color helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "تم الانتهاء منه":
      case "تمت المراجعة":
        return "bg-[#5dc239] text-white";
      case "قيد التنفيذ":
        return "bg-[#db8351] text-white";
      case "في الانتظار":
        return "bg-[#db8351] text-white";
      case "لم يبدأ":
        return "bg-[#262626] text-white";
      case "غير مطلوب":
        return "bg-[#6b7280] text-white";
      default:
        return "bg-[#ef3c54] text-white";
    }
  };

  const getFilmingStatusColor = (status: string) => {
    switch (status) {
      case "تم الانتـــهاء مــنه":
        return "bg-[#5dc239] text-white";
      case "لم يتم الانتهاء منه":
        return "bg-[#ef3c54] text-white";
      case "غير مطلوب":
        return "bg-[#6b7280] text-white";
      default:
        return "bg-[#ef3c54] text-white";
    }
  };

  // Get appropriate status text for enhancement projects
  const getEnhancementStatusText = (project: Project, mode: 'edit' | 'design') => {
    // Check for design enhancement
    const isDesignEnhancement = project.type && (
      project.type.includes("تحسين التصميم") || 
      (project.type.includes("تحسين") && project.type.includes("التصميم"))
    );

    // Check for production enhancement
    const isProductionEnhancement = project.type && (
      project.type.includes("تحسين الإنتاج") || 
      (project.type.includes("تحسين") && project.type.includes("الإنتاج"))
    );

    if (isDesignEnhancement) {
      // Design enhancement project
      if (mode === 'edit') {
        return "غير مطلوب"; // Not required for editors
      }
      return project.designMode || "لم يبدأ";
    } else if (isProductionEnhancement) {
      // Production enhancement project
      if (mode === 'design') {
        return "غير مطلوب"; // Not required for designers
      }
      return project.editMode || "لم يبدأ";
    }
    
    // Regular project - show normal status
    return mode === 'edit' ? (project.editMode || "لم يبدأ") : (project.designMode || "لم يبدأ");
  };
  const [isRequestImprovementModalOpen, setIsRequestImprovementModalOpen] =
    useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("جميع الحالات");
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on search term and selected filter
  const filteredProjects = projects.filter((project) => {
    // Search filter
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (selectedFilter !== "جميع الحالات") {
      switch (selectedFilter) {
        case "في الانتظار":
          matchesStatus = project.reviewMode === "في الانتظار" || 
                         project.editMode === "في الانتظار" || 
                         project.designMode === "في الانتظار";
          break;
        case "قيد التقدم":
          matchesStatus = project.reviewMode === "قيد التنفيذ" || 
                         project.editMode === "قيد التنفيذ" || 
                         project.designMode === "قيد التنفيذ";
          break;
        case "مكتمل":
          matchesStatus = project.reviewMode === "تم الانتهاء منه" || 
                         project.editMode === "تم الانتهاء منه" || 
                         project.designMode === "تم الانتهاء منه" ||
                         project.reviewMode === "تمت المراجعة";
          break;
        case "مراجعة":
          matchesStatus = project.reviewMode === "تمت المراجعة";
          break;
        default:
          matchesStatus = true;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  // Function to check if a project is verified
  const isProjectVerified = (project: Project) => {
    return project.documentation && project.documentation.trim() !== "";
  };

  // Count verified projects
  const completedVerifications = projects.filter(isProjectVerified).length;

  // Count projects in different stages
  const projectsInReview = projects.filter(
    (p) => p.reviewMode === "في الانتظار"
  ).length;
  const completedDesigns = projects.filter(
    (p) => p.designMode === "تم الانتهاء منه"
  ).length;
  const completedEdits = projects.filter(
    (p) => p.editMode === "تم الانتهاء منه"
  ).length;
  const completedFilming = projects.filter(
    (p) => p.filmingStatus === "تم الانتهاء منه"
  ).length;

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

  const handleAddProject = async (projectData: {
    title: string;
    type: string;
    filmingStatus: string;
    fileLinks: string;
    notes: string;
    date: string;
    voiceNoteUrl?: string;
  }) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Project created successfully:", data);
        // Refresh the projects list
        await fetchProjects();
        closeAddProjectModal();
      } else {
        const errorData = await response.json();
        console.error("Failed to create project:", errorData);
        alert(`فشل في إنشاء المشروع: ${errorData.error || "خطأ غير معروف"}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("حدث خطأ أثناء إنشاء المشروع");
    }
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const selectFilter = (filter: string) => {
    setSelectedFilter(filter);
    setIsFilterDropdownOpen(false);
  };

  const handleRequestImprovement = async (improvementData: {
    projectId: string;
    title: string;
    description: string;
    department: string;
    hasVoiceRecording?: boolean;
    voiceUrl?: string;
    isVerified?: boolean;
  }) => {
    try {
      // Get the original project details
      const originalProject = projects.find(p => p.id === improvementData.projectId);
      if (!originalProject) {
        alert("المشروع الأصلي غير موجود");
        return;
      }

      // Create a new project for the enhancement request
      const enhancementProjectData = {
        title: `تحسين: ${originalProject.title}`,
        type: `تحسين ${improvementData.department === 'design' ? 'التصميم' : 'الإنتاج'}`,
        filmingStatus: "تم الانتـــهاء مــنه", // Enhancement projects don't need filming
        fileLinks: originalProject.fileLinks || "", // Reference to original files
        notes: `طلب تحسين للمشروع: ${originalProject.title}\n\nوصف التحسين:\n${improvementData.description}\n\nالقسم المطلوب: ${improvementData.department === 'design' ? 'قسم التصميم' : 'قسم الإنتاج'}`,
        date: new Date().toISOString().split('T')[0],
        voiceNoteUrl: improvementData.voiceUrl || undefined,
        // Set appropriate initial statuses based on department
        editMode: improvementData.department === 'design' ? 'تم الانتهاء منه' : 'لم يبدأ',
        designMode: improvementData.department === 'design' ? 'في الانتظار' : 'تم الانتهاء منه',
        reviewMode: 'في الانتظار',
        verificationMode: 'لا شيء' // Both types start unverified until work is complete
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enhancementProjectData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Enhancement request created successfully:", data);
        // Refresh the projects list
        await fetchProjects();
        closeRequestImprovementModal();
        alert("تم إنشاء طلب التحسين بنجاح!");
      } else {
        const errorData = await response.json();
        console.error("Failed to create enhancement request:", errorData);
        alert(`فشل في إنشاء طلب التحسين: ${errorData.error || "خطأ غير معروف"}`);
      }
    } catch (error) {
      console.error("Error creating enhancement request:", error);
      alert("حدث خطأ أثناء إنشاء طلب التحسين");
    }
  };

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="flex-1"></div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <button
              onClick={openRequestImprovementModal}
              className="group relative cursor-pointer text-sm sm:text-base lg:text-lg font-bold bg-[#0F0F0F] text-white px-6 sm:px-12 lg:px-16 py-2.5 sm:py-2 rounded-2xl border border-[#333336] hover:bg-[#1a1a1a] hover:border-[#555555] hover:shadow-lg hover:shadow-black/50 transition-all duration-300 w-full sm:w-auto transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">طلــــب تحــــسيــــن</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </button>
            <button
              onClick={openAddProjectModal}
              className="group relative cursor-pointer text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black px-6 sm:px-12 lg:px-16 py-2.5 sm:py-2 rounded-2xl hover:from-[#F5D76E] hover:to-[#D4A02A] hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 w-full sm:w-auto transform hover:scale-105 active:scale-95"
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
            value={completedVerifications}
          />
          <SummaryCard
            icon="/icons/Eye.svg"
            iconAlt="Eye"
            title="بانتظار المراجعة"
            value={projectsInReview}
          />
          <SummaryCard
            icon="/icons/PaintPalette.svg"
            iconAlt="Palette"
            title="التصاميم المكتملة"
            value={completedDesigns}
          />
          <SummaryCard
            icon="/icons/VideoTrimming.svg"
            iconAlt="Scissors"
            title="المشاريع المحررة"
            value={completedEdits}
          />
          <SummaryCard
            icon="/icons/Documentary.svg"
            iconAlt="Camera"
            title="المشاريع المصورة"
            value={completedFilming}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {isLoading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 text-base sm:text-lg mb-4">
              جاري تحميل المشاريع...
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 text-base sm:text-lg mb-4">
              لا توجد مشاريع بعد
            </div>
            <div className="text-gray-500 text-sm sm:text-base">
              اضغط على &quot;مشروع جديد&quot; لإضافة مشروعك الأول
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 text-base sm:text-lg mb-4">
              لم يتم العثور على مشاريع مطابقة
            </div>
            <div className="text-gray-500 text-sm sm:text-base">
              جرب تغيير مصطلح البحث أو الفلتر
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
            dir="rtl"
          >
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-gradient-to-br from-[#0F0F0F] to-[#1a1a1a] p-6 rounded-2xl w-full border border-[#2a2a2a] hover:border-[#EAD06C]/30 hover:shadow-2xl hover:shadow-[#EAD06C]/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Header with title and type */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg sm:text-xl text-right break-words leading-tight group-hover:text-[#EAD06C] transition-colors duration-300">
                        {project.title}
                      </h3>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#EAD06C]/20 to-[#C48829]/20 text-[#EAD06C] border border-[#EAD06C]/30">
                        {project.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {project.startDate
                        ? formatDate(project.startDate)
                        : project.date}
                    </span>
                  </div>
                </div>

                {/* Status Grid */}
                <div className="space-y-4 mb-6">
                  {/* Filming Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EAD06C]"></div>
                      <span className="text-gray-300 text-sm font-medium">
                        التصوير
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getFilmingStatusColor(
                        project.filmingStatus
                      )} shadow-lg`}
                    >
                      {project.filmingStatus}
                    </span>
                  </div>

                  {/* Edit Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EAD06C]"></div>
                      <span className="text-gray-300 text-sm font-medium">
                        التحرير
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                        getEnhancementStatusText(project, 'edit')
                      )} shadow-lg`}
                    >
                      {getEnhancementStatusText(project, 'edit')}
                    </span>
                  </div>

                  {/* Design Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EAD06C]"></div>
                      <span className="text-gray-300 text-sm font-medium">
                        التصميم
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                        getEnhancementStatusText(project, 'design')
                      )} shadow-lg`}
                    >
                      {getEnhancementStatusText(project, 'design')}
                    </span>
                  </div>

                  {/* Review Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EAD06C]"></div>
                      <span className="text-gray-300 text-sm font-medium">
                        المراجعة
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                        project.reviewMode || "في الانتظار"
                      )} shadow-lg`}
                    >
                      {project.reviewMode || "في الانتظار"}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                {(project.fileLinks || project.notes) && (
                  <div className="space-y-3 pt-4 border-t border-[#2a2a2a]">
                    {project.fileLinks && (
                      <div>
                        <span className="text-gray-400 text-xs block mb-1">
                          الملفات
                        </span>
                        <div className="text-white text-xs break-all leading-relaxed truncate">
                          {project.fileLinks.length > 50
                            ? `${project.fileLinks.substring(0, 50)}...`
                            : project.fileLinks}
                        </div>
                      </div>
                    )}

                    {project.notes && (
                      <div>
                        <span className="text-gray-400 text-xs block mb-1">
                          ملاحظة
                        </span>
                        <div className="text-white text-xs break-words leading-relaxed truncate">
                          {project.notes.length > 50
                            ? `${project.notes.substring(0, 50)}...`
                            : project.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#EAD06C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
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
        projects={projects}
      />
    </div>
  );
}
