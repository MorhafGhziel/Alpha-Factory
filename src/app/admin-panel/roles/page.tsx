"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

interface RoleChangeRequest {
  userId: string;
  newRole: string;
  userName: string;
}

export default function RoleManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [roleChangeModal, setRoleChangeModal] = useState<RoleChangeRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const roles = [
    { value: "admin", label: "مدير", color: "bg-red-500" },
    { value: "client", label: "عميل", color: "bg-blue-500" },
    { value: "editor", label: "محرر", color: "bg-green-500" },
    { value: "designer", label: "مصمم", color: "bg-purple-500" },
    { value: "reviewer", label: "مراجع", color: "bg-orange-500" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-panel/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, userName: string, newRole: string) => {
    setRoleChangeModal({ userId, newRole, userName });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeModal) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin-panel/users/${roleChangeModal.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: roleChangeModal.newRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      const data = await response.json();
      
      // Update user in local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === roleChangeModal.userId ? data.user : user
        )
      );
      
      setRoleChangeModal(null);
      setError(null);
      setSuccessMessage(`تم تحديث دور ${roleChangeModal.userName} بنجاح`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelRoleChange = () => {
    setRoleChangeModal(null);
  };

  const getRoleInArabic = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getRoleColor = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.color : 'bg-gray-500';
  };

  const groupedUsers = roles.reduce((acc, role) => {
    acc[role.value] = users.filter(user => user.role === role.value);
    return acc;
  }, {} as Record<string, User[]>);

  // Add users without roles
  groupedUsers['no_role'] = users.filter(user => !user.role || !roles.some(r => r.value === user.role));

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
          إدارة الأدوار
        </h1>
        <p className="text-gray-400">
          تعيين وتعديل أدوار المستخدمين في النظام
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200 flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100 ml-2"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-green-900/50 border border-green-500 rounded-lg p-4 text-green-200 flex items-center justify-between"
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-300 hover:text-green-100 ml-2"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <motion.div
          className="text-center text-gray-400 text-lg py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          جاري تحميل المستخدمين...
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Role Groups */}
          {roles.map((role, roleIndex) => (
            <motion.div
              key={role.value}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + roleIndex * 0.1 }}
              className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${role.color} rounded-full`}></div>
                  <h2 className="text-xl font-semibold text-white">
                    {role.label}
                  </h2>
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm">
                    {groupedUsers[role.value]?.length || 0} مستخدم
                  </span>
                </div>
              </div>

              {groupedUsers[role.value]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedUsers[role.value].map((user, userIndex) => (
                    <motion.div
                      key={user.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: userIndex * 0.05 }}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-[#E9CF6B] rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium text-sm">
                              {user.name}
                            </h3>
                            <p className="text-gray-400 text-xs">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-gray-400 text-xs mb-1">
                          تغيير الدور:
                        </label>
                        <select
                          value={user.role || ''}
                          onChange={(e) => {
                            if (e.target.value !== user.role) {
                              handleRoleChange(user.id, user.name, e.target.value);
                            }
                          }}
                          className="w-full bg-[#0B0B0B] border border-gray-600 rounded text-white text-sm px-2 py-1 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B]"
                        >
                          <option value="">اختر الدور</option>
                          {roles.map(r => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  لا يوجد مستخدمون بهذا الدور
                </div>
              )}
            </motion.div>
          ))}

          {/* Users without roles */}
          {groupedUsers['no_role']?.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">
                    بدون دور محدد
                  </h2>
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm">
                    {groupedUsers['no_role'].length} مستخدم
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedUsers['no_role'].map((user, userIndex) => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: userIndex * 0.05 }}
                    className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#E9CF6B] rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm">
                            {user.name}
                          </h3>
                          <p className="text-gray-400 text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-gray-400 text-xs mb-1">
                        تعيين دور:
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleRoleChange(user.id, user.name, e.target.value);
                          }
                        }}
                        className="w-full bg-[#0B0B0B] border border-gray-600 rounded text-white text-sm px-2 py-1 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B]"
                      >
                        <option value="">اختر الدور</option>
                        {roles.map(r => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Role Change Confirmation Modal */}
      <AnimatePresence>
        {roleChangeModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-2xl bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-[#0f0f0f] rounded-3xl p-8 max-w-md w-full mx-4"
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
              <h3 className="text-white text-xl font-semibold mb-4 text-center">
                تأكيد تغيير الدور
              </h3>
              <p className="text-gray-300 mb-6 text-center">
                هل أنت متأكد من تغيير دور المستخدم{" "}
                <span className="text-[#E9CF6B] font-semibold">
                  &quot;{roleChangeModal.userName}&quot;
                </span>
                {" "}إلى{" "}
                <span className="text-[#E9CF6B] font-semibold">
                  &quot;{getRoleInArabic(roleChangeModal.newRole)}&quot;
                </span>
                ؟
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmRoleChange}
                  disabled={isUpdating}
                  className="bg-[#E9CF6B] cursor-pointer text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>جاري التحديث...</span>
                    </>
                  ) : (
                    <span>تأكيد التغيير</span>
                  )}
                </button>
                <button
                  onClick={cancelRoleChange}
                  disabled={isUpdating}
                  className="bg-gray-700 cursor-pointer text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
