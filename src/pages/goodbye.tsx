import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { IrisLogo } from "@/components/IrisLogo";

// Deliberately short and understated — the opposite of Home's power-orb
// "éveil" sequence (ripple waves, rotating ring, multi-second buildup).
// Logout should feel immediate, not ceremonial.
const EXIT_HOLD_MS = 650;

export default function GoodbyePage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Go straight to /login, not "/" — the root route is the cold-start
    // video splash (loader.tsx), which shouldn't replay right after logout.
    const timeout = setTimeout(() => navigate("/login"), EXIT_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 text-center px-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        >
          <IrisLogo className="w-10 h-10" />
        </motion.div>
        <p className="text-xs font-semibold text-primary/80 tracking-widest uppercase">
          À bientôt
        </p>
      </motion.div>
    </div>
  );
}
