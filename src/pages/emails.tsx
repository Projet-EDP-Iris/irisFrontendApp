import { useState, useEffect, useCallback } from "react";
import { Mail, MoreHorizontal, Calendar, CheckCircle2, Plug, Zap, Clock, Tag, BookOpen, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEmails } from "@/hooks/useEmails";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useOutlookConnection } from "@/hooks/useOutlookConnection";
import { apiFetch } from "@/lib/api";
import { notifyGmailConnected } from "@/lib/desktopNotifications";
import type { EmailItem } from "@/types/email";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMAILS_PER_PAGE = 20;
const GMAIL_COLORS = ["#EA4335", "#34A853", "#FBBC05", "#4285F4"] as const;
const OUTLOOK_BLUE = "#0078D4";

// ---------------------------------------------------------------------------
// OAuth callback helpers
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function providerAccent(email: EmailItem, index: number): string {
  if (email.provider === "gmail") return GMAIL_COLORS[index % GMAIL_COLORS.length];
  if (email.provider === "outlook") return OUTLOOK_BLUE;
  return "#E8842A";
}

// ---------------------------------------------------------------------------
// Email Detail Modal
// ---------------------------------------------------------------------------

function EmailDetailModal({ email, index, onClose }: { email: EmailItem; index: number; onClose: () => void }) {
  const accent = providerAccent(email, index);
  const dateStr = formatDate(email.date);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const providerLabel = email.provider === "gmail" ? "Gmail" : email.provider === "outlook" ? "Outlook" : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden"
        style={{ borderColor: `${accent}30` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border/40">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${accent}18` }}
          >
            <Mail size={16} style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground leading-snug mb-1">
              {email.subject || "(Sans objet)"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">{email.sender || "Expéditeur inconnu"}</span>
              {dateStr && (
                <>
                  <span className="text-muted-foreground/30 text-xs">·</span>
                  <span className="text-xs text-muted-foreground/70">{dateStr}</span>
                </>
              )}
              {providerLabel && (
                <>
                  <span className="text-muted-foreground/30 text-xs">·</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    {providerLabel}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {email.body ? (
            <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap font-mono-ish">
              {email.body}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Aucun contenu.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmailCard
// ---------------------------------------------------------------------------

function EmailCard({
  email,
  index,
  isIrisActive,
  onOpen,
}: {
  email: EmailItem;
  index: number;
  isIrisActive: boolean;
  onOpen: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const category = email.category ?? "info";
  const subject = email.subject || "(Sans objet)";
  const sender = email.sender || "Expéditeur inconnu";
  const dateStr = formatDate(email.date);
  const accent = providerAccent(email, index);

  const handleConfirm = async () => {
    if (!email.db_id) {
      window.open(buildCalendarUrl(email), "_blank");
      setConfirmed(true);
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`/calendar/confirm/${email.db_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_index: 0 }),
      });
      setConfirmed(true);
    } catch {
      setConfirmed(true);
    } finally {
      setLoading(false);
    }
  };

  function renderActionButton() {
    if (category === "rdv") {
      if (confirmed) {
        return (
          <div className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold">
            <CheckCircle2 size={16} />
            <span>RDV ajouté à Google Calendar ✓</span>
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
      className="rounded-2xl border transition-all duration-200 cursor-pointer"
      style={{
        borderColor: hovered
          ? `${accent}55`
          : confirmed || done
          ? "rgba(34,197,94,0.3)"
          : "var(--border, rgba(255,255,255,0.08))",
        background: confirmed || done ? "rgba(34,197,94,0.04)" : "var(--card)",
        boxShadow: hovered ? `0 0 0 1px ${accent}22, 0 4px 24px ${accent}18` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clickable email header area */}
      <div
        className="flex items-start gap-3 px-5 pt-4 pb-3"
        onClick={onOpen}
      >
        {/* Provider-colored icon */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200"
          style={{ background: `${accent}18` }}
        >
          <Mail size={14} style={{ color: accent }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug truncate">{subject}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span style={{ color: accent, opacity: 0.8 }}>{sender}</span>
                {dateStr && <>{" · "}{dateStr}</>}
              </p>
            </div>
            <button
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {email.body && (
            <p className="text-xs text-muted-foreground/60 mt-1.5 line-clamp-2 leading-relaxed">
              {email.body.slice(0, 160)}
            </p>
          )}
        </div>
      </div>

      {/* Action button — grayed when Iris is asleep */}
      <div
        className="px-5 pb-4 transition-opacity duration-200"
        style={{ opacity: isIrisActive ? 1 : 0.35, pointerEvents: isIrisActive ? "auto" : "none" }}
      >
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
  const [currentPage, setCurrentPage] = useState(1);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [connectingOutlook, setConnectingOutlook] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [openEmail, setOpenEmail] = useState<{ email: EmailItem; index: number } | null>(null);

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

  const anyConnected = (gmailEnabled && gmailConnected) || outlookConnected;
  const { data: emails, isLoading, error } = useEmails(anyConnected);

  // Reset to page 1 when tab changes
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

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
  const totalEmailCount = emails?.length ?? 0;

  // Per-tab filtered + paginated emails
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

  const filteredEmails = emails?.filter((e) => (e.category ?? "info") === activeTab) ?? [];
  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / EMAILS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedEmails = filteredEmails.slice((safePage - 1) * EMAILS_PER_PAGE, safePage * EMAILS_PER_PAGE);

  // Global index for color cycling (use position in full emails array)
  const getGlobalIndex = useCallback(
    (email: EmailItem) => emails?.indexOf(email) ?? 0,
    [emails]
  );

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

        {/* Iris status pill with email count */}
        {isIrisActive ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
            <span className="text-xs text-primary">✦</span>
            <span className="text-sm text-muted-foreground">Iris analyse vos emails...</span>
            {totalEmailCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold tabular-nums">
                {totalEmailCount}
              </span>
            )}
            <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/30">
            <span className="text-xs text-muted-foreground opacity-50">✦</span>
            <span className="text-sm text-muted-foreground italic">Iris est en sommeil</span>
            {totalEmailCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 text-xs font-bold tabular-nums">
                {totalEmailCount}
              </span>
            )}
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
                className="px-1.5 py-0.5 rounded-full text-xs font-bold tabular-nums"
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">

        {/* No provider connected */}
        {noProviderConnected && (
          <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
              ✉️
            </div>
            <div>
              <p className="text-foreground font-semibold text-lg mb-1">Connectez votre boîte mail</p>
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
                <MicrosoftIcon />
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

        {/* Fetch error */}
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

        {/* Empty tab */}
        {anyConnected && !isLoading && emails && emails.length > 0 && filteredEmails.length === 0 && (
          <div className="text-center py-12 text-muted-foreground/50 text-sm">
            Aucun email dans cette catégorie.
          </div>
        )}

        {/* Email list */}
        {pagedEmails.map((email) => {
          const globalIdx = getGlobalIndex(email);
          return (
            <EmailCard
              key={email.message_id ?? email.subject}
              email={email}
              index={globalIdx}
              isIrisActive={isIrisActive}
              onOpen={() => setOpenEmail({ email, index: globalIdx })}
            />
          );
        })}

        {/* Pagination */}
        {filteredEmails.length > EMAILS_PER_PAGE && (
          <div className="flex items-center justify-center gap-3 pt-2 pb-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Connect Outlook nudge */}
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

        {/* Connect Gmail nudge */}
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

      {/* Email detail modal */}
      {openEmail && (
        <EmailDetailModal
          email={openEmail.email}
          index={openEmail.index}
          onClose={() => setOpenEmail(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Microsoft icon (avoids external dep)
// ---------------------------------------------------------------------------

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
