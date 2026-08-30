import { createContext, useContext, useState, ReactNode } from "react";

const STORAGE_KEY = "iris_reduce_motion";

function getSystemPreference(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function getInitialPreference(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;
  // No explicit choice saved yet: default to the OS-level setting, but this
  // remains a one-time default only — from here on the user's own Settings
  // choice (Accessibilité > Réduire les animations) always wins.
  return getSystemPreference();
}

interface AccessibilityContextType {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  reduceMotion: false,
  setReduceMotion: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState<boolean>(getInitialPreference);

  const setReduceMotion = (value: boolean) => {
    setReduceMotionState(value);
    localStorage.setItem(STORAGE_KEY, value.toString());
  };

  return (
    <AccessibilityContext.Provider value={{ reduceMotion, setReduceMotion }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
