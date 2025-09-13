"use client";

import { useState, useEffect } from "react";
import { Project } from "../../../types";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{
    editors: Array<{ id: string; name: string; email: string }>;
    designers: Array<{ id: string; name: string; email: string }>;
    reviewers: Array<{ id: string; name: string; email: string }>;
  }>({ editors: [], designers: [], reviewers: [] });

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

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        const users = data.users || [];
        
        setTeamMembers({
          editors: users.filter((user: any) => user.role === "editor"),
          designers: users.filter((user: any) => user.role === "designer"),
          reviewers: users.filter((user: any) => user.role === "reviewer"),
        });
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const handleAssignTeamMembers = async (
    projectId: string,
    assignments: {
      editorId?: string | null;
      designerId?: string | null;
      reviewerId?: string | null;
    }
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignments),
      });

      if (response.ok) {
        await fetchProjects(); // Refresh the projects list
        setIsAssignModalOpen(false);
        setSelectedProject(null);
      } else {
        const errorData = await response.json();
        alert(`فشل في تعيين أعضاء الفريق: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error assigning team members:", error);
      alert("حدث خطأ أثناء تعيين أعضاء الفريق");
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
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">جاري تحميل المشاريع...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6 text-right">
          إدارة المشاريع
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0F0F0F] p-4 rounded-lg">
            <div className="text-gray-400 text-sm">إجمالي المشاريع</div>
            <div className="text-2xl font-bold text-[#EAD06C]">{projects.length}</div>
          </div>
          <div className="bg-[#0F0F0F] p-4 rounded-lg">
            <div className="text-gray-400 text-sm">قيد التنفيذ</div>
            <div className="text-2xl font-bold text-yellow-500">
              {projects.filter(p => p.editMode === "قيد التنفيذ" || p.designMode === "قيد التنفيذ").length}
            </div>
          </div>
          <div className="bg-[#0F0F0F] p-4 rounded-lg">
            <div className="text-gray-400 text-sm">بانتظار المراجعة</div>
            <div className="text-2xl font-bold text-orange-500">
              {projects.filter(p => p.reviewMode === "في الانتظار").length}
            </div>
          </div>
          <div className="bg-[#0F0F0F] p-4 rounded-lg">
            <div className="text-gray-400 text-sm">مكتملة</div>
            <div className="text-2xl font-bold text-green-500">
              {projects.filter(p => 
                p.editMode === "تم الانتهاء منه" && 
                p.reviewMode === "تمت المراجعة" && 
                p.designMode === "تم الانتهاء منه"
              ).length}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0F0F0F] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-4 py-3 text-right">العنوان</th>
                <th className="px-4 py-3 text-right">النوع</th>
                <th className="px-4 py-3 text-right">العميل</th>
                <th className="px-4 py-3 text-right">المحرر</th>
                <th className="px-4 py-3 text-right">المصمم</th>
                <th className="px-4 py-3 text-right">المراجع</th>
                <th className="px-4 py-3 text-right">حالة التحرير</th>
                <th className="px-4 py-3 text-right">حالة التصميم</th>
                <th className="px-4 py-3 text-right">حالة المراجعة</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t border-gray-700 hover:bg-[#1a1a1a]">
                  <td className="px-4 py-4 font-medium">{project.title}</td>
                  <td className="px-4 py-4 text-[#EAD06C]">{project.type}</td>
                  <td className="px-4 py-4">{project.client?.name || "غير محدد"}</td>
                  <td className="px-4 py-4">{project.editor?.name || "غير معين"}</td>
                  <td className="px-4 py-4">{project.designer?.name || "غير معين"}</td>
                  <td className="px-4 py-4">{project.reviewer?.name || "غير معين"}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.editMode)}`}>
                      {project.editMode}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.designMode)}`}>
                      {project.designMode}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.reviewMode)}`}>
                      {project.reviewMode}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setIsAssignModalOpen(true);
                      }}
                      className="bg-[#EAD06C] text-black px-3 py-1 rounded text-sm hover:bg-[#F5D76E] transition-colors"
                    >
                      تعيين الفريق
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F0F] rounded-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedProject(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">تعيين الفريق - {selectedProject.title}</h2>
            </div>

            <AssignmentForm
              project={selectedProject}
              teamMembers={teamMembers}
              onAssign={handleAssignTeamMembers}
              onCancel={() => {
                setIsAssignModalOpen(false);
                setSelectedProject(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Assignment Form Component
function AssignmentForm({
  project,
  teamMembers,
  onAssign,
  onCancel,
}: {
  project: Project;
  teamMembers: {
    editors: Array<{ id: string; name: string; email: string }>;
    designers: Array<{ id: string; name: string; email: string }>;
    reviewers: Array<{ id: string; name: string; email: string }>;
  };
  onAssign: (projectId: string, assignments: any) => void;
  onCancel: () => void;
}) {
  const [editorId, setEditorId] = useState(project.editorId || "");
  const [designerId, setDesignerId] = useState(project.designerId || "");
  const [reviewerId, setReviewerId] = useState(project.reviewerId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(project.id, {
      editorId: editorId || null,
      designerId: designerId || null,
      reviewerId: reviewerId || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-400 text-sm mb-2 text-right">المحرر</label>
        <select
          value={editorId}
          onChange={(e) => setEditorId(e.target.value)}
          className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-lg focus:outline-none text-right"
        >
          <option value="">اختر محرر</option>
          {teamMembers.editors.map((editor) => (
            <option key={editor.id} value={editor.id}>
              {editor.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-2 text-right">المصمم</label>
        <select
          value={designerId}
          onChange={(e) => setDesignerId(e.target.value)}
          className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-lg focus:outline-none text-right"
        >
          <option value="">اختر مصمم</option>
          {teamMembers.designers.map((designer) => (
            <option key={designer.id} value={designer.id}>
              {designer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-2 text-right">المراجع</label>
        <select
          value={reviewerId}
          onChange={(e) => setReviewerId(e.target.value)}
          className="w-full bg-[#0B0B0B] text-white px-4 py-2 rounded-lg focus:outline-none text-right"
        >
          <option value="">اختر مراجع</option>
          {teamMembers.reviewers.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id}>
              {reviewer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#EAD06C] text-black rounded-lg hover:bg-[#F5D76E] transition-colors"
        >
          حفظ التعيينات
        </button>
      </div>
    </form>
  );
}
