"use client";

import { useState, useEffect } from "react";
import { Project } from "../../../types";

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export default function EditorDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detectingDuration, setDetectingDuration] = useState<string | null>(null);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        // Filter out design-only enhancement projects for editors
        const filteredProjects = (data.projects || []).filter((project: Project) => {
          // Exclude design-only enhancement projects
          return !(project.type && project.type.includes("تحسين التصميم"));
        });
        setProjects(filteredProjects);
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
  const updateProjectStatus = async (projectId: string, editMode: string) => {
    // Find the project to check if it has review links
    const project = projects.find((p) => p.id === projectId);

    // If trying to mark as done but no review links, show error
    if (editMode === "تم الانتهاء منه" && !project?.reviewLinks) {
      alert(
        "يجب إضافة روابط المراجعة قبل تغيير حالة التحرير إلى 'تم الانتهاء منه'"
      );
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ editMode }),
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

  // Detect video duration from URL
  const detectVideoDuration = async (projectId: string, url: string) => {
    if (!url) return;
    
    setDetectingDuration(projectId);
    
    try {
      const response = await fetch("/api/video-duration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok && data.duration) {
        // Update project with the detected duration
        await updateProjectVideoDuration(projectId, data.duration);
      } else if (data.requiresManualEntry) {
        // Show message that manual entry is needed
        const manualDuration = prompt(
          `${data.message}\n\nالرجاء إدخال مدة الفيديو يدوياً (مثال: 5:30 أو 1:25:45):`
        );
        
        if (manualDuration) {
          await updateProjectVideoDuration(projectId, manualDuration);
        }
      }
    } catch (error) {
      console.error("Error detecting video duration:", error);
      const manualDuration = prompt(
        "لم نتمكن من اكتشاف مدة الفيديو تلقائياً.\n\nالرجاء إدخال مدة الفيديو يدوياً (مثال: 5:30 أو 1:25:45):"
      );
      
      if (manualDuration) {
        await updateProjectVideoDuration(projectId, manualDuration);
      }
    } finally {
      setDetectingDuration(null);
    }
  };

  // Update project video duration
  const updateProjectVideoDuration = async (
    projectId: string,
    videoDuration: string
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoDuration }),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh projects
      } else {
        const errorData = await response.json();
        alert(`فشل في تحديث مدة الفيديو: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating video duration:", error);
      alert("حدث خطأ أثناء تحديث مدة الفيديو");
    }
  };

  // Update project review links
  const updateProjectReviewLinks = async (
    projectId: string,
    reviewLinks: string
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewLinks }),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh projects
        
        // Auto-detect video duration when review link is added
        if (reviewLinks) {
          await detectVideoDuration(projectId, reviewLinks);
        }
      } else {
        const errorData = await response.json();
        alert(`فشل في تحديث روابط المراجعة: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating project review links:", error);
      alert("حدث خطأ أثناء تحديث روابط المراجعة");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تم الانتهاء منه":
        return "bg-green-500";
      case "قيد التنفيذ":
        return "bg-yellow-500";
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
                    الروابــــط
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الملاحظات
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة التصوير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    وضع التحرير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابــــط
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    مدة الفيديو
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      جاري تحميل المشاريع...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
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
                        {project.fileLinks ? (
                          <a
                            href={project.fileLinks}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            عرض الملفات
                          </a>
                        ) : (
                          <span className="text-gray-400">لا توجد ملفات</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis">
                        {project.notes || "لا توجد ملاحظات"}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${
                            project.filmingStatus === "تم الانتـــهاء مــنه"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {project.filmingStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <select
                          value={project.editMode}
                          onChange={(e) =>
                            updateProjectStatus(project.id, e.target.value)
                          }
                          className={`px-2 py-1 rounded text-xs text-white border-none outline-none ${getStatusColor(
                            project.editMode
                          )}`}
                        >
                          <option value="لم يبدأ">لم يبدأ</option>
                          <option value="قيد التنفيذ">قيد التنفيذ</option>
                          <option value="تم الانتهاء منه">
                            تم الانتهاء منه
                          </option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <input
                          type="url"
                          placeholder="رابط العمل المنجز"
                          className="bg-[#0B0B0B] text-white px-2 py-1 rounded text-xs w-32 outline-none"
                          defaultValue={project.reviewLinks || ""}
                          onBlur={(e) => {
                            if (
                              e.target.value !== (project.reviewLinks || "")
                            ) {
                              updateProjectReviewLinks(
                                project.id,
                                e.target.value
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        {detectingDuration === project.id ? (
                          <span className="text-xs text-yellow-400">
                            جاري الكشف...
                          </span>
                        ) : project.videoDuration ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-green-400">
                              ⏱️ {project.videoDuration}
                            </span>
                            <button
                              onClick={() => {
                                const newDuration = prompt(
                                  "تعديل مدة الفيديو:",
                                  project.videoDuration
                                );
                                if (newDuration) {
                                  updateProjectVideoDuration(project.id, newDuration);
                                }
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              ✏️
                            </button>
                          </div>
                        ) : project.reviewLinks ? (
                          <button
                            onClick={() => detectVideoDuration(project.id, project.reviewLinks!)}
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            كشف المدة
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
