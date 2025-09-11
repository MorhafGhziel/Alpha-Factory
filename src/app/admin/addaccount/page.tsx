"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authClient } from "@/src/lib/auth-client";

interface UserFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

interface FormData {
  groupName: string;
  client: UserFormData;
  editor: UserFormData;
  designer: UserFormData;
  reviewer: UserFormData;
}

export default function AddAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    groupName: "",
    client: { name: "", email: "", username: "", password: "", role: "client" },
    editor: { name: "", email: "", username: "", password: "", role: "editor" },
    designer: { name: "", email: "", username: "", password: "", role: "designer" },
    reviewer: { name: "", email: "", username: "", password: "", role: "reviewer" },
  });
  const [groupNameError, setGroupNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Validate group name
    if (!formData.groupName.trim()) {
      setGroupNameError("اسم المجموعة مطلوب");
      setIsSubmitting(false);
      return;
    }

    // Clear any previous errors
    setGroupNameError("");

    // Validate that all users have required fields
    const users = [formData.client, formData.editor, formData.designer, formData.reviewer];
    for (const user of users) {
      if (!user.name || !user.email || !user.username || !user.password) {
        setSubmitError("جميع الحقول مطلوبة لكل مستخدم");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Create group and users using our custom API
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: formData.groupName,
          users: users,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إنشاء المجموعة والحسابات');
      }

      // Success - redirect to manage accounts page
      router.push("/admin/manageaccount");
    } catch (error) {
      console.error("Error creating accounts:", error);
      setSubmitError(error instanceof Error ? error.message : "حدث خطأ في إنشاء الحسابات");
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Submit Error Display */}
          {submitError && (
            <motion.div
              className="mb-6 flex justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-center max-w-md">
                {submitError}
              </div>
            </motion.div>
          )}

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
                type="email"
                placeholder="Email"
                value={formData.client.email}
                onChange={(e) =>
                  handleInputChange("client", "email", e.target.value)
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

            {/* Editor Section */}
            <motion.div
              className="space-y-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h2 className="text-[#E9CF6B] text-lg font-semibold text-center bg-[#0B0B0B] rounded-full py-1">
                محرر
              </h2>
              <input
                type="text"
                placeholder="Name"
                value={formData.editor.name}
                onChange={(e) =>
                  handleInputChange("editor", "name", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.editor.email}
                onChange={(e) =>
                  handleInputChange("editor", "email", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="text"
                placeholder="Username"
                value={formData.editor.username}
                onChange={(e) =>
                  handleInputChange("editor", "username", e.target.value)
                }
                className="w-full bg-[#0B0B0B] text-white placeholder-[#A9A9A9]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9CF6B]"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.editor.password}
                onChange={(e) =>
                  handleInputChange("editor", "password", e.target.value)
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
                type="email"
                placeholder="Email"
                value={formData.designer.email}
                onChange={(e) =>
                  handleInputChange("designer", "email", e.target.value)
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
                type="email"
                placeholder="Email"
                value={formData.reviewer.email}
                onChange={(e) =>
                  handleInputChange("reviewer", "email", e.target.value)
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
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-[#272727] text-[14px] py-1 px-4 rounded-3xl hover:scale-105 transition font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? "جاري الإنشاء..." : "الاستمرار"}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
