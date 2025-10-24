"use client";

import { useState, useEffect } from "react";
import { Project } from "../../../types";
import TextEditModal from "../../../../components/ui/TextEditModal";

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export default function ReviewerTrackingBoardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [notesModal, setNotesModal] = useState<{
    isOpen: boolean;
    projectId: string;
    currentContent: string;
  }>({
    isOpen: false,
    projectId: "",
    currentContent: "",
  });

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

  // Update project status
  const updateProjectStatus = async (
    projectId: string,
    updates: Partial<Project>
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh projects
      } else {
        const errorData = await response.json();
        alert(`فشل في تحديث حالة المشروع: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("حدث خطأ أثناء تحديث المشروع");
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

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تمت المراجعة":
      case "تم الانتهاء منه":
        return "bg-green-500";
      case "قيد المراجعة":
      case "قيد التنفيذ":
        return "bg-yellow-500";
      case "في الانتظار":
        return "bg-orange-500";
      case "لم يبدأ":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full md:py-20 py-10">
      <div className="w-full text-center md:mb-34 mb-14">
        <h1 className="text-3xl">لوحــــــة المــــــتابــــعة</h1>
      </div>

      <div className="w-[95%] md:w-[90%]">
        <div className="bg-[#1a1a1a] rounded-[24px] overflow-hidden border border-[#3F3F3F]">
          <div className="overflow-x-auto">
            <table className="border-collapse w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#3F3F3F]">
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التاريــــخ
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    اسم المشــــروع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    النــــوع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الملاحظات
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة التحرير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة التصميم
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    روابط العمل
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة المراجعة
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      جاري تحميل المشاريع...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      لا توجد مشاريع معينة لك حالياً
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#3F3F3F] hover:bg-[#141414] transition-colors"
                    >
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.startDate
                          ? formatDate(project.startDate)
                          : project.date}
                      </td>
                      <td className="py-4 px-4 text-center text-[#EAD06C] border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.title}
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.type}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <div className="flex flex-col gap-2 items-center">
                          {project.notes ? (
                            <div className="flex flex-col gap-1 items-center">
                              <button
                                onClick={() =>
                                  openNotesModal(
                                    project.id,
                                    project.notes || ""
                                  )
                                }
                                className="text-[#CCCCCC] text-xs bg-[#1A1A1A] px-2 py-1 rounded max-w-[150px] text-center truncate hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                              >
                                {project.notes.length > 30
                                  ? `${project.notes.substring(0, 30)}...`
                                  : project.notes}
                              </button>
                              <span    onClick={() =>
                                  openNotesModal(
                                    project.id,
                                    project.notes || ""
                                  )
                                } className="text-blue-400 text-xs font-medium cursor-pointer">
                                عرض كامل
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              لا توجد ملاحظات
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                            project.editMode
                          )}`}
                        >
                          {project.editMode || "لم يبدأ"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                            project.designMode
                          )}`}
                        >
                          {project.designMode || "في الانتظار"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
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
                          {!project.reviewLinks && !project.designLinks && (
                            <span className="text-gray-400 text-xs">
                              لا توجد روابط
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <select
                          value={project.reviewMode}
                          onChange={(e) =>
                            updateProjectStatus(project.id, {
                              reviewMode: e.target.value,
                            })
                          }
                          className={`px-2 py-1 rounded text-xs text-white border-none outline-none ${getStatusColor(
                            project.reviewMode
                          )}`}
                        >
                          <option value="في الانتظار">في الانتظار</option>
                          <option value="قيد المراجعة">قيد المراجعة</option>
                          <option value="تمت المراجعة">تمت المراجعة</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <TextEditModal
        isOpen={notesModal.isOpen}
        onClose={closeNotesModal}
        onSave={() => {}} // Read-only for employees
        title="ملاحظات العميل"
        initialContent={notesModal.currentContent}
        placeholder="ملاحظات العميل..."
        isTextarea={true}
        rows={6}
        maxLength={1500}
        readOnly={true}
      />
    </div>
  );
}
