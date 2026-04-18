import { useState } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#fff" }}>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col justify-center px-16 py-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bon retour!</h1>
          <p className="text-gray-500 mb-8">Entrez vos identifiants pour accéder à votre compte</p>

          {/* Quick Connect */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Quick Connect
            </p>
            <div className="flex gap-3">
              <button className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs text-gray-600 font-medium">Google</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-xs text-gray-600 font-medium">Apple</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-xs text-gray-600 font-medium">Outlook</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

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
                <button type="button" className="text-sm text-orange-500 hover:underline">
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
            <div className="flex items-center gap-2">
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
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              Connexion
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Vous n'avez pas de compte?{" "}
            <button className="text-orange-500 font-semibold hover:underline">
              S'inscrire
            </button>
          </p>
        </div>

        {/* Iris logo bottom left */}
        <div className="absolute bottom-6 left-8 flex items-center gap-1.5">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#f97316" strokeWidth="2" />
              <circle cx="16" cy="16" r="8" fill="#f97316" opacity="0.3" />
              <path d="M16 8 C22 12, 22 20, 16 24 C10 20, 10 12, 16 8Z" fill="#f97316" opacity="0.6" />
              <circle cx="16" cy="16" r="3" fill="#f97316" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-600">iris</div>
            <div className="text-[9px] text-gray-400">v2.1.0</div>
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
                { label: "Google Calendar", icon: "📅", active: true },
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
              className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm"
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
