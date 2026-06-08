import { useState } from "react";
import { X, Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import { useAppleCalendarConnection } from "@/hooks/useAppleCalendarConnection";

interface AppleCalendarConnectModalProps {
  onClose: () => void;
}

const STEPS = [
  { n: 1, text: "Enable 2-Factor Authentication on your Apple ID (required for App Passwords)" },
  { n: 2, text: "Go to appleid.apple.com → Sign In → Security → App-Specific Passwords" },
  { n: 3, text: 'Click the + button, name it (e.g. "Iris Calendar"), then click Create' },
  { n: 4, text: "Apple shows a one-time password in the format xxxx-xxxx-xxxx-xxxx" },
  { n: 5, text: "Copy it immediately — Apple will not show it again" },
];

export function AppleCalendarConnectModal({ onClose }: AppleCalendarConnectModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [appleEmail, setAppleEmail] = useState("");
  const [applePassword, setApplePassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { connect, connecting } = useAppleCalendarConnection();

  const handleConnect = async () => {
    setError(null);
    try {
      await connect(appleEmail.trim(), applePassword.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed. Check your credentials and try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
              <Calendar size={22} className="text-primary" />
            </div>

            <h2 className="text-base font-semibold text-foreground mb-1">Connect Apple Calendar</h2>
            <p className="text-sm text-muted-foreground mb-5">
              You'll need an App-Specific Password from Apple — your regular Apple ID password won't work here.
            </p>

            <div className="space-y-3 mb-6">
              {STEPS.map(({ n, text }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-primary">{n}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              I have my password →
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setStep(1); setError(null); }}
              className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-4 mt-4">
              <Calendar size={22} className="text-primary" />
            </div>

            <h2 className="text-base font-semibold text-foreground mb-1">Enter your credentials</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Use the App-Specific Password you just generated — not your Apple ID password.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Apple ID email</label>
                <input
                  type="email"
                  value={appleEmail}
                  onChange={(e) => setAppleEmail(e.target.value)}
                  placeholder="yourname@icloud.com"
                  autoComplete="off"
                  className="w-full bg-card border border-border/70 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">App-Specific Password</label>
                <input
                  type="password"
                  value={applePassword}
                  onChange={(e) => setApplePassword(e.target.value)}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  autoComplete="off"
                  className="w-full bg-card border border-border/70 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 mb-4">
                <AlertCircle size={13} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connecting || !appleEmail.trim() || !applePassword.trim()}
              className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? "Connecting..." : "Connect Apple Calendar"}
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
