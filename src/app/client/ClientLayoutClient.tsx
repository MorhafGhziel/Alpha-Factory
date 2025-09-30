"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import MobileMenu from "@/components/ui/MobileMenu";
import Header from "@/components/ui/Header";
import ComingSoonModal from "@/components/ComingSoonModal";
import { ProjectProvider } from "@/contexts/ProjectContext";

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

  const copySupport = async () => {
    try {
      await navigator.clipboard.writeText("support@alphafactory.net");
      setToastType("success");
      setToastMsg("تم نسخ البريد: support@alphafactory.net");
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setToastType("error");
      setToastMsg("تعذر النسخ، حاول مرة أخرى");
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <ProjectProvider>
      <div className="min-h-screen flex">
        <Header
          title="Client Panel"
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
            {
              path: "/client/community",
              icon: "/icons/News.svg",
              alt: "Community",
              text: "المجتمع",
            },
            {
              path: "",
              icon: "/icons/Plus.svg",
              alt: "Coming Soon",
              text: "قريباً",
              onClick: openComingSoonModal,
            },
            {
              path: "",
              icon: "/icons/info.svg",
              alt: "Info",
              text: "معلومات",
              onClick: openInfo,
            },
            {
              path: "",
              icon: "/icons/bookmark.svg",
              alt: "Bookmark",
              text: "شروط",
              onClick: openBookmark,
            },
            {
              path: "",
              icon: "/icons/support.svg",
              alt: "Support",
              text: "الدعم",
              onClick: copySupport,
            },
            {
              path: "",
              icon: "",
              alt: "",
              text: "",
              isBorder: true,
            },
            {
              path: "",
              icon: "",
              alt: "Sign Out",
              text: "تسجيل الخروج",
              onClick: async () => {
                try {
                  const response = await fetch("/api/auth/signout", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (response.ok) {
                    window.location.href = "/";
                  }
                } catch (error) {
                  console.error("Error signing out:", error);
                }
              },
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
            },
            {
              path: "/client/community",
              icon: "/icons/News.svg",
              alt: "Community",
              tooltip: "المجتمع",
            },
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
              icon: "/icons/info.svg",
              alt: "Info",
              tooltip: "معلومات",
              onClick: openInfo,
            },
            {
              path: "",
              icon: "/icons/bookmark.svg",
              alt: "Bookmark",
              tooltip: "الشروط",
              onClick: openBookmark,
            },
            {
              path: "",
              icon: "/icons/support.svg",
              alt: "Support",
              tooltip: "الدعم",
              onClick: copySupport,
            },
            {
              path: "",
              icon: "",
              alt: "",
              tooltip: "",
              isBorder: true,
            },
            {
              path: "",
              icon: "",
              alt: "Sign Out",
              tooltip: "تسجيل الخروج",
              onClick: async () => {
                try {
                  const response = await fetch("/api/auth/signout", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (response.ok) {
                    window.location.href = "/";
                  }
                } catch (error) {
                  console.error("Error signing out:", error);
                }
              },
            },
          ]}
          spacing="space-y-4"
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="text-center pt-16 lg:pt-0">{children}</div>
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
                      الخدمة: الأعمال والمخرجات التي يقدمها المنفذ للعميل، حسب
                      ما هو مذكور في العرض أو الطلب.
                    </p>
                    <p>
                      المواد: كل ما يرسله العميل لتنفيذ الخدمة (مثل النصوص،
                      الصور، الفيديوهات، الشعارات، التراخيص، بيانات الدخول).
                    </p>
                    <p>
                      اليوم: يُقصد به &quot;يوم عمل&quot; ما لم يُذكر خلاف ذلك
                      (يُستثنى منه العطل والإجازات الرسمية).
                    </p>
                    <p>
                      الفاتورة: مستند مالي يُصدر كل 14 يومًا يوضح قيمة الأعمال
                      المُنجزة خلال الفترة.
                    </p>
                    <p>
                      المشروع: مجموعة الأعمال أو الخدمة المطلوبة من العميل،
                      والتي ينجزها المنفذ ضمن الشروط المحددة.
                    </p>
                    <p>
                      التسليم: تسليم النسخة النهائية أو المخرجات للعميل بعد
                      اكتمال التنفيذ والمراجعات المتفق عليها.
                    </p>
                    <p>
                      المراجعة: جولة من التعديلات أو الملاحظات يقدمها العميل على
                      النسخة المسلَّمة.
                    </p>
                    <p>
                      التعليق: إيقاف مؤقت للخدمات بسبب تأخر العميل في السداد أو
                      مخالفة الشروط.
                    </p>
                    <p>
                      إعادة التفعيل: استرجاع الخدمات بعد سداد المستحقات أو
                      معالجة سبب التعليق.
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">📌 شروط الخدمة</div>
                    <ol className="list-decimal pr-5 space-y-2">
                      <li>
                        <span className="font-medium">بداية العمل:</span> يبدأ
                        العمل بعد استلام المواد الأساسية
                        (نصوص/صور/شعارات/تعليمات) إن وجدت. تاريخ الاستلام هذا هو
                        تاريخ بدء احتساب المهل.
                      </li>
                      <li>
                        <span className="font-medium">مواعيد التسليم:</span>{" "}
                        تعتمد على طول المحتوى كما هو موضح في العرض (موعد تسليم
                        المشاريع). المهل تُحتسب بأيام عمل. أي تأخير من العميل
                        يؤخر المهل بنفس المقدار.
                      </li>
                      <li>
                        <span className="font-medium">التعديلات:</span> كل مشروع
                        يشمل عدد محدد من جولات المراجعة. أي تعديلات إضافية تُحسب
                        برسوم إضافية.
                      </li>
                      <li>
                        <span className="font-medium">الفواتير والدفع:</span>{" "}
                        تُصدر فاتورة كل 14 يومًا؛ يُدفع خلال 7 أيام. يوم 3
                        تذكير، يوم 7 إشعار، يوم 10 تعليق مؤقت. تُعاد الخدمة خلال
                        24 ساعة من استلام الدفع.
                      </li>
                      <li>
                        <span className="font-medium">
                          الإلغاء والدفعات غير المستردة:
                        </span>{" "}
                        الدفعة المقدمة غير قابلة للاسترداد. عند الإلغاء بعد
                        البدء تُحتسب الأعمال المنجزة.
                      </li>
                      <li>
                        <span className="font-medium">الملكية الفكرية:</span>{" "}
                        تُسلَّم رخصة استخدام للمخرجات بعد السداد الكامل. ملفات
                        المصدر تُسلَّم فقط باتفاق.
                      </li>
                      <li>
                        <span className="font-medium">المسؤولية:</span> لا يضمن
                        المنفذ نتائج تجارية محددة ولا يتحمّل أضرارًا تبعية.
                      </li>
                      <li>
                        <span className="font-medium">السرية:</span> تُعامل
                        المواد السرية بحرص ولا تُفصح لطرف ثالث إلا بطلب قانوني.
                      </li>
                      <li>
                        <span className="font-medium">الاحتفاظ بالبيانات:</span>{" "}
                        عند التعليق تُحفظ البيانات 30 يومًا ثم تُحذف بعد إشعار
                        نهائي إن لم يُسدَّد.
                      </li>
                      <li>
                        <span className="font-medium">
                          القوانين والإشعارات:
                        </span>{" "}
                        الإشعارات عبر البريد والواتساب. تُفسَّر الشروط وفق
                        قوانين الولايات المتحدة الأمريكية ما لم يُتفق خلاف ذلك.
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
                          <th className="py-2">نوع المشروع</th>
                          <th className="py-2">مدة المشروع</th>
                          <th className="py-2">مدة التسليم المتوقعة</th>
                        </tr>
                      </thead>
                      <tbody className="[&>tr:nth-child(even)]:bg-[#151515]">
                        <tr>
                          <td className="py-2">المحتوى الطويل</td>
                          <td className="py-2">8 - 15 دقائق</td>
                          <td className="py-2">1 - 3 أيام</td>
                        </tr>
                        <tr>
                          <td className="py-2">المحتوى القصير</td>
                          <td className="py-2">15 - 30 دقيقة</td>
                          <td className="py-2">3 - 5 أيام</td>
                        </tr>
                        <tr>
                          <td className="py-2">الإعلانات</td>
                          <td className="py-2">30 - 60 دقيقة</td>
                          <td className="py-2">4 - 6 أيام</td>
                        </tr>
                        <tr>
                          <td className="py-2">تصميم الصور</td>
                          <td className="py-2">تصميم واحد</td>
                          <td className="py-2">4 - 24 ساعة</td>
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
