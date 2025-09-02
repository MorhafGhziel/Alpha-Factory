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
    <div className="bg-[#0F0F0F] p-4 rounded-2xl flex-1 border border-[#222224]">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10  bg-[#171308] p-2 rounded-lg">
          <Image
            src={icon}
            alt={iconAlt}
            width={20}
            height={20}
            className="text-white w-full h-auto"
          />
        </div>
        <div>
          <div className="text-sm text-gray-300">{title}</div>
        </div>
      </div>
      <div className="text-[40px] font-bold text-white justify-end flex">
        {value}
      </div>
    </div>
  );
}
