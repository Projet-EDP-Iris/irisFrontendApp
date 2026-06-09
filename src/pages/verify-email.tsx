import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { IrisLogo } from "@/components/IrisLogo";
import { apiFetch } from "@/lib/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

function getHashParam(name: string): string | null {
  const hash = window.location.hash;
  const qi = hash.indexOf("?");
  if (qi === -1) return null;
  return new URLSearchParams(hash.slice(qi + 1)).get(name);
}

type VerifyState = "loading" | "success" | "error";

export default function EmailVerificationPage() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    const token = getHashParam("token");
    if (!token) {
      setState("error");
      setErrorMessage("Lien invalide — aucun jeton de vérification trouvé.");
      return;
    }
    apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => setState("success"))
      .catch((e) => {
        setState("error");
        setErrorMessage(e instanceof Error ? e.message : "Ce lien a expiré ou est invalide.");
      });
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    try {
      await apiFetch("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      setResendSent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center shadow-xl">
        {state === "loading" && (
          <>
            <Loader2 size={40} className="text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Vérification en cours...</h2>
            <p className="text-sm text-muted-foreground">Patientez quelques secondes.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">E-mail confirmé !</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Se connecter
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Lien expiré</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {errorMessage ?? "Ce lien de vérification a expiré ou est invalide."}
            </p>

            {resendSent ? (
              <p className="text-sm text-primary mb-4">
                Lien renvoyé ! Vérifiez votre boîte mail.
              </p>
            ) : (
              <form onSubmit={handleResend} className="space-y-3 mb-4">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={resending || !resendEmail.trim()}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {resending ? "Envoi..." : "Renvoyer le lien"}
                </button>
              </form>
            )}

            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center gap-1.5">
        <IrisLogo className="w-7 h-7" />
        <div>
          <div className="text-xs font-bold text-foreground/60">iris</div>
          <div className="text-[9px] text-muted-foreground">{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}
