"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const INVOICE_NOTIFICATION_KEY = "invoice_notification_seen";

interface InvoiceNotificationContextType {
  hasNewInvoice: boolean;
  markInvoiceNotificationAsSeen: () => void;
  showNotificationForNewActivity: () => void;
}

const InvoiceNotificationContext = createContext<InvoiceNotificationContextType | undefined>(undefined);

export function InvoiceNotificationProvider({ children }: { children: React.ReactNode }) {
  const [hasNewInvoice, setHasNewInvoice] = useState(false);

  // Check if user has visited invoices page
  const checkInvoiceNotificationStatus = useCallback(() => {
    if (typeof window !== "undefined") {
      const hasSeenNotification = localStorage.getItem(INVOICE_NOTIFICATION_KEY);
      return hasSeenNotification === "true";
    }
    return false;
  }, []);

  // Mark notification as seen when user visits invoices page
  const markInvoiceNotificationAsSeen = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(INVOICE_NOTIFICATION_KEY, "true");
      setHasNewInvoice(false);
    }
  }, []);

  // Show notification when project is created or enhancement requested
  const showNotificationForNewActivity = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(INVOICE_NOTIFICATION_KEY);
      setHasNewInvoice(true);
    }
  }, []);

  // Initialize notification state on mount
  useEffect(() => {
    const hasSeenNotification = checkInvoiceNotificationStatus();
    if (hasSeenNotification) {
      setHasNewInvoice(false);
    }
  }, [checkInvoiceNotificationStatus]);

  return (
    <InvoiceNotificationContext.Provider
      value={{
        hasNewInvoice,
        markInvoiceNotificationAsSeen,
        showNotificationForNewActivity,
      }}
    >
      {children}
    </InvoiceNotificationContext.Provider>
  );
}

export function useInvoiceNotifications() {
  const context = useContext(InvoiceNotificationContext);
  if (context === undefined) {
    throw new Error("useInvoiceNotifications must be used within an InvoiceNotificationProvider");
  }
  return context;
}
