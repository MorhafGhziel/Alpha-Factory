"use client";

export default function ClientInvoicesPage() {
  return (
    <div className="min-h-screen text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#EAD06C] mb-6">الفواتير</h1>
        <div className="bg-[#0F0F0F] border border-[#333336] rounded-2xl p-6 text-right">
          <p className="text-gray-300">لا توجد فواتير حالياً.</p>
        </div>
      </div>
    </div>
  );
}
