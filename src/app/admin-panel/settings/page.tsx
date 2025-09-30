"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    systemName: "Alpha Factory",
    systemVersion: "1.0.0",
    allowRegistration: false,
    requireEmailVerification: true,
    maxUsersPerGroup: 50,
    telegramBotEnabled: true,
    whatsappEnabled: true,
    emailNotifications: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("تم حفظ الإعدادات بنجاح");
    } catch (_err) {
      setError("فشل في حفظ الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
          إعدادات النظام
        </h1>
        <p className="text-gray-400">
          تكوين وإدارة إعدادات النظام العامة
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

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-semibold text-white mb-6">الإعدادات العامة</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                اسم النظام
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => handleInputChange('systemName', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                إصدار النظام
              </label>
              <input
                type="text"
                value={settings.systemVersion}
                readOnly
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                الحد الأقصى للمستخدمين في المجموعة
              </label>
              <input
                type="number"
                value={settings.maxUsersPerGroup}
                onChange={(e) => handleInputChange('maxUsersPerGroup', parseInt(e.target.value))}
                min="1"
                max="1000"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#E9CF6B] focus:ring-1 focus:ring-[#E9CF6B] transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* User Registration Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-semibold text-white mb-6">إعدادات التسجيل</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">السماح بالتسجيل العام</h3>
                <p className="text-gray-400 text-sm">السماح للمستخدمين بإنشاء حسابات جديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E9CF6B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E9CF6B]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">التحقق من البريد الإلكتروني مطلوب</h3>
                <p className="text-gray-400 text-sm">يتطلب تأكيد البريد الإلكتروني للحسابات الجديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E9CF6B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E9CF6B]"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Integration Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-semibold text-white mb-6">إعدادات التكامل</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0088cc] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.43l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.5.24l.18-2.51 4.62-4.18c.2-.18-.04-.28-.32-.1L9.74 13.8l-2.45-.77c-.53-.16-.54-.53.11-.79L19.24 7.4c.44-.16.83.11.69.76z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">بوت تيليجرام</h3>
                  <p className="text-gray-400 text-sm">تفعيل التكامل مع تيليجرام</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.telegramBotEnabled}
                  onChange={(e) => handleInputChange('telegramBotEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E9CF6B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E9CF6B]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">واتساب</h3>
                  <p className="text-gray-400 text-sm">تفعيل التكامل مع واتساب</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsappEnabled}
                  onChange={(e) => handleInputChange('whatsappEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E9CF6B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E9CF6B]"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-semibold text-white mb-6">إعدادات الإشعارات</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">إشعارات البريد الإلكتروني</h3>
                <p className="text-gray-400 text-sm">إرسال إشعارات عبر البريد الإلكتروني</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E9CF6B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E9CF6B]"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center pt-4"
      >
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#E9CF6B] text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>حفظ الإعدادات</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
