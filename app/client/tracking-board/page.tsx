"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useProjects } from "../../../contexts/ProjectContext";

export default function ClientTrackingBoardPage() {
  const { projects, updateProject } = useProjects();
  const [editingField, setEditingField] = useState<{
    projectId: string;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projectTypes = [
    "فيديوهات طويلة",
    "فيديوهات قصيرة",
    "إعلانات / مقاطع فيديو ترويجية",
  ];

  const filmingStatusOptions = ["لم يتم الانتهاء منه", "تم الانتهاء منه"];

  const EditModeOptions = ["لم يبدأ", "قيد التنفيذ", "تم الانتهاء منه"];

  const ReviewModeOptions = ["تمت المراجعة", "في الانتظار"];

  const DesignModeOptions = ["تم الانتهاء منه", "في الانتظار"];

  const VerificationModeOptions = [
    "متميز",
    "ممتاز",
    "جيد جدًا",
    "جيد",
    "قيد التطوير",
    "لا شيء",
  ];

  const handleTypeChange = (projectId: string, type: string) => {
    updateProject(projectId, { type });
  };

  const handleEditModeChange = (projectId: string, mode: string) => {
    updateProject(projectId, { editMode: mode });
  };

  const handleFilmingStatusChange = (projectId: string, status: string) => {
    updateProject(projectId, { filmingStatus: status });
  };

  const handleReviewModeChange = (projectId: string, mode: string) => {
    updateProject(projectId, { reviewMode: mode });
  };

  const handleDesignModeChange = (projectId: string, mode: string) => {
    updateProject(projectId, { designMode: mode });
  };

  const handleVerificationModeChange = (projectId: string, mode: string) => {
    updateProject(projectId, { verificationMode: mode });
  };

  const startEditing = (
    projectId: string,
    field: string,
    currentValue: string
  ) => {
    setEditingField({ projectId, field });
    setEditValue(currentValue);
    setIsModalOpen(true);
  };

  const saveEdit = () => {
    if (editingField) {
      updateProject(editingField.projectId, {
        [editingField.field]: editValue,
      });
      setEditingField(null);
      setEditValue("");
      setIsModalOpen(false);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
    setIsModalOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      title: "اسم المشروع",
      fileLinks: "روابط الملفات",
      notes: "الملاحظات",
      reviewLinks: "روابط المراجعة",
      designLinks: "روابط التصميم",
      documentation: "التوثيق",
      date: "التـــاريخ",
    };
    return labels[field] || field;
  };
  return (
    <div className="flex flex-col items-center min-h-screen w-full md:py-20 py-10">
      <div className="w-full text-center md:mb-34 mb-14">
        <h1 className="text-3xl">لوحــــــة المــــــتابــــعة</h1>
      </div>

      {/* Mobile Card View */}
      <div className="w-full px-4 md:hidden">
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center text-gray-400">
              لا توجد مشاريع بعد. قم بإنشاء مشروع جديد من لوحة التحكم.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-[#3F3F3F] space-y-3"
              >
                <div className="flex justify-between items-center border-b border-[#3F3F3F] pb-2">
                  <div
                    onClick={() =>
                      startEditing(project.id, "date", project.date)
                    }
                    className="text-gray-400 cursor-pointer hover:text-yellow-500"
                  >
                    {project.date}
                  </div>
                  <div
                    onClick={() =>
                      startEditing(project.id, "title", project.title)
                    }
                    className="text-white font-medium cursor-pointer hover:text-yellow-500"
                  >
                    {project.title}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">التـــاريخ</div>
                    <div
                      onClick={() =>
                        startEditing(project.id, "date", project.date)
                      }
                      className="bg-[#0B0B0B] p-2 rounded-lg cursor-pointer hover:bg-[#1F1F1F] text-white text-sm"
                    >
                      {project.date}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">الــــــــــنوع</div>
                    <CustomDropdown
                      options={projectTypes}
                      placeholder="نوع المشروع"
                      selectedValue={project.type || ""}
                      onSelect={(value) => handleTypeChange(project.id, value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">الروابـــــط</div>
                    <div
                      onClick={() =>
                        startEditing(
                          project.id,
                          "fileLinks",
                          project.fileLinks || ""
                        )
                      }
                      className="bg-[#0B0B0B] p-2 rounded-lg cursor-pointer hover:bg-[#1F1F1F] text-white text-sm"
                    >
                      {project.fileLinks || "---"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">الملاحظات</div>
                    <div
                      onClick={() =>
                        startEditing(project.id, "notes", project.notes || "")
                      }
                      className="bg-[#0B0B0B] p-2 rounded-lg cursor-pointer hover:bg-[#1F1F1F] text-white text-sm"
                    >
                      {project.notes || "---"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">حالة التصوير</div>
                    <CustomDropdown
                      options={filmingStatusOptions}
                      placeholder="حالة التصوير"
                      selectedValue={project.filmingStatus || ""}
                      onSelect={(value) =>
                        handleFilmingStatusChange(project.id, value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">وضع التحرير</div>
                    <CustomDropdown
                      options={EditModeOptions}
                      placeholder="وضع التحرير"
                      selectedValue={project.editMode || ""}
                      onSelect={(value) =>
                        handleEditModeChange(project.id, value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">المراجعة</div>
                    <CustomDropdown
                      options={ReviewModeOptions}
                      placeholder="المراجعة"
                      selectedValue={project.reviewMode || ""}
                      onSelect={(value) =>
                        handleReviewModeChange(project.id, value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">الروابـــــط</div>
                    <div
                      onClick={() =>
                        startEditing(
                          project.id,
                          "reviewLinks",
                          project.reviewLinks || ""
                        )
                      }
                      className="bg-[#0B0B0B] p-2 rounded-lg cursor-pointer hover:bg-[#1F1F1F] text-white text-sm"
                    >
                      {project.reviewLinks || "---"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">حالة التصميم</div>
                    <CustomDropdown
                      options={DesignModeOptions}
                      placeholder="حالة التصميم"
                      selectedValue={project.designMode || ""}
                      onSelect={(value) =>
                        handleDesignModeChange(project.id, value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">الروابـــــط</div>
                    <div
                      onClick={() =>
                        startEditing(
                          project.id,
                          "designLinks",
                          project.designLinks || ""
                        )
                      }
                      className="bg-[#0B0B0B] p-2 rounded-lg cursor-pointer hover:bg-[#1F1F1F] text-white text-sm"
                    >
                      {project.designLinks || "---"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">التوثيق</div>
                    <div
                      onClick={() =>
                        startEditing(
                          project.id,
                          "documentation",
                          project.documentation || ""
                        )
                      }
                      className="bg-[#0B0B0B] p-2 rounded-lg cursor-pointer hover:bg-[#1F1F1F] text-white text-sm"
                    >
                      {project.documentation || "---"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">تقييم المشروع</div>
                    <CustomDropdown
                      options={VerificationModeOptions}
                      placeholder="التوثيق"
                      selectedValue={project.verificationMode || ""}
                      onSelect={(value) =>
                        handleVerificationModeChange(project.id, value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-[90%]">
        <div className="bg-[#1a1a1a] rounded-[24px] overflow-hidden border border-[#3F3F3F]">
          <div
            className="overflow-x-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#3f3f3f] hover:scrollbar-thumb-[#555555] scrollbar-thumb-rounded-full"
            style={{ position: "relative", zIndex: 1 }}
          >
            <table className="border-collapse w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#3F3F3F]">
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التـــاريخ
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    اســم المشـــــروع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الــــــــــنوع
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابـــــط
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
                    المراجعة
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابـــــط
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    حالة التصميم
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    الروابـــــط
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    التوثيق
                  </th>
                  <th className="py-4 px-4 text-center text-[#CCCCCC] bg-[#161616] border-l border-[#3F3F3F] whitespace-nowrap">
                    تقييم المشروع
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
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
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          onClick={() =>
                            startEditing(project.id, "date", project.date)
                          }
                          className="cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors block"
                          title="انقر للتعديل"
                        >
                          {project.date}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          onClick={() =>
                            startEditing(project.id, "title", project.title)
                          }
                          className="cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors block"
                          title="انقر للتعديل"
                        >
                          {project.title}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                        <CustomDropdown
                          options={projectTypes}
                          placeholder="نوع المشروع"
                          selectedValue={project.type || ""}
                          onSelect={(value) =>
                            handleTypeChange(project.id, value)
                          }
                        />
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          onClick={() =>
                            startEditing(
                              project.id,
                              "fileLinks",
                              project.fileLinks || ""
                            )
                          }
                          className="cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors block"
                          title="انقر للتعديل"
                        >
                          {project.fileLinks || "---"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          onClick={() =>
                            startEditing(
                              project.id,
                              "notes",
                              project.notes || ""
                            )
                          }
                          className="cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors block"
                          title="انقر للتعديل"
                        >
                          {project.notes || "---"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                        <CustomDropdown
                          options={filmingStatusOptions}
                          placeholder="حالة التصوير"
                          selectedValue={project.filmingStatus || ""}
                          onSelect={(value) =>
                            handleFilmingStatusChange(project.id, value)
                          }
                        />
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                        <CustomDropdown
                          options={EditModeOptions}
                          placeholder="وضع التحرير"
                          selectedValue={project.editMode || ""}
                          onSelect={(value) =>
                            handleEditModeChange(project.id, value)
                          }
                        />
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                        <CustomDropdown
                          options={ReviewModeOptions}
                          placeholder="المراجعة"
                          selectedValue={project.reviewMode || ""}
                          onSelect={(value) =>
                            handleReviewModeChange(project.id, value)
                          }
                        />
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          onClick={() =>
                            startEditing(
                              project.id,
                              "reviewLinks",
                              project.reviewLinks || ""
                            )
                          }
                          className="cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors block"
                          title="انقر للتعديل"
                        >
                          {project.reviewLinks || "---"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                        <CustomDropdown
                          options={DesignModeOptions}
                          placeholder="حالة التصميم"
                          selectedValue={project.designMode || ""}
                          onSelect={(value) =>
                            handleDesignModeChange(project.id, value)
                          }
                        />
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          onClick={() =>
                            startEditing(
                              project.id,
                              "designLinks",
                              project.designLinks || ""
                            )
                          }
                          className="cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors block"
                          title="انقر للتعديل"
                        >
                          {project.designLinks || "---"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-white border-l border-[#3F3F3F] whitespace-nowrap">
                        <span
                          onClick={() =>
                            startEditing(
                              project.id,
                              "documentation",
                              project.documentation || ""
                            )
                          }
                          className="cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors block"
                          title="انقر للتعديل"
                        >
                          {project.documentation || "---"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                        <CustomDropdown
                          options={VerificationModeOptions}
                          placeholder="التوثيق"
                          selectedValue={project.verificationMode || ""}
                          onSelect={(value) =>
                            handleVerificationModeChange(project.id, value)
                          }
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

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
            onClick={cancelEdit}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-[#0F0F0F] rounded-2xl p-4 sm:p-8 w-full max-w-2xl mx-4 border border-[#3F3F3F] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h2 className="text-2xl text-white text-center mb-2">
                  تعديل {getFieldLabel(editingField.field)}
                </h2>
                <p className="text-gray-400 text-center">
                  قم بتعديل {getFieldLabel(editingField.field)} للمشروع
                </p>
              </div>

              <div className="mb-6">
                {editingField.field === "notes" ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full bg-[#0B0B0B] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none text-right border border-[#3F3F3F]"
                    placeholder={`أدخل ${getFieldLabel(editingField.field)}...`}
                    autoFocus
                    rows={4}
                  />
                ) : editingField.field === "date" ? (
                  <div className="space-y-4">
                    <div className="text-center text-gray-400 text-sm mb-4">
                      أدخل فترة المشروع (من - إلى)
                    </div>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full bg-[#0B0B0B] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right border border-[#3F3F3F]"
                      placeholder="مثال: 2024-01-01 - 2024-12-31"
                      autoFocus
                    />
                    <div className="text-center text-gray-500 text-xs">
                      يمكنك استخدام تنسيق التاريخ: YYYY-MM-DD - YYYY-MM-DD
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full bg-[#0B0B0B] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right border border-[#3F3F3F]"
                    placeholder={`أدخل ${getFieldLabel(editingField.field)}...`}
                    autoFocus
                  />
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveEdit}
                  className="px-6 py-3 bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-colors"
                >
                  حفظ
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
