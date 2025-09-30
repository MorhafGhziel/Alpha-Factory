"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Project } from "@/src/types";

type Invoice = {
  index: number;
  startDate: Date;
  dueDate: Date;
  projects: Project[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(d: Date) {
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
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

      result.push({
        index: idx,
        startDate: new Date(periodStart),
        dueDate: new Date(periodEnd),
        projects: bucket,
      });

      idx += 1;
      periodStart = periodEnd;
      // Safety stop to avoid infinite loops
      if (idx > 200) break;
    }

    return result.reverse(); // latest first
  }, [projects]);

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
            {invoices.map((inv) => {
              const remaining = daysUntil(inv.dueDate);
              const title =
                remaining > 0
                  ? `${remaining} يوم متبقي لدفع الاستحقاق`
                  : `متأخرة ${Math.abs(remaining)} يوم`;
              const isOpen = expanded === inv.index;
              const statusColor =
                remaining > 0 ? "text-[#EAD06C]" : "text-red-400";
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

                      <div className="px-3.5 py-1.5 text-xs sm:text-sm bg-[#1a1a1a] rounded-full border border-[#333336] text-gray-200">
                        #{inv.index}
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
                              {(inv.projects.length
                                ? inv.projects
                                : new Array(5).fill(null)
                              ).map((p, i) => (
                                <div
                                  key={i}
                                  className={`grid grid-cols-4 text-sm sm:text-base border-t ${
                                    i % 2 === 1 ? "bg-gray-50/70" : "bg-white"
                                  }`}
                                  dir="rtl"
                                >
                                  <div className="border-l px-4 py-3 text-right">
                                    {p && p.title ? p.title : "\u00A0"}
                                  </div>
                                  <div className="border-l px-4 py-3 text-right">
                                    {p && p.type ? p.type : "\u00A0"}
                                  </div>
                                  <div className="border-l px-4 py-3 text-right">
                                    {p ? "\u00A0" : "\u00A0"}
                                  </div>
                                  <div className="px-4 py-3 text-right">
                                    {p ? "\u00A0" : "\u00A0"}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between p-4 sm:p-5 mx-3 sm:mx-6">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <button className="cursor-pointer flex items-center gap-2 bg-[#F6C557] px-4 sm:px-10 py-2 rounded-lg hover:bg-[#EAD06C] transition-all duration-300">
                                  <Image
                                    src="/icons/PayPal.svg"
                                    alt="PayPal"
                                    width={70}
                                    height={20}
                                    className="h-5 w-auto"
                                  />
                                </button>
                                <button className="cursor-pointer flex items-center gap-2 text-white text-sm sm:text-base font-semibold px-4 sm:px-10 py-2 rounded-lg bg-[#0B0B0B] hover:bg-[#0B0B0B]/80 transition-all duration-300">
                                  <Image
                                    src="/icons/Crypto.svg"
                                    alt="Crypto"
                                    width={18}
                                    height={18}
                                    className="h-[18px] w-[18px]"
                                  />
                                  Crypto
                                </button>
                              </div>
                              <div
                                className="text-sm sm:text-base font-bold"
                                dir="rtl"
                              >
                                <span style={{ unicodeBidi: "plaintext" }}>
                                  المجموع الكلي :
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
