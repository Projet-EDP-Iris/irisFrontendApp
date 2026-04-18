import { useState } from "react";
import { MoreHorizontal, Mail, Loader2, AlertCircle, CheckCircle2, Calendar, RefreshCw } from "lucide-react";

const API_BASE = "/api";

interface EmailAddress {
  name?: string;
  address?: string;
}

interface AppointmentInfo {
  date?: string;
  time?: string;
  location?: string;
  subject?: string;
  organizer?: string;
  confidence: number;
}

interface ScannedEmail {
  id: string;
  subject: string;
  sender: EmailAddress;
  received_at: string;
  preview: string;
  is_appointment: boolean;
  appointment?: AppointmentInfo;
}

interface ScanResult {
  total_scanned: number;
  appointments_found: number;
  emails: ScannedEmail[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<"appointments" | "all">("appointments");
  const [step, setStep] = useState<"connect" | "scanning" | "results">("connect");
  const [gmailAddress, setGmailAddress] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingToCalendar, setAddingToCalendar] = useState<string | null>(null);
  const [addedToCalendar, setAddedToCalendar] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    if (!gmailAddress || !appPassword) return;
    setError(null);
    setStep("scanning");

    try {
      const res = await fetch(`${API_BASE}/gmail/scan?top=50`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gmail_address: gmailAddress,
          app_password: appPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erreur lors du scan");
      }

      const data: ScanResult = await res.json();
      setScanResult(data);
      setStep("results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      setStep("connect");
    }
  };

  const handleAddToCalendar = async (email: ScannedEmail) => {
    setAddingToCalendar(email.id);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setAddedToCalendar((prev) => new Set([...prev, email.id]));
    } finally {
      setAddingToCalendar(null);
    }
  };

  const displayedEmails = scanResult
    ? activeTab === "appointments"
      ? scanResult.emails.filter((e) => e.is_appointment)
      : scanResult.emails
    : [];

  if (step === "connect") {
    return (
      <div className="flex flex-col h-full">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Emails</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Connecte ta boîte mail pour commencer</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="bg-card border border-card-border rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Connecter Gmail</h2>
                  <p className="text-xs text-muted-foreground">Mot de passe d'application requis</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Adresse Gmail
                  </label>
                  <input
                    type="email"
                    value={gmailAddress}
                    onChange={(e) => setGmailAddress(e.target.value)}
                    placeholder="exemple@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Mot de passe d'application
                  </label>
                  <input
                    type="password"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    placeholder="abcdefghijklmnop"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Génère un mot de passe sur{" "}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      myaccount.google.com/apppasswords
                    </a>
                  </p>
                </div>

                <button
                  onClick={handleScan}
                  disabled={!gmailAddress || !appPassword}
                  className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Scanner mes emails
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "scanning") {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-foreground font-semibold">Iris analyse tes emails...</p>
          <p className="text-sm text-muted-foreground mt-1">Détection des rendez-vous en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emails</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {scanResult?.total_scanned} emails scannés · {scanResult?.appointments_found} rendez-vous détectés
          </p>
        </div>
        <button
          onClick={() => { setStep("connect"); setScanResult(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={14} />
          Rescanner
        </button>
      </div>

      {/* Tabs */}
      <div className="px-8 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "bg-card border border-primary/50 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>✦</span>
            <span>Rendez-vous</span>
            <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${activeTab === "appointments" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
              {scanResult?.appointments_found ?? 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-card border border-border text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>✉</span>
            <span>Tous</span>
            <span className="px-1.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
              {scanResult?.total_scanned ?? 0}
            </span>
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto px-8 space-y-3">
        {displayedEmails.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Aucun email dans cette catégorie
          </div>
        )}

        {displayedEmails.map((email) => {
          const senderName = email.sender?.name || email.sender?.address || "Inconnu";
          const initials = getInitials(senderName);
          const isAdded = addedToCalendar.has(email.id);
          const isAdding = addingToCalendar === email.id;

          return (
            <div
              key={email.id}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border border-card-border hover:border-primary/30 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground truncate">{senderName}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-foreground/90 truncate">{email.subject}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {email.is_appointment && email.appointment && (
                    <>
                      <span className="text-primary/70">Rendez-vous</span>
                      {email.appointment.date && <span> · {email.appointment.date}</span>}
                      {email.appointment.time && <span> à {email.appointment.time}</span>}
                      {email.appointment.location && <span> · {email.appointment.location}</span>}
                      <span> · </span>
                    </>
                  )}
                  {email.preview}
                </p>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {email.is_appointment && (
                  <button
                    onClick={() => handleAddToCalendar(email)}
                    disabled={isAdded || isAdding}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                      isAdded
                        ? "bg-green-600 opacity-80 cursor-default"
                        : "bg-primary hover:opacity-90"
                    } disabled:cursor-not-allowed`}
                  >
                    {isAdding ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isAdded ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Calendar size={14} />
                    )}
                    {isAdded ? "Ajouté" : "Ajouter"}
                  </button>
                )}
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
