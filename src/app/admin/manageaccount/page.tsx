"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generatePassword } from "../../../utils/credentials";

interface User {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone?: string | null;
  role: string | null;
  createdAt: string;
  emailVerified: boolean;
}

interface Group {
  id: string;
  name: string;
  createdAt: string;
  users: User[];
  telegramInviteLink?: string;
  telegramGroupName?: string;
  telegramChatId?: string;
}

export default function ManageAccountPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    field: 'name' | 'email' | 'phone';
    value: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  } | null>(null);
  const [changePasswordModal, setChangePasswordModal] = useState<{
    show: boolean;
    userId: string;
    userName: string;
    generatedPassword?: string;
  } | null>(null);
  
  // Delete group confirmation
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<{
    show: boolean;
    groupId: string;
    groupName: string;
    userCount: number;
  } | null>(null);
  
  const [passwordError, setPasswordError] = useState('');

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

  // Fetch current user role
  const fetchCurrentUserRole = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setCurrentUserRole(data.user?.role || null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/groups');
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setGroups(data.groups);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUserRole();
    fetchGroups();
  }, []);

  const handleEditStart = (userId: string, field: 'name' | 'email' | 'phone', currentValue: string) => {
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
      setGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          users: group.users.map(user => 
            user.id === editingUser.id ? data.user : user
          )
        }))
      );
      
      setEditingUser(null);
      setError(null);
      setSuccessMessage(`تم تحديث ${editingUser.field === 'name' ? 'الاسم' : editingUser.field === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'} بنجاح`);
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
      setGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          users: group.users.filter(user => user.id !== deleteConfirm.userId)
        })).filter(group => group.users.length > 0) // Remove empty groups
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

  const handleChangePassword = (userId: string, userName: string) => {
    const generatedPassword = generatePassword();
    setChangePasswordModal({ 
      show: true, 
      userId, 
      userName, 
      generatedPassword 
    });
    setPasswordError('');
  };

  const confirmChangePassword = async () => {
    if (!changePasswordModal || !changePasswordModal.generatedPassword) return;

    try {
      const response = await fetch(`/api/admin/users/${changePasswordModal.userId}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: changePasswordModal.generatedPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setChangePasswordModal(null);
      setPasswordError('');
      setError(null);
      setSuccessMessage('تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const regeneratePassword = () => {
    if (!changePasswordModal) return;
    
    const newGeneratedPassword = generatePassword();
    setChangePasswordModal({
      ...changePasswordModal,
      generatedPassword: newGeneratedPassword
    });
  };

  const copyPasswordToClipboard = () => {
    if (changePasswordModal?.generatedPassword) {
      navigator.clipboard.writeText(changePasswordModal.generatedPassword);
      setSuccessMessage('تم نسخ كلمة المرور إلى الحافظة');
    }
  };

  const cancelChangePassword = () => {
    setChangePasswordModal(null);
    setPasswordError('');
  };

  const handleDeleteGroup = (groupId: string, groupName: string, userCount: number) => {
    setDeleteGroupConfirm({ 
      show: true, 
      groupId, 
      groupName, 
      userCount 
    });
  };

  const confirmDeleteGroup = async () => {
    if (!deleteGroupConfirm) return;

    try {
      const response = await fetch('/api/admin/groups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: deleteGroupConfirm.groupId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete group');
      }

      // Remove group from local state
      setGroups(prevGroups => 
        prevGroups.filter(group => group.id !== deleteGroupConfirm.groupId)
      );
      
      setDeleteGroupConfirm(null);
      setError(null);
      setSuccessMessage(`تم حذف المجموعة "${deleteGroupConfirm.groupName}" وجميع حساباتها بنجاح`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const cancelDeleteGroup = () => {
    setDeleteGroupConfirm(null);
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
            جاري تحميل المجموعات...
          </motion.div>
        ) : groups.length === 0 ? (
          <motion.div
            className="text-center text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            لا توجد مجموعات بعد.
          </motion.div>
        ) : (
          <div className="space-y-8">
            {groups.map((group: Group, groupIndex: number) => (
              <motion.div
                key={group.id}
                className="bg-[#0f0f0f] rounded-3xl overflow-hidden"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.3 + groupIndex * 0.1,
                  duration: 0.6,
                }}
              >
                {/* Group Header */}
                <div className="bg-[#E9CF6B] px-6 py-4 relative">
                  <h2 className="text-black text-xl font-bold text-center">
                    مجموعة: {group.name}
                  </h2>
                  <p className="text-black/70 text-sm text-center mt-1">
                    تاريخ الإنشاء: {(() => {
                      const date = new Date(group.createdAt);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}/${month}/${day}`;
                    })()}
                  </p>
                  
                  {/* Delete Group Button */}
                  {currentUserRole !== "supervisor" && (
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name, group.users.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200 shadow-lg"
                      title="حذف المجموعة وجميع الحسابات"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Telegram Group Section */}
                {group.telegramInviteLink && (
                  <motion.div
                    className="bg-[#1a1a1a] mx-6 mt-6 rounded-2xl p-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.2 + groupIndex * 0.1,
                      duration: 0.3,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.43l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.5.24l.18-2.51 4.62-4.18c.2-.18-.04-.28-.32-.1L9.74 13.8l-2.45-.77c-.53-.16-.54-.53.11-.79L19.24 7.4c.44-.16.83.11.69.76z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[#0088cc] text-lg font-semibold">
                            مجموعة تيليجرام
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {group.telegramGroupName || `Alpha Factory - ${group.name}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
                      <div className="text-gray-400 text-sm mb-2">رابط الانضمام:</div>
                      <div className="flex items-center justify-between">
                        <div className="text-[#0088cc] text-sm font-mono bg-[#1a1a1a] px-3 py-2 rounded flex-1 mr-3 break-all">
                          {group.telegramInviteLink}
                        </div>
                      
                      </div>
                      
                      <div className="mt-3">
                        <a
                          href={group.telegramInviteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-[#E9CF6B] hover:bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.43l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.5.24l.18-2.51 4.62-4.18c.2-.18-.04-.28-.32-.1L9.74 13.8l-2.45-.77c-.53-.16-.54-.53.11-.79L19.24 7.4c.44-.16.83.11.69.76z"/>
                          </svg>
                          <span>انضم للمجموعة</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Users in Group */}
                <div className="p-6 space-y-6">
                  {group.users.map((user: User, userIndex: number) => (
                    <motion.div
                      key={user.id}
                      className="bg-[#1a1a1a] rounded-2xl p-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: 0.4 + groupIndex * 0.1 + userIndex * 0.05,
                        duration: 0.3,
                      }}
                    >
                      {/* User Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#E9CF6B] rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
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
                        <div className="flex space-x-2">
                          {currentUserRole !== "supervisor" && (
                            <button
                              onClick={() => handleChangePassword(user.id, user.name)}
                              className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-blue-900/20"
                            >
                              تغيير كلمة المرور
                            </button>
                          )}
                          {currentUserRole !== "supervisor" && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-red-900/20"
                            >
                              حذف الحساب
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Name Field */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + groupIndex * 0.1 + userIndex * 0.05, duration: 0.2 }}
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
                      transition={{ delay: 0.4 + groupIndex * 0.1 + userIndex * 0.05, duration: 0.2 }}
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

                    {/* Username Field - Read Only */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.45 + groupIndex * 0.1 + userIndex * 0.05, duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-sm mb-1">اسم المستخدم:</div>
                      <div className="text-gray-200 text-sm font-mono bg-[#1a1a1a] px-2 py-1 rounded">
                        {user.username || 'غير محدد'}
                      </div>
                    </motion.div>

                    {/* Role Field - Read Only */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + groupIndex * 0.1 + userIndex * 0.05, duration: 0.2 }}
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
                      transition={{ delay: 0.6 + groupIndex * 0.1 + userIndex * 0.05, duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-sm mb-1">تاريخ الإنشاء:</div>
                      <div className="text-gray-200 text-sm">
                        {(() => {
                          const date = new Date(user.createdAt);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          return `${year}/${month}/${day}`;
                        })()}
                      </div>
                    </motion.div>


                    {/* User ID - Read Only */}
                    <motion.div
                      className="bg-[#0B0B0B] rounded-lg px-4 py-3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8 + groupIndex * 0.1 + userIndex * 0.05, duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-sm mb-1">معرف المستخدم:</div>
                      <div className="text-gray-200 text-xs font-mono break-all">
                        {user.id}
                      </div>
                    </motion.div>
                      </div>
                    </motion.div>
                  ))}
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

      {/* Change Password Modal */}
      <AnimatePresence>
        {changePasswordModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-2xl bg-black/20 bg-opacity-50 flex items-center justify-center z-50"
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
                تغيير كلمة المرور
              </h3>
              <p className="text-gray-300 mb-6 text-center">
                كلمة مرور جديدة تم إنشاؤها للمستخدم{" "}
                <span className="text-[#E9CF6B] font-semibold">
                  &quot;{changePasswordModal.userName}&quot;
                </span>
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    كلمة المرور الجديدة المُولدة
                  </label>
                  <div className="relative">
                    <div className="w-full bg-[#1a1a1a] text-green-400 px-4 py-3 rounded-lg font-mono text-lg font-bold border border-green-500/30">
                      {changePasswordModal.generatedPassword}
                    </div>
                    <button
                      onClick={copyPasswordToClipboard}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title="نسخ كلمة المرور"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={regeneratePassword}
                    className="text-[#E9CF6B] hover:text-yellow-300 transition-colors text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>إنشاء كلمة مرور جديدة</span>
                  </button>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-blue-400 text-lg mr-2">ℹ️</span>
                  <span className="text-blue-300 font-semibold">
                    تنبيه مهم
                  </span>
                </div>
                <p className="text-blue-200 text-sm">
                  احتفظ بكلمة المرور هذه في مكان آمن. يمكنك نسخها باستخدام الزر أعلاه أو إنشاء كلمة مرور جديدة قبل التأكيد.
                </p>
              </div>

              {passwordError && (
                <div className="mb-4 text-red-400 text-sm text-center bg-red-900/20 border border-red-500 rounded-lg p-2">
                  {passwordError}
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmChangePassword}
                  className="bg-[#E9CF6B] cursor-pointer text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  تأكيد وحفظ كلمة المرور
                </button>
                <button
                  onClick={cancelChangePassword}
                  className="bg-gray-700 cursor-pointer text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Group Confirmation Modal */}
      <AnimatePresence>
        {deleteGroupConfirm && (
          <motion.div
            className="fixed inset-0 backdrop-blur-2xl bg-black/20 bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-[#0f0f0f] rounded-3xl p-8 max-w-md w-full mx-4 border border-red-500/30"
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
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">تأكيد حذف المجموعة</h3>
                <p className="text-gray-300 mb-4">
                  هل أنت متأكد من حذف المجموعة{" "}
                  <span className="text-[#E9CF6B] font-semibold">
                    &quot;{deleteGroupConfirm.groupName}&quot;
                  </span>
                  ؟
                </p>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-300 text-sm">
                    <strong>تحذير:</strong> سيتم حذف المجموعة وجميع الحسابات الموجودة بداخلها ({deleteGroupConfirm.userCount} حساب) نهائياً ولا يمكن التراجع عن هذا الإجراء.
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDeleteGroup}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>حذف المجموعة</span>
                </button>
                <button
                  onClick={cancelDeleteGroup}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
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
