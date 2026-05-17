"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import MobileMenu from "@/components/ui/MobileMenu";
import Header from "@/components/ui/Header";
import ComingSoonModal from "@/components/ComingSoonModal";
import OverdueRestriction from "@/components/OverdueRestriction";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { useInvoiceNotifications } from "@/src/contexts/InvoiceNotificationContext";
import { useProfileImage } from "@/src/hooks/useProfileImage";

export default function ClientLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  // Invoice notification hook
  const { hasNewInvoice, markInvoiceNotificationAsSeen, showNotificationForNewActivity } = useInvoiceNotifications();
  const profileImage = useProfileImage();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openComingSoonModal = () => {
    setIsComingSoonModalOpen(true);
  };

  const closeComingSoonModal = () => {
    setIsComingSoonModalOpen(false);
  };

  const openInfo = () => setIsInfoOpen(true);
  const closeInfo = () => setIsInfoOpen(false);

  const openBookmark = () => setIsBookmarkOpen(true);
  const closeBookmark = () => setIsBookmarkOpen(false);

  const openSupport = () => {
    try {
      const mailto = `mailto:support@alphafactory.net?subject=${encodeURIComponent(
        "طلب دعم فني - Alpha Factory"
      )}&body=${encodeURIComponent(
        "مرحباً فريق الدعم،\n\nأحتاج إلى مساعدة في:\n\n[يرجى وصف المشكلة أو الاستفسار هنا]\n\nشكراً لكم"
      )}`;
      window.open(mailto, "_blank");
    } catch {
      setToastType("error");
      setToastMsg("تعذر فتح تطبيق البريد، حاول مرة أخرى");
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <ProjectProvider>
      <div className="min-h-screen flex">
        <Header
          showLogo={true}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMenu={toggleMobileMenu}
        />

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          items={[
            {
              path: "/client/profile",
              icon: "/icons/Profile.svg",
              alt: "Profile",
              text: "الملف الشخصي",
              avatarUrl: profileImage,
            },
            {
              path: "",
              icon: "",
              alt: "",
              text: "",
              isBorder: true,
            },
            {
              path: "/client/dashboard",
              icon: "/icons/Manage.svg",
              alt: "Dashboard",
              text: "لوحة التحكم",
            },
            {
              path: "/client/tracking-board",
              icon: "/icons/Adjust.svg",
              alt: "Tracking Board",
              text: "لوحة المتابعة",
            },
            {
              path: "/client/invoices",
              icon: "/icons/Card.svg",
              alt: "Invoices",
              text: "الفواتير",
            },
            // {
            //   path: "/client/community",
            //   icon: "/icons/News.svg",
            //   alt: "Community",
            //   text: "المجتمع",
            // },
            {
              path: "",
              icon: "/icons/Plus.svg",
              alt: "Coming Soon",
              text: "قريباً",
              onClick: openComingSoonModal,
            },
            {
              path: "",
              icon: "/icons/Info.svg",
              alt: "Info",
              text: "معلومات",
              onClick: openInfo,
            },
            {
              path: "",
              icon: "/icons/Bookmark.svg",
              alt: "Bookmark",
              text: "شروط",
              onClick: openBookmark,
            },
            {
              path: "",
              icon: "/icons/Support.svg",
              alt: "Support",
              text: "الدعم",
              onClick: openSupport,
            },
          ]}
          animated={true}
        />

        <Sidebar
          items={[
            {
              path: "/client/profile",
              icon: "/icons/Profile.svg",
              alt: "Profile",
              tooltip: "الملف الشخصي",
              avatarUrl: profileImage,
            },
            {
              path: "",
              icon: "",
              alt: "",
              tooltip: "",
              isBorder: true,
            },
            {
              path: "/client/dashboard",
              icon: "/icons/Manage.svg",
              alt: "Dashboard",
              tooltip: "لوحة التحكم",
            },
            {
              path: "/client/tracking-board",
              icon: "/icons/Adjust.svg",
              alt: "Tracking Board",
              tooltip: "لوحة المتابعة",
            },
            {
              path: "/client/invoices",
              icon: "/icons/Card.svg",
              alt: "Invoices",
              tooltip: "الفواتير",
              hasNotification: hasNewInvoice,
            },
            // {
            //   path: "/client/community",
            //   icon: "/icons/News.svg",
            //   alt: "Community",
            //   tooltip: "المجتمع",
            // },
            {
              path: "",
              icon: "/icons/Plus.svg",
              alt: "Coming Soon",
              tooltip: "قريباً",
              onClick: openComingSoonModal,
            },
            { path: "", icon: "", alt: "", tooltip: "", isSpacer: true },
            {
              path: "",
              icon: "/icons/Info.svg",
              alt: "Info",
              tooltip: "معلومات",
              onClick: openInfo,
            },
            {
              path: "",
              icon: "/icons/Bookmark.svg",
              alt: "Bookmark",
              tooltip: "الشروط",
              onClick: openBookmark,
            },
            {
              path: "",
              icon: "/icons/Support.svg",
              alt: "Support",
              tooltip: "الدعم",
              onClick: openSupport,
            },
            {
              path: "",
              icon: "",
              alt: "",
              tooltip: "",
              isBorder: true,
            },
          ]}
          spacing="space-y-4"
        />

        {/* Main Content */}
        <div className="flex-1">
          <OverdueRestriction>
            <div className="text-center pt-16 lg:pt-0">{children}</div>
          </OverdueRestriction>
          {toastMsg && (
            <div
              className={`af-toast ${
                toastType === "success"
                  ? "af-toast--success"
                  : "af-toast--error"
              }`}
              dir="rtl"
            >
              <div className="af-toast__accent" />
              <div className="af-toast__icon" aria-hidden>
                {toastType === "success" ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                )}
              </div>
              <div className="af-toast__text">{toastMsg}</div>
              <button
                className="af-toast__close"
                onClick={() => setToastMsg(null)}
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Coming Soon Modal */}
        <ComingSoonModal
          isOpen={isComingSoonModalOpen}
          onClose={closeComingSoonModal}
        />

        {/* Info Modal */}
        {isInfoOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={closeInfo}
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
                  معلومات وسياسة الخدمة
                </div>
                <div className="space-y-6 leading-7">
                  <div>
                    <div className="font-semibold mb-2">🔑 التعريفات</div>
                    <p>المنفذ: Alpha Factory.</p>
                    <p>
                    العميل: الشخص أو الجهة التي تطلب الخدمة وتدفع مقابلها.
                    </p>
                    <p>
                    الخدمة: الأعمال والمخرجات التي يقدمها المنفذ للعميل، حسب ما هو مذكور في العرض أو الطلب.
                    </p>
                    <p>
                    المواد: كل ما يرسله العميل لتنفيذ الخدمة (مثل النصوص، الصور، الفيديوهات، الشعارات، التراخيص، بيانات الدخول).
                    </p>
                    <p>
                    اليوم: يُقصد به &quot;يوم عمل&quot; ما لم يُذكر خلاف ذلك (يُستثنى منه العطل والإجازات الرسمية).
                    </p>
                    <p>
                    الفاتورة: مستند مالي يُصدر كل 14 يومًا يوضح قيمة الأعمال المُنجزة خلال الفترة.
                    </p>
                    <p>
                    المشروع: مجموعة الأعمال أو الخدمة المطلوبة من العميل، والتي ينجزها المنفذ ضمن الشروط المحددة.
                    </p>
                    <p>
                    التسليم: تسليم النسخة النهائية أو المخرجات للعميل بعد اكتمال التنفيذ والمراجعات المتفق عليها.
                    </p>
                    <p>
                    المراجعة: جولة من التعديلات أو الملاحظات يقدمها العميل على النسخة المسلَّمة.
                    </p>
                    <p>
                    التعليق: إيقاف مؤقت للخدمات بسبب تأخر العميل في السداد أو مخالفة الشروط.
                    </p>
                    <p>
                    إعادة التفعيل: استرجاع الخدمات بعد سداد المستحقات أو معالجة سبب التعليق.
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">📌 شروط الخدمة</div>
                    <ol className="list-decimal pr-5 space-y-2">
                      <li>
                        <span className="font-medium">بداية العمل:</span> يبدأ العمل بعد استلام المواد الأساسية (نصوص/صور/شعارات/تعليمات) إن وجدت.
                         تاريخ الاستلام هذا هو تاريخ بدء احتساب المهل.
                      </li>
                      <li>
                        <span className="font-medium">مواعيد التسليم:</span>{" "}
                        مواعيد التسليم تعتمد على طول المحتوى كما هو موضح في العرض (موعد تسليم المشاريع). المهل تُحتسب بأيام عمل ما لم يُنص خلاف ذلك.
                        أي تأخير بسبب تأخر العميل في إرسال المواد أو الموافقات يؤخر المهل بنفس مقدار التأخير.
                      </li>
                      <li>
                        <span className="font-medium">التعديلات:</span> كل مشروع يشمل عدد محدد من جولات المراجعة (مذكور في العرض). أي تعديلات إضافية تُحسب برسوم إضافية.
                      </li>
                      <li>
                        <span className="font-medium">الفواتير والدفع:</span>{" "}
                        تُصدر فاتورة مجمعة كل 14 يومًا عن الأعمال المُنجزة خلال الفترة.<br /> يجب سداد الفاتورة خلال 7 أيام من تاريخ الإصدار.<br /> عند التأخر: يوم 3 تذكير، يوم 7 إشعار نهائي، يوم 10 تعليق مؤقت للخدمة (البيانات محفوظة).<br /> تُعاد الخدمة خلال 24 ساعة من استلام الدفع.<br /> قد تُطبق رسوم تأخير تُذكر في عرض السعر أو تُتفق لاحقًا.
                      </li>
                      <li>
                        <span className="font-medium">
                          الإلغاء والدفعات غير المستردة:
                        </span>{" "}
                        الدفعة المقدمة غير قابلة للاسترداد. في حال إلغاء العميل بعد بدء العمل، تُحتسب قيمة ما أنجز حتى تاريخ الإلغاء وتُضاف إلى الفاتورة.
                      </li>
                      <li>
                        <span className="font-medium">الملكية الفكرية:</span>{" "}
                        تُسلم للعميل رخصة استخدام للمخرجات النهائية بعد السداد الكامل بشكل تلقائي. <br /> ملفات المصدر (source files) تُسلم فقط إذا تم الاتفاق عليها. <br /> يحق للمنفذ عرض العمل كعينة في ملفه العام ما لم يُطلب خلاف ذلك كتابةً مع اتفاق وُفِّيَ ماليًا.
                      </li>
                      <li>
                        <span className="font-medium">المسؤولية:</span> المنفذ يبذل عناية مهنية لتقديم العمل وفق المواصفات، لكن لا يضمن نتائج تجارية معينة  <br/>      (مثل عدد المشاهدات أو المبيعات). <br/>لا يتحمّل المنفذ مسؤولية عن أضرار تبعية أو فقدان أرباح.
                      </li>
                      <li>
                        <span className="font-medium">السرية:</span> تُعامل المواد السرية التي يزوّد بها العميل بسرية ولا تُفصح لطرف ثالث إلا بطلب قانوني.
                      </li>
                      <li>
                        <span className="font-medium">الاحتفاظ بالبيانات:</span>{" "}
                        في حالة تعليق الخدمة لعدم السداد، تُحفظ البيانات لمدة 30 يومًا ثم تُحذف بعد إشعار نهائي إذا لم يُسدَّد المبلغ.
                      </li>
                      <li>
                        <span className="font-medium">
                          القوانين والإشعارات:
                        </span>{" "}
                        تُرسل الإشعارات عبر البريد الإلكتروني المسجّل ورقم الواتساب. <br/>  تُفسّر هذه الشروط وفق قوانين [الولايات المتحدة الامريكية] ما لم يتفق الطرفان خلاف ذلك.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-[#333336] flex justify-end">
                <button
                  onClick={closeInfo}
                  className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333336] hover:bg-[#242424]"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookmark Modal (Pricing & timelines) */}
        {isBookmarkOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={closeBookmark}
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
                  onClick={closeBookmark}
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

        /* Toast */
        @keyframes afToastIn {
          from {
            transform: translate(-50%, -8px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .af-toast {
          position: fixed;
          top: 18px;
          left: 50%;
          transform: translate(-50%, 0);
          z-index: 60;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px 10px 10px;
          background: #0f0f0f;
          border: 1px solid #2b2b2b;
          color: #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(4px);
          animation: afToastIn 220ms ease-out;
          max-width: 92vw;
        }
        .af-toast__accent {
          width: 3px;
          align-self: stretch;
          border-radius: 12px 0 0 12px;
          background: linear-gradient(180deg, #ead06c, #8a6b1f);
        }
        .af-toast--error .af-toast__accent {
          background: linear-gradient(180deg, #ef4444, #7f1d1d);
        }
        .af-toast__icon {
          color: #ead06c;
        }
        .af-toast--error .af-toast__icon {
          color: #ef4444;
        }
        .af-toast__text {
          white-space: nowrap;
          font-size: 0.925rem;
        }
        .af-toast__close {
          margin-inline-start: 8px;
          background: transparent;
          color: #9ca3af;
          border: 0;
          line-height: 1;
          font-size: 16px;
          cursor: pointer;
        }
        .af-toast__close:hover {
          color: #e5e7eb;
        }
      `}</style>
    </ProjectProvider>
  );
}
