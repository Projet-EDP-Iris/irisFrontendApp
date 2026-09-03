import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import type { MouseEvent } from "react";

import { IrisLogo } from "@/components/IrisLogo";
import { APP_VERSION } from "@/lib/version";
import { PowerButtonWithProgress } from "@/components/PowerButtonWithProgress";
import { RippleField } from "@/components/RippleField";
import { useProcessingState } from "@/hooks/useProcessingState";
import { useAccessibility } from "@/context/AccessibilityContext";

// Max drift (px) of the rotating ring toward the cursor.
const RING_PARALLAX_RANGE = 14;

export default function HomePage() {
  const { data: processingState } = useProcessingState();
  const isIrisActive = processingState?.is_active ?? false;
  const { reduceMotion } = useAccessibility();

  const orbRef = useRef<HTMLDivElement>(null);
  const mouseAngleRef = useRef(0);
  const mouseDistRef = useRef(Infinity);

  const ringX = useMotionValue(0);
  const ringY = useMotionValue(0);
  const springX = useSpring(ringX, { stiffness: 120, damping: 20 });
  const springY = useSpring(ringY, { stiffness: 120, damping: 20 });
  // Dashed ring is 380px — offset by half its size so `left/top:50%` plus this
  // (plus the live parallax spring) lands it exactly centered on the orb box.
  const dashedX = useTransform(springX, (v) => v - 190);
  const dashedY = useTransform(springY, (v) => v - 190);

  function handlePageMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!isIrisActive || !orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    mouseAngleRef.current = Math.atan2(dy, dx);
    mouseDistRef.current = Math.hypot(dx, dy);
    ringX.set(Math.max(-1, Math.min(1, dx * 0.04)) * RING_PARALLAX_RANGE);
    ringY.set(Math.max(-1, Math.min(1, dy * 0.04)) * RING_PARALLAX_RANGE);
  }

  function handlePageMouseLeave() {
    ringX.set(0);
    ringY.set(0);
    mouseDistRef.current = Infinity;
  }

  return (
    <div
      className="flex flex-col h-full items-center justify-center relative bg-background overflow-hidden"
      onMouseMove={handlePageMouseMove}
      onMouseLeave={handlePageMouseLeave}
    >
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

      {/* Power orb system — fixed to the gauge's own 340x340 footprint, no flex
          centering (the button's own caption below would otherwise stretch the
          flex cross-size and throw off every decorative layer's center). Each
          decorative layer instead centers itself explicitly via left/top:50%. */}
      <div ref={orbRef} className="relative z-10" style={{ width: 340, height: 340 }}>
        {/* Pulsing outer glow */}
        <motion.div
          animate={{
            scale: isIrisActive ? 1.1 : 1,
            opacity: isIrisActive ? 0.8 : 0,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            x: -240,
            y: -240,
            width: "480px",
            height: "480px",
            background: "radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 75%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Energy ripple waves — sit clearly outside the gauge (button+gauge stay
            centered inside the innermost ripple, not touching it), expand to cover
            most of the page, and dent/undulate toward the cursor. */}
        {isIrisActive && !reduceMotion && (
          <RippleField active={isIrisActive} mouseAngleRef={mouseAngleRef} mouseDistRef={mouseDistRef} />
        )}

        {/* Rotating energy ring — static (no spin) when reduced motion is preferred */}
        {isIrisActive && (
          <motion.div
            initial={{ rotate: 0, opacity: 0, scale: 0.8 }}
            animate={{ rotate: reduceMotion ? 0 : 360, opacity: 1, scale: 1 }}
            transition={{
              rotate: reduceMotion ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: "linear" },
              opacity: { duration: 0.5 },
            }}
            className="absolute rounded-full border-2 border-dashed pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              width: "380px",
              height: "380px",
              borderColor: "rgba(249,115,22,0.5)",
              boxShadow: "0 0 30px rgba(249,115,22,0.3)",
              x: reduceMotion ? -190 : dashedX,
              y: reduceMotion ? -190 : dashedY,
            }}
          />
        )}

        {/* Power button with progress ring */}
        <PowerButtonWithProgress size="large" poll={true} />
      </div>

      {/* Animated caption */}
      <motion.p
        animate={{
          opacity: isIrisActive ? 1 : 0.8,
          y: isIrisActive ? 5 : 0,
        }}
        className="mt-28 text-sm text-primary/80 font-semibold tracking-wide uppercase"
        style={
          isIrisActive
            ? {
                textShadow:
                  "0 0 8px rgba(249,115,22,0.8), 0 0 24px rgba(249,115,22,0.4), 0 0 48px rgba(249,115,22,0.2)",
              }
            : undefined
        }
      >
        {reduceMotion ? (
          isIrisActive ? "Iris s'éveille..." : "Iris est en sommeil"
        ) : (isIrisActive ? "Iris s'éveille..." : "Iris est en sommeil")
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
              {char === " " ? " " : char}
            </motion.span>
          ))}
      </motion.p>

      {/* Iris logo bottom right */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <IrisLogo className="w-10 h-10" />
        <div>
          <div className="text-xs font-bold text-primary/70 uppercase tracking-tighter">iris</div>
          <div className="text-[9px] text-muted-foreground">{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}
