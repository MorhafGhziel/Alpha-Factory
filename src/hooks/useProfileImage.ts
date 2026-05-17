"use client";

import { useCallback, useEffect, useState } from "react";

export const PROFILE_IMAGE_UPDATED_EVENT = "profile-image-updated";

export async function fetchProfileImage(): Promise<string | null> {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user?.image ?? null;
}

export function notifyProfileImageUpdated(imageUrl: string | null) {
  window.dispatchEvent(
    new CustomEvent(PROFILE_IMAGE_UPDATED_EVENT, { detail: imageUrl }),
  );
}

export function useProfileImage() {
  const [image, setImage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const url = await fetchProfileImage();
    setImage(url);
  }, []);

  useEffect(() => {
    load();

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<string | null>).detail;
      if (detail !== undefined) {
        setImage(detail);
      } else {
        load();
      }
    };

    window.addEventListener(PROFILE_IMAGE_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(PROFILE_IMAGE_UPDATED_EVENT, onUpdate);
  }, [load]);

  return image;
}
