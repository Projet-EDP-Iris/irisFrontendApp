import { useRef } from "react";
import type { RefObject } from "react";
import { useAnimationFrame } from "framer-motion";

// Leaves a clear gap outside the power gauge (gauge outer edge ~radius 153)
// before the innermost ripple begins, then expands to cover most of the home page.
const BASE_RADIUS = 230;
const MAX_RADIUS = 560;
const DURATION_MS = 2500;
const STAGGER_MS = 800;
const RIPPLE_COUNT = 3;
const POINTS = 72;
const DENT_AMPLITUDE = 26;
const PROXIMITY_SIGMA = 60;
const SVG_SIZE = 1200;
const CENTER = SVG_SIZE / 2;

function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function buildRipplePath(radius: number, mouseAngle: number, mouseDist: number) {
  const proximity = Math.exp(-((radius - mouseDist) ** 2) / (2 * PROXIMITY_SIGMA ** 2));
  let d = "";
  for (let i = 0; i <= POINTS; i++) {
    const theta = (i / POINTS) * Math.PI * 2;
    const bump = DENT_AMPLITUDE * Math.cos(angleDiff(theta, mouseAngle)) * proximity;
    const r = radius + bump;
    const x = CENTER + r * Math.cos(theta);
    const y = CENTER + r * Math.sin(theta);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d + "Z";
}

export function RippleField({
  active,
  mouseAngleRef,
  mouseDistRef,
}: {
  active: boolean;
  mouseAngleRef: RefObject<number>;
  mouseDistRef: RefObject<number>;
}) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useAnimationFrame((elapsed) => {
    if (!active) return;
    const mouseAngle = mouseAngleRef.current ?? 0;
    const mouseDist = mouseDistRef.current ?? Infinity;

    for (let i = 0; i < RIPPLE_COUNT; i++) {
      const path = pathRefs.current[i];
      if (!path) continue;
      const raw = elapsed - i * STAGGER_MS;
      if (raw < 0) {
        path.style.opacity = "0";
        continue;
      }
      const t = (raw % DURATION_MS) / DURATION_MS;
      const radius = BASE_RADIUS + t * (MAX_RADIUS - BASE_RADIUS);
      path.setAttribute("d", buildRipplePath(radius, mouseAngle, mouseDist));
      path.style.opacity = String(0.5 * (1 - t));
    }
  });

  if (!active) return null;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: SVG_SIZE,
        height: SVG_SIZE,
        overflow: "visible",
      }}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
    >
      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          fill="none"
          stroke="rgba(249,115,22,0.35)"
          strokeWidth={1.5}
          style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.25))" }}
        />
      ))}
    </svg>
  );
}
