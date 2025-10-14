"use client";

import { useEffect } from "react";

export default function PayPalCancelPage() {
  useEffect(() => {
    // Notify parent window and close popup
    if (window.opener) {
      window.opener.postMessage({
        type: 'PAYPAL_CANCEL'
      }, window.location.origin);
      window.close();
    } else {
      // If not in popup, redirect after delay
      setTimeout(() => {
        window.location.href = '/client/invoices?payment=cancelled';
      }, 3000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-yellow-400">تم إلغاء الدفع</h2>
          <p className="text-gray-400 text-sm">تم إلغاء عملية الدفع من قبل المستخدم</p>
          <p className="text-gray-500 text-xs mt-4">سيتم إغلاق هذه النافذة تلقائياً...</p>
          <button
            onClick={() => window.close()}
            className="mt-4 bg-[#EAD06C] text-black px-4 py-2 rounded-lg hover:bg-[#F5D76E] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
