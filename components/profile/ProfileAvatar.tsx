"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchProfileImage,
  notifyProfileImageUpdated,
} from "@/src/hooks/useProfileImage";

export default function ProfileAvatar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvatar = useCallback(async () => {
    try {
      const image = await fetchProfileImage();
      setAvatarUrl(image);
    } catch (err) {
      console.error("Error loading profile image:", err);
    } finally {
      setLoadingImage(false);
    }
  }, []);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const previousUrl = avatarUrl;
    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      setAvatarUrl(data.imageUrl);
      notifyProfileImageUpdated(data.imageUrl);
    } catch (err) {
      setAvatarUrl(previousUrl);
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-3"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      }}
    >
      <motion.div
        className="relative md:w-24 w-20 md:h-24 h-20 sm:w-28 sm:h-28 rounded-full bg-[#222224] overflow-hidden"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2,
          duration: 0.8,
        }}
      >
        {loadingImage ? (
          <span className="flex w-full h-full items-center justify-center">
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </span>
        ) : avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="صورة الملف الشخصي"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex w-full h-full items-center justify-center">
            <Image
              src="/icons/Profile.svg"
              alt="Profile"
              width={48}
              height={48}
              className="md:w-12 w-10 h-auto sm:w-14"
            />
          </span>
        )}
      </motion.div>

      <button
        type="button"
        onClick={() => !uploading && fileInputRef.current?.click()}
        disabled={uploading || loadingImage}
        className="text-white text-xs hover:cursor-pointer sm:text-sm font-medium px-4 py-2 rounded-full bg-[#222224] hover:bg-[#2e2e30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "جاري الرفع..." : "تغيير الصورة"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="text-red-400 text-xs sm:text-sm text-center max-w-xs">
          {error}
        </p>
      )}
    </motion.div>
  );
}
