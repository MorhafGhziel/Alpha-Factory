import Image from "next/image";

interface SummaryCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  value: string | number;
}

export default function SummaryCard({
  icon,
  iconAlt,
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="bg-[#0F0F0F] p-3 sm:p-4 rounded-2xl flex-1 border border-[#222224] min-h-[120px] sm:min-h-[140px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#171308] p-1.5 sm:p-2 rounded-lg flex-shrink-0">
          <Image
            src={icon}
            alt={iconAlt}
            width={20}
            height={20}
            className="text-white w-full h-auto"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm text-gray-300 text-right break-words leading-tight">
            {title}
          </div>
        </div>
      </div>
      <div className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-white justify-end flex">
        {value}
      </div>
    </div>
  );
}
