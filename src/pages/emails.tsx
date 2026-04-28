import { useState, useEffect } from "react";
import { Mail, MoreHorizontal, Calendar, CheckCircle2, Plug, Zap, Clock, Tag, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEmails } from "@/hooks/useEmails";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useOutlookConnection } from "@/hooks/useOutlookConnection";
import { apiFetch } from "@/lib/api";
import { notifyGmailConnected } from "@/lib/desktopNotifications";
import type { EmailItem } from "@/types/email";

// ---------------------------------------------------------------------------
// OAuth callback helpers (inline — reads URL hash/query params after redirect)
// ---------------------------------------------------------------------------

function getOAuthCallbackParams(): {
  gmail: "connected" | "error" | null;
  outlook: "success" | "error" | null;
  reason: string | null;
} {
  const hash = window.location.hash || "";
  const queryIndex = hash.indexOf("?");
  const query = queryIndex >= 0 ? hash.slice(queryIndex + 1) : window.location.search.slice(1);
  const params = new URLSearchParams(query);
  const gmail = params.get("gmail");
  const outlook = params.get("outlook");
  return {
    gmail: gmail === "connected" || gmail === "error" ? gmail : null,
    outlook: outlook === "success" || outlook === "error" ? outlook : null,
    reason: params.get("gmail_reason") ?? params.get("outlook_reason"),
  };
}

function clearCallbackParams() {
  const cleanHash = (window.location.hash || "").split("?")[0] || "#/emails";
  window.history.replaceState({}, "", `${window.location.pathname}${cleanHash}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCalendarUrl(email: EmailItem): string {
  let start: Date;
  if (email.date) {
    start = new Date(email.date);
    if (isNaN(start.getTime())) {
      start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(10, 0, 0, 0);
    }
  } else {
    start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: email.subject,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: email.body?.slice(0, 200) ?? "",
  });
  if (email.sender) params.set("add", email.sender);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// EmailCard
// ---------------------------------------------------------------------------

function EmailCard({ email }: { email: EmailItem }) {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);

  const category = email.category ?? "info";
  const subject = email.subject ?? "(Sans objet)";
  const sender = email.sender ?? "Expéditeur inconnu";
  const dateStr = email.date
    ? new Date(email.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  const handleConfirm = async () => {
    if (!email.db_id) {
      window.open(buildCalendarUrl(email), "_blank");
      setConfirmed(true);
      return;
    }
    setLoading(true);
    try {
      const result = await apiFetch<any>(`/calendar/confirm/${email.db_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_index: 0 }),
      });
      if (result?.slot?.start_time) {
        const d = new Date(result.slot.start_time);
        setConfirmedDate(d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }));
      }
      setConfirmed(true);
    } catch (err) {
      console.error("Calendar confirm failed:", err);
      alert("Erreur lors de l'ajout au calendrier. Vérifie que ton calendrier est bien connecté !");
    } finally {
      setLoading(false);
    }
  };

  function renderActionButton() {
    // RDV — calendar confirm (original behaviour)
    if (category === "rdv") {
      if (confirmed) {
        return (
          <div className="flex flex-col items-center gap-1 w-full px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>RDV ajouté à Google Calendar ✓</span>
            </div>
            {confirmedDate && (
              <span className="text-xs font-normal opacity-80">Prévu le : {confirmedDate}</span>
            )}
          </div>
        );
      }
      return (
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #E8842A 0%, #d4751f 100%)" }}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Calendar size={15} />
          )}
          <span>{loading ? "Ajout en cours…" : "Confirmer ce RDV dans Google Calendar"}</span>
        </button>
      );
    }

    // Shared "done" state for all non-RDV categories
    if (done) {
      return (
        <div className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold">
          <CheckCircle2 size={16} />
          <span>Fait ✓</span>
        </div>
      );
    }

    if (category === "action") {
      return (
        <button
          onClick={() => setDone(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #E8842A 0%, #d4751f 100%)" }}
        >
          <Zap size={15} />
          <span>Marquer comme traité</span>
        </button>
      );
    }

    if (category === "attente") {
      return (
        <button
          onClick={() => setDone(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground transition-all hover:bg-accent active:scale-[0.98]"
        >
          <Clock size={15} />
          <span>Envoyer un rappel</span>
        </button>
      );
    }

    if (category === "bonsplans") {
      return (
        <button
          onClick={() => setDone(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground transition-all hover:bg-accent active:scale-[0.98]"
        >
          <Tag size={15} />
          <span>Voir l'offre</span>
        </button>
      );
    }

    // info (default)
    return (
      <button
        onClick={() => setDone(true)}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-muted/30 text-muted-foreground transition-all hover:bg-accent active:scale-[0.98]"
      >
        <BookOpen size={15} />
        <span>Marquer comme lu</span>
      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        confirmed || done ? "border-green-500/30 bg-green-500/5" : "border-card-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3 px-5 pt-4 pb-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Mail size={14} className="text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug truncate">{subject}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="text-primary/70">{sender}</span>
                {dateStr && (
                  <>
                    {" · "}
                    {dateStr}
                  </>
                )}
              </p>
            </div>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Body preview */}
          {email.body && (
            <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2 leading-relaxed">
              {email.body.slice(0, 140)}
            </p>
          )}
        </div>
      </div>

      {/* Category action button */}
      <div className="px-5 pb-4">
        {renderActionButton()}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EmailsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("rdv");
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [connectingOutlook, setConnectingOutlook] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const { isIrisActive } = useAuth();

  const {
    connected: gmailConnected,
    enabled: gmailEnabled,
    isLoading: gmailStatusLoading,
    error: gmailStatusError,
    refetchStatus: refetchGmail,
  } = useGmailConnection();

  const {
    connected: outlookConnected,
    isLoading: outlookStatusLoading,
    refetchStatus: refetchOutlook,
  } = useOutlookConnection();

  // Fetch emails when at least one provider is active
  const anyConnected = (gmailEnabled && gmailConnected) || outlookConnected;
  const { data: emails, isLoading, error } = useEmails(20, anyConnected);

  // Handle OAuth callbacks
  useEffect(() => {
    const { gmail, outlook, reason } = getOAuthCallbackParams();
    if (!gmail && !outlook) return;
    clearCallbackParams();

    if (gmail === "error") {
      const devSuffix = import.meta.env.DEV && reason ? ` (${reason})` : "";
      setStatusMsg({ text: `Gmail connection failed. Please try again.${devSuffix}`, ok: false });
      return;
    }
    if (outlook === "error") {
      const devSuffix = import.meta.env.DEV && reason ? ` (${reason})` : "";
      setStatusMsg({ text: `Outlook connection failed. Please try again.${devSuffix}`, ok: false });
      return;
    }

    if (gmail === "connected") {
      localStorage.setItem("gmail_enabled", "true");
      setStatusMsg({ text: "Gmail connecté ! Vos emails se chargent…", ok: true });
      void (async () => {
        const statusResult = await refetchGmail();
        if (statusResult.data?.connected) {
          await notifyGmailConnected({ gmailEmail: statusResult.data.gmail_email });
          await queryClient.invalidateQueries({ queryKey: ["emails"] });
        } else {
          setStatusMsg({ text: "Gmail lié, mais Iris n'a pas pu confirmer la boîte. Actualisez une fois.", ok: false });
        }
      })();
    }

    if (outlook === "success") {
      setStatusMsg({ text: "Outlook connecté ! Vos emails se chargent…", ok: true });
      void (async () => {
        await refetchOutlook();
        await queryClient.invalidateQueries({ queryKey: ["emails"] });
      })();
    }
  }, [queryClient, refetchGmail, refetchOutlook]);

  const emailErrorStatus = (error as Error & { status?: number } | null)?.status;
  const gmailStatusErrorStatus = (gmailStatusError as Error & { status?: number } | null)?.status;
  const isSessionExpired = gmailStatusErrorStatus === 401 || gmailStatusErrorStatus === 403;
  const noProviderConnected =
    !gmailStatusLoading &&
    !outlookStatusLoading &&
    !gmailConnected &&
    !outlookConnected &&
    !isSessionExpired &&
    emailErrorStatus !== 200;

  async function handleConnectGmail() {
    setConnectingGmail(true);
    try {
      const { auth_url } = await apiFetch<{ auth_url: string }>("/auth/google");
      window.location.href = auth_url;
    } catch {
      setStatusMsg({ text: "Impossible de démarrer la connexion Gmail. Vérifiez la config backend.", ok: false });
      setConnectingGmail(false);
    }
  }

  async function handleConnectOutlook() {
    setConnectingOutlook(true);
    try {
      const { auth_url } = await apiFetch<{ auth_url: string }>("/auth/microsoft");
      window.location.href = auth_url;
    } catch {
      setStatusMsg({ text: "Impossible de démarrer la connexion Outlook. Vérifiez la config backend.", ok: false });
      setConnectingOutlook(false);
    }
  }

  const pendingCount = emails?.filter((e) => (e.category ?? "info") === "rdv").length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emails</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {gmailConnected && outlookConnected
              ? "Gmail + Outlook"
              : gmailConnected
              ? "Gmail"
              : outlookConnected
              ? "Outlook"
              : "Connectez une boîte mail"}
          </p>
        </div>
        {isIrisActive ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
            <span className="text-xs text-primary">✦</span>
            <span className="text-sm text-muted-foreground">Iris analyse vos emails...</span>
            <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/30">
            <span className="text-xs text-muted-foreground opacity-50">✦</span>
            <span className="text-sm text-muted-foreground italic">Iris est en sommeil</span>
          </div>
        )}
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div
          className={`mx-8 mb-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
            statusMsg.ok
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Pending appointments banner */}
      {anyConnected && pendingCount > 0 && (
        <div className="mx-8 mb-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 border border-primary/30 text-primary flex items-center gap-2">
          <Calendar size={15} />
          <span>{pendingCount} RDV{pendingCount > 1 ? "s" : ""} à confirmer dans Google Calendar</span>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
            {pendingCount}
          </span>
        </div>
      )}

      {/* Tabs */}
      {(() => {
        const tabDef = [
          { id: "rdv",       label: "RDV" },
          { id: "action",    label: "Action" },
          { id: "attente",   label: "En attente" },
          { id: "bonsplans", label: "Bons plans" },
          { id: "info",      label: "Info" },
        ] as const;
        const tabCounts: Record<string, number> = { rdv: 0, action: 0, attente: 0, bonsplans: 0, info: 0 };
        if (emails) {
          for (const e of emails) {
            const cat = e.category ?? "info";
            tabCounts[cat in tabCounts ? cat : "info"]++;
          }
        }
        return (
          <div
            className="flex px-8 mb-5 flex-shrink-0 border-b"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            {tabDef.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all border-b-2 -mb-px"
                style={{
                  color: activeTab === t.id ? "#E8842A" : "rgba(255,255,255,0.45)",
                  borderColor: activeTab === t.id ? "#E8842A" : "transparent",
                  background: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
                {tabCounts[t.id] > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: activeTab === t.id ? "#E8842A" : "rgba(255,255,255,0.15)",
                      color: activeTab === t.id ? "white" : "rgba(255,255,255,0.5)",
                      fontSize: 10,
                    }}
                  >
                    {tabCounts[t.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 space-y-3">

        {/* No provider connected → big CTA with both options */}
        {noProviderConnected && (
          <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
              ✉️
            </div>
            <div>
              <p className="text-foreground font-semibold text-lg mb-1">
                Connectez votre boîte mail
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Iris lit vos emails et détecte automatiquement les rendez-vous pour alléger votre charge mentale.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={handleConnectGmail}
                disabled={connectingGmail}
                className="flex items-center justify-center gap-2.5 w-full px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Mail size={16} />
                {connectingGmail ? "Redirection…" : "Connecter Gmail"}
              </button>
              <button
                onClick={handleConnectOutlook}
                disabled={connectingOutlook}
                className="flex items-center justify-center gap-2.5 w-full px-6 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
                </svg>
                {connectingOutlook ? "Redirection…" : "Connecter Outlook"}
              </button>
            </div>
          </div>
        )}

        {/* Gmail disabled */}
        {!noProviderConnected && !gmailEnabled && !outlookConnected && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-muted-foreground text-sm">Gmail est désactivé.</p>
            <p className="text-xs text-muted-foreground/60">Activez-le dans Paramètres → Services connectés.</p>
          </div>
        )}

        {/* Loading */}
        {anyConnected && isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement de vos emails…</span>
          </div>
        )}

        {/* Session expired */}
        {isSessionExpired && (
          <div className="text-center py-16 text-red-400 text-sm">
            Votre session Iris a expiré. Reconnectez-vous pour relier Gmail.
          </div>
        )}

        {/* Fetch error (not "no provider") */}
        {error && !noProviderConnected && emailErrorStatus !== 404 && (
          <div className="text-center py-16 text-red-400 text-sm">
            Erreur de chargement des emails. Réessayez plus tard.
          </div>
        )}

        {/* Empty inbox */}
        {anyConnected && !isLoading && emails && emails.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Aucun email trouvé dans votre boîte.
          </div>
        )}

        {/* Email list — filtered by active tab */}
        {emails
          ?.filter((e) => (e.category ?? "info") === activeTab)
          .map((email) => (
            <EmailCard key={email.message_id ?? email.subject} email={email} />
          ))}

        {/* "Connect Outlook too" nudge — shown when only Gmail is connected */}
        {gmailConnected && !outlookConnected && !noProviderConnected && (
          <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-border bg-muted/20">
            <Plug size={16} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                Vous utilisez aussi Outlook ?{" "}
                <button
                  onClick={handleConnectOutlook}
                  disabled={connectingOutlook}
                  className="text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {connectingOutlook ? "Redirection…" : "Connecter Outlook →"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* "Connect Gmail too" nudge — shown when only Outlook is connected */}
        {outlookConnected && !gmailConnected && !noProviderConnected && (
          <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-border bg-muted/20">
            <Plug size={16} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                Vous utilisez aussi Gmail ?{" "}
                <button
                  onClick={handleConnectGmail}
                  disabled={connectingGmail}
                  className="text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {connectingGmail ? "Redirection…" : "Connecter Gmail →"}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
