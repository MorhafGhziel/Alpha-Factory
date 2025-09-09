"use client";

import { useState } from "react";
import { useTeam } from "../../../utils";
import { useRouter } from "next/navigation";
import { AccountData, ClientData } from "../../../types";
import { motion } from "framer-motion";

interface FormData {
  groupName: string;
  client: ClientData;
  producer: AccountData;
  designer: AccountData;
  reviewer: AccountData;
}

export default function AddAccountPage() {
  const { addTeam } = useTeam();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    groupName: "",
    client: { name: "", number: "", username: "", password: "" },
    producer: { name: "", token: "", chatId: "", username: "", password: "" },
    designer: { name: "", token: "", chatId: "", username: "", password: "" },
    reviewer: { name: "", token: "", chatId: "", username: "", password: "" },
  });
  const [groupNameError, setGroupNameError] = useState("");

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
    // Clear error when user starts typing
    if (value.trim()) {
      setGroupNameError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate group name
    if (!formData.groupName.trim()) {
      setGroupNameError("اسم المجموعة مطلوب");
      return;
    }

    // Clear any previous errors
    setGroupNameError("");

    // Create the team
    addTeam({
      name: formData.groupName,
      client: formData.client,
      producer: formData.producer,
      designer: formData.designer,
      reviewer: formData.reviewer,
    });

    // Redirect to manage accounts page
    router.push("/admin/manageaccount");
  };

  return (
    <div className="min-h-screen md:py-20 py-10">
      {/* Main form container */}
      <div className="mx-auto">
        {/* Header */}
        <motion.div
          className="bg-[#0f0f0f] rounded-3xl px-10 py-4 md:mb-23 mb-14 inline-block mx-auto"
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6,
          }}
        >
          <h1 className="text-white text-2xl font-semibold text-center">
            اضافة حساب
          </h1>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-[#0f0f0f] rounded-3xl p-8 md:max-w-6xl max-w-[320px] mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.2,
            duration: 0.6,
          }}
        >
          {/* Group Name Input */}
          <motion.div
            className="mb-14 flex flex-col items-center"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <input
              type="text"
              placeholder="ادخــــل   اســــــــــــم   المجــــمـــوعة"
              value={formData.groupName}
              onChange={(e) => handleGroupNameChange(e.target.value)}
              className={`w-auto min-w-[310px] bg-[#0B0B0B] text-white placeholder-[#A9A9A9] rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#E9CF6B] ${
                groupNameError ? "border-2 border-red-500" : ""
              }`}
            />
            {groupNameError && (
              <motion.div
                className="text-red-500 text-sm mt-2 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {groupNameError}
              </motion.div>
            )}
          </motion.div>

          {/* Account Role Sections */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Client Section */}
            <motion.div
              className="space-y-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
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
              <input
                type="text"
                placeholder="Username"
                value={formData.client.username}
                onChange={(e) =>
                  handleInputChange("client", "username", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.client.password}
                onChange={(e) =>
                  handleInputChange("client", "password", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </motion.div>

            {/* Producer Section */}
            <motion.div
              className="space-y-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
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
              <input
                type="text"
                placeholder="Username"
                value={formData.producer.username}
                onChange={(e) =>
                  handleInputChange("producer", "username", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.producer.password}
                onChange={(e) =>
                  handleInputChange("producer", "password", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </motion.div>

            {/* Designer Section */}
            <motion.div
              className="space-y-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
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
              <input
                type="text"
                placeholder="Username"
                value={formData.designer.username}
                onChange={(e) =>
                  handleInputChange("designer", "username", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.designer.password}
                onChange={(e) =>
                  handleInputChange("designer", "password", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </motion.div>

            {/* Reviewer Section */}
            <motion.div
              className="space-y-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
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
              <input
                type="text"
                placeholder="Username"
                value={formData.reviewer.username}
                onChange={(e) =>
                  handleInputChange("reviewer", "username", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.reviewer.password}
                onChange={(e) =>
                  handleInputChange("reviewer", "password", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
            </motion.div>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <button
              type="submit"
              className="bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-[#272727] text-[14px] py-1 px-4 rounded-3xl hover:scale-105 transition font-bold cursor-pointer"
            >
              الاستمرار
            </button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
