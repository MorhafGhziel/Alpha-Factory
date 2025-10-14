"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Project } from "@/src/types";
import PayPalButton from "@/components/ui/PayPalButton";

type InvoiceItem = {
  id: string;
  projectId: string;
  projectName: string;
  projectType: string;
  unitPrice?: number; // to be provided by backend
  quantity?: number; // optional if you decide to multiply
  total?: number; // computed by backend or derived from unitPrice*quantity
  workDate?: Date; // optional
};

type Invoice = {
  index: number;
  startDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  grandTotal?: number; // optional aggregate from backend
};

const DAY_MS = 24 * 60 * 60 * 1000;

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
    return new Intl.NumberFormat("ar-EG", {
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

// Define when a project is considered completed for invoicing
function isProjectCompleted(p: Project): boolean {
  // Reuse the completion criteria used in tracking board auto-verification
  const filmingDone = p.filmingStatus === "تم الانتـــهاء مــنه";
  const hasFiles = Boolean(p.fileLinks && p.fileLinks.trim() !== "");
  const editDone = p.editMode === "تم الانتهاء منه";
  const reviewDone = p.reviewMode === "تمت المراجعة";
  const designDone = p.designMode === "تم الانتهاء منه";
  return filmingDone && hasFiles && editDone && reviewDone && designDone;
}

export default function ClientInvoicesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [paidMap, setPaidMap] = useState<Record<string, boolean>>({});
  // Reminder modal state removed; auto-sending only
  const [showPaidBannerFor, setShowPaidBannerFor] = useState<string | null>(
    null
  );
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to load projects");
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
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

  const invoices = useMemo<Invoice[]>(() => {
    if (!projects.length) return [];

    // Determine the start of the first invoice period based on the first project worked on
    // Use earliest of createdAt or date field
    const dates: Date[] = projects
      .map((p) => {
        if (p.createdAt) return new Date(p.createdAt);
        // p.date is string, try parse as dd-mm-yyyy or yyyy-mm-dd
        const s = p.date;
        if (!s) return null as unknown as Date;
        // Try ISO first
        const iso = new Date(s);
        if (!isNaN(iso.getTime())) return iso;
        // Try dd-mm-yyyy
        const parts = s.split(/[\/-]/);
        if (parts.length === 3) {
          const [d, m, y] = parts.map((x) => parseInt(x, 10));
          const guess = new Date(y, (m || 1) - 1, d || 1);
          if (!isNaN(guess.getTime())) return guess;
        }
        return new Date();
      })
      .filter(Boolean) as Date[];

    if (!dates.length) return [];
    const first = new Date(Math.min(...dates.map((d) => d.getTime())));

    // Build 14-day windows from first date to now+1 period
    const result: Invoice[] = [];
    const sortedCompleted = projects
      .filter(isProjectCompleted)
      .sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );

    const now = new Date();
    let periodStart = new Date(first);
    let idx = 1;
    while (periodStart <= now || result.length === 0) {
      const periodEnd = new Date(periodStart.getTime() + 14 * DAY_MS);
      const bucket = sortedCompleted.filter((p) => {
        const completedAt = new Date(p.updatedAt);
        return completedAt >= periodStart && completedAt < periodEnd;
      });

      const items: InvoiceItem[] = bucket.map((p) => ({
        id: `${p.id}`,
        projectId: p.id,
        projectName: p.title,
        projectType: p.type,
        // unitPrice, quantity, total and workDate intentionally left undefined for backend to fill
      }));

      result.push({
        index: idx,
        startDate: new Date(periodStart),
        dueDate: new Date(periodEnd),
        items,
      });

      idx += 1;
      periodStart = periodEnd;
      // Safety stop to avoid infinite loops
      if (idx > 200) break;
    }

    return result.reverse(); // latest first
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
    setTimeout(
      () => setShowPaidBannerFor((cur) => (cur === id ? null : cur)),
      4000
    );
  }

  function wasReminderSent(id: string, day: 3 | 7 | 10) {
    try {
      return localStorage.getItem(`af_inv_${id}_rem_${day}`) === "1";
    } catch {
      return false;
    }
  }

  function setReminderSent(id: string, day: 3 | 7 | 10) {
    try {
      localStorage.setItem(`af_inv_${id}_rem_${day}`, "1");
    } catch {}
  }

  // Attempt to trigger email and also show message in app
  async function triggerEmail(kind: "3" | "7" | "10") {
    const subjectMap: Record<string, string> = {
      "3": "تذكير بالدفع - بعد 3 أيام من تاريخ الاستحقاق",
      "7": "تعليق مؤقت للحساب - تأخير 7 أيام",
      "10": "إيقاف نهائي للحساب - تأخير 10 أيام",
    };

    const body3 = `عزيزي العميل\n\nنود تذكيرك بضرورة تسديد الفاتورة في الوقت المحدد لضمان استمرار الخدمة دون أي انقطاع:\n\n• بعد 3 أيام من تاريخ الاستحقاق: سيتم إرسال تذكير إضافي بالدفع\n• بعد 7 أيام من التأخير: سيتم تعليق الحساب بشكل مؤقت\n• بعد 10 أيام من التأخير: سيتوقف الحساب بشكل كامل\n\nنرجوا منك تجاوز عملية الدفع في أسرع وقت ممكن. ولأي استفسار أو مساعدة في عملية السداد، يرجى التواصل مع فريق الدعم.\n\nمع التقدير،\nفريق Alpha Factory`;
    const body7 = `عزيزي العميل،\n\nنود إعلامك بأنه تم تعليق حسابك مؤقتاً بسبب عدم تسديد الفاتورة المستحقة خلال المدة المحددة.\nيمكنك إعادة تفعيل الحساب فوراً عن طريق إتمام عملية الدفع\n\nنرجو منك الإسراع في السداد لتفادي انتقال الحساب إلى الإيقاف الكامل بعد مرور 10 أيام\n\nمع الشكر والتقدير،\nفريق Alpha Factory`;
    const body10 = `عزيزي العميل\n\nنود إعلامك أنه قد تم إيقاف حسابك نهائياً بسبب عدم تسديد الفاتورة المستحقة خلال الفترة المحددة (10 أيام من تاريخ الاستحقاق)\n\nيرجى ملاحظة ما يلي:\n• لا يمكن إعادة تفعيل الحساب عبر الدفع المباشر.\n• لمتابعة الإجراءات وتسوية المبالغ المستحقة، يجب التواصل مع فريق الدعم حصراً.\n\nللتواصل مع الدعم، الرجاء مراسلتنا عبر البريد: support@alphafactory.net\n\nفي حال عدم التواصل خلال فترة وجيزة، تحتفظ الشركة بحقها في اتخاذ أي خطوات إضافية بخصوص المبلغ غير المسدد.\n\nمع التحية،\nإدارة Alpha Factory`;

    const msg = kind === "3" ? body3 : kind === "7" ? body7 : body10;

    // Try API notification
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project_update",
          message: `${subjectMap[kind]}\n\n${msg}`,
        }),
      });
    } catch {}

    // Fallback: open mail client so the email can be sent by user
    try {
      const mailto = `mailto:support@alphafactory.net?subject=${encodeURIComponent(
        subjectMap[kind]
      )}&body=${encodeURIComponent(msg)}`;
      window.open(mailto, "_blank");
    } catch {}

    setEmailNotice("تم إرسال رسالة التذكير عبر البريد");
    setTimeout(() => setEmailNotice(null), 4000);
  }

  // Auto trigger per threshold (3/7/10) once per invoice (frontend-only)
  useEffect(() => {
    invoices.forEach((inv) => {
      const id = getInvoiceId(inv);
      if (paidMap[id]) return;
      const remaining = daysUntil(inv.dueDate);
      const overdue = Math.max(0, -remaining);
      if (overdue >= 10 && !wasReminderSent(id, 10)) {
        setReminderSent(id, 10);
        triggerEmail("10");
      } else if (overdue >= 7 && !wasReminderSent(id, 7)) {
        setReminderSent(id, 7);
        triggerEmail("7");
      } else if (overdue >= 3 && !wasReminderSent(id, 3)) {
        setReminderSent(id, 3);
        triggerEmail("3");
      }
    });
  }, [invoices, paidMap]);

  return (
    <div className="min-h-screen text-white md:py-20 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="w-full text-center md:mb-34 mb-14">
          <h1 className="text-5xl bg-gradient-to-l from-white to-black bg-clip-text text-transparent font-light">
            الفواتير{" "}
          </h1>
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
            {(emailNotice || paymentStatus) && (
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
              </div>
            )}
            {invoices.map((inv) => {
              const remaining = daysUntil(inv.dueDate);
              const title =
                remaining > 0
                  ? `${remaining} يوم متبقي لدفع الاستحقاق`
                  : `متأخرة ${Math.abs(remaining)} يوم`;
              const isOpen = expanded === inv.index;
              const statusColor =
                remaining > 0 ? "text-[#EAD06C]" : "text-red-400";
              const id = getInvoiceId(inv);
              return (
                <div
                  key={inv.index}
                  className="rounded-2xl border border-[#333336] bg-[#0F0F0F] overflow-hidden"
                >
                  <div
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${
                      isOpen ? "bg-[#141414]" : ""
                    }`}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : inv.index)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1b1b1b] border border-[#2a2a2a] flex items-center justify-center text-gray-300 cursor-pointer">
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
                            <div className="p-5 sm:p-6 text-sm sm:text-base">
                              <div className="flex items-start justify-between gap-6">
                                {/* Left: Company details */}
                                <div className="text-left">
                                  <div className="font-semibold text-base sm:text-lg">
                                    Alpha Factory
                                  </div>
                                  <div className="text-gray-700 text-xs sm:text-sm leading-6">
                                    789 Madison Ave, New York, NY 10065, USA
                                    <br />
                                    support@alphafactory.net |
                                    www.alphafactory.net
                                    <br />
                                    Bill To: —
                                  </div>
                                </div>

                                {/* Right: Invoice title and dates (RTL) */}
                                <div className="text-right" dir="rtl">
                                  <div className="font-bold">الفاتورة</div>
                                  <div>التاريخ: {formatDate(new Date())}</div>
                                  <div>
                                    تاريخ الاستحقاق: {formatDate(inv.dueDate)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className="border border-[#333336] mx-3 sm:mx-6"
                              dir="rtl"
                            >
                              <div className="grid grid-cols-4 text-sm sm:text-base bg-gray-50">
                                <div className="border-l px-4 py-3 text-right">
                                  اسم المشروع
                                </div>
                                <div className="border-l px-4 py-3 text-right">
                                  نوع المشروع
                                </div>
                                <div className="border-l px-4 py-3 text-right">
                                  السعر/الوحدة
                                </div>
                                <div className="px-4 py-3 text-right">
                                  المجموع
                                </div>
                              </div>
                              {(
                                (inv.items.length
                                  ? inv.items
                                  : new Array<InvoiceItem | null>(5).fill(
                                      null
                                    )) as (InvoiceItem | null)[]
                              ).map((item, i) => {
                                const it = item as InvoiceItem | null;
                                return (
                                  <div
                                    key={i}
                                    className={`grid grid-cols-4 text-sm sm:text-base border-t ${
                                      i % 2 === 1 ? "bg-gray-50/70" : "bg-white"
                                    }`}
                                    dir="rtl"
                                  >
                                    <div className="border-l px-4 py-3 text-right">
                                      {it?.projectName ?? "\u00A0"}
                                    </div>
                                    <div className="border-l px-4 py-3 text-right">
                                      {it?.projectType ?? "\u00A0"}
                                    </div>
                                    <div className="border-l px-4 py-3 text-right">
                                      {formatCurrency(it?.unitPrice)}
                                    </div>
                                    <div className="px-4 py-3 text-right">
                                      {formatCurrency(it?.total)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between p-4 sm:p-5 mx-3 sm:mx-6">
                              <div className="flex items-center gap-3 sm:gap-4">
                                {!paidMap[id] ? (
                                  <>
                                    <PayPalButton
                                      amount={inv.grandTotal || 100} // Default $100 for testing
                                      description={`Alpha Factory Invoice #${inv.index}`}
                                      invoiceId={id}
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
                                      onClick={() => markPaid(inv)}
                                      className="cursor-pointer flex items-center gap-2 text-white text-sm sm:text-base font-semibold px-4 sm:px-10 py-2 rounded-lg bg-[#0B0B0B] hover:bg-[#0B0B0B]/80 transition-all duration-300"
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
                                className="text-sm sm:text-base font-bold"
                                dir="rtl"
                              >
                                <span style={{ unicodeBidi: "plaintext" }}>
                                  المجموع الكلي{" "}
                                  {inv.grandTotal !== undefined
                                    ? `: ${formatCurrency(inv.grandTotal)}`
                                    : ":"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
