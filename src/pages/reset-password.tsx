import { useState } from "react";
import { useLocation } from "wouter";
import { IrisLogo } from "@/components/IrisLogo";
import { apiFetch } from "@/lib/api";
import { CheckCircle, Lock, AlertCircle } from "lucide-react";

function getHashParam(name: string): string | null {
  const hash = window.location.hash;
  const qi = hash.indexOf("?");
  if (qi === -1) return null;
  return new URLSearchParams(hash.slice(qi + 1)).get(name);
}

const PASSWORD_RULES = /^(?=.*[0-9])(?=.*[@$!%*?&]).{8,72}$/;

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const token = getHashParam("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = newPassword === confirmPassword;
  const passwordValid = PASSWORD_RULES.test(newPassword);
  const canSubmit = newPassword.trim() && confirmPassword.trim() && passwordsMatch && passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !token) return;
    setError(null);
    setIsLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ce lien a expiré ou est invalide.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#fff" }}>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col justify-center px-16 py-12 relative">
        <div className="max-w-md">
          {!token ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                <AlertCircle size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Lien invalide</h1>
              <p className="text-gray-500 mb-8">
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                Demander un nouveau lien
              </button>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                <CheckCircle size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Mot de passe mis à jour !</h1>
              <p className="text-gray-500 mb-8">
                Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
              <p className="text-gray-500 mb-8">
                Choisissez un mot de passe fort pour sécuriser votre compte.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  {newPassword && !passwordValid && (
                    <p className="text-xs text-red-500 mt-1">
                      8 caractères minimum, avec un chiffre et un caractère spécial (@$!%*?&)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                {error && (
                  <div className="text-center">
                    <p className="text-sm text-red-500 mb-2">{error}</p>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm text-orange-500 hover:underline"
                    >
                      Demander un nouveau lien
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer le mot de passe"}
                </button>
              </form>
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
              <Lock size={28} className="text-white" />
            </div>
          </div>
          <div className="rounded-3xl p-5 shadow-xl"
            style={{ background: "rgba(180, 100, 50, 0.85)", backdropFilter: "blur(10px)" }}>
            <h2 className="text-xl font-bold text-white text-center mb-1">
              Sécurisez votre compte
            </h2>
            <p className="text-sm text-orange-100 text-center mb-4">
              Créez un mot de passe fort pour protéger vos données.
            </p>
            <div className="space-y-2">
              {[
                { icon: "🔢", text: "Au moins un chiffre" },
                { icon: "✳️", text: "Un caractère spécial (@$!%*?&)" },
                { icon: "📏", text: "8 caractères minimum" },
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
