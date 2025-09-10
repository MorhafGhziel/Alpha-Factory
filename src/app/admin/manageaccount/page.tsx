"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
  emailVerified: boolean;
}

export default function ManageAccountPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    field: 'name' | 'email';
    value: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  } | null>(null);

  // Auto-hide messages after 5 seconds
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

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditStart = (userId: string, field: 'name' | 'email', currentValue: string) => {
    setEditingUser({ id: userId, field, value: currentValue });
  };

  const handleEditSave = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [editingUser.field]: editingUser.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editingUser.id ? data.user : user
        )
      );
      
      setEditingUser(null);
      setError(null);
      setSuccessMessage(`تم تحديث ${editingUser.field === 'name' ? 'الاسم' : 'البريد الإلكتروني'} بنجاح`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteConfirm({ show: true, userId, userName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/admin/users/${deleteConfirm.userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Remove user from local state
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== deleteConfirm.userId)
      );
      
      setDeleteConfirm(null);
      setError(null);
      setSuccessMessage('تم حذف الحساب بنجاح');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen md:py-20 py-10">
      {/* Header */}
      <motion.div
        className="bg-[#0f0f0f] rounded-3xl px-10 py-4 md:mb-34 mb-14 inline-block mx-auto"
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
          ادارة الحسابات
        </h1>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="max-w-6xl mx-auto px-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-300 hover:text-red-100 ml-2"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          className="max-w-6xl mx-auto px-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 text-green-200 flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-300 hover:text-green-100 ml-2"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Users Container */}
      <motion.div
        className="max-w-6xl mx-auto px-4"
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
        {loading ? (
          <motion.div
            className="text-center text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            جاري تحميل الحسابات...
          </motion.div>
        ) : users.length === 0 ? (
          <motion.div
            className="text-center text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            لا توجد حسابات بعد.
          </motion.div>
        ) : (
          <div className="space-y-6">
            {users.map((user: User, index: number) => (
              <motion.div
                key={user.id}
                className="bg-[#0f0f0f] rounded-3xl overflow-hidden"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.3 + index * 0.1,
                  duration: 0.6,
                }}
              >
                {/* User Card */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#E9CF6B] rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[#E9CF6B] text-lg font-semibold">
                          {user.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'No Role'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-red-900/20"
                    >
                      حذف الحساب
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-sm mb-1">الاسم:</div>
                        <button
                          onClick={() => handleEditStart(user.id, 'name', user.name)}
                          className="text-xs text-[#E9CF6B] hover:text-white transition-colors"
                        >
                          تعديل
                        </button>
                      </div>
                      {editingUser?.id === user.id && editingUser?.field === 'name' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingUser.value}
                            onChange={(e) => setEditingUser({ ...editingUser, value: e.target.value })}
                            className="flex-1 bg-[#1a1a1a] text-white px-2 py-1 rounded text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                          />
                          <button
                            onClick={handleEditSave}
                            className="text-green-400 hover:text-green-300 text-xs"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-200 text-sm">{user.name}</div>
                      )}
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.05, duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-sm mb-1">البريد الإلكتروني:</div>
                        <button
                          onClick={() => handleEditStart(user.id, 'email', user.email)}
                          className="text-xs text-[#E9CF6B] hover:text-white transition-colors"
                        >
                          تعديل
                        </button>
                      </div>
                      {editingUser?.id === user.id && editingUser?.field === 'email' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="email"
                            value={editingUser.value}
                            onChange={(e) => setEditingUser({ ...editingUser, value: e.target.value })}
                            className="flex-1 bg-[#1a1a1a] text-white px-2 py-1 rounded text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                          />
                          <button
                            onClick={handleEditSave}
                            className="text-green-400 hover:text-green-300 text-xs"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-200 text-sm">{user.email}</div>
                      )}
                    </motion.div>

                    {/* Role Field - Read Only */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-sm mb-1">الدور:</div>
                      <div className="text-gray-200 text-sm">
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'لا يوجد دور'}
                      </div>
                    </motion.div>

                    {/* Created Date - Read Only */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.05, duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-sm mb-1">تاريخ الإنشاء:</div>
                      <div className="text-gray-200 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </motion.div>

                    {/* Email Verified Status */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.05, duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-sm mb-1">حالة التحقق:</div>
                      <div className={`text-sm ${user.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
                        {user.emailVerified ? 'محقق' : 'غير محقق'}
                      </div>
                    </motion.div>

                    {/* User ID - Read Only */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.05, duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-sm mb-1">معرف المستخدم:</div>
                      <div className="text-gray-200 text-xs font-mono break-all">
                        {user.id}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 backdrop-blur-2xl bg-black/20 bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-[#0f0f0f] rounded-3xl p-8 text-center"
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
              <h3 className="text-white text-xl font-semibold mb-4">
                تأكيد الحذف
              </h3>
              <p className="text-gray-300 mb-6">
                هذا الاجراء غير قابل للتراجع , هل أنت متأكد من حذف الحساب{" "}
                <br />
                &quot;{deleteConfirm.userName}&quot; ؟
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDelete}
                  className="bg-[#E9CF6B] cursor-pointer text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  تأكيد الحذف
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-700 cursor-pointer text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
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
