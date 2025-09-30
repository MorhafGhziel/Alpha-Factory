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
  isSpacer?: boolean;
  onClick?: () => void;
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
    if (item.isSpacer) {
      return <div key={`spacer-${index}`} className="flex-1" />;
    }
    if (item.isBorder) {
      return <div key={`border-${index}`} className="w-8 h-px bg-[#222224]" />;
    }

    const handleClick = () => {
      if (item.onClick) {
        item.onClick();
      } else if (item.path) {
        router.push(item.path);
      }
    };

    const isActive = item.path && pathname === item.path;
    const isSignOut = item.alt === "Sign Out";

    return (
      <div key={item.path || index} className="relative group">
        <button
          onClick={handleClick}
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            isActive
              ? "bg-[#222224]"
              : isSignOut
              ? "hover:bg-red-600/20"
              : "hover:bg-[#222224]"
          }`}
        >
          {isSignOut ? (
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17L21 12L16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <Image
              src={item.icon}
              alt={item.alt}
              width={iconSize}
              height={iconSize}
              className="w-auto h-auto"
            />
          )}
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
