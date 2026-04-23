import { useState } from "react";
import { X, Mail, ShieldCheck, Eye } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface GmailConnectModalProps {
  onClose: () => void;
}

export function GmailConnectModal({ onClose }: GmailConnectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const { auth_url } = await apiFetch<{ auth_url: string }>("/auth/google");
      window.location.href = auth_url;
    } catch {
      setError("Could not start the connection. Make sure the backend is running.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
          <Mail size={22} className="text-primary" />
        </div>

        <h2 className="text-base font-semibold text-foreground mb-1">Connect Gmail</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Iris needs access to your Gmail inbox to read your emails and detect meeting requests.
        </p>

        {/* Permissions list */}
        <div className="space-y-2 mb-6">
          {[
            { icon: <Eye size={13} />, text: "Read your emails (read-only)" },
            { icon: <ShieldCheck size={13} />, text: "No emails are stored permanently" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary/70">{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-3">{error}</p>
        )}

        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Redirecting to Google…" : "Connect with Google"}
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
