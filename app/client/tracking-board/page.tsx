"use client";

import { useState } from "react";
import CustomDropdown from "@/components/ui/CustomDropdown";

export default function ClientTrackingBoardPage() {
  const [selectedTypes, setSelectedTypes] = useState<{ [key: number]: string }>(
    {}
  );
  const [selectedEditMode, setSelectedEditMode] = useState<{
    [key: number]: string;
  }>({});
  const [selectedFilmingStatus, setSelectedFilmingStatus] = useState<{
    [key: number]: string;
  }>({});
  const [selectedReviewMode, setSelectedReviewMode] = useState<{
    [key: number]: string;
  }>({});
  const [selectedDesignMode, setSelectedDesignMode] = useState<{
    [key: number]: string;
  }>({});
  const [selectedVerificationMode, setSelectedVerificationMode] = useState<{
    [key: number]: string;
  }>({});
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

  const handleTypeChange = (rowIndex: number, type: string) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [rowIndex]: type,
    }));
  };

  const handleEditModeChange = (rowIndex: number, mode: string) => {
    setSelectedEditMode((prev) => ({
      ...prev,
      [rowIndex]: mode,
    }));
  };
  const handleFilmingStatusChange = (rowIndex: number, status: string) => {
    setSelectedFilmingStatus((prev) => ({
      ...prev,
      [rowIndex]: status,
    }));
  };
  const handleReviewModeChange = (rowIndex: number, mode: string) => {
    setSelectedReviewMode((prev) => ({
      ...prev,
      [rowIndex]: mode,
    }));
  };
  const handleDesignModeChange = (rowIndex: number, mode: string) => {
    setSelectedDesignMode((prev) => ({
      ...prev,
      [rowIndex]: mode,
    }));
  };
  const handleVerificationModeChange = (rowIndex: number, mode: string) => {
    setSelectedVerificationMode((prev) => ({
      ...prev,
      [rowIndex]: mode,
    }));
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
                {[...Array(15)].map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#3F3F3F] hover:bg-[#141414] transition-colors"
                  >
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      <CustomDropdown
                        options={projectTypes}
                        placeholder="نوع المشروع"
                        selectedValue={selectedTypes[index] || ""}
                        onSelect={(value) => handleTypeChange(index, value)}
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      <CustomDropdown
                        options={filmingStatusOptions}
                        placeholder="حالة التصوير"
                        selectedValue={selectedFilmingStatus[index] || ""}
                        onSelect={(value) =>
                          handleFilmingStatusChange(index, value)
                        }
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      <CustomDropdown
                        options={EditModeOptions}
                        placeholder="وضع التحرير"
                        selectedValue={selectedEditMode[index] || ""}
                        onSelect={(value) => handleEditModeChange(index, value)}
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      <CustomDropdown
                        options={ReviewModeOptions}
                        placeholder="المراجعة"
                        selectedValue={selectedReviewMode[index] || ""}
                        onSelect={(value) =>
                          handleReviewModeChange(index, value)
                        }
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      <CustomDropdown
                        options={DesignModeOptions}
                        placeholder="حالة التصميم	"
                        selectedValue={selectedDesignMode[index] || ""}
                        onSelect={(value) =>
                          handleDesignModeChange(index, value)
                        }
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      ###
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 border-l border-[#3F3F3F] whitespace-nowrap">
                      <CustomDropdown
                        options={VerificationModeOptions}
                        placeholder="التوثيق"
                        selectedValue={selectedVerificationMode[index] || ""}
                        onSelect={(value) =>
                          handleVerificationModeChange(index, value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
