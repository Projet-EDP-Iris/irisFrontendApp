import { useState } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [, navigate] = useLocation();
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col h-full items-center justify-center relative bg-background">
      {/* Power orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <div
          className={`absolute rounded-full transition-all duration-700 ${
            isActive ? "opacity-90" : "opacity-60"
          }`}
          style={{
            width: "420px",
            height: "420px",
            background: isActive
              ? "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(180,80,20,0.3) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(249,115,22,0.35) 0%, rgba(180,80,20,0.2) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: "320px",
            height: "320px",
            background: isActive
              ? "radial-gradient(circle, rgba(220,100,40,0.6) 0%, rgba(160,70,20,0.4) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(200,90,35,0.45) 0%, rgba(140,60,15,0.3) 50%, transparent 75%)",
          }}
        />
        {/* Inner circle - clickable */}
        <button
          onClick={() => {
            setIsActive(!isActive);
            if (!isActive) {
              setTimeout(() => navigate("/emails"), 600);
            }
          }}
          className="relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: isActive
              ? "radial-gradient(circle, #c05530 0%, #9a3f20 60%)"
              : "radial-gradient(circle, #b84c28 0%, #8a3518 60%)",
            boxShadow: isActive
              ? "0 0 40px rgba(249,115,22,0.6), inset 0 1px 0 rgba(255,255,255,0.1)"
              : "0 0 30px rgba(180,76,40,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Power icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,220,180,0.7)" strokeWidth="2" className="w-12 h-12">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" strokeLinecap="round" />
            <line x1="12" y1="2" x2="12" y2="12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Caption */}
      <p className="mt-8 text-sm text-primary/80 font-medium">
        Activer Iris pour analyser vos e-mails et préparer vos actions
      </p>

      {/* Iris logo bottom right */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2">
        <div className="w-10 h-10 relative">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#f97316" strokeWidth="1.5" opacity="0.7" />
            <circle cx="16" cy="16" r="8" fill="#f97316" opacity="0.25" />
            <path d="M16 8 C22 12, 22 20, 16 24 C10 20, 10 12, 16 8Z" fill="#f97316" opacity="0.5" />
            <circle cx="16" cy="16" r="3" fill="#f97316" opacity="0.8" />
            <circle cx="20" cy="10" r="1.5" fill="#f97316" opacity="0.9" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold text-primary/70">iris</div>
          <div className="text-[9px] text-muted-foreground">v2.1.0</div>
        </div>
      </div>
    </div>
  );
}
