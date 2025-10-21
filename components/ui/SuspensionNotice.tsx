"use client";

import { useState, useEffect } from "react";

interface SuspensionNoticeProps {
  suspendedAt?: string;
  suspensionReason?: string;
  onContactSupport?: () => void;
}

export default function SuspensionNotice({
  suspendedAt,
  suspensionReason,
  onContactSupport,
}: SuspensionNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleContactSupport = () => {
    try {
      const mailto = `mailto:support@alphafactory.net?subject=${encodeURIComponent(
        "طلب إلغاء تعليق الحساب - Alpha Factory"
      )}&body=${encodeURIComponent(
        "مرحباً فريق الدعم،\n\nأرغب في طلب إلغاء تعليق حسابي.\n\nتفاصيل الحساب:\n- تاريخ التعليق: " +
        (suspendedAt ? new Date(suspendedAt).toLocaleDateString('ar-SA') : 'غير محدد') +
        "\n- سبب التعليق: " + (suspensionReason || 'غير محدد') +
        "\n\nأرجو مراجعة حالة حسابي وإعادة تفعيله إذا أمكن.\n\nشكراً لكم"
      )}`;
      window.open(mailto, "_blank");
      if (onContactSupport) onContactSupport();
    } catch (error) {
      console.error("Error opening email client:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F0F0F] border border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          حساب معلق
        </h2>

        {/* Message */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          نود إعلامك أنه قد تم تعليق حسابك مؤقتاً. لا يمكنك الوصول إلى النظام حالياً.
        </p>

        {/* Details */}
        {(suspendedAt || suspensionReason) && (
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6 text-right" dir="rtl">
            {suspendedAt && (
              <div className="mb-2">
                <span className="text-gray-400 text-sm">تاريخ التعليق: </span>
                <span className="text-gray-200 text-sm">
                  {new Date(suspendedAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            )}
            {suspensionReason && (
              <div>
                <span className="text-gray-400 text-sm">السبب: </span>
                <span className="text-gray-200 text-sm">{suspensionReason}</span>
              </div>
            )}
          </div>
        )}

        {/* Support Contact */}
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            للحصول على المساعدة أو لطلب إعادة تفعيل الحساب، يرجى التواصل مع فريق الدعم:
          </p>
          
          <button
            onClick={handleContactSupport}
            className="w-full bg-[#E9CF6B] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#E9CF6B]/90 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>التواصل مع الدعم</span>
          </button>

          <div className="text-xs text-gray-500">
            support@alphafactory.net
          </div>
        </div>
      </div>
    </div>
  );
}
