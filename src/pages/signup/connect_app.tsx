import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getSignupDraft } from "@/lib/signupDraft";

function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caracteres.";
  if (!/\d/.test(password)) return "Le mot de passe doit contenir au moins un chiffre.";
  if (!/[@$!%*?&]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractere special (@$!%*?&).";
  }
  return null;
}

const APPS = [
  { id: "gmail", label: "Gmail" },
  { id: "gcal", label: "Google Calendar" },
  { id: "outlook", label: "Outlook Email" },
  { id: "ocal", label: "Outlook Calendar" },
  { id: "apple", label: "Apple iCal" },
];

export default function IrisConnectApps() {
  const draft = useMemo(() => getSignupDraft(), []);
  const [connected, setConnected] = useState(new Set<string>());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const [_, navigate] = useLocation();

  const toggle = (id: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createAccount = async () => {
    if (isLoading) return false;
    setError(null);
    if (!draft.email || !draft.password || !draft.name || !draft.profile_icon) {
      setError("Le parcours d'inscription est incomplet. Reprenez depuis le debut.");
      return false;
    }
    const passwordError = validatePasswordPolicy(draft.password);
    if (passwordError) {
      setError(passwordError);
      return false;
    }

    setIsLoading(true);
    try {
      await signup({
        email: draft.email,
        password: draft.password,
        name: draft.name,
        profile_icon: draft.profile_icon,
      });
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Echec de creation du compte";
      setError(message);
      setIsLoading(false);
      return false;
    }
  };

  const skipAndConnectLater = async () => {
    const ok = await createAccount();
    if (ok) navigate("/home");
  };

  const continueWithConnections = async () => {
    if (connected.size === 0) return;
    const ok = await createAccount();
    if (ok) navigate("/home");
  };

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
            const isConnected = connected.has(app.id);
            return (
              <button
                key={app.id}
                onClick={() => toggle(app.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  isConnected ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{app.label}</span>
                  <span className="text-xs text-gray-400">{isConnected ? "Connected" : "Connect"}</span>
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
          {connected.size} service{connected.size === 1 ? "" : "s"} connected
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={skipAndConnectLater}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            Connect later
          </button>
          <button
            onClick={continueWithConnections}
            disabled={isLoading || connected.size === 0}
            className="flex-1 py-3 rounded-xl text-white font-semibold transition-all disabled:cursor-not-allowed disabled:shadow-none"
            style={{
              background:
                isLoading || connected.size === 0
                  ? "linear-gradient(90deg, #d6d3d1, #e7e5e4)"
                  : "linear-gradient(90deg,#FF5722,#FF8C42)",
              color: isLoading || connected.size === 0 ? "#78716c" : "#ffffff",
            }}
          >
            {isLoading ? "Creation..." : "Continuer"}
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
          src="/EmailOverloadVisualIris.png"
          alt="Email overload visual for Iris onboarding"
          className="relative z-10 w-[84%] max-w-[620px] object-contain drop-shadow-2xl"
          animate={{ y: [0, -8, 0], scale: [1, 1.01, 1] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
