"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface UserFormData {
  name: string;
  email: string;
  role: string;
}

interface Group {
  id: string;
  name: string;
  createdAt: string;
  users: any[];
}

export default function CreateAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    groupName: "",
    telegramChatId: "",
  });
  const [users, setUsers] = useState<UserFormData[]>([
    { name: "", email: "", role: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [createNewGroup, setCreateNewGroup] = useState(true);
  const [createStandalone, setCreateStandalone] = useState(false);

  const roles = [
    { value: "admin", label: "مدير" },
    { value: "client", label: "عميل" },
    { value: "editor", label: "محرر" },
    { value: "designer", label: "مصمم" },
    { value: "reviewer", label: "مراجع" },
  ];

  // Filter roles based on standalone mode
  const availableRoles = createStandalone 
    ? roles.filter(role => role.value !== "client") // Exclude clients for standalone accounts
    : roles;

  useEffect(() => {
    fetchGroups();
  }, []);

  // Clear client roles when switching to standalone mode
  useEffect(() => {
    if (createStandalone) {
      setUsers(users.map(user => 
        user.role === "client" ? { ...user, role: "" } : user
      ));
    }
  }, [createStandalone]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/admin-panel/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const addUser = () => {
    setUsers([...users, { name: "", email: "", role: "" }]);
  };

  const removeUser = (index: number) => {
    if (users.length > 1) {
      const newUsers = users.filter((_, i) => i !== index);
      setUsers(newUsers);
    }
  };

  const updateUser = (index: number, field: keyof UserFormData, value: string) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Validation
    if (!createStandalone) {
      if (createNewGroup && !formData.groupName.trim()) {
        setSubmitError("اسم المجموعة مطلوب عند إنشاء مجموعة جديدة");
        setIsSubmitting(false);
        return;
      }

      if (!createNewGroup && !selectedGroup) {
        setSubmitError("يرجى اختيار مجموعة موجودة");
        setIsSubmitting(false);
        return;
      }
    }

    for (const user of users) {
      // For all users, require name, email and role
      if (!user.name || !user.email) {
        setSubmitError("الاسم والبريد الإلكتروني مطلوبان لجميع المستخدمين");
        setIsSubmitting(false);
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        setSubmitError("البريد الإلكتروني غير صحيح");
        setIsSubmitting(false);
        return;
      }
      
      if (!user.role) {
        setSubmitError("الدور مطلوب لكل مستخدم");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let endpoint: string;
      let requestBody: any;

      if (createStandalone) {
        // Create standalone accounts without groups
        endpoint = "/api/admin-panel/standalone-accounts";
        requestBody = {
          users: users,
        };
      } else {
        // Create accounts with groups
        endpoint = "/api/admin-panel/accounts";
        requestBody = {
          users: users,
          telegramChatId: formData.telegramChatId || undefined,
        };

        if (createNewGroup) {
          // Create new group
          requestBody.groupName = formData.groupName;
        } else {
          // Add to existing group
          requestBody.groupId = selectedGroup;
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل في إنشاء الحسابات");
      }

      // Show credentials modal with generated passwords
      if (data.credentials) {
        setGeneratedCredentials(data.credentials);
        setShowCredentialsModal(true);
      } else {
        // Fallback to redirect if no credentials
        router.push("/admin-panel/accounts");
      }
    } catch (error) {
      console.error("Error creating accounts:", error);
      setSubmitError(
        error instanceof Error ? error.message : "حدث خطأ في إنشاء الحسابات"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    const credentialsText = generatedCredentials
      .map(
        (cred) =>
          `الاسم: ${cred.name}\nاسم المستخدم: ${cred.username}\nكلمة المرور: ${cred.password}\nالدور: ${cred.role}\n---`
      )
      .join("\n");
    
    navigator.clipboard.writeText(credentialsText);
  };

  const closeCredentialsModal = () => {
    setShowCredentialsModal(false);
    router.push("/admin-panel/accounts");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          إنشاء حساب جديد
        </h1>
        <p className="text-gray-400">
          إضافة مستخدمين جدد للنظام
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-[#0f0f0f] rounded-3xl p-8 border border-gray-800"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Group Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">إعداد الحساب</h2>
            
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={createStandalone}
                  onChange={() => {
                    setCreateStandalone(true);
                    setCreateNewGroup(false);
                  }}
                  className="w-4 h-4 text-[#E9CF6B] bg-gray-800 border-gray-600 focus:ring-[#E9CF6B]"
                />
                <span className="text-gray-300">إنشاء حساب مستقل (بدون مجموعة)</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!createStandalone && createNewGroup}
                  onChange={() => {
                    setCreateStandalone(false);
                    setCreateNewGroup(true);
                  }}
                  className="w-4 h-4 text-[#E9CF6B] bg-gray-800 border-gray-600 focus:ring-[#E9CF6B]"
                />
                <span className="text-gray-300">إنشاء مجموعة جديدة</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!createStandalone && !createNewGroup}
                  onChange={() => {
                    setCreateStandalone(false);
                    setCreateNewGroup(false);
                  }}
                  className="w-4 h-4 text-[#E9CF6B] bg-gray-800 border-gray-600 focus:ring-[#E9CF6B]"
                />
                <span className="text-gray-300">إضافة لمجموعة موجودة</span>
              </label>
            </div>

            {!createStandalone && (
              createNewGroup ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      اسم المجموعة *
                    </label>
                    <input
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
                      placeholder="مثال: فريق التطوير"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      معرف مجموعة تيليجرام (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.telegramChatId}
                      onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
                      placeholder="مثال: -1001234567890"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    اختر المجموعة *
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
                    required
                  >
                    <option value="">اختر مجموعة</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.users.length} مستخدم)
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            {createStandalone && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-300 text-sm">
                    سيتم إنشاء الحسابات بدون ربطها بأي مجموعة. مناسب للمدراء .
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Users Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">بيانات المستخدمين</h2>
              <button
                type="button"
                onClick={addUser}
                className="bg-[#E9CF6B] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>إضافة مستخدم</span>
              </button>
            </div>

            {users.map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#E9CF6B]">
                    المستخدم {index + 1}
                  </h3>
                  {users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUser(index)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      الاسم *
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => updateUser(index, "name", e.target.value)}
                      className="w-full px-4 py-3 bg-[#0B0B0B] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
                      placeholder="اسم المستخدم"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      الدور *
                    </label>
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(index, "role", e.target.value)}
                      className="w-full px-4 py-3 bg-[#0B0B0B] border border-gray-600 rounded-lg text-white focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
                      required
                    >
                      <option value="">اختر الدور</option>
                      {availableRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => updateUser(index, "email", e.target.value)}
                      className="w-full px-4 py-3 bg-[#0B0B0B] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
                      placeholder="example@domain.com"
                      required
                    />
                  </div>

                </div>
              </motion.div>
            ))}
          </div>

          {/* Error Message */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200"
            >
              {submitError}
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#E9CF6B] text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>إنشاء الحسابات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Credentials Modal */}
      <AnimatePresence>
        {showCredentialsModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-2xl bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-[#0f0f0f] rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
            >
              <h3 className="text-white text-2xl font-semibold mb-6 text-center">
                تم إنشاء الحسابات بنجاح!
              </h3>
              
              <div className="mb-6">
                <button
                  onClick={copyCredentials}
                  className="w-full bg-[#E9CF6B] text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors mb-4 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>نسخ جميع بيانات الدخول</span>
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {generatedCredentials.map((credential, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-400 text-sm">الاسم:</div>
                        <div className="text-white font-medium">{credential.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">الدور:</div>
                        <div className="text-white font-medium">{credential.role}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">اسم المستخدم:</div>
                        <div className="text-green-400 font-mono">{credential.username}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">كلمة المرور:</div>
                        <div className="text-green-400 font-mono font-bold">{credential.password}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={closeCredentialsModal}
                  className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  إغلاق والانتقال لإدارة الحسابات
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
