"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

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
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 });
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setBackgroundOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen]);

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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={onClose}
        />

        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at ${backgroundOffset.x}% ${
              backgroundOffset.y
            }%, 
                rgba(196, 137, 41, 0.3) 0%, 
                rgba(196, 137, 41, 0.1) 25%, 
                rgba(196, 137, 41, 0.05) 50%, 
                transparent 70%),
              radial-gradient(circle at ${100 - backgroundOffset.x}% ${
              100 - backgroundOffset.y
            }%, 
                rgba(233, 207, 107, 0.2) 0%, 
                rgba(233, 207, 107, 0.08) 30%, 
                transparent 60%)
            `,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              conic-gradient(from ${backgroundOffset.x * 3.6}deg at ${
              backgroundOffset.x
            }% ${backgroundOffset.y}%, 
                transparent 0deg, 
                rgba(255, 255, 255, 0.03) 60deg, 
                transparent 120deg, 
                rgba(196, 137, 41, 0.02) 180deg, 
                transparent 240deg, 
                rgba(233, 207, 107, 0.03) 300deg, 
                transparent 360deg)
            `,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        <div className="md:hidden relative z-[100] w-full max-w-md">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, x: 50, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, x: -50, scale: 0.9, rotateY: -15 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/30 to-gray-800/30 border border-white/20 backdrop-blur-xl shadow-2xl">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              />
              <div className="relative p-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Image
                    src={images[currentImageIndex].src}
                    alt={images[currentImageIndex].alt}
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-between mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <motion.button
              onClick={prevImage}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-800/95 to-gray-700/95 hover:from-gray-700/95 hover:to-gray-600/95 transition-all duration-300 text-white backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-white/20"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
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

            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <span className="text-white/90 text-sm font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                {currentImageIndex + 1} of {images.length}
              </span>
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-white scale-125 shadow-lg shadow-white/30"
                        : "bg-white/40 hover:bg-white/60 hover:scale-110"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.2 }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.button
              onClick={nextImage}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-800/95 to-gray-700/95 hover:from-gray-700/95 hover:to-gray-600/95 transition-all duration-300 text-white backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-white/20"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
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
          </motion.div>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-12 max-w-7xl mx-4 relative z-[100]">
          <motion.div
            ref={(el) => {
              cardRefs.current[0] = el;
            }}
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 80, rotateX: -20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
            whileHover={{
              scale: 1.05,
              y: -10,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            onMouseMove={(e) => handleMouseMove(e, 0)}
            onMouseLeave={() => handleMouseLeave(0)}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            <div className="relative">
              <motion.div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/30 to-gray-800/30 border border-white/20 backdrop-blur-xl transition-all duration-500 ease-out shadow-2xl"
                whileHover={{
                  boxShadow:
                    "0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.1)",
                  transition: { duration: 0.3 },
                }}
              >
                <motion.div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 0
                      ? "border-2 border-white/50 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                      : "border-2 border-transparent"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                />

                <motion.div
                  className="relative p-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Image
                    src="/images/Soon1.svg"
                    alt="Coming Soon 1"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </motion.div>

                <motion.div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 0
                      ? "bg-gradient-to-t from-black/50 via-transparent to-transparent"
                      : "bg-transparent"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                />

                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            ref={(el) => {
              cardRefs.current[1] = el;
            }}
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 80, rotateX: -20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.4,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
            whileHover={{
              scale: 1.05,
              y: -10,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            onMouseMove={(e) => handleMouseMove(e, 1)}
            onMouseLeave={() => handleMouseLeave(1)}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            <div className="relative">
              <motion.div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/30 to-gray-800/30 border border-white/20 backdrop-blur-xl transition-all duration-500 ease-out shadow-2xl"
                whileHover={{
                  boxShadow:
                    "0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.1)",
                  transition: { duration: 0.3 },
                }}
              >
                <motion.div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 1
                      ? "border-2 border-white/50 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                      : "border-2 border-transparent"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                />

                <motion.div
                  className="relative p-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <Image
                    src="/images/Soon2.svg"
                    alt="Coming Soon 2"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </motion.div>

                <motion.div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 1
                      ? "bg-gradient-to-t from-black/50 via-transparent to-transparent"
                      : "bg-transparent"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                />

                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            ref={(el) => {
              cardRefs.current[2] = el;
            }}
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 80, rotateX: -20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
            whileHover={{
              scale: 1.05,
              y: -10,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            onMouseMove={(e) => handleMouseMove(e, 2)}
            onMouseLeave={() => handleMouseLeave(2)}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            <div className="relative">
              <motion.div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/30 to-gray-800/30 border border-white/20 backdrop-blur-xl transition-all duration-500 ease-out shadow-2xl"
                whileHover={{
                  boxShadow:
                    "0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.1)",
                  transition: { duration: 0.3 },
                }}
              >
                <motion.div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 2
                      ? "border-2 border-white/50 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                      : "border-2 border-transparent"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                />

                <motion.div
                  className="relative p-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <Image
                    src="/images/Soon3.svg"
                    alt="Coming Soon 3"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </motion.div>

                <motion.div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    hoveredImage === 2
                      ? "bg-gradient-to-t from-black/50 via-transparent to-transparent"
                      : "bg-transparent"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                />

                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.button
          onClick={onClose}
          className="absolute cursor-pointer bottom-8 md:bottom-30 left-1/2 transform -translate-x-1/2 md:w-16 md:h-16 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-800/95 to-gray-700/95 hover:from-gray-700/95 hover:to-gray-600/95 transition-all duration-300 text-white backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-white/30 z-[200]"
          initial={{ opacity: 0, y: 50, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          whileHover={{
            scale: 1.15,
            y: -5,
            rotate: 90,
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.2)",
            transition: { duration: 0.3, ease: "easeOut" },
          }}
          whileTap={{ scale: 0.9 }}
          transition={{
            delay: 1.2,
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          <motion.svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </motion.svg>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
