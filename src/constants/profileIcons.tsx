export type ProfileIconId = "icon-1" | "icon-2" | "icon-3" | "icon-4" | "icon-5" | "icon-6";

export interface ProfileIconOption {
  id: ProfileIconId;
  bg: string;
  icon: React.ReactNode;
}

import React from "react";

const img = (n: number) => (
  <img
    src={`${import.meta.env.BASE_URL}ProfileIcon${n}.png`}
    alt={`Profile icon ${n}`}
    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
  />
);

export const PROFILE_ICON_OPTIONS: ProfileIconOption[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `icon-${n}` as ProfileIconId,
  bg: "transparent",
  icon: img(n),
}));

export const DEFAULT_PROFILE_ICON: ProfileIconId = "icon-1";

export function getProfileIconById(iconId: string | null | undefined): ProfileIconOption {
  return (
    PROFILE_ICON_OPTIONS.find((o) => o.id === iconId) ??
    PROFILE_ICON_OPTIONS.find((o) => o.id === DEFAULT_PROFILE_ICON) ??
    PROFILE_ICON_OPTIONS[0]
  );
}
