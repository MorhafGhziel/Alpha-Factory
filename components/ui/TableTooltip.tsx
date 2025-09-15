"use client";

import { useState, useRef } from "react";

interface TableTooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  margin?: number;
}

export default function TableTooltip({
  text,
  children,
  className = "",
  maxWidth = "330px",
  margin = 20,
}: TableTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = parseInt(maxWidth.replace("px", ""));
    const screenWidth = window.innerWidth;

    let x = rect.left + rect.width / 2;

    if (x - tooltipWidth / 2 < margin) {
      x = margin + tooltipWidth / 2;
    } else if (x + tooltipWidth / 2 > screenWidth - margin) {
      x = screenWidth - margin - tooltipWidth / 2;
    }

    setPosition({
      x: x,
      y: rect.top - 10,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`cursor-help ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-[9999] px-3 py-2 bg-[#222224] text-white text-sm rounded-lg shadow-lg border border-[#333336] pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translateX(-50%) translateY(-100%)",
            maxWidth: maxWidth,
          }}
        >
          <div className="whitespace-normal text-right">{text}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 rotate-[135deg] w-2 h-2 bg-[#222224] border-r border-t border-[#333336]"></div>
        </div>
      )}
    </>
  );
}
