import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { getSignupDraft } from "@/lib/signupDraft";
import emailOverloadVisual from "@/assets/email-overload-visual.svg";

function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caracteres.";
  if (!/\d/.test(password)) return "Le mot de passe doit contenir au moins un chiffre.";
  if (!/[@$!%*?&]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractere special (@$!%*?&).";
  }
  return null;
}

const APPS = [
  { id: "gmail",   label: "Gmail",            authPath: "/auth/google" },
  { id: "gcal",    label: "Google Calendar",   authPath: "/auth/google" },
  { id: "outlook", label: "Outlook Email",     authPath: "/auth/microsoft" },
  { id: "ocal",    label: "Outlook Calendar",  authPath: "/auth/microsoft" },
  { id: "apple",   label: "Apple iCal",        authPath: null }, // CalDAV — manual setup after signup
] as const;

export default function IrisConnectApps() {
  const draft = useMemo(() => getSignupDraft(), []);
  const [accountCreated, setAccountCreated] = useState(false);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();
  const [_, navigate] = useLocation();

  const ensureAccount = async (): Promise<boolean> => {
    if (accountCreated) return true;
    if (!draft.email || !draft.password || !draft.name || !draft.profile_icon) {
      setError("Le parcours d'inscription est incomplet. Reprenez depuis le debut.");
      return false;
    }
    const passwordError = validatePasswordPolicy(draft.password);
    if (passwordError) {
      setError(passwordError);
      return false;
    }
    try {
      await signup({
        email: draft.email,
        password: draft.password,
        name: draft.name,
        profile_icon: draft.profile_icon,
      });
      setAccountCreated(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Echec de creation du compte");
      return false;
    }
  };

  const handleConnect = async (appId: string, authPath: string | null) => {
    if (connectingApp) return;
    setError(null);
    setConnectingApp(appId);

    const ok = await ensureAccount();
    if (!ok) {
      setConnectingApp(null);
      return;
    }

    if (!authPath) {
      // Apple CalDAV — no OAuth redirect; account is created, send to home
      navigate("/home");
      return;
    }

    try {
      const data = await apiFetch<{ auth_url: string }>(authPath);
      // Redirect the whole browser to the OAuth consent page.
      // After granting access, the provider redirects to our callback which
      // then bounces back to the frontend /emails page with ?gmail=connected
      // (or ?outlook=success), where the existing callback handler takes over.
      window.location.href = data.auth_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de démarrer la connexion. Réessayez.");
      setConnectingApp(null);
    }
  };

  const skipAndConnectLater = async () => {
    if (connectingApp) return;
    setConnectingApp("skip");
    const ok = await ensureAccount();
    if (ok) navigate("/home");
    else setConnectingApp(null);
  };

  const isLoading = connectingApp !== null;

  return (
    <div className="min-h-screen h-screen flex overflow-hidden">
      <div className="w-1/2 bg-white px-12 py-8 flex flex-col">
        <button onClick={() => navigate("/profile-choose")} className="w-fit px-4 py-2 rounded-xl text-sm font-semibold text-white mb-4" style={{ background: "linear-gradient(90deg,#FF5722,#FF8C42)" }}>
          ← Retour
        </button>

        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Connect Your Apps <span className="text-orange-500 font-semibold">to</span> Iris
        </h1>
        <p className="text-sm text-gray-500 mt-2 mb-4 max-w-lg">
          Connect your email and calendar services to enable Iris to analyze your communications and prepare smart actions.
        </p>

        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {APPS.map((app) => {
            const busy = connectingApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => handleConnect(app.id, app.authPath)}
                disabled={isLoading}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all disabled:cursor-not-allowed ${
                  busy ? "bg-orange-50 border-orange-300" : "bg-white border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{app.label}</span>
                  <span className="text-xs text-gray-400">
                    {busy ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                        Connexion…
                      </span>
                    ) : app.authPath === null ? (
                      "Config. après inscription"
                    ) : (
                      "Connecter →"
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div
          className="mt-3 px-4 py-2.5 rounded-lg border text-sm font-medium"
          style={{
            borderColor: "rgba(249,115,22,0.28)",
            background: "linear-gradient(90deg, rgba(255,237,213,0.9), rgba(255,247,237,0.9))",
            color: "#ea580c",
          }}
        >
          Cliquez sur un service pour démarrer la connexion OAuth
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={skipAndConnectLater}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            {connectingApp === "skip" ? "Création…" : "Connect later"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="mt-4">
          <div className="text-xs font-bold text-gray-700">iris</div>
          <div className="text-[10px] text-gray-400">Beta v0.1.0</div>
        </div>
      </div>

      <div className="w-1/2 relative flex items-center justify-center px-10 overflow-hidden" style={{ background: "linear-gradient(160deg, #FFAD6A 0%, #FF8C42 40%, #FF5722 100%)" }}>
        <motion.img
          src={emailOverloadVisual}
          alt="Email overload visual for Iris onboarding"
          className="relative z-10 w-[84%] max-w-[620px] object-contain drop-shadow-2xl"
          animate={{ y: [0, -8, 0], scale: [1, 1.01, 1] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
