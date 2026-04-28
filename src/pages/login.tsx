import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { IrisLogo } from "@/components/IrisLogo";
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("E-mail ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#fff" }}>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col justify-center px-16 py-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bon retour!</h1>
          <p className="text-gray-500 mb-8">Entrez vos identifiants pour accéder à votre compte</p>



          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre e-mail"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <button type="button" className="hidden text-sm text-orange-500 hover:underline">
                  mot de passe oublié
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div className="hidden flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Rester toujours connecté
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {isLoading ? "Connexion..." : "Connexion"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Vous n'avez pas de compte?{" "}
            <button   
            onClick={() => navigate("/signup")}
            className="text-orange-500 font-semibold hover:underline">
              S'inscrire
            </button>
          </p>
        </div>

        {/* Iris logo bottom left */}
        <div className="absolute bottom-6 left-8 flex items-center gap-1.5">
          <IrisLogo className="w-8 h-8" />
          <div>
            <div className="text-xs font-bold text-gray-600">iris</div>
            <div className="text-[9px] text-gray-400">Beta v0.1.0</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="w-1/2 relative flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #fde8d3 0%, #f5c9a0 40%, #e8a87c 70%, #d4875a 100%)",
        }}
      >
        {/* Decorative shapes */}
        <div
          className="absolute top-20 right-10 w-64 h-80 rounded-3xl opacity-30"
          style={{ background: "rgba(255,255,255,0.4)", transform: "rotate(15deg)" }}
        />
        <div
          className="absolute bottom-20 left-10 w-48 h-64 rounded-3xl opacity-20"
          style={{ background: "rgba(255,255,255,0.4)", transform: "rotate(-8deg)" }}
        />

        {/* Floating app card */}
        <div className="relative z-10 w-72">
          {/* App icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              <span className="text-2xl">👋</span>
            </div>
          </div>

          {/* Welcome card */}
          <div
            className="rounded-3xl p-5 shadow-xl"
            style={{ background: "rgba(180, 100, 50, 0.85)", backdropFilter: "blur(10px)" }}
          >
            <h2 className="text-xl font-bold text-white text-center mb-1">
              Ravi de vous revoir!
            </h2>
            <p className="text-sm text-orange-100 text-center mb-5">
              Connectez-vous pour continuer à organiser vos e-mails et gérer vos tâches avec Iris
            </p>

            {/* Calendar options */}
            <div className="space-y-2">
              {[
                { label: "Gmail", icon: "✉️", active: true },
                { label: "Google Calendar", icon: "📅", active: false },
                { label: "Outlook", icon: "✉️", active: false },
                { label: "Apple Calendar", icon: "📅", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <span className="text-sm">{item.icon}</span>
                    </div>
                    <span className="text-sm text-white font-medium">{item.label}</span>
                  </div>
                  <div
                    className="w-9 h-5 rounded-full relative"
                    style={{ background: item.active ? "#f97316" : "rgba(255,255,255,0.2)" }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{ transform: item.active ? "translateX(18px)" : "translateX(2px)" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              className="hidden w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ background: "rgba(249, 115, 22, 0.9)" }}
            >
              Add New App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
