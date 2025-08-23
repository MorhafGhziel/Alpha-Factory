"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export interface MobileMenuItem {
  path: string;
  icon: string;
  alt: string;
  text: string;
  isBorder?: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MobileMenuItem[];
  animated?: boolean;
  width?: string;
  bgColor?: string;
  borderColor?: string;
  iconSize?: number;
}

export default function MobileMenu({
  isOpen,
  onClose,
  items,
  animated = false,
  width = "w-64",
  bgColor = "bg-[#0f0f0f]",
  borderColor = "border-[#222224]",
  iconSize = 24,
}: MobileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const renderMenuItem = (item: MobileMenuItem, index: number) => {
    if (item.isBorder) {
      return (
        <motion.div
          key={`border-${index}`}
          className={`w-full h-px ${borderColor}`}
          initial={animated ? { scaleX: 0 } : false}
          animate={animated ? { scaleX: 1 } : false}
          transition={
            animated ? { delay: 0.2 + index * 0.1, duration: 0.3 } : {}
          }
        />
      );
    }

    const Wrapper = animated ? motion.div : "div";
    const wrapperProps = animated
      ? {
          initial: { y: -20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.1 + index * 0.1, duration: 0.3 },
        }
      : {};

    return (
      <Wrapper key={item.path} className="text-center" {...wrapperProps}>
        <button
          onClick={() => handleNavigation(item.path)}
          className={`w-full p-3 rounded-lg transition-colors cursor-pointer text-left ${
            pathname === item.path
              ? "bg-[#222224] text-white"
              : "text-gray-300 hover:bg-[#222224] hover:text-white"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Image
              src={item.icon}
              alt={item.alt}
              width={iconSize}
              height={iconSize}
              className="w-auto h-auto"
            />
            <span className="text-sm">{item.text}</span>
          </div>
        </button>
      </Wrapper>
    );
  };

  const Overlay = animated ? motion.div : "div";
  const MenuContainer = animated ? motion.div : "div";

  const overlayProps = animated
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {};

  const menuContainerProps = animated
    ? {
        initial: { x: -256, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -256, opacity: 0 },
        transition: {
          type: "spring" as const,
          stiffness: 300,
          damping: 30,
          duration: 0.4,
        },
      }
    : {};

  if (!isOpen) return null;

  const content = (
    <Overlay
      className="lg:hidden fixed inset-0 z-40 backdrop-blur-md bg-black/20"
      onClick={onClose}
      {...overlayProps}
    >
      <MenuContainer
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] ${width} ${bgColor} border-r ${borderColor} p-6`}
        {...menuContainerProps}
      >
        <div className="space-y-6">
          {items.map((item, index) => renderMenuItem(item, index))}
        </div>
      </MenuContainer>
    </Overlay>
  );

  if (animated) {
    return <AnimatePresence>{content}</AnimatePresence>;
  }

  return content;
}
