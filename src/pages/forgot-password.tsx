import { useState } from "react";
import { useLocation } from "wouter";
import { IrisLogo } from "@/components/IrisLogo";
import { apiFetch } from "@/lib/api";
import { CheckCircle, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#fff" }}>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col justify-center px-16 py-12 relative">
        <div className="max-w-md">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                <CheckCircle size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Vérifiez votre boîte mail</h1>
              <p className="text-gray-500 mb-8">
                Si cette adresse est enregistrée, un lien de réinitialisation vous a été envoyé.
                Vérifiez aussi vos spams.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
              <p className="text-gray-500 mb-8">
                Entrez votre e-mail pour recevoir un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre e-mail"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <button
                  onClick={() => navigate("/login")}
                  className="text-orange-500 font-semibold hover:underline"
                >
                  ← Retour à la connexion
                </button>
              </p>
            </>
          )}
        </div>

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
        <div className="absolute top-20 right-10 w-64 h-80 rounded-3xl opacity-30"
          style={{ background: "rgba(255,255,255,0.4)", transform: "rotate(15deg)" }} />
        <div className="absolute bottom-20 left-10 w-48 h-64 rounded-3xl opacity-20"
          style={{ background: "rgba(255,255,255,0.4)", transform: "rotate(-8deg)" }} />

        <div className="relative z-10 w-72">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <Mail size={28} className="text-white" />
            </div>
          </div>
          <div className="rounded-3xl p-5 shadow-xl"
            style={{ background: "rgba(180, 100, 50, 0.85)", backdropFilter: "blur(10px)" }}>
            <h2 className="text-xl font-bold text-white text-center mb-1">
              Récupérez l'accès
            </h2>
            <p className="text-sm text-orange-100 text-center mb-4">
              Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
            </p>
            <div className="space-y-2">
              {[
                { icon: "📧", text: "Lien envoyé par e-mail" },
                { icon: "🔒", text: "Lien sécurisé et unique" },
                { icon: "⏱", text: "Valide pendant 1 heure" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.12)" }}>
                  <span className="text-sm">{icon}</span>
                  <span className="text-xs text-white">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
