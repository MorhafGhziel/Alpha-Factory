"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useRef } from "react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({
  isOpen,
  onClose,
}: ComingSoonModalProps) {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!isOpen) return null;

  const images = [
    { src: "/images/Soon1.svg", alt: "Coming Soon 1" },
    { src: "/images/Soon2.svg", alt: "Coming Soon 2" },
    { src: "/images/Soon3.svg", alt: "Coming Soon 3" },
  ];

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    imageIndex: number
  ) => {
    const card = cardRefs.current[imageIndex];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;

    const rotateY = normalizedX * 20;
    const rotateX = -normalizedY * 15;

    const shadowX = normalizedX * 20;
    const shadowY = normalizedY * 20;
    const shadowBlur = Math.abs(normalizedX) * 30 + Math.abs(normalizedY) * 30;

    card.style.transform = `
      perspective(1200px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      scale3d(1.05, 1.05, 1.05)
      translateZ(20px)
    `;

    card.style.boxShadow = `
      ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.6),
      0 20px 40px rgba(0, 0, 0, 0.3)
    `;

    setHoveredImage(imageIndex);
  };

  const handleMouseLeave = (imageIndex: number) => {
    const card = cardRefs.current[imageIndex];
    if (card) {
      card.style.transform = `
        perspective(1200px) 
        rotateX(0deg) 
        rotateY(0deg) 
        scale3d(1, 1, 1)
        translateZ(0px)
      `;
      card.style.boxShadow = `
        0 10px 30px rgba(0, 0, 0, 0.2)
      `;
    }
    setHoveredImage(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="absolute inset-0 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        />

        <div className="md:hidden relative z-10 w-full max-w-md">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/20 to-gray-800/20 border border-white/10 backdrop-blur-sm">
              <div className="relative p-4">
                <Image
                  src={images[currentImageIndex].src}
                  alt={images[currentImageIndex].alt}
                  width={400}
                  height={300}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between mt-6">
            <motion.button
              onClick={prevImage}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-800/90 to-gray-700/90 hover:from-gray-700/90 hover:to-gray-600/90 transition-all duration-300 text-white backdrop-blur-xl border border-white/20 shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>

            <div className="flex items-center space-x-2">
              <span className="text-white/80 text-sm font-medium">
                {currentImageIndex + 1} of {images.length}
              </span>
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            <motion.button
              onClick={nextImage}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-800/90 to-gray-700/90 hover:from-gray-700/90 hover:to-gray-600/90 transition-all duration-300 text-white backdrop-blur-xl border border-white/20 shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-12 max-w-7xl mx-4 relative z-10">
          <motion.div
            ref={(el) => {
              cardRefs.current[0] = el;
            }}
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            onMouseMove={(e) => handleMouseMove(e, 0)}
            onMouseLeave={() => handleMouseLeave(0)}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/20 to-gray-800/20 border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out">
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 0
                      ? "border-2 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                      : "border-2 border-transparent"
                  }`}
                />

                <div className="relative p-4">
                  <Image
                    src="/images/Soon1.svg"
                    alt="Coming Soon 1"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>

                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 0
                      ? "bg-gradient-to-t from-black/40 via-transparent to-transparent"
                      : "bg-transparent"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={(el) => {
              cardRefs.current[1] = el;
            }}
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
            }}
            transition={{
              delay: 0.2,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            onMouseMove={(e) => handleMouseMove(e, 1)}
            onMouseLeave={() => handleMouseLeave(1)}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/20 to-gray-800/20 border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out">
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 1
                      ? "border-2 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                      : "border-2 border-transparent"
                  }`}
                />

                <div className="relative p-4">
                  <Image
                    src="/images/Soon2.svg"
                    alt="Coming Soon 2"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>

                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 1
                      ? "bg-gradient-to-t from-black/40 via-transparent to-transparent"
                      : "bg-transparent"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={(el) => {
              cardRefs.current[2] = el;
            }}
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
            }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            onMouseMove={(e) => handleMouseMove(e, 2)}
            onMouseLeave={() => handleMouseLeave(2)}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/20 to-gray-800/20 border border-white/10 backdrop-blur-sm transition-all duration-500 ease-out">
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 2
                      ? "border-2 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                      : "border-2 border-transparent"
                  }`}
                />

                <div className="relative p-4">
                  <Image
                    src="/images/Soon3.svg"
                    alt="Coming Soon 3"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>

                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 2
                      ? "bg-gradient-to-t from-black/40 via-transparent to-transparent"
                      : "bg-transparent"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.button
          onClick={onClose}
          className="absolute cursor-pointer bottom-8 md:bottom-30 left-1/2 transform -translate-x-1/2 md:w-14 md:h-14 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-800/90 to-gray-700/90 hover:from-gray-700/90 hover:to-gray-600/90 transition-all duration-300 text-white backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-white/20 z-20"
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{
            scale: 1.1,
            y: -2,
            transition: { duration: 0.2 },
          }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
