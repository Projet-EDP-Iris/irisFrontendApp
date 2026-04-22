import { useState } from "react";
import { useLocation } from "wouter";
const IrisLogo = ({ className = "w-5 h-6" }) => (
  <svg className={className} viewBox="0 0 58 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="irisGrad3" x1="25" y1="49" x2="25" y2="5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF3D00" /><stop offset="1" stopColor="#A05533" />
      </linearGradient>
    </defs>
    <path d="M36.8118 62.5754C36.2386 61.6164 36.296 61.1969 37.0986 60.1779C38.0732 59.0391 38.0732 59.0391 39.2199 60.2978C40.0225 61.1969 40.1372 61.6763 39.6784 61.8562C39.2773 61.976 38.9905 62.4555 38.9905 62.935C38.9905 64.1933 37.6721 63.9536 36.8118 62.5754Z" fill="url(#irisGrad3)" />
    <path d="M22.4792 52.5663C21.9632 51.6073 22.0205 51.1278 22.5938 50.6484C23.7978 49.5695 24.8871 51.2477 23.8551 52.6862C23.1098 53.7651 23.0525 53.7651 22.4792 52.5663Z" fill="url(#irisGrad3)" />
    <path d="M41.4557 48.4307C40.4811 47.8913 39.5064 47.1121 39.3344 46.6327C38.9332 45.6141 38.9906 45.6141 41.4557 46.6926C42.5451 47.1721 43.5198 47.4118 43.6915 47.292C43.8062 47.1721 44.7235 46.9923 45.6408 46.8724C49.5394 46.5727 47.3607 42.1378 39.3344 33.8069L34.9772 29.3718L33.3147 30.3907C31.2508 31.6493 29.1295 31.7092 26.6643 30.4506C24.3138 29.3119 23.3391 27.0344 23.5684 23.3185C23.7404 20.6215 23.6258 20.3817 21.5046 18.7635C20.2433 17.8645 18.982 17.0853 18.6953 17.0254C18.4087 17.0254 17.6634 16.5459 17.0327 16.0066C16.0008 14.9877 15.8861 14.9877 14.6248 16.6658C12.6182 19.3029 11.2423 24.3973 11.6436 28.1132C12.5609 37.5829 21.2179 45.2545 30.1042 44.4753C33.2573 44.1756 34.3467 44.775 31.9961 45.4343C28.9002 46.273 22.3645 45.7939 19.7273 44.5352C16.2301 42.7971 11.4143 37.7627 9.75171 34.1665C7.63047 29.5516 7.3438 23.2585 9.0064 18.344C9.75171 16.1264 10.5543 14.1486 10.8983 13.789C11.701 12.9499 10.2677 11.8711 6.99982 11.032C4.64923 10.4926 3.78928 10.4327 3.15864 11.032C1.95469 12.0509 2.06936 13.0098 3.73196 16.4261C5.33723 19.7824 5.27988 20.082 3.21597 17.9244C-0.338545 14.2085 -0.911854 11.5714 1.32405 9.35387C2.92932 7.79559 6.08251 7.67572 9.46505 8.99425C10.7263 9.53368 12.1023 9.9532 12.5036 9.9532C12.8476 10.0131 13.1916 10.3128 13.1916 10.6724C13.1916 11.1519 13.3062 11.1519 13.6502 10.6724C14.5675 9.234 21.1605 5.69788 24.0271 5.09855C28.2123 4.19953 31.5374 4.73896 36.4681 7.19626C39.4491 8.63467 41.2837 10.0731 42.9462 12.1708C44.265 13.789 45.297 15.4671 45.297 15.8867C45.297 16.3661 45.6982 17.2652 46.157 17.8645C46.7302 18.6436 47.0169 20.3817 46.9596 22.6592V26.3152L45.8129 22.2397C45.1823 19.9622 44.3224 17.6847 43.8635 17.2052C43.4051 16.7258 43.0036 16.1264 43.0036 15.8867C43.0036 14.8079 39.1053 11.4515 36.1813 10.0131C31.4801 7.67572 26.091 7.73565 21.8485 10.133C20.1286 11.1519 18.638 12.2307 18.5807 12.5304C18.466 12.89 20.0713 14.2685 22.1352 15.6469C25.747 18.1042 25.919 18.1642 28.3269 17.5049C30.4482 16.9055 31.0788 16.9655 33.0279 17.9844C35.4934 19.243 36.9266 21.7003 36.8692 24.5771C36.8119 26.1953 37.6145 27.334 41.9142 32.0089C49.8832 40.5794 51.7179 44.9548 48.8516 48.3708C47.7622 49.6894 43.9783 49.6894 41.4557 48.4307Z" fill="url(#irisGrad3)" />
    <path d="M2.41366 43.0967C2.01234 42.2576 1.43903 41.5983 1.03771 41.5983C0.69373 41.5983 0.865724 40.9989 1.55369 40.2797C2.18434 39.5005 2.87231 38.4819 3.0443 38.0024C3.21629 37.3431 3.50294 37.5829 3.96159 38.7813C4.30557 39.6803 4.82155 40.3996 5.16553 40.3996C5.45219 40.3996 5.73885 40.6992 5.73885 40.9989C5.73885 41.3585 5.33752 41.5983 4.8789 41.5983C4.42025 41.5983 4.01891 42.1377 4.01891 42.7371C4.01891 44.5352 3.10163 44.715 2.41366 43.0967Z" fill="url(#irisGrad3)" />
    <path d="M55.6165 40.3996C55.6165 39.98 55.158 39.2608 54.5848 38.7213C53.5528 37.7624 53.5528 37.6425 54.7566 36.4441L56.018 35.2454L57.1647 36.564C58.2537 37.8223 58.2537 37.8822 56.9353 39.4406C56.19 40.3396 55.6165 40.7592 55.6165 40.3996Z" fill="url(#irisGrad3)" />
    <path d="M53.3808 20.7413C52.9794 19.9022 52.9794 19.3029 53.5529 18.5237C54.2981 17.4449 54.3555 17.4449 54.9287 18.5837C55.3302 19.4228 55.3302 20.0221 54.7566 20.8012C54.0114 21.88 53.954 21.88 53.3808 20.7413Z" fill="url(#irisGrad3)" />
    <path d="M10.5544 1.38276C10.0957 0.543685 11.5863 -0.475195 12.2743 0.244014C12.7903 0.783421 12.2743 2.04203 11.4717 2.04203C11.185 2.04203 10.7837 1.74236 10.5544 1.38276Z" fill="url(#irisGrad3)" />
  </svg>
);


// ── App icons ──────────────────────────────────────────────
const GmailIcon = () => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#22C55E" }}>
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="white" opacity="0.95" />
      <path d="M2 6l10 7 10-7" stroke="#22C55E" strokeWidth="2" fill="none" />
    </svg>
  </div>
);

const CalendarIcon = ({ color = "#3B82F6" }) => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <path d="M3 9h18" stroke={color} strokeWidth="1.5" />
      <rect x="7" y="2" width="2" height="5" rx="1" fill={color} />
      <rect x="15" y="2" width="2" height="5" rx="1" fill={color} />
    </svg>
  </div>
);

const OutlookMailIcon = () => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#0072C6" opacity="0.15" stroke="#0072C6" strokeWidth="1.5" />
      <path d="M2 6l10 7 10-7" stroke="#0072C6" strokeWidth="1.5" fill="none" />
    </svg>
  </div>
);

const AppleCalIcon = () => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#6B7280" opacity="0.15" stroke="#6B7280" strokeWidth="1.5" />
      <path d="M3 9h18" stroke="#6B7280" strokeWidth="1.5" />
      <rect x="7" y="2" width="2" height="5" rx="1" fill="#6B7280" />
      <rect x="15" y="2" width="2" height="5" rx="1" fill="#6B7280" />
    </svg>
  </div>
);

const APPS = [
  { id: "gmail",   label: "Gmail",           icon: <GmailIcon /> },
  { id: "gcal",   label: "Google Calendar",  icon: <CalendarIcon /> },
  { id: "outlook",label: "Outlook Email",    icon: <OutlookMailIcon /> },
  { id: "ocal",   label: "Outlook Calendar", icon: <CalendarIcon color="#0072C6" /> },
  { id: "apple",  label: "Apple iCal",       icon: <AppleCalIcon /> },
];

export default function IrisConnectApps() {
  const [connected, setConnected] = useState(new Set());
 const [, navigate] = useLocation();

  const toggle = (id: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const count = connected.size;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans">

      {/* ── LEFT PANEL ───────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col px-6 sm:px-10 lg:px-14 py-8 min-h-screen lg:min-h-0">

        {/* ── Back button — couleurs Iris ── */}
        <a
          href="#"
          className="flex items-center gap-2 w-fit mb-6 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ background: "linear-gradient(90deg,#FF5722,#FF8C42)", color: "#fff" }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour
        </a>

        {/* Title */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Connect Your Apps{" "}
            <span className="font-normal text-gray-400">to</span>
            {" "}<span>Iris</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-sm">
            Connect your email and calendar services to enable Iris to analyze
            your communications and prepare smart actions.
          </p>
        </div>

        {/* App list */}
        <div className="flex flex-col gap-3 mb-4">
          {APPS.map((app) => {
            const isConnected = connected.has(app.id);
            return (
              <button
                key={app.id}
                onClick={() => toggle(app.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isConnected
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {app.icon}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{app.label}</p>
                  {isConnected && (
                    <p className="text-xs text-green-500 font-medium mt-0.5">Connected</p>
                  )}
                </div>
                {isConnected ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#22C55E" }}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-green-600">
            {count} service{count !== 1 ? "s" : ""} connected
          </p>
        </div>

        {/* Bottom buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => navigate("/home")}
            className="flex-1 py-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            Skip for now
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 py-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: "linear-gradient(90deg,#FF5722,#FF8C42)" }}
          >
            Continue
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Iris branding */}
        <div className="flex items-center gap-2 mt-6">
          <IrisLogo />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold tracking-widest text-gray-800">IRIS</span>
            <span className="text-xs text-gray-400 mt-0.5">v2.1.0</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center overflow-hidden min-h-72 lg:min-h-screen px-10 gap-6"
        style={{ background: "linear-gradient(160deg, #FFAD6A 0%, #FF8C42 40%, #FF5722 100%)" }}
      >
        {/* Envelope icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Supercharge Your Workflow</h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
            Connect your favorite apps to let Iris analyze your communications, schedule meetings automatically, and create intelligent task lists.
          </p>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white" style={{ background: "rgba(255,255,255,0.2)" }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Smart Analysis
          </span>
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white" style={{ background: "rgba(255,255,255,0.2)" }}>
            📅 Auto-Scheduling
          </span>
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white" style={{ background: "rgba(255,255,255,0.2)" }}>
            ✅ Task Automation
          </span>
        </div>
      </div>

    </div>
  );
}