import { useState } from "react";
import { IrisLogo } from "@/components/IrisLogo";

// ── Nav icon wrapper ───────────────────────────────────────
const NavIcon = ({ active = false, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer"
    style={active ? { background: "linear-gradient(135deg,#FF6B35,#E84000)" } : { background: "transparent" }}
  >
    {children}
  </button>
);

// ── SVG Icons ──────────────────────────────────────────────
const HamburgerIcon  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const HomeIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const MailIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const TaskIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>;
const ChartIcon      = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7"  width="4" height="14"/><rect x="17" y="3"  width="4" height="18"/></svg>;
const SunIcon        = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2"  x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2"  y1="12" x2="5"  y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66"/><line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/></svg>;
const GearIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const HistoryIcon    = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/><polyline points="12 7 12 12 16 14"/></svg>;
const PersonIcon     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const PowerIcon      = () => (
  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(60,20,0,0.7)" }}>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
    <line x1="12" y1="2" x2="12" y2="12"/>
  </svg>
);

export default function IrisDashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [powered, setPowered] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans select-none" style={{ background: "#2A1F14" }}>

      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <aside
        className="flex flex-col items-center py-5 gap-3 flex-shrink-0 z-10"
        style={{ width: 64, background: "#362818", borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Hamburger */}
        <button className="w-9 h-9 flex items-center justify-center mb-1 cursor-pointer" style={{ color: "rgba(255,255,255,0.5)" }}>
          <HamburgerIcon />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ background: "linear-gradient(135deg,#FF6B35,#E84000)" }}>
          <PersonIcon />
        </div>

        {/* MAIN label */}
        <span className="text-xs font-semibold tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)", fontSize: 9 }}>MAIN</span>

        {/* Main nav */}
        <NavIcon active={activeNav === "home"} onClick={() => setActiveNav("home")}>
          <span style={{ color: activeNav === "home" ? "white" : "rgba(255,255,255,0.45)" }}><HomeIcon /></span>
        </NavIcon>
        <NavIcon active={activeNav === "mail"} onClick={() => setActiveNav("mail")}>
          <span style={{ color: activeNav === "mail" ? "white" : "rgba(255,255,255,0.45)" }}><MailIcon /></span>
        </NavIcon>
        <NavIcon active={activeNav === "tasks"} onClick={() => setActiveNav("tasks")}>
          <span style={{ color: activeNav === "tasks" ? "white" : "rgba(255,255,255,0.45)" }}><TaskIcon /></span>
        </NavIcon>
        <NavIcon active={activeNav === "chart"} onClick={() => setActiveNav("chart")}>
          <span style={{ color: activeNav === "chart" ? "white" : "rgba(255,255,255,0.45)" }}><ChartIcon /></span>
        </NavIcon>

        {/* Orange separator */}
        <div className="w-5 h-0.5 rounded-full my-1" style={{ background: "#E84000" }} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav */}
        <NavIcon active={activeNav === "sun"} onClick={() => setActiveNav("sun")}>
          <span style={{ color: "rgba(255,255,255,0.45)" }}><SunIcon /></span>
        </NavIcon>
        <NavIcon active={activeNav === "settings"} onClick={() => setActiveNav("settings")}>
          <span style={{ color: "rgba(255,255,255,0.45)" }}><GearIcon /></span>
        </NavIcon>
        <NavIcon active={activeNav === "history"} onClick={() => setActiveNav("history")}>
          <span style={{ color: "rgba(255,255,255,0.45)" }}><HistoryIcon /></span>
        </NavIcon>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="relative flex-1 flex items-center justify-center overflow-hidden">

        {/* Concentric circles */}
        <div className="relative flex items-center justify-center">

          {/* Outer ring — very dark */}
          <div
            className="absolute rounded-full"
            style={{
              width: 520, height: 520,
              background: "radial-gradient(circle, rgba(90,45,10,0.45) 0%, rgba(30,15,5,0.0) 70%)",
            }}
          />

          {/* Middle ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 360, height: 360,
              background: "radial-gradient(circle, rgba(120,55,15,0.6) 0%, rgba(60,25,5,0.1) 70%)",
            }}
          />

          {/* Inner glow circle */}
          <div
            className="absolute rounded-full"
            style={{
              width: 260, height: 260,
              background: "radial-gradient(circle, rgba(150,60,10,0.7) 0%, rgba(80,30,5,0.2) 75%)",
            }}
          />

          {/* Power button circle */}
          <button
            onClick={() => setPowered((p) => !p)}
            className="relative rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{
              width: 180, height: 180,
              background: powered
                ? "radial-gradient(circle at 40% 35%, #FF8C42, #E03000)"
                : "radial-gradient(circle at 40% 35%, #CC5520, #A03000)",
              boxShadow: powered
                ? "0 0 60px rgba(255,100,30,0.5), 0 0 120px rgba(200,60,0,0.3)"
                : "0 0 30px rgba(150,60,10,0.4)",
              border: "none",
            }}
          >
            <PowerIcon />
          </button>
        </div>

        {/* Bottom text */}
        <p
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-center whitespace-nowrap"
          style={{ color: "#FF7040" }}
        >
          {powered
            ? "Iris est active — analyse en cours…"
            : "Activer Iris pour analyser vos e-mails et préparer vos actions"}
        </p>

        {/* Bottom-right Iris branding */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2">
          <IrisLogo className="w-[52px] h-[52px]" />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold" style={{ color: "#D4621A" }}>iris</span>
            <span className="text-xs" style={{ color: "#7A4020", fontSize: 9 }}>Beta v0.1.0</span>
          </div>
        </div>

      </main>
    </div>
  );
}