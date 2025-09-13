"use client";

import { useState, useEffect } from "react";
import { Project } from "../../../types";

export default function DesignerTrackingBoardPage() {
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

  // Update project status
  const updateProjectStatus = async (projectId: string, updates: Partial<Project>) => {
    // Find the project to check if it has design links
    const project = projects.find(p => p.id === projectId);
    
    // If trying to mark design as done but no design links, show error
    if (updates.designMode === "تم الانتهاء منه" && !project?.designLinks && !updates.designLinks) {
      alert("يجب إضافة روابط التصميم قبل تغيير وضع التصميم إلى 'تم الانتهاء منه'");
      return;
    }

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تم الانتهاء منه":
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
                    حالة التحرير
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    وضع التصميم
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    روابط التصميم
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
                        {project.date}
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
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${
                          project.filmingStatus === "تم الانتـــهاء مــنه" ? "bg-green-500" : "bg-red-500"
                        }`}>
                          {project.filmingStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.editMode)}`}>
                          {project.editMode || "لم يبدأ"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <select
                          value={project.designMode}
                          onChange={(e) => updateProjectStatus(project.id, { designMode: e.target.value })}
                          className={`px-2 py-1 rounded text-xs text-white border-none outline-none ${getStatusColor(project.designMode)}`}
                        >
                          <option value="في الانتظار">في الانتظار</option>
                          <option value="قيد التنفيذ">قيد التنفيذ</option>
                          <option value="تم الانتهاء منه">تم الانتهاء منه</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-center border-l border-[#3F3F3F] whitespace-nowrap">
                        <input
                          type="url"
                          placeholder="رابط التصميم"
                          className="bg-[#0B0B0B] text-white px-2 py-1 rounded text-xs w-32 outline-none"
                          defaultValue={project.designLinks || ""}
                          onBlur={(e) => {
                            if (e.target.value !== (project.designLinks || "")) {
                              updateProjectStatus(project.id, { designLinks: e.target.value });
                            }
                          }}
                        />
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
