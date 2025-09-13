"use client";

import { useState, useEffect } from "react";
import { Project } from "../../../types";

export default function ClientTrackingBoardPage() {
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

  // Update filming status
  const updateFilmingStatus = async (projectId: string, filmingStatus: string) => {
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
      } else {
        const errorData = await response.json();
        alert(`فشل في تحديث حالة التصوير: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating filming status:", error);
      alert("حدث خطأ أثناء تحديث حالة التصوير");
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "تم الانتهاء منه":
      case "تمت المراجعة":
        return "bg-green-500";
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

  const getStatusText = (status: string) => {
    return status || "غير محدد";
  };
  return (
    <div className="flex flex-col items-center min-h-screen w-full md:py-20 py-10">
      <div className="w-full text-center md:mb-34 mb-14">
        <h1 className="text-3xl">لوحــــــة المــــــتابــــعة</h1>
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
                  <div className="text-gray-400 text-sm">{project.date}</div>
                  <div className="text-white text-sm mt-1">{project.type}</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-[#0B0B0B] rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-2">حالة التصوير</div>
                    <select
                      value={project.filmingStatus}
                      onChange={(e) => updateFilmingStatus(project.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs text-white border-none outline-none ${getStatusColor(project.filmingStatus)}`}
                    >
                      <option value="لم يتم الانتهاء منه">لم يتم الانتهاء منه</option>
                      <option value="تم الانتـــهاء مــنه">تم الانتـــهاء مــنه</option>
                    </select>
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-2">حالة التحرير</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.editMode)}`}>
                      {getStatusText(project.editMode)}
                    </div>
                    {project.editor && (
                      <div className="text-gray-500 text-xs mt-1">المحرر: {project.editor.name}</div>
                    )}
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-2">حالة التصميم</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.designMode)}`}>
                      {getStatusText(project.designMode)}
                    </div>
                    {project.designer && (
                      <div className="text-gray-500 text-xs mt-1">المصمم: {project.designer.name}</div>
                    )}
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-2">حالة المراجعة</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.reviewMode)}`}>
                      {getStatusText(project.reviewMode)}
                    </div>
                    {project.reviewer && (
                      <div className="text-gray-500 text-xs mt-1">المراجع: {project.reviewer.name}</div>
                    )}
                  </div>

                  {project.verificationMode && project.verificationMode !== "لا شيء" && (
                    <div className="bg-[#0B0B0B] rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-2">تقييم المشروع</div>
                      <div className="text-[#EAD06C] text-sm font-medium">
                        {project.verificationMode}
                      </div>
                    </div>
                  )}

                  {project.filmingStatus === "تم الانتـــهاء مــنه" && (project.fileLinks || project.reviewLinks || project.designLinks) && (
                    <div className="bg-[#0B0B0B] rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-2">الروابط المتاحة</div>
                      <div className="space-y-1">
                        {project.fileLinks && (
                          <a href={project.fileLinks} target="_blank" rel="noopener noreferrer" 
                             className="block text-blue-400 hover:text-blue-300 text-xs underline">
                            ملفات المشروع
                          </a>
                        )}
                        {project.reviewLinks && (
                          <a href={project.reviewLinks} target="_blank" rel="noopener noreferrer" 
                             className="block text-blue-400 hover:text-blue-300 text-xs underline">
                            روابط المراجعة
                          </a>
                        )}
                        {project.designLinks && (
                          <a href={project.designLinks} target="_blank" rel="noopener noreferrer" 
                             className="block text-blue-400 hover:text-blue-300 text-xs underline">
                            روابط التصميم
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {project.notes && (
                    <div className="bg-[#0B0B0B] rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-2">ملاحظات</div>
                      <div className="text-white text-sm">{project.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-[95%]">
        <div className="bg-[#1a1a1a] rounded-[24px] overflow-hidden border border-[#3F3F3F]">
          <div className="overflow-x-auto">
            <table className="border-collapse w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#3F3F3F]">
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    المشروع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    النوع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التاريخ
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة التصوير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التحرير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التصميم
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    المراجعة
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التقييم
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابط
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
                    <td colSpan={9} className="py-8 px-4 text-center text-gray-400">
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
                        <div className="text-[#EAD06C] font-medium">{project.title}</div>
                        {project.notes && (
                          <div className="text-gray-400 text-xs mt-1 max-w-[150px] truncate">
                            {project.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.type}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.date}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <select
                          value={project.filmingStatus}
                          onChange={(e) => updateFilmingStatus(project.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs text-white border-none outline-none ${getStatusColor(project.filmingStatus)}`}
                        >
                          <option value="لم يتم الانتهاء منه">لم يتم الانتهاء منه</option>
                          <option value="تم الانتـــهاء مــنه">تم الانتـــهاء مــنه</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.editMode)}`}>
                          {getStatusText(project.editMode)}
                        </span>
                        {project.editor && (
                          <div className="text-gray-500 text-xs mt-1">{project.editor.name}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.designMode)}`}>
                          {getStatusText(project.designMode)}
                        </span>
                        {project.designer && (
                          <div className="text-gray-500 text-xs mt-1">{project.designer.name}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.reviewMode)}`}>
                          {getStatusText(project.reviewMode)}
                        </span>
                        {project.reviewer && (
                          <div className="text-gray-500 text-xs mt-1">{project.reviewer.name}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.verificationMode && project.verificationMode !== "لا شيء" ? (
                          <span className="text-[#EAD06C] text-sm font-medium">
                            {project.verificationMode}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">غير مقيم</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        {project.filmingStatus === "تم الانتـــهاء مــنه" ? (
                          <div className="flex flex-col gap-1">
                            {project.fileLinks && (
                              <a href={project.fileLinks} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-400 hover:text-blue-300 text-xs underline">
                                ملفات
                              </a>
                            )}
                            {project.reviewLinks && (
                              <a href={project.reviewLinks} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-400 hover:text-blue-300 text-xs underline">
                                مراجعة
                              </a>
                            )}
                            {project.designLinks && (
                              <a href={project.designLinks} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-400 hover:text-blue-300 text-xs underline">
                                تصميم
                              </a>
                            )}
                            {!project.fileLinks && !project.reviewLinks && !project.designLinks && (
                              <span className="text-gray-500 text-xs">لا توجد</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">في انتظار التصوير</span>
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
