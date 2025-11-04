"use client";

import { useState, useEffect } from "react";
import { Project } from "../../../types";
import CustomDropdown from "../../../../components/ui/CustomDropdown";
import TextEditModal from "../../../../components/ui/TextEditModal";
import TableTooltip from "../../../../components/ui/TableTooltip";
import { authClient } from "../../../lib/auth-client";

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export default function ClientTrackingBoardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [filmingFilesModal, setFilmingFilesModal] = useState<{
    isOpen: boolean;
    projectId: string;
    currentContent: string;
  }>({
    isOpen: false,
    projectId: "",
    currentContent: "",
  });

  const [notesModal, setNotesModal] = useState<{
    isOpen: boolean;
    projectId: string;
    currentContent: string;
  }>({
    isOpen: false,
    projectId: "",
    currentContent: "",
  });

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: {
      filmingStatus?: boolean;
      rating?: boolean;
      documentation?: boolean;
      notes?: boolean;
      fileLinks?: boolean;
      verificationMode?: boolean;
    };
  }>({});

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

  // Load projects and session on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();

      // Fetch session to check user role
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    loadData();
  }, []);

  // Check if current user is a client (can edit)
  const isClient = session?.data?.user?.role === "client";

  // Update filming status
  const updateFilmingStatus = async (
    projectId: string,
    filmingStatus: string
  ) => {
    // Find the project to check if it has file links
    const project = projects.find((p) => p.id === projectId);

    // If trying to mark as done but no file links, show error
    if (filmingStatus === "تم الانتـــهاء مــنه" && !project?.fileLinks) {
      alert(
        "يجب إضافة رابط الملفات قبل تغيير حالة التصوير إلى 'تم الانتهاء منه'"
      );
      return;
    }

    // Set loading state
    setLoadingStates((prev) => ({
      ...prev,
      [projectId]: { ...prev[projectId], filmingStatus: true },
    }));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filmingStatus }),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh projects
        // Check for auto-verification after updating filming status
        await checkAndAutoVerify(projectId);
      } else {
        const errorData = await response.json();
        alert(`فشل في تحديث حالة التصوير: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating filming status:", error);
      alert("حدث خطأ أثناء تحديث حالة التصوير");
    } finally {
      // Clear loading state
      setLoadingStates((prev) => ({
        ...prev,
        [projectId]: { ...prev[projectId], filmingStatus: false },
      }));
    }
  };

  // Update file links
  const updateFileLinks = async (projectId: string, fileLinks: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileLinks }),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh projects
        // Check for auto-verification after updating file links
        await checkAndAutoVerify(projectId);
      } else {
        const errorData = await response.json();
        alert(`فشل في تحديث روابط الملفات: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating file links:", error);
      alert("حدث خطأ أثناء تحديث روابط الملفات");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تم الانتهاء منه":
      case "تمت المراجعة":
        return "text-white border";
      case "قيد التنفيذ":
        return "text-white border";
      case "في الانتظار":
        return "text-white border";
      case "لم يبدأ":
        return "text-white border";
      default:
        return "text-white border";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "تم الانتهاء منه":
      case "تمت المراجعة":
        return { backgroundColor: "#5dc239", borderColor: "#5dc239" };
      case "قيد التنفيذ":
        return { backgroundColor: "#db8351", borderColor: "#db8351" };
      case "في الانتظار":
        return { backgroundColor: "#db8351", borderColor: "#db8351" };
      case "لم يبدأ":
        return { backgroundColor: "#262626", borderColor: "#262626" };
      default:
        return { backgroundColor: "#ef3c54", borderColor: "#ef3c54" };
    }
  };

  const getFilmingStatusColor = (status: string) => {
    switch (status) {
      case "تم الانتـــهاء مــنه":
        return "text-white border";
      case "لم يتم الانتهاء منه":
        return "text-white border";
      default:
        return "text-white border";
    }
  };

  const getFilmingStatusStyle = (status: string) => {
    switch (status) {
      case "تم الانتـــهاء مــنه":
        return { backgroundColor: "#5dc239", borderColor: "#5dc239" };
      case "لم يتم الانتهاء منه":
        return { backgroundColor: "#ef3c54", borderColor: "#ef3c54" };
      default:
        return { backgroundColor: "#ef3c54", borderColor: "#ef3c54" };
    }
  };

  const getStatusText = (status: string) => {
    return status || "غير محدد";
  };

  // Get appropriate status text for enhancement projects
  const getEnhancementStatusText = (project: Project, mode: 'edit' | 'design') => {
    // Check for design enhancement (more flexible matching)
    const isDesignEnhancement = project.type && (
      project.type.includes("تحسين التصميم") || 
      project.type.includes("تحسين") && project.type.includes("التصميم")
    );

    // Check for production enhancement (more flexible matching)
    const isProductionEnhancement = project.type && (
      project.type.includes("تحسين الإنتاج") || 
      project.type.includes("تحسين") && project.type.includes("الإنتاج")
    );

    if (isDesignEnhancement) {
      // Design enhancement project
      if (mode === 'edit') {
        return "غير مطلوب"; // Not required for editors
      }
      return getStatusText(project.designMode);
    } else if (isProductionEnhancement) {
      // Production enhancement project
      if (mode === 'design') {
        return "غير مطلوب"; // Not required for designers
      }
      return getStatusText(project.editMode);
    }
    
    // Regular project - show normal status
    return mode === 'edit' ? getStatusText(project.editMode) : getStatusText(project.designMode);
  };

  // Get appropriate status style for enhancement projects
  const getEnhancementStatusStyle = (project: Project, mode: 'edit' | 'design') => {
    // Check for design enhancement (more flexible matching)
    const isDesignEnhancement = project.type && (
      project.type.includes("تحسين التصميم") || 
      project.type.includes("تحسين") && project.type.includes("التصميم")
    );

    // Check for production enhancement (more flexible matching)
    const isProductionEnhancement = project.type && (
      project.type.includes("تحسين الإنتاج") || 
      project.type.includes("تحسين") && project.type.includes("الإنتاج")
    );

    if (isDesignEnhancement) {
      // Design enhancement project
      if (mode === 'edit') {
        return { backgroundColor: "#6b7280", borderColor: "#6b7280" }; // Gray for "not required"
      }
      return getStatusStyle(project.designMode);
    } else if (isProductionEnhancement) {
      // Production enhancement project
      if (mode === 'design') {
        return { backgroundColor: "#6b7280", borderColor: "#6b7280" }; // Gray for "not required"
      }
      return getStatusStyle(project.editMode);
    }
    
    // Regular project - show normal style
    return mode === 'edit' ? getStatusStyle(project.editMode) : getStatusStyle(project.designMode);
  };

  // Check if project should show as verified based on type
  const isProjectVerified = (project: Project) => {
    // First check if it's already verified in the database
    if (project.verificationMode === "موثق" || project.verificationMode === "متميز") {
      return true;
    }

    // Check for design enhancement (more flexible matching)
    const isDesignEnhancement = project.type && (
      project.type.includes("تحسين التصميم") || 
      project.type.includes("تحسين") && project.type.includes("التصميم")
    );

    // Check for production enhancement (more flexible matching)
    const isProductionEnhancement = project.type && (
      project.type.includes("تحسين الإنتاج") || 
      project.type.includes("تحسين") && project.type.includes("الإنتاج")
    );

    if (isDesignEnhancement) {
      // Design enhancement: verified when design and review are complete
      return project.designMode === "تم الانتهاء منه" && project.reviewMode === "تمت المراجعة";
    } else if (isProductionEnhancement) {
      // Production enhancement: verified when editing and review are complete
      return project.editMode === "تم الانتهاء منه" && project.reviewMode === "تمت المراجعة";
    }
    
    // Regular project: automatically verified when all main work is complete
    const editDone = project.editMode === "تم الانتهاء منه";
    const designDone = project.designMode === "تم الانتهاء منه";
    const reviewDone = project.reviewMode === "تمت المراجعة";
    
    // Auto-verify when edit, design, and review are all complete
    return editDone && designDone && reviewDone;
  };

  // Handle filming files modal
  const openFilmingFilesModal = (projectId: string, currentContent: string) => {
    setFilmingFilesModal({
      isOpen: true,
      projectId,
      currentContent: currentContent || "",
    });
  };

  const closeFilmingFilesModal = () => {
    setFilmingFilesModal({
      isOpen: false,
      projectId: "",
      currentContent: "",
    });
  };

  const saveFilmingFiles = async (content: string) => {
    if (filmingFilesModal.projectId) {
      await updateFileLinks(filmingFilesModal.projectId, content);
    }
  };

  // Handle notes modal
  const openNotesModal = (projectId: string, currentContent: string) => {
    setNotesModal({
      isOpen: true,
      projectId,
      currentContent: currentContent || "",
    });
  };

  const closeNotesModal = () => {
    setNotesModal({
      isOpen: false,
      projectId: "",
      currentContent: "",
    });
  };

  const saveNotes = async (content: string) => {
    if (notesModal.projectId) {
      try {
        const response = await fetch(`/api/projects/${notesModal.projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: content }),
        });

        if (response.ok) {
          await fetchProjects(); // Refresh projects
          // Check for auto-verification after updating notes
          await checkAndAutoVerify(notesModal.projectId);
          closeNotesModal();
        } else {
          const errorData = await response.json();
          alert(`فشل في تحديث الملاحظات: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error updating notes:", error);
        alert("حدث خطأ أثناء تحديث الملاحظات");
      }
    }
  };

  // Handle rating update
  const updateRating = async (projectId: string, rating: string) => {
    // Set loading state
    setLoadingStates((prev) => ({
      ...prev,
      [projectId]: { ...prev[projectId], rating: true },
    }));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationMode: rating }),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh projects
      } else {
        const errorData = await response.json();
        alert(`فشل في تحديث التقييم: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      alert("حدث خطأ أثناء تحديث التقييم");
    } finally {
      // Clear loading state
      setLoadingStates((prev) => ({
        ...prev,
        [projectId]: { ...prev[projectId], rating: false },
      }));
    }
  };

  // Auto-verification logic: Check if project is complete and auto-verify
  const checkAndAutoVerify = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Check completion based on project type
    let isComplete = false;

    if (project.type && project.type.includes("تحسين التصميم")) {
      // For design enhancement projects, only design and review matter
      isComplete =
        project.filmingStatus === "تم الانتـــهاء مــنه" &&
        Boolean(project.fileLinks && project.fileLinks.trim() !== "") &&
        project.designMode === "تم الانتهاء منه" &&
        project.reviewMode === "تمت المراجعة";
    } else if (project.type && project.type.includes("تحسين الإنتاج")) {
      // For editing enhancement projects, only editing and review matter
      isComplete =
        project.filmingStatus === "تم الانتـــهاء مــنه" &&
        Boolean(project.fileLinks && project.fileLinks.trim() !== "") &&
        project.editMode === "تم الانتهاء منه" &&
        project.reviewMode === "تمت المراجعة";
    } else {
      // For regular projects, all departments must be complete
      isComplete =
        project.filmingStatus === "تم الانتـــهاء مــنه" &&
        Boolean(project.fileLinks && project.fileLinks.trim() !== "") &&
        project.editMode === "تم الانتهاء منه" &&
        project.reviewMode === "تمت المراجعة" &&
        project.designMode === "تم الانتهاء منه";
    }

    // If project is complete and not already verified, auto-verify
    if (isComplete && project.verificationMode !== "متميز") {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verificationMode: "متميز" }),
        });

        if (response.ok) {
          await fetchProjects(); // Refresh projects
        }
      } catch (error) {
        console.error("Error auto-verifying project:", error);
      }
    }
  };

  // Loading spinner component
  const LoadingSpinner = ({ size = "w-4 h-4" }: { size?: string }) => (
    <div
      className={`${size} animate-spin rounded-full border-2 border-gray-300 border-t-[#EAD06C]`}
    ></div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen w-full md:py-20 py-10">
      <div className="w-full text-center md:mb-34 mb-14">
        <h1 className="text-3xl text-[#EAD06C] font-bold">
          لوحــــــة المــــــتابــــعة
        </h1>
      </div>

      {/* Mobile Card View */}
      <div className="w-full px-4 md:hidden">
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center text-gray-400">
              جاري تحميل المشاريع...
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center text-gray-400">
              لا توجد مشاريع بعد. قم بإنشاء مشروع جديد من لوحة التحكم.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-[#3F3F3F] space-y-4"
              >
                <div className="border-b border-[#3F3F3F] pb-3">
                  <div className="text-[#EAD06C] font-bold text-lg mb-1">
                    {project.title}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {project.startDate
                      ? formatDate(project.startDate)
                      : project.date}
                  </div>
                  <div className="text-white text-sm mt-1">{project.type}</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-[#0B0B0B] rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-2">
                      حالة التصوير
                    </div>
                    <div className="relative">
                      {loadingStates[project.id]?.filmingStatus ? (
                        <div className="flex items-center justify-center min-h-[40px]">
                          <LoadingSpinner size="w-6 h-6" />
                        </div>
                      ) : (
                        <CustomDropdown
                          options={[
                            "لم يتم الانتهاء منه",
                            "تم الانتـــهاء مــنه",
                          ]}
                          placeholder="اختر حالة التصوير"
                          selectedValue={project.filmingStatus}
                          onSelect={(value) =>
                            updateFilmingStatus(project.id, value)
                          }
                          className="w-full"
                          buttonClassName={`${getFilmingStatusColor(
                            project.filmingStatus
                          )} min-w-[180px]`}
                          style={getFilmingStatusStyle(project.filmingStatus)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#2A2A2A]">
                    <div className="text-[#EAD06C] text-xs mb-2 font-medium">
                      ملفات التصوير
                    </div>
                    {project.fileLinks ? (
                      <button
                        onClick={() =>
                          openFilmingFilesModal(
                            project.id,
                            project.fileLinks || ""
                          )
                        }
                        className="w-full text-left text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                      >
                        {project.fileLinks.length > 50
                          ? `${project.fileLinks.substring(0, 50)}...`
                          : project.fileLinks}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          openFilmingFilesModal(
                            project.id,
                            project.fileLinks || ""
                          )
                        }
                        className="w-full text-left text-gray-400 text-xs bg-[#1A1A1A] px-2 py-1 rounded hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                      >
                        إضافة ملفات التصوير
                      </button>
                    )}
                    {!project.fileLinks && (
                      <div className="text-red-400 text-xs mt-1">
                        ⚠️ مطلوب لتغيير حالة التصوير إلى &quot;تم الانتهاء
                        منه&quot;
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#2A2A2A]">
                    <div className="text-[#EAD06C] text-xs mb-2 font-medium">
                      الملاحظات
                    </div>
                    {project.notes ? (
                      <button
                        onClick={() =>
                          openNotesModal(project.id, project.notes || "")
                        }
                        className="w-full text-left text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                      >
                        {project.notes.length > 50
                          ? `${project.notes.substring(0, 50)}...`
                          : project.notes}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          openNotesModal(project.id, project.notes || "")
                        }
                        className="w-full text-left text-gray-400 text-xs bg-[#1A1A1A] px-2 py-1 rounded hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                      >
                        إضافة ملاحظات
                      </button>
                    )}
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#2A2A2A]">
                    <div className="text-[#EAD06C] text-xs mb-2 font-medium">
                      التحرير
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                        project.editMode
                      )}`}
                      style={getStatusStyle(project.editMode)}
                    >
                      {getStatusText(project.editMode)}
                    </div>
                    {project.editor && (
                      <div className="text-[#CCCCCC] text-xs mt-2 bg-[#1A1A1A] px-2 py-1 rounded">
                        المحرر: {project.editor.name}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#2A2A2A]">
                    <div className="text-[#EAD06C] text-xs mb-2 font-medium">
                      التصميم
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                        project.designMode
                      )}`}
                      style={getStatusStyle(project.designMode)}
                    >
                      {getStatusText(project.designMode)}
                    </div>
                    {project.designer && (
                      <div className="text-[#CCCCCC] text-xs mt-2 bg-[#1A1A1A] px-2 py-1 rounded">
                        المصمم: {project.designer.name}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#2A2A2A]">
                    <div className="text-[#EAD06C] text-xs mb-2 font-medium">
                      المراجعة
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                        project.reviewMode
                      )}`}
                      style={getStatusStyle(project.reviewMode)}
                    >
                      {getStatusText(project.reviewMode)}
                    </div>
                    {project.reviewer && (
                      <div className="text-[#CCCCCC] text-xs mt-2 bg-[#1A1A1A] px-2 py-1 rounded">
                        المراجع: {project.reviewer.name}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#2A2A2A]">
                    <div className="text-[#EAD06C] text-xs mb-2 font-medium">
                      التقييم
                    </div>
                    <div className="relative">
                      {loadingStates[project.id]?.rating ? (
                        <div className="flex items-center justify-center min-h-[40px]">
                          <LoadingSpinner size="w-6 h-6" />
                        </div>
                      ) : isClient ? (
                        // Dropdown for clients to give ratings
                        <CustomDropdown
                          options={[
                            "ممتاز",
                            "جيد جداً",
                            "جيد",
                            "مقبول",
                            "يحتاج تحسين",
                            "لا شيء",
                          ]}
                          placeholder="اختر التقييم"
                          selectedValue={project.verificationMode || ""}
                          onSelect={(value: string) =>
                            updateRating(project.id, value)
                          }
                          className="w-full"
                        />
                      ) : (
                        // Read-only display for non-clients
                        <div className="w-full px-3 py-2 text-xs font-medium text-center bg-[#1A1A1A] rounded">
                          <span className="text-gray-300">
                            {project.verificationMode || "لا شيء"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#2A2A2A]">
                    <div className="text-[#EAD06C] text-xs mb-2 font-medium">
                      التوثيق
                    </div>
                    <div className="flex items-center gap-3">
                      {loadingStates[project.id]?.documentation ? (
                        <div className="flex items-center justify-center w-8 h-8">
                          <LoadingSpinner size="w-6 h-6" />
                        </div>
                      ) : (
                        <>
                          <button
                      
                            className="relative group cursor-pointer active:scale-95 transition-transform duration-150"
                          >
                            <div className="relative w-8 h-8">
                              {/* Verified Badge */}
                              <div
                                className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out ${
                                  project.verificationMode &&
                                  project.verificationMode !== "لا شيء"
                                    ? "opacity-100 scale-100 rotate-0"
                                    : "opacity-0 scale-75 rotate-180"
                                }`}
                              >
                                <svg
                                  className="w-5 h-5 text-white transition-all duration-300"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>

                              {/* Unverified Badge */}
                                  <div
                                    className={`absolute inset-0 border-2 border-gray-400 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out group-hover:border-blue-400 group-hover:bg-blue-50 ${
                                      isProjectVerified(project)
                                        ? "opacity-0 scale-75 rotate-180"
                                        : "opacity-100 scale-100 rotate-0"
                                    }`}
                                  >
                                <div className="w-3 h-3 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-all duration-300"></div>
                              </div>
                            </div>
                          </button>
                          <span
                            className={`text-xs font-medium ${
                              isProjectVerified(project)
                                ? "text-blue-400"
                                : "text-gray-400"
                            }`}
                          >
                            {isProjectVerified(project)
                              ? "موثق"
                              : "غير موثق"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-[95%]">
        <div className="bg-[#1a1a1a] rounded-[24px] overflow-hidden border border-[#3F3F3F]">
          <div
            className="overflow-x-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#3f3f3f] hover:scrollbar-thumb-[#555555] scrollbar-thumb-rounded-full"
            style={{ position: "relative", zIndex: 1 }}
          >
            <table className="border-collapse w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#3F3F3F] bg-[#1A1A1A]">
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      المشروع
                      <TableTooltip text="الاسم الرسمي للمشروع وتاريخ بدء المشروع، حيث يمكنك تحديد المشروع عند المراجعة او المتابعة">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      النوع
                      <TableTooltip text="في هذا الحقل يتم تحديد نوع المشروع او المحتوى">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      ملفات التصوير
                      <TableTooltip text="المستندات او الملفات التي يحتاجها الفريق والمتعلقة بالمشروع">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      الملاحظات
                      <TableTooltip text="ملاحظات مهمة او تعليقات للفريق">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      حالة التصوير
                      <TableTooltip text="يرجى توضيح اذا كان التصوير لم يبدا - جاري - منتهي. حتى تكون حالة التصوير واضحة لدى الفريق">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      التحرير
                      <TableTooltip text="متابعة حالة التحرير/المونتاج للمحتوى">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      التصميم
                      <TableTooltip text="متابعة حالة التصميم">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      المراجعة
                      <TableTooltip text="حالة مراجعة العمل النهائي">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      الروابط
                      <TableTooltip text="الروابط النهائية للأعمال المنجزة">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      التقييم
                      <TableTooltip text="تقييم جودة المشروع/المحتوى بعد الانتهاء">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-[#EAD06C] font-semibold border-l border-[#3F3F3F] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      التوثيق
                      <TableTooltip text="يتم توثيق المشروع بالعلامة الزرقاء بعد الانتهاء منه دلالة على انتهاء العمل عليه">
                        <button className="w-4 h-4 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-xs hover:bg-[#EAD06C]/80 transition-colors">
                          ?
                        </button>
                      </TableTooltip>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-gray-400">
                      جاري تحميل المشاريع...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="py-8 px-4 text-center text-gray-400"
                    >
                      لا توجد مشاريع بعد. قم بإنشاء مشروع جديد من لوحة التحكم.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#3F3F3F] hover:bg-[#141414] transition-colors"
                    >
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F]">
                        <div className="text-[#EAD06C] font-medium">
                          {project.title}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {project.startDate
                            ? formatDate(project.startDate)
                            : project.date}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap text-xs">
                        {project.type}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="flex flex-col gap-2 items-center">
                          {project.fileLinks ? (
                            <div className="flex flex-col gap-1 items-center">
                              <div className="text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded max-w-[150px] text-center truncate">
                                {project.fileLinks.length > 30
                                  ? `${project.fileLinks.substring(0, 30)}...`
                                  : project.fileLinks}
                              </div>
                              {isClient && (
                                <button
                                  onClick={() =>
                                    openFilmingFilesModal(
                                      project.id,
                                      project.fileLinks || ""
                                    )
                                  }
                                  className="text-blue-400 text-xs hover:text-blue-300 transition-colors duration-200 font-medium cursor-pointer"
                                >
                                  تعديل
                                </button>
                              )}
                            </div>
                          ) : (
                            isClient && (
                              <button
                                onClick={() =>
                                  openFilmingFilesModal(
                                    project.id,
                                    project.fileLinks || ""
                                  )
                                }
                                className="text-gray-400 text-xs bg-[#1A1A1A] px-2 py-1 rounded max-w-[150px] hover:bg-[#2A2A2A] transition-colors cursor-pointer text-center"
                              >
                                إضافة ملفات
                              </button>
                            )
                          )}
                          {!project.fileLinks && (
                            <div className="text-red-400 text-xs">مطلوب</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="flex flex-col gap-2 items-center">
                          {project.notes ? (
                            <div className="flex flex-col gap-1 items-center">
                              <div className="text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded max-w-[150px] text-center truncate">
                                {project.notes.length > 30
                                  ? `${project.notes.substring(0, 30)}...`
                                  : project.notes}
                              </div>
                              {isClient && (
                                <button
                                  onClick={() =>
                                    openNotesModal(
                                      project.id,
                                      project.notes || ""
                                    )
                                  }
                                  className="text-blue-400 text-xs hover:text-blue-300 transition-colors duration-200 font-medium cursor-pointer"
                                >
                                  تعديل
                                </button>
                              )}
                            </div>
                          ) : (
                            isClient && (
                              <button
                                onClick={() =>
                                  openNotesModal(
                                    project.id,
                                    project.notes || ""
                                  )
                                }
                                className="text-gray-400 text-xs bg-[#1A1A1A] px-2 py-1 rounded max-w-[150px] hover:bg-[#2A2A2A] transition-colors cursor-pointer text-center"
                              >
                                إضافة ملاحظات
                              </button>
                            )
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="relative">
                          {loadingStates[project.id]?.filmingStatus ? (
                            <div className="flex items-center justify-center min-h-[40px]">
                              <LoadingSpinner size="w-6 h-6" />
                            </div>
                          ) : (
                            <CustomDropdown
                              options={[
                                "لم يتم الانتهاء منه",
                                "تم الانتـــهاء مــنه",
                              ]}
                              placeholder="اختر حالة التصوير"
                              selectedValue={project.filmingStatus}
                              onSelect={(value) =>
                                updateFilmingStatus(project.id, value)
                              }
                              className="w-full max-w-[200px] mx-auto"
                              buttonClassName={`${getFilmingStatusColor(
                                project.filmingStatus
                              )} min-w-[180px]`}
                              style={getFilmingStatusStyle(
                                project.filmingStatus
                              )}
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`px-3 py-2 rounded-full text-xs font-medium text-white border`}
                            style={getEnhancementStatusStyle(project, 'edit')}
                          >
                            {getEnhancementStatusText(project, 'edit')}
                          </span>
                          {project.editor && (
                            <div className="text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded">
                              {project.editor.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`px-3 py-2 rounded-full text-xs font-medium text-white border`}
                            style={getEnhancementStatusStyle(project, 'design')}
                          >
                            {getEnhancementStatusText(project, 'design')}
                          </span>
                          {project.designer && (
                            <div className="text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded">
                              {project.designer.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                              project.reviewMode
                            )}`}
                            style={getStatusStyle(project.reviewMode)}
                          >
                            {getStatusText(project.reviewMode)}
                          </span>
                          {project.reviewer && (
                            <div className="text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded">
                              {project.reviewer.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.filmingStatus === "تم الانتـــهاء مــنه" ? (
                          <div className="flex flex-col gap-1">
                            {project.reviewLinks && (
                              <a
                                href={project.reviewLinks}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs underline"
                              >
                                تحرير
                              </a>
                            )}
                            {project.designLinks && (
                              <a
                                href={project.designLinks}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs underline"
                              >
                                تصميم
                              </a>
                            )}
                            {!project.reviewLinks &&
                              !project.designLinks && (
                                <span className="text-gray-500 text-xs">
                                  لا توجد
                                </span>
                              )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            في انتظار التصوير
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="relative">
                          {loadingStates[project.id]?.rating ? (
                            <div className="flex items-center justify-center min-h-[40px]">
                              <LoadingSpinner size="w-6 h-6" />
                            </div>
                          ) : isClient ? (
                            // Dropdown for clients to give ratings
                            <CustomDropdown
                              options={[
                                "ممتاز",
                                "جيد جداً",
                                "جيد",
                                "مقبول",
                                "يحتاج تحسين",
                                "لا شيء",
                              ]}
                              placeholder="اختر التقييم"
                              selectedValue={project.verificationMode || ""}
                              onSelect={(value: string) =>
                                updateRating(project.id, value)
                              }
                              className="min-w-[120px]"
                            />
                          ) : (
                            // Read-only display for non-clients
                            <div className="min-w-[120px] px-3 py-2 text-xs font-medium text-center">
                              <span className="text-gray-300">
                                {project.verificationMode || "لا شيء"}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {loadingStates[project.id]?.documentation ? (
                            <div className="flex items-center justify-center w-6 h-6">
                              <LoadingSpinner size="w-6 h-6" />
                            </div>
                          ) : (
                            <>
                              {isClient && (
                                <button
                              
                                  className="relative group cursor-pointer active:scale-95 transition-transform duration-150"
                                >
                                <div className="relative w-6 h-6">
                                  {/* Verified Badge */}
                                  <div
                                    className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out ${
                                      isProjectVerified(project)
                                        ? "opacity-100 scale-100 rotate-0"
                                        : "opacity-0 scale-75 rotate-180"
                                    }`}
                                  >
                                    <svg
                                      className="w-4 h-4 text-white transition-all duration-300"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>

                                  {/* Unverified Badge */}
                                  <div
                                    className={`absolute inset-0 border-2 border-gray-400 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out group-hover:border-blue-400 group-hover:bg-blue-50 ${
                                      isProjectVerified(project)
                                        ? "opacity-0 scale-75 rotate-180"
                                        : "opacity-100 scale-100 rotate-0"
                                    }`}
                                  >
                                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-all duration-300"></div>
                                  </div>
                                </div>
                                </button>
                              )}
                              <span
                                className={`text-xs font-medium ${
                                  isProjectVerified(project)
                                    ? "text-blue-400"
                                    : "text-gray-400"
                                }`}
                              >
                                {isProjectVerified(project)
                                  ? "تم التوثيق"
                                  : "غير موثق"}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filming Files Modal */}
      <TextEditModal
        isOpen={filmingFilesModal.isOpen}
        onClose={closeFilmingFilesModal}
        onSave={saveFilmingFiles}
        title="ملفات التصوير"
        initialContent={filmingFilesModal.currentContent}
        placeholder="أدخل روابط ملفات التصوير (مثال: https://drive.google.com/...)"
        isTextarea={true}
        rows={4}
        maxLength={2000}
      />

      {/* Notes Modal */}
      <TextEditModal
        isOpen={notesModal.isOpen}
        onClose={closeNotesModal}
        onSave={saveNotes}
        title="الملاحظات"
        initialContent={notesModal.currentContent}
        placeholder="أدخل الملاحظات الخاصة بالمشروع..."
        isTextarea={true}
        rows={6}
        maxLength={1500}
        showVoiceRecorder={true}
      />
    </div>
  );
}
