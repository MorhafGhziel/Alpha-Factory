"use client";

import { useState } from "react";
import PayPalButton from "./PayPalButton";

export default function TestPayPalInvoice() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const testInvoiceData = {
    invoiceNumber: "TEST-001",
    amount: 100,
    description: "Alpha Factory - Test Invoice Payment",
    items: [
      { name: "مشروع تجريبي - فيديو تسويقي", price: 60 },
      { name: "تصميم شعار", price: 40 },
    ],
  };

  const handlePaymentSuccess = (data: { transactionId: string }) => {
    console.log("Payment successful:", data);
    setPaymentStatus("تم الدفع بنجاح! معرف المعاملة: " + data.transactionId);
    setTimeout(() => setPaymentStatus(null), 10000);
  };

  const handlePaymentError = (error: Error) => {
    console.error("Payment error:", error);
    setPaymentStatus("فشل في الدفع: " + error.message);
    setTimeout(() => setPaymentStatus(null), 8000);
  };

  const handlePaymentCancel = () => {
    setPaymentStatus("تم إلغاء الدفع من قبل المستخدم");
    setTimeout(() => setPaymentStatus(null), 5000);
  };

  if (!showInvoice) {
    return (
      <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl p-6 max-w-md mx-auto">
        <h3 className="text-white text-xl font-bold mb-4 text-center">
          اختبار دفع PayPal
        </h3>
        <p className="text-gray-300 text-sm mb-6 text-center">
          اضغط لإنشاء فاتورة تجريبية واختبار نظام الدفع
        </p>
        <button
          onClick={() => setShowInvoice(true)}
          className="w-full bg-gradient-to-r from-[#EAD06C] to-[#C48829] text-black font-bold py-3 px-6 rounded-lg hover:from-[#F5D76E] hover:to-[#D4A02A] transition-all duration-300"
        >
          إنشاء فاتورة تجريبية
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-[#141414] p-4 border-b border-[#333336]">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-xl font-bold">فاتورة تجريبية</h3>
          <button
            onClick={() => setShowInvoice(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Payment Status */}
      {paymentStatus && (
        <div className="p-4 border-b border-[#333336]">
          <div
            className={`px-4 py-2 rounded-lg text-sm ${
              paymentStatus.includes('نجاح') 
                ? 'bg-green-900/30 border border-green-600 text-green-200'
                : paymentStatus.includes('إلغاء')
                ? 'bg-yellow-900/30 border border-yellow-600 text-yellow-200'
                : 'bg-red-900/30 border border-red-600 text-red-200'
            }`}
            dir="rtl"
          >
            {paymentStatus}
          </div>
        </div>
      )}

      {/* Invoice Content */}
      <div className="bg-white text-black p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="font-bold text-lg">Alpha Factory</h4>
            <p className="text-gray-600 text-sm">
              789 Madison Ave, New York, NY 10065, USA<br />
              support@alphafactory.net
            </p>
          </div>
          <div className="text-right" dir="rtl">
            <h4 className="font-bold">فاتورة تجريبية</h4>
            <p className="text-gray-600">رقم الفاتورة: {testInvoiceData.invoiceNumber}</p>
            <p className="text-gray-600">التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        {/* Items */}
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-2 font-semibold text-right" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>الخدمة</div>
              <div>السعر</div>
            </div>
          </div>
          {testInvoiceData.items.map((item, index) => (
            <div key={index} className="px-4 py-3 border-t border-gray-200" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <div>{item.name}</div>
                <div>${item.price}</div>
              </div>
            </div>
          ))}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-300 font-bold text-right" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>المجموع الكلي</div>
              <div>${testInvoiceData.amount}</div>
            </div>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PayPalButton
              amount={testInvoiceData.amount}
              description={testInvoiceData.description}
              invoiceId={testInvoiceData.invoiceNumber}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
            <button className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2 rounded-lg bg-[#0B0B0B] hover:bg-[#1a1a1a] transition-all duration-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Crypto (قريباً)
            </button>
          </div>
          <div className="text-right" dir="rtl">
            <p className="text-sm text-gray-600">طرق الدفع المتاحة</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#141414] p-4 text-center">
        <p className="text-gray-400 text-xs">
          هذه فاتورة تجريبية لاختبار نظام الدفع • PayPal Sandbox Mode
        </p>
      </div>
    </div>
  );
}
