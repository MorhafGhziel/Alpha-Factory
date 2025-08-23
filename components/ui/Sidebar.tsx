"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Tooltip from "./Tooltip";

export interface SidebarItem {
  path: string;
  icon: string;
  alt: string;
  tooltip: string;
  isBorder?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  width?: string;
  bgColor?: string;
  iconSize?: number;
  tooltipPosition?: "left" | "right";
  spacing?: string;
}

export default function Sidebar({
  items,
  width = "w-20",
  bgColor = "bg-[#0f0f0f]",
  iconSize = 34,
  tooltipPosition = "left",
  spacing = "space-y-6",
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const renderSidebarItem = (item: SidebarItem, index: number) => {
    if (item.isBorder) {
      return <div key={`border-${index}`} className="w-8 h-px bg-[#222224]" />;
    }

    return (
      <div key={item.path} className="relative group">
        <button
          onClick={() => router.push(item.path)}
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            pathname === item.path ? "bg-[#222224]" : "hover:bg-[#222224]"
          }`}
        >
          <Image
            src={item.icon}
            alt={item.alt}
            width={iconSize}
            height={iconSize}
            className="w-auto h-auto"
          />
        </button>
        <Tooltip text={item.tooltip} position={tooltipPosition} />
      </div>
    );
  };

  return (
    <div
      className={`hidden lg:flex ${width} ${bgColor} flex-col items-center py-6 ${spacing}`}
    >
      {items.map((item, index) => renderSidebarItem(item, index))}
    </div>
  );
}
