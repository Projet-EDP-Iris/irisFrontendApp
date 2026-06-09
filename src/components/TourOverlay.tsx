import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Placement = "right" | "left" | "bottom" | "top";

interface TourStep {
  id: string;
  page: string;
  title: string;
  description: string;
  placement: Placement;
}

const STEPS: TourStep[] = [
  {
    id: "power-button",
    page: "/home",
    title: "Bouton Iris",
    description:
      "Activez Iris en appuyant sur ce bouton. Elle analyse vos emails en continu quand elle est allumée. Appuyez à nouveau pour la mettre en veille.",
    placement: "right",
  },
  {
    id: "iris-toggle",
    page: "/emails",
    title: "Contrôle rapide d'Iris",
    description:
      "Ce mini bouton vous permet d'activer ou désactiver Iris directement depuis la page des emails, sans revenir à l'accueil.",
    placement: "bottom",
  },
  {
    id: "email-tabs",
    page: "/emails",
    title: "Catégories d'emails",
    description:
      "Iris trie automatiquement vos emails : RDV (rendez-vous), Action (à traiter), En attente, Bons plans (promos), et Info (informatif).",
    placement: "bottom",
  },
  {
    id: "quick-action",
    page: "/emails",
    title: "Actions rapides (⋮)",
    description:
      "Cliquez sur les trois points oranges pour révéler les actions disponibles : confirmer un RDV, résumer, répondre, ou copier un code promo.",
    placement: "right",
  },
];

const CARD_W = 280;
const CARD_GAP = 14;

interface Pos {
  top: number;
  left: number;
  arrowDir: Placement;
}

function computePos(rect: DOMRect, placement: Placement, vw: number, vh: number): Pos {
  let top = 0;
  let left = 0;
  let arrowDir = placement;

  if (placement === "right") {
    top = rect.top + rect.height / 2 - 60;
    left = rect.right + CARD_GAP;
    // flip to left if no room
    if (left + CARD_W > vw - 8) {
      left = rect.left - CARD_W - CARD_GAP;
      arrowDir = "left";
    }
  } else if (placement === "left") {
    top = rect.top + rect.height / 2 - 60;
    left = rect.left - CARD_W - CARD_GAP;
    if (left < 8) {
      left = rect.right + CARD_GAP;
      arrowDir = "right";
    }
  } else if (placement === "bottom") {
    top = rect.bottom + CARD_GAP;
    left = rect.left;
    if (left + CARD_W > vw - 8) left = vw - CARD_W - 8;
    if (left < 8) left = 8;
    if (top + 160 > vh - 8) {
      top = rect.top - 160 - CARD_GAP;
      arrowDir = "top";
    }
  } else {
    top = rect.top - 160 - CARD_GAP;
    left = rect.left;
    if (left + CARD_W > vw - 8) left = vw - CARD_W - 8;
    if (left < 8) left = 8;
    if (top < 8) {
      top = rect.bottom + CARD_GAP;
      arrowDir = "bottom";
    }
  }

  top = Math.max(8, Math.min(top, vh - 180));
  return { top, left, arrowDir };
}

function arrowStyle(dir: Placement, rect: DOMRect | null): React.CSSProperties {
  if (!rect) return {};
  const base: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    pointerEvents: "none",
  };
  const color = "var(--card, #fff)";
  if (dir === "left") {
    return { ...base, right: -10, top: "50%", transform: "translateY(-50%)", borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: `10px solid ${color}` };
  }
  if (dir === "right") {
    return { ...base, left: -10, top: "50%", transform: "translateY(-50%)", borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: `10px solid ${color}` };
  }
  if (dir === "top") {
    return { ...base, bottom: -10, left: 24, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: `10px solid ${color}` };
  }
  // bottom arrow (points up, card is below element)
  return { ...base, top: -10, left: 24, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: `10px solid ${color}` };
}

export function TourOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [, navigate] = useLocation();

  const measureStep = useCallback((idx: number) => {
    const s = STEPS[idx];
    if (!s) return;
    const el = document.querySelector(`[data-tour="${s.id}"]`);
    if (!el) { setPos(null); setTargetRect(null); return; }
    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    setPos(computePos(rect, s.placement, window.innerWidth, window.innerHeight));
  }, []);

  useEffect(() => {
    const s = STEPS[step];
    if (!s) return;
    navigate(s.page);
    // wait for navigation + paint
    const t = setTimeout(() => measureStep(step), 250);
    return () => clearTimeout(t);
  }, [step, navigate, measureStep]);

  // re-measure on resize
  useEffect(() => {
    const onResize = () => measureStep(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step, measureStep]);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[200]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        {pos && (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: CARD_W, zIndex: 201 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl bg-card border border-border shadow-2xl p-4 relative"
          >
            {/* Arrow */}
            <div style={arrowStyle(pos.arrowDir, targetRect)} />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-foreground leading-snug">{current.title}</p>
              <button
                onClick={onClose}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors -mt-0.5"
              >
                <X size={12} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{current.description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground/50 font-medium">
                {step + 1} / {STEPS.length}
              </span>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  >
                    ← Précédent
                  </button>
                )}
                <button
                  onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
                  className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
                >
                  {isLast ? "Terminer" : "Suivant →"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
