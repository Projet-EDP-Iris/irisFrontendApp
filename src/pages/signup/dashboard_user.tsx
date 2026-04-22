import { useState } from "react";

// ── Iris orbit logo (bottom right) ────────────────────────
const IrisOrbitLogo = () => (
  <svg width="52" height="52" viewBox="0 0 58 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="orbitGrad" x1="25" y1="49" x2="25" y2="5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF3D00" /><stop offset="1" stopColor="#A05533" />
      </linearGradient>
    </defs>
    <path d="M36.8118 62.5754C36.2386 61.6164 36.296 61.1969 37.0986 60.1779C38.0732 59.0391 38.0732 59.0391 39.2199 60.2978C40.0225 61.1969 40.1372 61.6763 39.6784 61.8562C39.2773 61.976 38.9905 62.4555 38.9905 62.935C38.9905 64.1933 37.6721 63.9536 36.8118 62.5754Z" fill="url(#orbitGrad)" />
    <path d="M22.4792 52.5663C21.9632 51.6073 22.0205 51.1278 22.5938 50.6484C23.7978 49.5695 24.8871 51.2477 23.8551 52.6862C23.1098 53.7651 23.0525 53.7651 22.4792 52.5663Z" fill="url(#orbitGrad)" />
    <path d="M41.4557 48.4307C40.4811 47.8913 39.5064 47.1121 39.3344 46.6327C38.9332 45.6141 38.9906 45.6141 41.4557 46.6926C42.5451 47.1721 43.5198 47.4118 43.6915 47.292C43.8062 47.1721 44.7235 46.9923 45.6408 46.8724C49.5394 46.5727 47.3607 42.1378 39.3344 33.8069L34.9772 29.3718L33.3147 30.3907C31.2508 31.6493 29.1295 31.7092 26.6643 30.4506C24.3138 29.3119 23.3391 27.0344 23.5684 23.3185C23.7404 20.6215 23.6258 20.3817 21.5046 18.7635C20.2433 17.8645 18.982 17.0853 18.6953 17.0254C18.4087 17.0254 17.6634 16.5459 17.0327 16.0066C16.0008 14.9877 15.8861 14.9877 14.6248 16.6658C12.6182 19.3029 11.2423 24.3973 11.6436 28.1132C12.5609 37.5829 21.2179 45.2545 30.1042 44.4753C33.2573 44.1756 34.3467 44.775 31.9961 45.4343C28.9002 46.273 22.3645 45.7939 19.7273 44.5352C16.2301 42.7971 11.4143 37.7627 9.75171 34.1665C7.63047 29.5516 7.3438 23.2585 9.0064 18.344C9.75171 16.1264 10.5543 14.1486 10.8983 13.789C11.701 12.9499 10.2677 11.8711 6.99982 11.032C4.64923 10.4926 3.78928 10.4327 3.15864 11.032C1.95469 12.0509 2.06936 13.0098 3.73196 16.4261C5.33723 19.7824 5.27988 20.082 3.21597 17.9244C-0.338545 14.2085 -0.911854 11.5714 1.32405 9.35387C2.92932 7.79559 6.08251 7.67572 9.46505 8.99425C10.7263 9.53368 12.1023 9.9532 12.5036 9.9532C12.8476 10.0131 13.1916 10.3128 13.1916 10.6724C13.1916 11.1519 13.3062 11.1519 13.6502 10.6724C14.5675 9.234 21.1605 5.69788 24.0271 5.09855C28.2123 4.19953 31.5374 4.73896 36.4681 7.19626C39.4491 8.63467 41.2837 10.0731 42.9462 12.1708C44.265 13.789 45.297 15.4671 45.297 15.8867C45.297 16.3661 45.6982 17.2652 46.157 17.8645C46.7302 18.6436 47.0169 20.3817 46.9596 22.6592V26.3152L45.8129 22.2397C45.1823 19.9622 44.3224 17.6847 43.8635 17.2052C43.4051 16.7258 43.0036 16.1264 43.0036 15.8867C43.0036 14.8079 39.1053 11.4515 36.1813 10.0131C31.4801 7.67572 26.091 7.73565 21.8485 10.133C20.1286 11.1519 18.638 12.2307 18.5807 12.5304C18.466 12.89 20.0713 14.2685 22.1352 15.6469C25.747 18.1042 25.919 18.1642 28.3269 17.5049C30.4482 16.9055 31.0788 16.9655 33.0279 17.9844C35.4934 19.243 36.9266 21.7003 36.8692 24.5771C36.8119 26.1953 37.6145 27.334 41.9142 32.0089C49.8832 40.5794 51.7179 44.9548 48.8516 48.3708C47.7622 49.6894 43.9783 49.6894 41.4557 48.4307Z" fill="url(#orbitGrad)" />
    <path d="M2.41366 43.0967C2.01234 42.2576 1.43903 41.5983 1.03771 41.5983C0.69373 41.5983 0.865724 40.9989 1.55369 40.2797C2.18434 39.5005 2.87231 38.4819 3.0443 38.0024C3.21629 37.3431 3.50294 37.5829 3.96159 38.7813C4.30557 39.6803 4.82155 40.3996 5.16553 40.3996C5.45219 40.3996 5.73885 40.6992 5.73885 40.9989C5.73885 41.3585 5.33752 41.5983 4.8789 41.5983C4.42025 41.5983 4.01891 42.1377 4.01891 42.7371C4.01891 44.5352 3.10163 44.715 2.41366 43.0967Z" fill="url(#orbitGrad)" />
    <path d="M55.6165 40.3996C55.6165 39.98 55.158 39.2608 54.5848 38.7213C53.5528 37.7624 53.5528 37.6425 54.7566 36.4441L56.018 35.2454L57.1647 36.564C58.2537 37.8223 58.2537 37.8822 56.9353 39.4406C56.19 40.3396 55.6165 40.7592 55.6165 40.3996Z" fill="url(#orbitGrad)" />
    <path d="M53.3808 20.7413C52.9794 19.9022 52.9794 19.3029 53.5529 18.5237C54.2981 17.4449 54.3555 17.4449 54.9287 18.5837C55.3302 19.4228 55.3302 20.0221 54.7566 20.8012C54.0114 21.88 53.954 21.88 53.3808 20.7413Z" fill="url(#orbitGrad)" />
    <path d="M10.5544 1.38276C10.0957 0.543685 11.5863 -0.475195 12.2743 0.244014C12.7903 0.783421 12.2743 2.04203 11.4717 2.04203C11.185 2.04203 10.7837 1.74236 10.5544 1.38276Z" fill="url(#orbitGrad)" />
  </svg>
);

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
          <IrisOrbitLogo />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold" style={{ color: "#D4621A" }}>iris</span>
            <span className="text-xs" style={{ color: "#7A4020", fontSize: 9 }}>Beta v0.1.0</span>
          </div>
        </div>

      </main>
    </div>
  );
}