import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getSignupDraft, patchSignupDraft } from "@/lib/signupDraft";
import { IrisLogo } from "@/components/IrisLogo";

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
            className="hidden mx-3 my-3 w-[calc(100%-24px)] py-3 rounded-xl text-white text-sm font-semibold"
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
