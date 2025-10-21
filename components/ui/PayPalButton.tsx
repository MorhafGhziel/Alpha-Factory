"use client";

import { useState } from "react";
import Image from "next/image";

interface PayPalTransactionData {
  success: boolean;
  status: string;
  transactionId: string;
  amount: {
    currency_code: string;
    value: string;
  };
  referenceId?: string;
  payerId?: string;
}

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  invoiceId?: string;
  onSuccess?: (transactionData: PayPalTransactionData) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function PayPalButton({
  amount,
  currency = "USD",
  description,
  invoiceId,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = "",
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create payment
      const createResponse = await fetch("/api/paypal/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          invoiceId,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || "Failed to create payment");
      }

      if (!createData.approvalUrl) {
        throw new Error("No approval URL received from PayPal");
      }

      // Open PayPal in a new tab
      const paypalWindow = window.open(createData.approvalUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      // Check if popup was blocked
      if (!paypalWindow) {
        // Fallback to same window if popup blocked
        window.location.href = createData.approvalUrl;
        return;
      }

      // Listen for messages from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'PAYPAL_SUCCESS') {
          setIsLoading(false);
          onSuccess?.(event.data.data);
          paypalWindow.close();
        } else if (event.data.type === 'PAYPAL_CANCEL') {
          setIsLoading(false);
          onCancel?.();
          paypalWindow.close();
        }
      };

      window.addEventListener('message', handleMessage);

      // Monitor the popup window (fallback)
      const checkClosed = setInterval(() => {
        if (paypalWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
          console.log('PayPal window closed');
        }
      }, 1000);

    } catch (err: unknown) {
      console.error("PayPal payment error:", err);
      const error = err instanceof Error ? err : new Error("Payment failed");
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className={`cursor-pointer flex items-center gap-2 bg-[#F6C557] px-4 sm:px-10 py-2 rounded-lg hover:bg-[#EAD06C] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span className="text-black font-semibold">جاري المعالجة...</span>
          </div>
        ) : (
          <>
            <Image
              src="/icons/PayPal.svg"
              alt="PayPal"
              width={70}
              height={20}
              className="h-5 w-auto"
            />
            {/* <span className="text-black font-semibold">
              ${amount.toFixed(2)}
            </span> */}
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-400 text-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}
