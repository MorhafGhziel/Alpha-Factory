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
  groupId?: string | null;
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

export default function AccountsManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'groups'>('all');
  
  // Edit states
  const [editingUser, setEditingUser] = useState<{
    id: string;
    field: 'name' | 'email' | 'phone' | 'role';
    value: string;
  } | null>(null);
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  } | null>(null);
  
  // Password change modal
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

  const roles = ['admin', 'client', 'designer', 'reviewer', 'editor'];

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-hide messages
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersResponse = await fetch('/api/admin-panel/users');
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }
      const usersData = await usersResponse.json();
      setUsers(usersData.users);

      // Fetch groups
      const groupsResponse = await fetch('/api/admin-panel/groups');
      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch groups');
      }
      const groupsData = await groupsResponse.json();
      setGroups(groupsData.groups);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (userId: string, field: 'name' | 'email' | 'phone' | 'role', currentValue: string) => {
    setEditingUser({ id: userId, field, value: currentValue });
  };

  const handleEditSave = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin-panel/users/${editingUser.id}`, {
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
      
      // Also update in groups if viewing by groups
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
      setSuccessMessage(`تم تحديث ${getFieldNameInArabic(editingUser.field)} بنجاح`);
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
      const response = await fetch(`/api/admin-panel/users/${deleteConfirm.userId}`, {
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
      
      setGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          users: group.users.filter(user => user.id !== deleteConfirm.userId)
        })).filter(group => group.users.length > 0)
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
      const response = await fetch(`/api/admin-panel/users/${changePasswordModal.userId}/change-password`, {
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
      const response = await fetch('/api/admin-panel/groups', {
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

  const getFieldNameInArabic = (field: string) => {
    const fieldMap: { [key: string]: string } = {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      role: 'الدور',
    };
    return fieldMap[field] || field;
  };

  const getRoleInArabic = (role: string) => {
    const roleMap: { [key: string]: string } = {
      owner: 'مالك',
      admin: 'مدير',
      client: 'عميل',
      editor: 'محرر',
      designer: 'مصمم',
      reviewer: 'مُراجع',
    };
    return roleMap[role] || role;
  };

  const renderUserCard = (user: User, index: number) => (
    <motion.div
      key={user.id}
      className="bg-[#1a1a1a] rounded-2xl p-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {/* User Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#E9CF6B] rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-[#E9CF6B] text-xl font-semibold">
              {user.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {user.role ? getRoleInArabic(user.role) : 'لا يوجد دور'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleChangePassword(user.id, user.name)}
            className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-blue-900/20"
          >
            تغيير كلمة المرور
          </button>
          <button
            onClick={() => handleDeleteUser(user.id, user.name)}
            className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-red-900/20"
          >
            حذف الحساب
          </button>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Name Field */}
        <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">الاسم:</div>
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
        </div>

        {/* Role Field */}
        <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">الدور:</div>
            <button
              onClick={() => handleEditStart(user.id, 'role', user.role || '')}
              className="text-xs text-[#E9CF6B] hover:text-white transition-colors"
            >
              تعديل
            </button>
          </div>
          {editingUser?.id === user.id && editingUser?.field === 'role' ? (
            <div className="flex items-center space-x-2">
              <select
                value={editingUser.value}
                onChange={(e) => setEditingUser({ ...editingUser, value: e.target.value })}
                className="flex-1 bg-[#1a1a1a] text-white px-2 py-1 rounded text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave();
                  if (e.key === 'Escape') handleEditCancel();
                }}
              >
                <option value="">اختر الدور</option>
                {roles.map(role => (
                  <option key={role} value={role}>{getRoleInArabic(role)}</option>
                ))}
              </select>
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
            <div className="text-gray-200 text-sm">
              {user.role ? getRoleInArabic(user.role) : 'لا يوجد دور'}
            </div>
          )}
        </div>

        {/* Email/Phone Field */}
        {user.role === "client" ? (
          <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">رقم الهاتف (واتساب):</div>
              <button
                onClick={() => handleEditStart(user.id, 'phone', user.phone || '')}
                className="text-xs text-[#E9CF6B] hover:text-white transition-colors"
              >
                تعديل
              </button>
            </div>
            {editingUser?.id === user.id && editingUser?.field === 'phone' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  value={editingUser.value}
                  onChange={(e) => setEditingUser({ ...editingUser, value: e.target.value })}
                  className="flex-1 bg-[#1a1a1a] text-white px-2 py-1 rounded text-sm"
                  autoFocus
                  placeholder="مثال: 0501234567"
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
              <div className="text-gray-200 text-sm">
                {user.phone || 'لم يتم إدخال رقم الهاتف'}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm">البريد الإلكتروني:</div>
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
          </div>
        )}

        {/* Username Field - Read Only */}
        <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
          <div className="text-gray-400 text-sm mb-2">اسم المستخدم:</div>
          <div className="text-gray-200 text-sm font-mono bg-[#1a1a1a] px-2 py-1 rounded">
            {user.username || 'غير محدد'}
          </div>
        </div>

        {/* Created Date */}
        <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
          <div className="text-gray-400 text-sm mb-2">تاريخ الإنشاء:</div>
          <div className="text-gray-200 text-sm">
            {(() => {
              const date = new Date(user.createdAt);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}/${month}/${day}`;
            })()}
          </div>
        </div>

        {/* Email Verified Status */}
        <div className="bg-[#0B0B0B] rounded-lg px-4 py-3">
          <div className="text-gray-400 text-sm mb-2">حالة التحقق:</div>
          <div className={`text-sm ${user.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
            {user.emailVerified ? 'محقق' : 'غير محقق'}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            إدارة الحسابات
          </h1>
          <p className="text-gray-400">
            عرض وتعديل جميع حسابات المستخدمين في النظام
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex bg-[#0f0f0f] rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'all' 
                ? 'bg-[#E9CF6B] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            جميع المستخدمين
          </button>
          <button
            onClick={() => setViewMode('groups')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'groups' 
                ? 'bg-[#E9CF6B] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            عرض بالمجموعات
          </button>
        </div>
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
          جاري تحميل البيانات...
        </motion.div>
      ) : viewMode === 'all' ? (
        /* All Users View */
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {users.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              لا توجد حسابات مستخدمين.
            </div>
          ) : (
            users.map((user, index) => renderUserCard(user, index))
          )}
        </motion.div>
      ) : (
        /* Groups View */
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {groups.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              لا توجد مجموعات بعد.
            </div>
          ) : (
            groups.map((group: Group, groupIndex: number) => (
              <motion.div
                key={group.id}
                className="bg-[#0f0f0f] rounded-3xl overflow-hidden border border-gray-800"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: groupIndex * 0.1,
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
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.name, group.users.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200 shadow-lg"
                    title="حذف المجموعة وجميع الحسابات"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Users in Group */}
                <div className="p-6 space-y-6">
                  {group.users.map((user: User, userIndex: number) => 
                    renderUserCard(user, userIndex)
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

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
              className="bg-[#0f0f0f] rounded-3xl p-8 text-center max-w-md w-full mx-4"
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
                هذا الاجراء غير قابل للتراجع. هل أنت متأكد من حذف الحساب{" "}
                <br />
                &quot;{deleteConfirm.userName}&quot; ؟
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 cursor-pointer text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
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
