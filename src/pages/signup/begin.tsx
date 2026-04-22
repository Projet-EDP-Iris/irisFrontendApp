import { useState } from "react";
import { useLocation } from "wouter";

const IrisLogo = ({ className = "w-6 h-7" }) => (
  <svg className={className} viewBox="0 0 58 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="irisGrad" x1="25" y1="49" x2="25" y2="5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF3D00" />
        <stop offset="1" stopColor="#A05533" />
      </linearGradient>
    </defs>
    <path d="M36.8118 62.5754C36.2386 61.6164 36.296 61.1969 37.0986 60.1779C38.0732 59.0391 38.0732 59.0391 39.2199 60.2978C40.0225 61.1969 40.1372 61.6763 39.6784 61.8562C39.2773 61.976 38.9905 62.4555 38.9905 62.935C38.9905 64.1933 37.6721 63.9536 36.8118 62.5754Z" fill="url(#irisGrad)" />
    <path d="M22.4792 52.5663C21.9632 51.6073 22.0205 51.1278 22.5938 50.6484C23.7978 49.5695 24.8871 51.2477 23.8551 52.6862C23.1098 53.7651 23.0525 53.7651 22.4792 52.5663Z" fill="url(#irisGrad)" />
    <path d="M41.4557 48.4307C40.4811 47.8913 39.5064 47.1121 39.3344 46.6327C38.9332 45.6141 38.9906 45.6141 41.4557 46.6926C42.5451 47.1721 43.5198 47.4118 43.6915 47.292C43.8062 47.1721 44.7235 46.9923 45.6408 46.8724C49.5394 46.5727 47.3607 42.1378 39.3344 33.8069L34.9772 29.3718L33.3147 30.3907C31.2508 31.6493 29.1295 31.7092 26.6643 30.4506C24.3138 29.3119 23.3391 27.0344 23.5684 23.3185C23.7404 20.6215 23.6258 20.3817 21.5046 18.7635C20.2433 17.8645 18.982 17.0853 18.6953 17.0254C18.4087 17.0254 17.6634 16.5459 17.0327 16.0066C16.0008 14.9877 15.8861 14.9877 14.6248 16.6658C12.6182 19.3029 11.2423 24.3973 11.6436 28.1132C12.5609 37.5829 21.2179 45.2545 30.1042 44.4753C33.2573 44.1756 34.3467 44.775 31.9961 45.4343C28.9002 46.273 22.3645 45.7939 19.7273 44.5352C16.2301 42.7971 11.4143 37.7627 9.75171 34.1665C7.63047 29.5516 7.3438 23.2585 9.0064 18.344C9.75171 16.1264 10.5543 14.1486 10.8983 13.789C11.701 12.9499 10.2677 11.8711 6.99982 11.032C4.64923 10.4926 3.78928 10.4327 3.15864 11.032C1.95469 12.0509 2.06936 13.0098 3.73196 16.4261C5.33723 19.7824 5.27988 20.082 3.21597 17.9244C-0.338545 14.2085 -0.911854 11.5714 1.32405 9.35387C2.92932 7.79559 6.08251 7.67572 9.46505 8.99425C10.7263 9.53368 12.1023 9.9532 12.5036 9.9532C12.8476 10.0131 13.1916 10.3128 13.1916 10.6724C13.1916 11.1519 13.3062 11.1519 13.6502 10.6724C14.5675 9.234 21.1605 5.69788 24.0271 5.09855C28.2123 4.19953 31.5374 4.73896 36.4681 7.19626C39.4491 8.63467 41.2837 10.0731 42.9462 12.1708C44.265 13.789 45.297 15.4671 45.297 15.8867C45.297 16.3661 45.6982 17.2652 46.157 17.8645C46.7302 18.6436 47.0169 20.3817 46.9596 22.6592V26.3152L45.8129 22.2397C45.1823 19.9622 44.3224 17.6847 43.8635 17.2052C43.4051 16.7258 43.0036 16.1264 43.0036 15.8867C43.0036 14.8079 39.1053 11.4515 36.1813 10.0131C31.4801 7.67572 26.091 7.73565 21.8485 10.133C20.1286 11.1519 18.638 12.2307 18.5807 12.5304C18.466 12.89 20.0713 14.2685 22.1352 15.6469C25.747 18.1042 25.919 18.1642 28.3269 17.5049C30.4482 16.9055 31.0788 16.9655 33.0279 17.9844C35.4934 19.243 36.9266 21.7003 36.8692 24.5771C36.8119 26.1953 37.6145 27.334 41.9142 32.0089C49.8832 40.5794 51.7179 44.9548 48.8516 48.3708C47.7622 49.6894 43.9783 49.6894 41.4557 48.4307Z" fill="url(#irisGrad)" />
    <path d="M2.41366 43.0967C2.01234 42.2576 1.43903 41.5983 1.03771 41.5983C0.69373 41.5983 0.865724 40.9989 1.55369 40.2797C2.18434 39.5005 2.87231 38.4819 3.0443 38.0024C3.21629 37.3431 3.50294 37.5829 3.96159 38.7813C4.30557 39.6803 4.82155 40.3996 5.16553 40.3996C5.45219 40.3996 5.73885 40.6992 5.73885 40.9989C5.73885 41.3585 5.33752 41.5983 4.8789 41.5983C4.42025 41.5983 4.01891 42.1377 4.01891 42.7371C4.01891 44.5352 3.10163 44.715 2.41366 43.0967Z" fill="url(#irisGrad)" />
    <path d="M55.6165 40.3996C55.6165 39.98 55.158 39.2608 54.5848 38.7213C53.5528 37.7624 53.5528 37.6425 54.7566 36.4441L56.018 35.2454L57.1647 36.564C58.2537 37.8223 58.2537 37.8822 56.9353 39.4406C56.19 40.3396 55.6165 40.7592 55.6165 40.3996Z" fill="url(#irisGrad)" />
    <path d="M53.3808 20.7413C52.9794 19.9022 52.9794 19.3029 53.5529 18.5237C54.2981 17.4449 54.3555 17.4449 54.9287 18.5837C55.3302 19.4228 55.3302 20.0221 54.7566 20.8012C54.0114 21.88 53.954 21.88 53.3808 20.7413Z" fill="url(#irisGrad)" />
    <path d="M10.5544 1.38276C10.0957 0.543685 11.5863 -0.475195 12.2743 0.244014C12.7903 0.783421 12.2743 2.04203 11.4717 2.04203C11.185 2.04203 10.7837 1.74236 10.5544 1.38276Z" fill="url(#irisGrad)" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C34.96 2.09 29.37 0 23 0 14.02 0 6.26 5.12 2.45 12.57l7.98 6.2C12.2 13.14 17.16 9.5 23 9.5z" fill="#EA4335" />
    <path d="M44.5 23.5c0-1.57-.14-3.08-.4-4.54H23v9.02h12.08c-.52 2.8-2.1 5.17-4.47 6.76l7.02 5.46C41.54 36.09 44.5 30.22 44.5 23.5z" fill="#4285F4" />
    <path d="M10.45 27.23A13.48 13.48 0 0 1 9.5 23c0-1.47.25-2.9.69-4.23l-7.98-6.2A23 23 0 0 0 0 23c0 3.71.89 7.22 2.45 10.33l7.99-6.1z" fill="#FBBC05" />
    <path d="M23 46c6.29 0 11.57-2.08 15.43-5.66l-7.02-5.46c-2.13 1.43-4.87 2.27-8.41 2.27-5.84 0-10.8-3.64-12.57-8.87l-7.99 6.1C6.26 40.88 14.02 46 23 46z" fill="#34A853" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-148.1-98.1c-49.7-71.1-91-175.1-91-274.5 0-195.3 127.4-298.5 252.7-298.5 66.1 0 121.2 43.4 162.6 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
  </svg>
);

const OutlookIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#0072C6" />
    <rect x="10" y="15" width="28" height="18" rx="2" fill="#fff" />
    <path d="M10 17l14 9 14-9" stroke="#0072C6" strokeWidth="1.5" fill="none" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
    <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" opacity="0.7" />
    <path d="M5 14l.5 1.5L7 16l-1.5.5L5 18l-.5-1.5L3 16l1.5-.5L5 14z" opacity="0.5" />
  </svg>
);

const Toggle = () => (
  <div className="relative w-10 h-6 rounded-full flex-shrink-0" style={{ background: "#FF7043" }}>
    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow" />
  </div>
);

const AppItem = ({ icon, name }: { icon: React.ReactNode; name: string }) => (
  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "rgba(140,85,55,0.55)" }}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
      {icon}
    </div>
    <span className="flex-1 text-sm font-medium text-white">{name}</span>
    <Toggle />
  </div>
);

export default function IrisSignup() {
  const [accepted, setAccepted] = useState(false);
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans">

      {/* ── LEFT PANEL ───────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col px-6 sm:px-10 lg:px-14 py-8 min-h-screen lg:min-h-0">

        {/* Back link */}
        <a href="#" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit mb-8 lg:mb-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour à la connexion
        </a>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Commencer maintenant</h1>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Créez votre compte pour commencer à organiser avec Iris
          </p>

          {/* OAuth buttons */}
          <div className="flex gap-3 mb-6">
            {[
              { icon: <GoogleIcon />, label: "Google" },
              { icon: <AppleIcon />, label: "Apple" },
              { icon: <OutlookIcon />, label: "Outlook" },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="flex-1 flex flex-col items-center gap-2 py-4 px-2 border border-gray-200 rounded-xl bg-white text-xs text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-orange-500 flex-shrink-0"
            />
            <span className="text-sm text-gray-500">J'accepte les conditions générales</span>
          </label>

          {/* CTA */}
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-4 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: "linear-gradient(90deg, #FF5722 0%, #FF8C42 100%)" }}
          >
            Inscription
          </button>
        </div>

        {/* Iris branding */}
        <div className="flex items-center gap-2 mt-8 lg:mt-auto">
          <IrisLogo className="w-5 h-6" />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold tracking-widest text-gray-800">IRIS</span>
            <span className="text-xs text-gray-400 mt-0.5">v2.1.0</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center overflow-hidden py-16 lg:py-0 min-h-72 lg:min-h-screen"
        style={{ background: "#F2E4D4" }}
      >
        {/* Decorative rings — hidden on very small screens */}
        {[520, 350, 200].map((size) => (
          <div
            key={size}
            className="absolute rounded-full border hidden sm:block"
            style={{
              width: size,
              height: size,
              top: "50%",
              left: "42%",
              transform: "translate(-50%, -50%)",
              borderColor: "rgba(180,130,100,0.22)",
            }}
          />
        ))}

        {/* Orbit dots */}
        <div className="absolute w-2.5 h-2.5 rounded-full hidden sm:block" style={{ background: "rgba(180,120,90,0.35)", top: "18%", left: "72%" }} />
        <div className="absolute w-2.5 h-2.5 rounded-full hidden sm:block" style={{ background: "rgba(180,120,90,0.35)", top: "78%", left: "80%" }} />

        {/* Planet decoration */}
        <svg className="absolute opacity-50 hidden sm:block" style={{ top: "14%", right: "7%", width: 44, height: 44 }} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="14" fill="rgba(180,120,80,0.5)" />
          <ellipse cx="40" cy="40" rx="38" ry="12" stroke="rgba(180,120,80,0.4)" strokeWidth="2" fill="none" transform="rotate(-20 40 40)" />
        </svg>

        {/* App Card */}
        <div
          className="relative z-10 rounded-2xl w-64 sm:w-72 overflow-hidden shadow-2xl mx-4"
          style={{ background: "rgba(170,110,75,0.82)", backdropFilter: "blur(6px)" }}
        >
          {/* Header */}
          <div className="flex flex-col items-center px-5 pt-6 pb-4 gap-2.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #FF7043 0%, #FF5722 100%)" }}
            >
              <SparkleIcon />
            </div>
            <h2 className="text-lg font-bold text-white text-center">Bienvenue sur Iris</h2>
            <p className="text-xs text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
              Votre assistant IA pour l'analyse des mails, la planification intelligente et la gestion des tâches
            </p>
          </div>

          {/* Section title */}
          <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>
            Authorised Apps
          </p>

          {/* App list */}
          <div className="px-3 flex flex-col gap-1.5">
            <AppItem
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="white" opacity="0.9" />
                  <path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="2" fill="none" />
                </svg>
              }
              name="Gmail"
            />
            <AppItem
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="#0072C6" />
                  <path d="M2 6l10 7 10-7" stroke="white" strokeWidth="1.5" fill="none" />
                </svg>
              }
              name="Outlook"
            />
            <AppItem
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="17" rx="2" fill="white" opacity="0.9" />
                  <path d="M3 9h18" stroke="#e5e5e5" strokeWidth="1" />
                  <rect x="7" y="2" width="2" height="5" rx="1" fill="#777" />
                  <rect x="15" y="2" width="2" height="5" rx="1" fill="#777" />
                  <text x="12" y="18" textAnchor="middle" fontSize="7" fill="#E53935" fontFamily="sans-serif" fontWeight="700">21</text>
                </svg>
              }
              name="Apple Calendar"
            />
          </div>

          {/* Add New App */}
          <button
            className="mx-3 my-3 w-[calc(100%-24px)] py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: "#FF5722" }}
          >
            Add New App
          </button>
        </div>
      </div>

    </div>
  );
}