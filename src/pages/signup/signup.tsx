import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getSignupDraft, patchSignupDraft } from "@/lib/signupDraft";

function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caracteres.";
  }
  if (!/\d/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre.";
  }
  if (!/[@$!%*?&]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractere special (@$!%*?&).";
  }
  return null;
}

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
  </svg>
);

export default function IrisSignup() {
  const initialDraft = useMemo(() => getSignupDraft(), []);
  const [email, setEmail] = useState(initialDraft.email);
  const [password, setPassword] = useState(initialDraft.password);
  const [accepted, setAccepted] = useState(initialDraft.acceptedTerms);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleContinue = () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Veuillez renseigner un e-mail et un mot de passe.");
      return;
    }
    if (!accepted) {
      setError("Veuillez accepter les conditions générales pour continuer.");
      return;
    }
    const passwordError = validatePasswordPolicy(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    patchSignupDraft({ email: email.trim(), password, acceptedTerms: accepted });
    navigate("/begin");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans">
      <div className="w-full lg:w-1/2 bg-white flex flex-col px-6 sm:px-10 lg:px-14 py-8 min-h-screen lg:min-h-0">
        <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit mb-8 lg:mb-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour a la connexion
        </button>

        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Commencer maintenant</h1>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Creez votre compte pour commencer a organiser avec Iris
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choisissez un mot de passe" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>

          <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-orange-500 flex-shrink-0" />
            <span className="text-sm text-gray-500">J'accepte les conditions generales</span>
          </label>

          <button onClick={handleContinue} className="w-full py-4 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90 cursor-pointer" style={{ background: "linear-gradient(90deg, #FF5722 0%, #FF8C42 100%)" }}>
            Continuer
          </button>
          {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
        </div>

        <div className="flex items-center gap-2 mt-8 lg:mt-auto">
          <IrisLogo className="w-5 h-6" />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-gray-800">iris</span>
            <span className="text-xs text-gray-400 mt-0.5">Beta v0.1.0</span>
          </div>
        </div>
      </div>

      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center overflow-hidden py-16 lg:py-0 min-h-72 lg:min-h-screen"
        style={{ background: "#F2E4D4" }}
      >
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

        <div
          className="relative z-10 rounded-2xl w-64 sm:w-72 overflow-hidden shadow-2xl mx-4"
          style={{ background: "rgba(170,110,75,0.82)", backdropFilter: "blur(6px)" }}
        >
          <div className="flex flex-col items-center px-5 pt-6 pb-4 gap-2.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white text-2xl"
              style={{ background: "linear-gradient(135deg, #FF7043 0%, #FF5722 100%)" }}
            >
              ✨
            </div>
            <h2 className="text-lg font-bold text-white text-center">Bienvenue sur Iris</h2>
            <p className="text-xs text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
              Votre assistant IA pour l'analyse des mails, la planification intelligente et la gestion des taches
            </p>
          </div>

          <p
            className="px-5 pb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Authorised Apps
          </p>

          <div className="px-3 flex flex-col gap-1.5">
            {["Gmail", "Outlook", "Apple Calendar"].map((appName) => (
              <div
                key={appName}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: "rgba(140,85,55,0.55)" }}
              >
                <span className="text-sm text-white font-medium">{appName}</span>
                <div className="relative w-10 h-6 rounded-full" style={{ background: "#FF7043" }}>
                  <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            ))}
          </div>

          <button
            className="mx-3 my-3 w-[calc(100%-24px)] py-3 rounded-xl text-white text-sm font-semibold"
            style={{ background: "#FF5722" }}
            type="button"
          >
            Add New App
          </button>
        </div>
      </div>
    </div>
  );
}
