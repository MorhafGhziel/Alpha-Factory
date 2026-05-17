"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Project } from "@/src/types";
import PayPalButton from "@/components/ui/PayPalButton";
import { authClient } from "@/src/lib/auth-client";
import { useInvoiceNotifications } from "@/src/contexts/InvoiceNotificationContext";

type InvoiceItem = {
  id: string;
  projectId: string;
  projectName: string;
  projectType?: string;
  workType?: string;
  description?: string;
  unitPrice?: number;
  quantity?: number;
  total?: number;
  workDate?: Date;
  workDescription?: string; // Description of completed work
};

type Invoice = {
  id?: string; // For database invoices
  index: number;
  invoiceNumber?: string; // For database invoices
  startDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  invoice_item?: InvoiceItem[]; // For backward compatibility
  grandTotal?: number; // optional aggregate from backend
  totalAmount?: number; // For database invoices
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"; // For database invoices
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** UI-only: hide invoice details and payment; show disabled message on expand */
const INVOICES_DISABLED_FOR_ACCOUNT = true;

function formatDate(d: Date) {
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value))
    return "\u00A0";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  } catch {
    return String(value);
  }
}

function daysUntil(date: Date) {
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
  return diff;
}

// Define when a project should be included in invoicing
function isProjectBillable(p: Project): boolean {
  // Exclude enhancement projects from invoicing entirely
  const isEnhancement = p.type && (
    p.type.includes("تحسين") || 
    p.title.includes("تحسين:")
  );
  
  // Enhancement projects should never be billed
  if (isEnhancement) {
    return false;
  }
  
  // For regular projects, include if any significant work is done
  const hasAnyWork = 
    p.filmingStatus === "تم الانتـــهاء مــنه" ||
    p.editMode === "تم الانتهاء منه" || 
    p.editMode === "قيد التنفيذ" ||
    p.designMode === "تم الانتهاء منه" || 
    p.designMode === "قيد التنفيذ" ||
    p.reviewMode === "تمت المراجعة" ||
    Boolean(p.fileLinks && p.fileLinks.trim() !== "");
    
  return Boolean(hasAnyWork);
}

export default function ClientInvoicesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [databaseInvoices, setDatabaseInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paidMap, setPaidMap] = useState<Record<string, boolean>>({});
  // Reminder modal state removed; auto-sending only
  const [showPaidBannerFor, setShowPaidBannerFor] = useState<string | null>(
    null
  );
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [cryptoToast, setCryptoToast] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const searchParams = useSearchParams();
  
  // Invoice notification hook - mark as seen when page is visited
  const { markInvoiceNotificationAsSeen } = useInvoiceNotifications();

  // Mark notification as seen when page is visited
  useEffect(() => {
    markInvoiceNotificationAsSeen();
  }, [markInvoiceNotificationAsSeen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to load projects");
        const data = await res.json();
        setProjects(data.projects || []);
        
        // Fetch database invoices
        try {
          const invoicesRes = await fetch("/api/invoices", {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (invoicesRes.ok) {
            const invoicesData = await invoicesRes.json();
            setDatabaseInvoices(invoicesData.invoices || []);
            console.log("📊 Loaded database invoices:", invoicesData.invoices?.length || 0);
          } else {
            console.warn("Failed to load database invoices:", invoicesRes.status, invoicesRes.statusText);
          }
        } catch (invoiceError) {
          console.warn("Could not load database invoices:", invoiceError);
        }
        
        // Fetch session for client email
        const sessionData = await authClient.getSession();
        console.log("Session data:", sessionData); // Debug log
        setSession(sessionData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle PayPal return
  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    const token = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    const handlePayPalReturn = async (token: string, payerId: string | null) => {
      try {
        const response = await fetch(`/api/paypal/handle-return?token=${token}&PayerID=${payerId || ''}`);
        const data = await response.json();
        
        if (data.success && data.status === 'COMPLETED') {
          // Mark invoice as paid based on reference ID
          if (data.referenceId) {
            const invoiceId = data.referenceId.replace('invoice_', '');
            const next = { ...paidMap, [invoiceId]: true };
            setPaidMap(next);
            savePaid(next);
            setShowPaidBannerFor(invoiceId);
            setTimeout(() => setShowPaidBannerFor(null), 4000);
            
            // Refresh database invoices to get updated payment status
            try {
              const invoicesRes = await fetch("/api/invoices", {
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              if (invoicesRes.ok) {
                const invoicesData = await invoicesRes.json();
                setDatabaseInvoices(invoicesData.invoices || []);
                console.log("🔄 Refreshed invoices after payment");
              }
            } catch (refreshError) {
              console.warn("Could not refresh invoices:", refreshError);
            }
          }
          setPaymentStatus('تم الدفع بنجاح! شكراً لك');
        } else {
          setPaymentStatus('فشل في معالجة الدفع');
        }
      } catch (error) {
        console.error('Error handling PayPal return:', error);
        setPaymentStatus('حدث خطأ في معالجة الدفع');
      }
      
      setTimeout(() => setPaymentStatus(null), 5000);
    };

    if (success === 'true' && token) {
      // Handle successful payment
      handlePayPalReturn(token, payerId);
    } else if (cancelled === 'true') {
      setPaymentStatus('تم إلغاء الدفع');
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  }, [searchParams, paidMap, savePaid]);

  // Function to check if invoice has any pending items
  const hasWaitingItems = (invoice: Invoice) => {
    const items = invoice.invoice_item || invoice.items || [];
    return items.some((item: InvoiceItem) => 
      item.unitPrice === 0 || item.quantity === 0 || item.total === 0
    );
  };

  // Function to check if invoice is ready for payment based on project type and work completion
  const isInvoiceReadyForPayment = (invoice: Invoice) => {
    const items = invoice.invoice_item || invoice.items || [];
    
    // Find the projects associated with this invoice
    const projectIds = items.map((item: InvoiceItem) => item.projectId).filter(Boolean);
    const associatedProjects = projects.filter(project => projectIds.includes(project.id));
    
    if (associatedProjects.length === 0) {
      return false; // No associated projects found
    }

    // Check each associated project
    return associatedProjects.every(project => {
      // Check if this is an enhancement project
      const isDesignEnhancement = project.type && project.type.includes("تحسين التصميم");
      const isEditingEnhancement = project.type && project.type.includes("تحسين الإنتاج");
      
      if (isDesignEnhancement) {
        // For design enhancement projects, enable PayPal when design is ready
        return project.designMode === "تم الانتهاء منه";
      } else if (isEditingEnhancement) {
        // For editing enhancement projects, enable PayPal when edit is complete
        return project.editMode === "تم الانتهاء منه";
      } else {
        // For regular projects, check based on project type and work type
        const hasDesignWork = items.some((item: InvoiceItem) => 
          item.projectId === project.id && (
            item.id?.includes('_thumbnail') || 
            item.workType?.includes("تصميم") ||
            item.workType?.includes("ثمبنيل") ||
            item.description?.includes("تصميم") ||
            item.description?.includes("ثمبنيل") ||
            (item.projectType && (
              item.projectType === "تصاميم الصور المصغرة (ثمبنيل)" ||
              item.projectType === "تصاميم الصور المصغرة" ||
              item.projectType?.includes("تصميم") ||
              item.projectType?.includes("ثمبنيل")
            ))
          )
        );

        const hasVideoWork = items.some((item: InvoiceItem) => 
          item.projectId === project.id && item.id?.includes('_video')
        );

        // For design projects, check if design is ready
        if (hasDesignWork && !hasVideoWork) {
          return project.designMode === "تم الانتهاء منه";
        }
        
        // For video projects, check if edit is complete
        if (hasVideoWork && !hasDesignWork) {
          return project.editMode === "تم الانتهاء منه";
        }
        
        // For projects with both design and video work
        if (hasDesignWork && hasVideoWork) {
          return project.designMode === "تم الانتهاء منه" && project.editMode === "تم الانتهاء منه";
        }
        
        // For other project types, use the original logic
        return project.designLinks && project.designLinks.trim() !== "";
      }
    });
  };

  const invoices = useMemo<Invoice[]>(() => {
    if (!projects.length) return [];

    // Create separate invoice for each billable project
    const billableProjects = projects.filter(isProjectBillable);
    
    const result: Invoice[] = billableProjects.map((project, index) => {
      // Calculate pricing based on project type and video duratio
      let unitPrice = 0;
      let quantity = 1;
      let workDescription = "";
      let pricingUnit = "مشروع";
      let durationInMinutes = 0; // Declare at the top level
      
      // New duration-based pricing structure
      const durationBasedPrices = {
        "فيــــــــــــــديوهــــات قـــــصيرة": { rate: 39, unit: "دولار للدقيقة" },
        "فيــــــــــــــديوهــــات طـــــويلة": { rate: 9, unit: "دولار للدقيقة" },
        "إعلانات / مقاطع فيديو ترويجية": { rate: 49, unit: "دولار للدقيقة" },
        "تصاميم الصور المصغرة": { rate: 19, unit: "دولار للتصميم" },
        "تصاميم الصور المصغرة (ثمبنيل)": { rate: 19, unit: "دولار للتصميم" },
        "default": { rate: 9, unit: "دولار للدقيقة" }
      };
      
      // Get pricing info for project type
      const pricingInfo = durationBasedPrices[project.type as keyof typeof durationBasedPrices] || durationBasedPrices.default;
      
      // Check if this is a thumbnail/design project (fixed price)
      const isDesignProject = project.type === "تصاميم الصور المصغرة" || 
                              project.type === "تصاميم الصور المصغرة (ثمبنيل)" || 
                              project.type?.includes("تصميم") || 
                              project.type?.includes("ثمبنيل");
      
      if (isDesignProject) {
        // For design projects (including design enhancement), use thumbnail pricing
        unitPrice = 19; // Fixed price for design work
        quantity = 1;
        pricingUnit = "تصميم";
      } else {
        // Duration-based pricing for video projects
        
        if (project.videoDuration) {
          // Parse duration (format: "MM:SS" or "HH:MM:SS")
          const parts = project.videoDuration.split(':');
          if (parts.length === 2) {
            // MM:SS format
            const minutes = parseInt(parts[0]) || 0;
            const seconds = parseInt(parts[1]) || 0;
            durationInMinutes = minutes + seconds / 60;
            
            // Debug log to see what's happening
            console.log(`Parsing duration: ${project.videoDuration} -> ${minutes}m ${seconds}s = ${durationInMinutes} minutes, rounded up to ${Math.ceil(durationInMinutes)} minutes`);
          } else if (parts.length === 3) {
            // HH:MM:SS format
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseInt(parts[2]) || 0;
            durationInMinutes = hours * 60 + minutes + seconds / 60;
          }
        }
        
        // Use exact minutes for billing (floor to get only complete minutes)
        // Don't set a default minimum - let it be 0 if no duration
        quantity = Math.floor(durationInMinutes);
        unitPrice = pricingInfo.rate;
        pricingUnit = "دقيقة";
      }
      
      // Check what work was completed or in progress
      const workCompleted = [];
      const workInProgress = [];
      
      // Check filming
      if (project.filmingStatus === "تم الانتـــهاء مــنه") {
        workCompleted.push("التصوير");
      }
      
      // Check editing
      if (project.editMode === "تم الانتهاء منه") {
        workCompleted.push("المونتاج");
      } else if (project.editMode === "قيد التنفيذ") {
        workInProgress.push("المونتاج");
      }
      
      // Check design
      if (project.designMode === "تم الانتهاء منه") {
        workCompleted.push("التصميم");
      } else if (project.designMode === "قيد التنفيذ") {
        workInProgress.push("التصميم");
      }
      
      // Check review
      if (project.reviewMode === "تمت المراجعة") {
        workCompleted.push("المراجعة");
      } else if (project.reviewMode === "قيد المراجعة") {
        workInProgress.push("المراجعة");
      }
      
      // Build description
      const allWork = [...workCompleted, ...workInProgress.map(w => `${w} (قيد التنفيذ)`)];
      workDescription = allWork.length > 0 
        ? allWork.join(" + ") 
        : "العمل قيد التنفيذ";

      // Add duration info to description for video projects
      if (project.videoDuration && pricingUnit === "دقيقة") {
        const minuteText = quantity === 1 ? "دقيقة" : "دقائق";
        workDescription += ` - مدة الفيديو: ${project.videoDuration} (${quantity} ${minuteText})`;
      }

      // Add pricing unit info
      workDescription += ` - ${pricingInfo.unit}`;

      // Calculate total based on quantity
      const totalAmount = unitPrice * quantity;

      // Create items for this project (can be multiple if video + thumbnail)
      const items: InvoiceItem[] = [];
      
      // Check if this project has video work (only if it's a video project type)
      const isVideoProject = !project.type?.includes("تصميم") && !project.type?.includes("ثمبنيل");
      const hasVideoWork = isVideoProject && (
                          project.videoDuration || 
                          project.editMode === "تم الانتهاء منه" || 
                          project.editMode === "قيد التنفيذ" ||
                          project.filmingStatus === "تم الانتـــهاء مــنه"
                        );
      
      const hasDesignWork = workCompleted.includes("التصميم") || 
                           workInProgress.includes("التصميم") ||
                           project.designMode === "تم الانتهاء منه" ||
                           project.designMode === "قيد التنفيذ";

      let invoiceTotal = 0;

      // Add video editing item if there's video work
      if (hasVideoWork) {
        const videoWorkDescription = workCompleted.filter(w => w !== "التصميم").concat(
          workInProgress.filter(w => w !== "التصميم").map(w => `${w} (قيد التنفيذ)`)
        ).join(" + ") || "المونتاج";
        
        let videoDescription = videoWorkDescription;
        let videoTotal = 0;
        let videoQuantity = quantity;
        let videoUnitPrice = unitPrice;
        
        // Check if video is completed and has duration
        if (project.videoDuration && quantity > 0) {
          const minuteText = quantity === 1 ? "دقيقة" : "دقائق";
          videoDescription += ` - مدة الفيديو: ${project.videoDuration} (${quantity} ${minuteText})`;
          videoDescription += ` - ${pricingInfo.unit}`;
          videoTotal = unitPrice * quantity;
        } else if (project.editMode === "تم الانتهاء منه" && !project.videoDuration) {
          // Video is marked as completed but no duration - show pending
          videoDescription += ` - في انتظار تحديد مدة الفيديو من المحرر`;
          videoUnitPrice = 0;
          videoQuantity = 0;
          videoTotal = 0;
        } else {
          // Video work is in progress or not started
          videoDescription += ` - العمل قيد التنفيذ - الفاتورة النهائية في انتظار اكتمال العمل`;
          videoUnitPrice = 0;
          videoQuantity = 0;
          videoTotal = 0;
        }

        items.push({
          id: `${project.id}_video`,
          projectId: project.id,
          projectName: project.title,
          projectType: project.type,
          unitPrice: videoUnitPrice,
          quantity: videoQuantity,
          total: videoTotal,
          workDate: new Date(project.updatedAt),
          workDescription: videoDescription
        });
        invoiceTotal += videoTotal;
      }

      // Add thumbnail design item if there's design work
      if (hasDesignWork) {
        const thumbnailPrice = 19;
        const thumbnailDescription = "تصميم الصورة المصغرة  - دولار للتصميم";
        
        items.push({
          id: `${project.id}_thumbnail`,
          projectId: project.id,
          projectName: `${project.title} - ثمبنيل`,
          projectType: "تصاميم الصور المصغرة (ثمبنيل)",
          unitPrice: thumbnailPrice,
          quantity: 1,
          total: thumbnailPrice,
          workDate: new Date(project.updatedAt),
          workDescription: thumbnailDescription
        });
        invoiceTotal += thumbnailPrice;
      }

      // If no specific work detected, create a general item
      if (items.length === 0) {
        items.push({
          id: `${project.id}`,
          projectId: project.id,
          projectName: project.title,
          projectType: project.type,
          unitPrice: unitPrice,
          quantity: quantity,
          total: totalAmount,
          workDate: new Date(project.updatedAt),
          workDescription: workDescription
        });
        invoiceTotal = totalAmount;
      }

      // Create invoice with due date 7 days from project update
      const projectDate = new Date(project.updatedAt);
      const dueDate = new Date(projectDate.getTime() + 7 * DAY_MS);

      return {
        index: index + 1,
        startDate: projectDate,
        dueDate: dueDate,
        items: items,
        grandTotal: invoiceTotal,
      };
    });

    // Sort by most recent first
    return result.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [projects]);

  // ------- Helpers & Persistence -------
  // const DAY_WINDOW = 14 * DAY_MS; // reserved for future
  function getInvoiceId(inv: Invoice) {
    return `${inv.index}-${new Date(inv.dueDate).toISOString().slice(0, 10)}`;
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem("af_paid_invoices");
      if (saved) setPaidMap(JSON.parse(saved));
    } catch {}
  }, []);

  function savePaid(next: Record<string, boolean>) {
    try {
      localStorage.setItem("af_paid_invoices", JSON.stringify(next));
    } catch {}
  }

  function markPaid(inv: Invoice) {
    const id = getInvoiceId(inv);
    const next = { ...paidMap, [id]: true };
    setPaidMap(next);
    savePaid(next);
    setShowPaidBannerFor(id);
    
    // Show success message
    setTimeout(
      () => setShowPaidBannerFor((cur) => (cur === id ? null : cur)),
      4000
    );

    // Remove suspension if user was suspended due to overdue invoices
    setTimeout(async () => {
      try {
        const userId = session?.data?.user?.id || session?.user?.id;
        if (userId) {
          // Check if user is suspended
          const response = await fetch("/api/auth/check-suspension");
          if (response.ok) {
            const data = await response.json();
            if (data.suspended) {
              console.log("🔓 Payment completed - removing suspension...");
              // Remove suspension since invoice is now paid
              await fetch("/api/admin/suspend-user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });
            }
          }
        }
      } catch (error) {
        console.error("Error removing suspension after payment:", error);
      }
      
      console.log("🔄 Payment completed - refreshing overdue status...");
      window.location.reload();
    }, 2000);
  }

  function wasReminderSent(id: string, day: 3 | 7) {
    try {
      return localStorage.getItem(`af_inv_${id}_rem_${day}`) === "1";
    } catch {
      return false;
    }
  }

  function setReminderSent(id: string, day: 3 | 7) {
    try {
      localStorage.setItem(`af_inv_${id}_rem_${day}`, "1");
    } catch {}
  }

  // Attempt to trigger email and also show message in app
  async function triggerEmail(kind: "3" | "7") {
    try {
      // Get user info for the email
      const userEmail = session?.data?.user?.email || session?.user?.email || session?.email;
      const userName = session?.data?.user?.name || session?.user?.name || session?.name || "العميل";

      if (!userEmail) {
        console.error("No user email found for sending reminder");
        setEmailNotice("تعذر إرسال البريد - لم يتم العثور على عنوان البريد الإلكتروني");
        setTimeout(() => setEmailNotice(null), 4000);
        return;
      }

      console.log(`📧 Sending ${kind}-day reminder email to ${userEmail}`);

      // Send email via our API
      const response = await fetch("/api/test/send-email-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderType: kind,
          userEmail: userEmail,
          userName: userName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ ${kind}-day reminder email sent successfully`);
        setEmailNotice(`تم إرسال رسالة التذكير عبر البريد الإلكتروني إلى ${userEmail}`);
      } else {
        console.error("❌ Failed to send reminder email:", result.error);
        setEmailNotice("تعذر إرسال رسالة التذكير - يرجى المحاولة مرة أخرى");
      }
    } catch (error) {
      console.error("❌ Error sending reminder email:", error);
      setEmailNotice("تعذر إرسال رسالة التذكير - خطأ في النظام");
    }

    setTimeout(() => setEmailNotice(null), 4000);
  }

  // Auto trigger per threshold (3/7) once per invoice with progressive restrictions
  useEffect(() => {
    invoices.forEach(async (inv) => {
      const id = getInvoiceId(inv);
      if (paidMap[id]) return;
      const remaining = daysUntil(inv.dueDate);
      const overdue = Math.max(0, -remaining);
      
      // 7 days: Complete account block (only owner can unblock)
      if (overdue >= 7 && !wasReminderSent(id, 7)) {
        setReminderSent(id, 7);
        triggerEmail("7");
        
        // Auto-suspend user after 7 days overdue
        try {
          const userId = session?.data?.user?.id || session?.user?.id;
          if (userId) {
            await fetch("/api/admin/auto-suspend", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                invoiceDueDate: inv.dueDate,
              }),
            });
            console.log("🔒 7-day overdue: User account automatically suspended");
          }
        } catch (error) {
          console.error("Error auto-suspending user:", error);
        }
      } 
      // 3 days: Email only, no restrictions
      else if (overdue >= 3 && !wasReminderSent(id, 3)) {
        setReminderSent(id, 3);
        triggerEmail("3");
        console.log("📧 3-day overdue: Email sent, no access restrictions");
      }
    });
  }, [invoices, paidMap, session]);

  // Close expanded invoice if it becomes paid
  useEffect(() => {
    if (expanded) {
      const expandedInvoice = [...databaseInvoices, ...invoices].find(inv => 
        (inv.id || getInvoiceId(inv)) === expanded
      );
      if (expandedInvoice) {
        const isPaid = expandedInvoice.status === "PAID" || paidMap[expanded];
        if (isPaid) {
          setExpanded(null);
        }
      }
    }
  }, [expanded, databaseInvoices, invoices, paidMap]);

  if (INVOICES_DISABLED_FOR_ACCOUNT) {
    return (
      <div className="min-h-screen text-white md:py-20 py-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="w-full text-center md:mb-16 mb-10">
            <h1 className="text-5xl bg-gradient-to-l from-white to-black bg-clip-text text-transparent font-light">
              الفواتير
            </h1>
          </div>
          <div
            className="rounded-2xl border border-[#333336] bg-[#0F0F0F] px-6 py-12 text-center"
            dir="rtl"
          >
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-lg sm:text-xl text-gray-300">
              هذه الفاتورة معطلة لهذا الحساب
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white md:py-20 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="w-full text-center md:mb-34 mb-14">
          <h1 className="text-5xl bg-gradient-to-l from-white to-black bg-clip-text text-transparent font-light">
            الفواتير{" "}
          </h1>
        </div>

        {/* Terms Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowTermsModal(true)}
            className="w-8 h-8 rounded-full bg-[#EAD06C] text-black flex items-center justify-center font-bold text-lg hover:bg-[#EAD06C]/80 transition-colors"
            title="الشروط وهيكل الأسعار"
          >
            ?
          </button>
        </div>

        {loading ? (
          <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl p-8 text-center">
            جاري التحميل...
          </div>
        ) : !invoices.length ? (
          <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl p-8 text-center text-gray-300">
            لا توجد فواتير حالياً
          </div>
        ) : (
          <div className="space-y-5">
            {(emailNotice || paymentStatus || cryptoToast) && (
              <div className="mx-auto max-w-6xl px-4">
                {emailNotice && (
                  <div
                    className="mb-3 px-4 py-2 rounded-lg bg-blue-900/30 border border-blue-600 text-blue-200 text-sm"
                    dir="rtl"
                  >
                    {emailNotice}
                  </div>
                )}
                {paymentStatus && (
                  <div
                    className={`mb-3 px-4 py-2 rounded-lg text-sm ${
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
                )}
                {cryptoToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="mb-3 px-4 py-3 rounded-lg bg-orange-900/30 border border-orange-500 text-orange-200 text-sm flex items-center gap-2"
                    dir="rtl"
                  >
                    <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {cryptoToast}
                  </motion.div>
                )}
              </div>
            )}
            {[...databaseInvoices, ...invoices.filter(legacyInv => {
              // Only show legacy invoices that don't have a corresponding paid database invoice
              const legacyId = getInvoiceId(legacyInv);
              return !databaseInvoices.some(dbInv => dbInv.id === legacyId);
            })].map((inv, index) => {
              // Handle both database and legacy invoices
              const id = inv.id || getInvoiceId(inv);
              const isPaidInvoice = inv.status === "PAID" || paidMap[id];
              
              // Calculate remaining days and title based on payment status
              const remaining = daysUntil(new Date(inv.dueDate));
              const title = isPaidInvoice 
                ? "تم الدفع"
                : remaining > 0
                  ? `${remaining} يوم متبقي لدفع الاستحقاق`
                  : `متأخرة ${Math.abs(remaining)} يوم`;
              
              const isOpen = expanded === id && !isPaidInvoice;
              const statusColor = isPaidInvoice 
                ? "text-green-400"
                : remaining > 0 
                  ? "text-[#EAD06C]" 
                  : "text-red-400";
              return (
                <div
                  key={inv.id || inv.index || index}
                  className="rounded-2xl border border-[#333336] bg-[#0F0F0F] overflow-hidden"
                >
                  <div
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${
                      isOpen ? "bg-[#141414]" : ""
                    }`}
                  >
                    <button
                      onClick={() => !isPaidInvoice && setExpanded(isOpen ? null : id)}
                      className={`w-full flex items-center justify-between ${isPaidInvoice ? 'cursor-default' : 'cursor-pointer'}`}
                      disabled={isPaidInvoice}
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1b1b1b] border border-[#2a2a2a] flex items-center justify-center ${isPaidInvoice ? 'text-gray-500 cursor-default' : 'text-gray-300 cursor-pointer'}`}>
                        {!isPaidInvoice ? (
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isOpen ? "rotate-90" : "rotate-0"
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 5l7 7-7 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 flex justify-center">
                        <div
                          dir="rtl"
                          className="px-4 sm:px-5 py-1.5 rounded-full bg-[#1f1f1f] border border-[#2d2d2f] text-sm sm:text-base text-gray-200 truncate"
                        >
                          <span
                            className={`${statusColor}`}
                            style={{ unicodeBidi: "plaintext" }}
                          >
                            {title}
                          </span>
                        </div>
                      </div>

                      <div className="px-3.5 py-1.5 text-xs sm:text-sm bg-[#1a1a1a] rounded-full border border-[#333336] text-gray-200 flex items-center gap-2">
                        #{inv.index}
                        {Math.max(0, -remaining) > 0 && !paidMap[id] && (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Could open a modal here; auto-send is already handled
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                // Could open a modal here; auto-send is already handled
                              }
                            }}
                            title="إشعارات التأخير"
                            className="ml-1 text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-4 h-4"
                              fill="currentColor"
                            >
                              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`inv-${inv.index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        {INVOICES_DISABLED_FOR_ACCOUNT ? (
                          <div
                            className="px-4 sm:px-6 py-8 text-center"
                            dir="rtl"
                          >
                            <div className="mx-auto max-w-md rounded-xl border border-[#333336] bg-[#141414] px-6 py-8">
                              <svg
                                className="mx-auto mb-4 h-10 w-10 text-gray-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                              </svg>
                              <p className="text-base sm:text-lg text-gray-300">
                                هذه الفاتورة معطلة لهذا الحساب
                              </p>
                            </div>
                          </div>
                        ) : (
                        <div className="px-4 sm:px-6 pb-6">
                          {showPaidBannerFor === id && (
                            <div
                              className="mb-3 px-4 py-2 rounded-lg bg-green-900/30 border border-green-600 text-green-300 text-sm flex items-center gap-2"
                              dir="rtl"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5"
                                fill="currentColor"
                              >
                                <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z" />
                              </svg>
                              تم اكمال دفع الفاتورة بنجاح
                            </div>
                          )}
                          <div className="bg-white text-black rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 sm:p-6 text-sm sm:text-base">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                                {/* Left: Company details */}
                                <div className="text-left w-full sm:w-auto">
                                  <div className="font-semibold text-base sm:text-lg">
                                    Alpha Factory
                                  </div>
                                  <div className="text-gray-700 text-xs sm:text-sm leading-5 sm:leading-6">
                                    789 Madison Ave, New York, NY 10065, USA
                                    <br />
                                    support@alphafactory.net |
                                    www.alphafactory.net
                                    <br />
                                    Bill To: {session?.data?.user?.email || session?.user?.email || session?.email || "Loading..."}
                                  </div>
                                </div>

                                {/* Right: Invoice title and dates (RTL) */}
                                <div className="text-right w-full sm:w-auto" dir="rtl">
                                  <div className="font-bold text-base sm:text-lg">الفاتورة</div>
                                  <div className="text-sm">التاريخ: {formatDate(new Date())}</div>
                                  <div className="text-sm">
                                    تاريخ الاستحقاق: {formatDate(new Date(inv.dueDate))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className="border border-[#333336] mx-3 sm:mx-6"
                              dir="rtl"
                            >
                              {/* Desktop Table Header */}
                              <div className="hidden md:grid grid-cols-6 text-sm sm:text-base bg-gray-50">
                                <div className="border-l px-4 py-3 text-right">
                                  اسم المشروع
                                </div>
                                <div className="border-l px-4 py-3 text-right">
                                  نوع المشروع
                                </div>
                                <div className="border-l px-4 py-3 text-right">
                                  العمل المنجز
                                </div>
                                <div className="border-l px-4 py-3 text-right">
                                  السعر
                                </div>
                                <div className="border-l px-4 py-3 text-right">
                                  المدة
                                </div>
                                <div className="px-4 py-3 text-right">
                                  المجموع
                                </div>
                              </div>
                              {(inv.invoice_item || inv.items || []).map((item: InvoiceItem, i: number) => (
                                <div key={i}>
                                  {/* Desktop Table Row */}
                                  <div
                                    className={`hidden md:grid grid-cols-6 text-sm sm:text-base border-t ${
                                      i % 2 === 1 ? "bg-gray-50/70" : "bg-white"
                                    }`}
                                    dir="rtl"
                                  >
                                    <div className="border-l px-4 py-3 text-right">
                                      {item.projectName}
                                    </div>
                                    <div className="border-l px-4 py-3 text-right">
                                      {item.projectType}
                                    </div>
                                    <div className="border-l px-4 py-3 text-right">
                                      <div className="flex flex-wrap gap-1">
                                        {item.workDescription && item.workDescription.split(" - ")[0].split(" + ").map((work: string, idx: number) => (
                                          <span 
                                            key={idx}
                                            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                              work.includes("قيد التنفيذ") 
                                                ? "bg-yellow-100 text-yellow-800" 
                                                : work === "العمل قيد التنفيذ"
                                                ? "bg-gray-100 text-gray-600"
                                                : "bg-green-100 text-green-800"
                                            }`}
                                          >
                                            {work}
                                          </span>
                                        ))}
                                        {/* Show duration info if available */}
                                        {item.workDescription && item.workDescription.includes("مدة الفيديو") && (
                                          <div className="text-xs text-gray-600 mt-1">
                                            {item.workDescription.split(" - ").find((part: string) => part.includes("مدة الفيديو"))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="border-l px-4 py-3 text-right">
                                      {item.unitPrice === 0 ? (
                                        <div className="text-yellow-600 text-sm">في الانتظار</div>
                                      ) : (
                                        <>
                                          <div className="font-medium">${item.unitPrice}</div>
                                          <div className="text-xs text-gray-600">
                                            {item.workDescription && item.workDescription.includes("دولار للدقيقة") ? "للدقيقة" : 
                                             item.workDescription && item.workDescription.includes("دولار للتصميم") ? "للتصميم" : ""}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <div className="border-l px-4 py-3 text-right">
                                      {item.quantity === 0 ? (
                                        <div className="text-yellow-600 text-sm">في الانتظار</div>
                                      ) : (
                                        <>
                                          <div className="font-medium">{item.quantity}</div>
                                          <div className="text-xs text-gray-600">
                                            {item.projectType === "تصاميم الصور المصغرة" || 
                                             item.projectType === "تصاميم الصور المصغرة (ثمبنيل)" || 
                                             item.projectType?.includes("تصميم") || 
                                             item.projectType?.includes("ثمبنيل") ? "تصميم" : 
                                             item.quantity === 1 ? "دقيقة" : "دقائق"}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <div className="px-4 py-3 text-right font-medium">
                                      {item.total === 0 ? (
                                        <div className="text-yellow-600 text-sm">في الانتظار</div>
                                      ) : (
                                        formatCurrency(item.total)
                                      )}
                                    </div>
                                  </div>

                                  {/* Mobile Card Layout */}
                                  <div
                                    className={`md:hidden border-t p-4 ${
                                      i % 2 === 1 ? "bg-gray-50/70" : "bg-white"
                                    }`}
                                    dir="rtl"
                                  >
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="font-medium text-sm">{item.projectName}</div>
                                          <div className="text-xs text-gray-600 mt-1">{item.projectType}</div>
                                        </div>
                                        <div className="text-left">
                                          {item.total === 0 ? (
                                            <div className="text-yellow-600 text-sm">في الانتظار</div>
                                          ) : (
                                            <div className="font-bold text-lg">{formatCurrency(item.total)}</div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-1">
                                        {item.workDescription && item.workDescription.split(" - ")[0].split(" + ").map((work: string, idx: number) => (
                                          <span 
                                            key={idx}
                                            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                              work.includes("قيد التنفيذ") 
                                                ? "bg-yellow-100 text-yellow-800" 
                                                : work === "العمل قيد التنفيذ"
                                                ? "bg-gray-100 text-gray-600"
                                                : "bg-green-100 text-green-800"
                                            }`}
                                          >
                                            {work}
                                          </span>
                                        ))}
                                      </div>

                                      {item.workDescription && item.workDescription.includes("مدة الفيديو") && (
                                        <div className="text-xs text-gray-600">
                                          {item.workDescription.split(" - ").find((part: string) => part.includes("مدة الفيديو"))}
                                        </div>
                                      )}

                                      <div className="flex justify-between text-sm">
                                        <div>
                                          <span className="text-gray-600">السعر: </span>
                                          {item.unitPrice === 0 ? (
                                            <span className="text-yellow-600">في الانتظار</span>
                                          ) : (
                                            <>
                                              <span className="font-medium">${item.unitPrice}</span>
                                              <span className="text-xs text-gray-600 mr-1">
                                                {item.workDescription && item.workDescription.includes("دولار للدقيقة") ? "للدقيقة" : 
                                                 item.workDescription && item.workDescription.includes("دولار للتصميم") ? "للتصميم" : ""}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        <div>
                                          <span className="text-gray-600">المدة: </span>
                                          {item.quantity === 0 ? (
                                            <span className="text-yellow-600">في الانتظار</span>
                                          ) : (
                                            <>
                                              <span className="font-medium">{item.quantity}</span>
                                              <span className="text-xs text-gray-600 mr-1">
                                                {item.projectType === "تصاميم الصور المصغرة" || 
                                                 item.projectType === "تصاميم الصور المصغرة (ثمبنيل)" || 
                                                 item.projectType?.includes("تصميم") || 
                                                 item.projectType?.includes("ثمبنيل") ? "تصميم" : 
                                                 item.quantity === 1 ? "دقيقة" : "دقائق"}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 mx-3 sm:mx-6">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                {!isPaidInvoice ? (
                                  <>
                                    <PayPalButton
                                      amount={inv.totalAmount || inv.grandTotal || 0}
                                      description={`Alpha Factory Invoice #${inv.invoiceNumber || inv.index}`}
                                      invoiceId={`invoice_${id}`}
                                      disabled={hasWaitingItems(inv) || !(inv.totalAmount || inv.grandTotal) || (inv.totalAmount || inv.grandTotal) === 0 || !isInvoiceReadyForPayment(inv)}
                                      onSuccess={(data) => {
                                        console.log('Payment successful:', data);
                                        markPaid(inv);
                                      }}
                                      onError={(error) => {
                                        console.error('Payment error:', error);
                                        setPaymentStatus('فشل في الدفع');
                                        setTimeout(() => setPaymentStatus(null), 5000);
                                      }}
                                      onCancel={() => {
                                        setPaymentStatus('تم إلغاء الدفع');
                                        setTimeout(() => setPaymentStatus(null), 5000);
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        if (hasWaitingItems(inv) || !(inv.totalAmount || inv.grandTotal) || (inv.totalAmount || inv.grandTotal) === 0 || !isInvoiceReadyForPayment(inv)) {
                                          return; // Do nothing if disabled
                                        }
                                        setCryptoToast('دفع العملات المشفرة قيد التطوير - سيتم تفعيله قريباً! ');
                                        setTimeout(() => setCryptoToast(null), 4000);
                                      }}
                                      disabled={hasWaitingItems(inv) || !(inv.totalAmount || inv.grandTotal) || (inv.totalAmount || inv.grandTotal) === 0 || !isInvoiceReadyForPayment(inv)}
                                      className={`flex items-center gap-2 text-sm sm:text-base font-semibold px-4 sm:px-10 py-2 rounded-lg transition-all duration-300 ${
                                        hasWaitingItems(inv) || !(inv.totalAmount || inv.grandTotal) || (inv.totalAmount || inv.grandTotal) === 0 || !isInvoiceReadyForPayment(inv)
                                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                          : 'bg-[#0B0B0B] text-white cursor-pointer hover:bg-[#0B0B0B]/80'
                                      }`}
                                    >
                                      <Image
                                        src="/icons/crypto.svg"
                                        alt="Crypto"
                                        width={18}
                                        height={18}
                                        className="h-[18px] w-[18px]"
                                      />
                                      Crypto
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-5 h-5"
                                      fill="currentColor"
                                    >
                                      <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z" />
                                    </svg>
                                    تم الدفع
                                  </div>
                                )}
                              </div>
                              <div
                                className="text-base sm:text-lg font-bold text-right w-full sm:w-auto"
                                dir="rtl"
                              >
                                <span style={{ unicodeBidi: "plaintext" }}>
                                  المجموع الكلي{" "}
                                  {inv.totalAmount !== undefined
                                    ? `: ${formatCurrency(inv.totalAmount)}`
                                    : inv.grandTotal !== undefined
                                    ? `: ${formatCurrency(inv.grandTotal)}`
                                    : ":"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Terms Modal */}
        {showTermsModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <div
              className="max-w-3xl w-full bg-[#0F0F0F] border border-[#333336] rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="max-h-[75vh] overflow-y-auto af-scroll p-6 text-right text-gray-200"
                dir="rtl"
              >
                <div className="text-lg font-semibold mb-4">
                  جدول التسعير ومواعيد التسليم
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="font-medium mb-3">💰 جدول التسعير</div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-[#333336]">
                          <th className="py-2">نوع المشروع</th>
                          <th className="py-2">السعر</th>
                        </tr>
                      </thead>
                      <tbody className="[&>tr:nth-child(even)]:bg-[#151515]">
                        <tr>
                          <td className="py-2">
                            مشاريع المحتوى الطويل (فيديوهات طويلة)
                          </td>
                          <td className="py-2">9$ / الدقيقة</td>
                        </tr>
                        <tr>
                          <td className="py-2">
                            مشاريع المحتوى القصير (فيديوهات قصيرة)
                          </td>
                          <td className="py-2">39$ / الدقيقة</td>
                        </tr>
                        <tr>
                          <td className="py-2">
                            مشاريع الإعلانات (مقاطع ترويجية)
                          </td>
                          <td className="py-2">49$ / الدقيقة</td>
                        </tr>
                        <tr>
                          <td className="py-2">
                            تصاميم الصور المصغرة (ثَمبُنيل)
                          </td>
                          <td className="py-2">19$ / التصميم</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div className="font-medium mb-3">
                      ⏰ جدول مواعيد تسليم المشاريع
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-[#333336]">
                          <th className="py-2 text-right">نوع المشروع</th>
                          <th className="py-2 text-right">مدة المشروع</th>
                          <th className="py-2 text-right">مدة التسليم المتوقعة</th>
                        </tr>
                      </thead>
                      <tbody className="[&>tr:nth-child(even)]:bg-[#151515]">
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            مشاريع المحتوى الطويل [فيديوهات طويلة]
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            8 - 15 دقائق
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            1 - 3 أيام
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            15 - 30 دقيقة
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            3 - 5 أيام
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            30 - 60 دقيقة
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            4 - 6 أيام
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            1 - 5 ساعات
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            4 - 7 أيام
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            مشاريع المحتوى القصير [فيديوهات قصيرة]
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            10 ثوان - 1 دقيقة
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            0 - 1 يوم
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            1 - 3 دقائق
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            1 - 2 أيام
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            مشاريع الإعلانات [مقاطع ترويجية]
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            10 ثوان - 1 دقيقة
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            0 - 1 يوم
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            1 - 3 دقائق
                          </td>
                          <td className="py-3 px-2 border-b border-[#333336]">
                            1 - 2 أيام
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2">
                            تصاميم الصور المصغرة [ثَمبُنيلات]
                          </td>
                          <td className="py-3 px-2">
                            تصميم واحد
                          </td>
                          <td className="py-3 px-2">
                            1 - 24 ساعة
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-[#333336] flex justify-end">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333336] hover:bg-[#242424]"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scoped scrollbar styling for modals */}
      <style jsx>{`
        .af-scroll {
          scrollbar-width: thin;
          scrollbar-color: #333336 #0f0f0f;
        }
        .af-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .af-scroll::-webkit-scrollbar-track {
          background: #0f0f0f;
          border-radius: 9999px;
        }
        .af-scroll::-webkit-scrollbar-thumb {
          background: #333336;
          border-radius: 9999px;
        }
        .af-scroll::-webkit-scrollbar-thumb:hover {
          background: #4a4a4a;
        }
      `}</style>
    </div>
  );
}
