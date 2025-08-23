"use client";

interface HeaderProps {
  title: string;
  isMobileMenuOpen: boolean;
  onToggleMenu: () => void;
}

export default function Header({
  title,
  isMobileMenuOpen,
  onToggleMenu,
}: HeaderProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-[#222224] px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-lg font-semibold">{title}</h1>
        <button
          onClick={onToggleMenu}
          className="p-2 text-white hover:bg-[#222224] rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
