import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getSignupDraft, patchSignupDraft } from "@/lib/signupDraft";

export default function IrisSignupName() {
  const draft = useMemo(() => getSignupDraft(), []);
  const [name, setName] = useState(draft.name);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleContinue = () => {
    if (!name.trim()) {
      setError("Veuillez renseigner votre nom.");
      return;
    }
    patchSignupDraft({ name: name.trim() });
    navigate("/profile-choose");
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex flex-col justify-center px-16 py-12 bg-white">
        <button onClick={() => navigate("/signup")} className="absolute top-8 left-10 text-sm text-gray-500 hover:text-gray-700">
          ← Retour
        </button>
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Commencer maintenant</h1>
          <p className="text-gray-500 mb-8">Creez votre compte pour commencer a organiser avec Iris</p>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Votre nom"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          <button
            onClick={handleContinue}
            className="w-full py-3 mt-6 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
          >
            Continuer
          </button>
        </div>
        <div className="absolute bottom-6 left-8">
          <div className="text-xs font-bold text-gray-600">iris</div>
          <div className="text-[10px] text-gray-400">Beta v0.1.0</div>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-orange-300 via-orange-500 to-orange-600">
        <div className="text-center text-white">
          <h2 className="text-5xl font-bold mb-2">Welcome to Iris!</h2>
          <p className="text-white/80">Lets personalize your experience</p>
        </div>
      </div>
    </div>
  );
}
