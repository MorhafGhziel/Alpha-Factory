"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  totalProjects: number;
  adminUsers: number;
  clientUsers: number;
  editorUsers: number;
  designerUsers: number;
  reviewerUsers: number;
}

export default function AdminPanelDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGroups: 0,
    totalProjects: 0,
    adminUsers: 0,
    clientUsers: 0,
    editorUsers: 0,
    designerUsers: 0,
    reviewerUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-panel/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "إنشاء حساب جديد",
      description: "إضافة مستخدم جديد للنظام",
      href: "/admin-panel/create-account",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: "bg-green-500",
    },
    {
      title: "إدارة الحسابات",
      description: "عرض وتعديل حسابات المستخدمين",
      href: "/admin-panel/accounts",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: "bg-blue-500",
    },
    {
      title: "إدارة الأدوار",
      description: "تعيين وتعديل أدوار المستخدمين",
      href: "/admin-panel/roles",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "bg-purple-500",
    },
    // {
    //   title: "الإعدادات",
    //   description: "تكوين إعدادات النظام",
    //   href: "/admin-panel/settings",
    //   icon: (
    //     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   color: "bg-gray-500",
    // },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          لوحة التحكم الرئيسية
        </h1>
        <p className="text-gray-400 text-lg">
          إدارة شاملة لجميع جوانب النظام
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {loading ? (
          <div className="col-span-full text-center text-gray-400">
            جاري تحميل الإحصائيات...
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-400">
            خطأ في تحميل الإحصائيات: {error}
          </div>
        ) : (
          <>
            <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المجموعات</p>
                  <p className="text-3xl font-bold text-white">{stats.totalGroups}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المشاريع</p>
                  <p className="text-3xl font-bold text-white">{stats.totalProjects}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">المديرون</p>
                  <p className="text-3xl font-bold text-white">{stats.adminUsers}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Role Distribution */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800"
      >
        <h2 className="text-xl font-semibold text-white mb-4">توزيع الأدوار</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.clientUsers}</p>
            <p className="text-gray-400 text-sm">العملاء</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.editorUsers}</p>
            <p className="text-gray-400 text-sm">المحررون</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.designerUsers}</p>
            <p className="text-gray-400 text-sm">المصممون</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.reviewerUsers}</p>
            <p className="text-gray-400 text-sm">المراجعون</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-white">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={action.title}
              href={action.href}
              className="group"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800 hover:border-[#E9CF6B] transition-all duration-300 group-hover:transform group-hover:scale-105"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 text-white`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#E9CF6B] transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {action.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
