"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PayPalSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handlePayPalReturn = async () => {
      const token = searchParams.get('token');
      const payerId = searchParams.get('PayerID');

      if (!token) {
        setStatus('error');
        setMessage('Missing payment token');
        return;
      }

      try {
        const response = await fetch(`/api/paypal/handle-return?token=${token}&PayerID=${payerId || ''}`);
        const data = await response.json();
        
        if (data.success && data.status === 'COMPLETED') {
          setStatus('success');
          setMessage(`Payment successful! Transaction ID: ${data.transactionId}`);
          
          // Close popup and notify parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'PAYPAL_SUCCESS',
              data: data
            }, window.location.origin);
            window.close();
          } else {
            // If not in popup, redirect after delay
            setTimeout(() => {
              window.location.href = '/client/invoices?payment=success';
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('Payment failed or was not completed');
        }
      } catch (error) {
        console.error('Error handling PayPal return:', error);
        setStatus('error');
        setMessage('Error processing payment');
      }
    };

    handlePayPalReturn();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-[#EAD06C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">معالجة الدفع...</h2>
              <p className="text-gray-400">يرجى الانتظار بينما نتحقق من حالة الدفع</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-green-400">تم الدفع بنجاح!</h2>
              <p className="text-gray-400 text-sm">{message}</p>
              <p className="text-gray-500 text-xs mt-4">سيتم إغلاق هذه النافذة تلقائياً...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-red-400">فشل في الدفع</h2>
              <p className="text-gray-400 text-sm">{message}</p>
              <button
                onClick={() => window.close()}
                className="mt-4 bg-[#EAD06C] text-black px-4 py-2 rounded-lg hover:bg-[#F5D76E] transition-colors"
              >
                إغلاق
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PayPalSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#EAD06C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">معالجة الدفع...</h2>
            <p className="text-gray-400">يرجى الانتظار بينما نتحقق من حالة الدفع</p>
          </div>
        </div>
      </div>
    }>
      <PayPalSuccessContent />
    </Suspense>
  );
}
