import { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

import { useProcessingState, useToggleProcessing } from "@/hooks/useProcessingState";

type Size = "large" | "small";

// Large: 192px (w-48 h-48) button, gauge pushed well outward to a 340px SVG viewport.
// Small: 40px (w-10 h-10) button, thin gauge in a 60px SVG viewport.
const SIZE_CONFIG: Record<Size, { button: number; svg: number; radius: number; stroke: number; iconClass: string }> = {
  large: { button: 192, svg: 340, radius: 150, stroke: 6, iconClass: "w-14 h-14" },
  small: { button: 40, svg: 60, radius: 26, stroke: 3, iconClass: "w-5 h-5" },
};

// The gauge isn't a closed loop — it leaves a small rounded gap centered at the bottom.
const GAP_DEGREES = 46;

export function PowerButtonWithProgress({ size = "large" }: { size?: Size }) {
  const [location, navigate] = useLocation();
  const { data: state } = useProcessingState();
  const toggle = useToggleProcessing();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isActive = state?.is_active ?? false;
  const totalEmails = state?.total_emails ?? 0;
  const processedEmails = state?.processed_emails ?? 0;
  const percent = totalEmails > 0 ? Math.min(100, Math.round((processedEmails / totalEmails) * 100)) : 0;

  const { button, svg, radius, stroke, iconClass } = SIZE_CONFIG[size];
  const circumference = 2 * Math.PI * radius;
  const gapFraction = GAP_DEGREES / 360;
  const onLength = circumference * (1 - gapFraction);
  const gapLength = circumference * gapFraction;
  const progressLength = onLength * (percent / 100);
  // Rotates the gauge so the gap sits centered at the bottom, fill starts bottom-left
  // and sweeps clockwise over the top to bottom-right at 100%.
  const gaugeRotation = 90 + GAP_DEGREES / 2;

  function handleToggle() {
    toggle.mutate(undefined, {
      onSuccess: (result) => {
        if (result.is_active && !(size === "small" && location === "/emails")) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            navigate("/emails");
          }, 2000);
        } else if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      },
    });
  }

  const gradientId = `power-ring-gradient-${size}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: svg, height: svg }}>
        {/* Progress ring */}
        <svg
          width={svg}
          height={svg}
          viewBox={`0 0 ${svg} ${svg}`}
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `rotate(${gaugeRotation}deg)` }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {isActive ? (
                <>
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#b84c28" />
                  <stop offset="100%" stopColor="#8a3518" />
                </>
              )}
            </linearGradient>
          </defs>
          {/* Track — gauge, not a closed loop: leaves a rounded gap at the bottom */}
          <circle
            cx={svg / 2}
            cy={svg / 2}
            r={radius}
            fill="none"
            stroke="rgba(249,115,22,0.15)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${onLength} ${gapLength}`}
          />
          {/* Progress — fills within the same gauge arc, same rounded ends */}
          <circle
            cx={svg / 2}
            cy={svg / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${circumference - progressLength}`}
            style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.5s ease" }}
          />
        </svg>

        {/* Power button */}
        <motion.button
          type="button"
          data-tour={size === "large" ? "power-button" : "iris-toggle"}
          onClick={handleToggle}
          disabled={toggle.isPending}
          aria-label={isActive ? "Désactiver Iris" : "Activer Iris"}
          aria-pressed={isActive}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            size === "large"
              ? {
                  boxShadow: isActive
                    ? "0 0 80px rgba(249,115,22,0.9), inset 0 0 20px rgba(255,255,255,0.3)"
                    : "0 0 30px rgba(184,76,40,0.4)",
                  backgroundColor: isActive ? "#f97316" : "#b84c28",
                }
              : {
                  boxShadow: isActive
                    ? "0 0 18px rgba(249,115,22,0.8), inset 0 0 6px rgba(255,255,255,0.2)"
                    : "0 0 8px rgba(184,76,40,0.3)",
                }
          }
          className="relative rounded-full flex items-center justify-center transition-colors duration-500 shadow-2xl shrink-0"
          style={{
            width: button,
            height: button,
            background: isActive
              ? "radial-gradient(circle, #f97316 0%, #ea580c 100%)"
              : "linear-gradient(135deg, #b84c28 0%, #8a3518 100%)",
          }}
          title={size === "small" ? (isActive ? "Iris est active" : "Iris est en sommeil") : undefined}
        >
          <motion.div
            animate={{
              rotate: isActive ? 360 : 0,
              scale: isActive ? (size === "large" ? 1.2 : 1.15) : 1,
            }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className={iconClass}>
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" strokeLinecap="round" />
              <line x1="12" y1="2" x2="12" y2="12" strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.button>
      </div>

      {size === "large" && (
        <p
          className="mt-16 text-xs text-primary/80 font-medium tracking-wide"
          style={
            isActive
              ? {
                  textShadow:
                    "0 0 8px rgba(249,115,22,0.5), 0 0 24px rgba(249,115,22,0.25)",
                }
              : undefined
          }
        >
          {`${processedEmails}/${totalEmails} · ${percent}%`}
        </p>
      )}
    </div>
  );
}
