"use client";

import { useState } from "react";

interface AccountData {
  name: string;
  token: string;
  chatId: string;
}

interface ClientData {
  name: string;
  number: string;
}

interface FormData {
  groupName: string;
  client: ClientData;
  producer: AccountData;
  designer: AccountData;
  reviewer: AccountData;
}

export default function AddAccountPage() {
  const [formData, setFormData] = useState<FormData>({
    groupName: "",
    client: { name: "", number: "" },
    producer: { name: "", token: "", chatId: "" },
    designer: { name: "", token: "", chatId: "" },
    reviewer: { name: "", token: "", chatId: "" },
  });

  const handleInputChange = (
    section: keyof Omit<FormData, "groupName">,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleGroupNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      groupName: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen py-20">
      {/* Main form container */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#0f0f0f] rounded-3xl px-10 py-4 mb-34 inline-block mx-auto">
          <h1 className="text-white text-2xl font-semibold text-center">
            اضافة حساب
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#0f0f0f] rounded-3xl p-8">
          {/* Group Name Input */}
          <div className="mb-14 flex justify-center">
            <input
              type="text"
              placeholder="ادخــــل   اســــــــــــم   المجــــمـــوعة"
              value={formData.groupName}
              onChange={(e) => handleGroupNameChange(e.target.value)}
              className="w-auto min-w-[310px] bg-[#0B0B0B] text-white placeholder-[#A9A9A9] rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
            />
          </div>

          {/* Account Role Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-30">
            {/* Client Section */}
            <div className="space-y-4">
              <h2 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                عميل
              </h2>
              <input
                type="text"
                placeholder="Name"
                value={formData.client.name}
                onChange={(e) =>
                  handleInputChange("client", "name", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="Number"
                value={formData.client.number}
                onChange={(e) =>
                  handleInputChange("client", "number", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </div>

            {/* Producer Section */}
            <div className="space-y-4">
              <h2 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                ممنتج
              </h2>
              <input
                type="text"
                placeholder="Name"
                value={formData.producer.name}
                onChange={(e) =>
                  handleInputChange("producer", "name", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="Token"
                value={formData.producer.token}
                onChange={(e) =>
                  handleInputChange("producer", "token", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="CHAT_ID"
                value={formData.producer.chatId}
                onChange={(e) =>
                  handleInputChange("producer", "chatId", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </div>

            {/* Designer Section */}
            <div className="space-y-4">
              <h2 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                مصمم
              </h2>
              <input
                type="text"
                placeholder="Name"
                value={formData.designer.name}
                onChange={(e) =>
                  handleInputChange("designer", "name", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="Token"
                value={formData.designer.token}
                onChange={(e) =>
                  handleInputChange("designer", "token", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="CHAT_ID"
                value={formData.designer.chatId}
                onChange={(e) =>
                  handleInputChange("designer", "chatId", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </div>

            {/* Reviewer Section */}
            <div className="space-y-4">
              <h2 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                مُراجع
              </h2>
              <input
                type="text"
                placeholder="Name"
                value={formData.reviewer.name}
                onChange={(e) =>
                  handleInputChange("reviewer", "name", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="Token"
                value={formData.reviewer.token}
                onChange={(e) =>
                  handleInputChange("reviewer", "token", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="CHAT_ID"
                value={formData.reviewer.chatId}
                onChange={(e) =>
                  handleInputChange("reviewer", "chatId", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-[#272727] text-[14px] py-1 px-4 rounded-3xl hover:scale-105 transition font-bold cursor-pointer"
            >
              الاستمرار
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
