import { ReactNode } from "react";

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
    <path d="M12 2l2.9 6.1L22 9.3l-5 5 1.2 7-6.2-3.4L5.8 21.3l1.2-7-5-5 7.1-1.2z" />
  </svg>
);

const PersonAltIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8" opacity="0.9">
    <circle cx="12" cy="7" r="4" />
    <path d="M3 21c0-4.4 4-8 9-8s9 3.6 9 8" />
  </svg>
);

export type ProfileIconId = "iris-orange" | "iris-star" | "iris-brown" | "iris-bright" | "iris-soft";

export interface ProfileIconOption {
  id: ProfileIconId;
  bg: string;
  icon: ReactNode;
}

export const PROFILE_ICON_OPTIONS: ProfileIconOption[] = [
  {
    id: "iris-orange",
    bg: "linear-gradient(135deg, #FF6D3A 0%, #FF4500 100%)",
    icon: <PersonIcon />,
  },
  {
    id: "iris-star",
    bg: "linear-gradient(135deg, #E53000 0%, #CC2200 100%)",
    icon: <StarIcon />,
  },
  {
    id: "iris-brown",
    bg: "linear-gradient(135deg, #B87040 0%, #8B5A2B 100%)",
    icon: <PersonAltIcon />,
  },
  {
    id: "iris-bright",
    bg: "linear-gradient(135deg, #FF8050 0%, #FF5722 100%)",
    icon: <PersonIcon />,
  },
  {
    id: "iris-soft",
    bg: "linear-gradient(135deg, #FF9060 0%, #FF6533 100%)",
    icon: <PersonIcon />,
  },
];

export const DEFAULT_PROFILE_ICON: ProfileIconId = "iris-star";

export function getProfileIconById(iconId: string | null | undefined): ProfileIconOption {
  return (
    PROFILE_ICON_OPTIONS.find((option) => option.id === iconId) ??
    PROFILE_ICON_OPTIONS.find((option) => option.id === DEFAULT_PROFILE_ICON) ??
    PROFILE_ICON_OPTIONS[0]
  );
}
