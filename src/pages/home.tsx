import { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { isIrisActive, setIsIrisActive } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggle = () => {
    if (isIrisActive) {
      setIsIrisActive(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      setIsIrisActive(true);
      timerRef.current = setTimeout(() => {
        navigate("/emails");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center relative bg-background overflow-hidden">
      {/* Background ambience */}
      {isIrisActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(249,115,22,0.15) 0%, transparent 70%)"
          }}
        />
      )}

      {/* Power orb system */}
      <div className="relative flex items-center justify-center z-10">
        {/* Pulsing outer glow */}
        <motion.div
          animate={{
            scale: isIrisActive ? 1.1 : 1,
            opacity: isIrisActive ? 0.8 : 0,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{
            width: "480px",
            height: "480px",
            background: "radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 75%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Energy ripple waves */}
        {isIrisActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut",
                }}
                className="absolute rounded-full border border-primary/30"
                style={{
                  width: "280px",
                  height: "280px",
                  boxShadow: "0 0 20px rgba(249,115,22,0.1)",
                }}
              />
            ))}
          </div>
        )}

        {/* Rotating energy ring */}
        {isIrisActive && (
          <motion.div
            initial={{ rotate: 0, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 360, opacity: 1, scale: 1 }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              opacity: { duration: 0.5 },
            }}
            className="absolute rounded-full border-2 border-dashed pointer-events-none"
            style={{
              width: "280px",
              height: "280px",
              borderColor: "rgba(249,115,22,0.5)",
              boxShadow: "0 0 30px rgba(249,115,22,0.3)",
            }}
          />
        )}

        {/* Power button */}
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: isIrisActive
              ? "0 0 80px rgba(249,115,22,0.9), inset 0 0 20px rgba(255,255,255,0.3)"
              : "0 0 30px rgba(184,76,40,0.4)",
            backgroundColor: isIrisActive ? "#f97316" : "#b84c28",
          }}
          className="relative w-48 h-48 rounded-full flex items-center justify-center transition-colors duration-500 shadow-2xl"
          style={{
            background: isIrisActive
              ? "radial-gradient(circle, #f97316 0%, #ea580c 100%)"
              : "linear-gradient(135deg, #b84c28 0%, #8a3518 100%)",
          }}
        >
          <motion.div
            animate={{
              rotate: isIrisActive ? 360 : 0,
              scale: isIrisActive ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-14 h-14">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" strokeLinecap="round" />
              <line x1="12" y1="2" x2="12" y2="12" strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.button>
      </div>

      {/* Animated caption */}
      <motion.p
        animate={{
          opacity: isIrisActive ? 1 : 0.8,
          y: isIrisActive ? 5 : 0,
        }}
        className="mt-12 text-sm text-primary/80 font-semibold tracking-wide uppercase"
        style={
          isIrisActive
            ? {
                textShadow:
                  "0 0 8px rgba(249,115,22,0.8), 0 0 24px rgba(249,115,22,0.4), 0 0 48px rgba(249,115,22,0.2)",
              }
            : undefined
        }
      >
        {(isIrisActive ? "Iris s'éveille..." : "Iris est en sommeil")
          .split("")
          .map((char, i) => (
            <motion.span
              key={`${isIrisActive}-${i}`}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.07,
                ease: "easeInOut",
              }}
              style={{ display: "inline-block" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
      </motion.p>

      {/* Iris logo bottom right */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 relative">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#f97316" strokeWidth="1.5" />
            <path d="M16 8 C22 12, 22 20, 16 24 C10 20, 10 12, 16 8Z" fill="#f97316" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold text-primary/70 uppercase tracking-tighter">iris</div>
          <div className="text-[9px] text-muted-foreground">Beta v0.1.0</div>
        </div>
      </div>
    </div>
  );
}
