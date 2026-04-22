import { useRef, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function LoaderPage() {
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkip, setShowSkip] = useState(false);
  const [exiting, setExiting] = useState(false);

  const proceed = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => navigate("/login"), 700);
  };

  useEffect(() => {
    videoRef.current?.play().catch(proceed);
    const t = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-black"
    >
      <video
        ref={videoRef}
        src="./loader.mp4"
        onEnded={proceed}
        playsInline
        className="w-full h-full object-cover"
      />

      <AnimatePresence>
        {showSkip && !exiting && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={proceed}
            className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide text-white/60 hover:text-white/90 transition-colors duration-300"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            Passer
            <svg
              className="w-3 h-3 opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
