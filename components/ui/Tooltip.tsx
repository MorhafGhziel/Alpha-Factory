interface TooltipProps {
  text: string;
  position?: "left" | "right" | "top" | "bottom";
}

export default function Tooltip({ text, position = "left" }: TooltipProps) {
  const positionClasses = {
    left: "left-16 top-1/2 -translate-y-1/2",
    right: "right-16 top-1/2 -translate-y-1/2",
    top: "top-0 left-1/2 -translate-x-1/2 -translate-y-full",
    bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full",
  };

  const arrowClasses = {
    left: "right-full top-1/2 -translate-y-1/2 rotate-45",
    right: "left-full top-1/2 -translate-y-1/2 -rotate-[135deg]",
    top: "bottom-full left-1/2 -translate-x-1/2 rotate-[135deg]",
    bottom: "top-full left-1/2 -translate-x-1/2 -rotate-45",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} px-3 py-2 bg-[#222224] text-white text-sm rounded-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-lg border border-[#333336]`}
    >
      {text}
      <div
        className={`absolute ${arrowClasses[position]} w-2 h-2 bg-[#222224] border-r border-t border-[#333336]`}
      ></div>
    </div>
  );
}
