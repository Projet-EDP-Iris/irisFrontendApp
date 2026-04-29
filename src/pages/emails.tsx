import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mail, Calendar, CheckCircle2, Plug, Zap, Clock, Tag, BookOpen,
  X, ArrowLeft,
} from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEmailFeed } from "@/hooks/useEmailFeed";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useOutlookConnection } from "@/hooks/useOutlookConnection";
import { apiFetch } from "@/lib/api";
import { notifyGmailConnected } from "@/lib/desktopNotifications";
import type { EmailItem } from "@/types/email";


// ---------------------------------------------------------------------------
// OAuth callback helpers
// ---------------------------------------------------------------------------

function getOAuthCallbackParams() {
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
    if (isNaN(start.getTime())) { start = new Date(); start.setDate(start.getDate() + 1); start.setHours(10, 0, 0, 0); }
  } else {
    start = new Date(); start.setDate(start.getDate() + 1); start.setHours(10, 0, 0, 0);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const p = new URLSearchParams({ action: "TEMPLATE", text: email.subject, dates: `${fmt(start)}/${fmt(end)}`, details: email.body?.slice(0, 200) ?? "" });
  if (email.sender) p.set("add", email.sender);
  return `https://calendar.google.com/calendar/render?${p}`;
}

function fmtDate(dateStr: string | null, long = false) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  if (long) return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function cardClass(provider?: string) {
  if (provider === "gmail") return "email-card-gmail";
  if (provider === "outlook") return "email-card-outlook";
  return "email-card-default";
}

// ---------------------------------------------------------------------------
// Email Detail Side Panel
// ---------------------------------------------------------------------------

function EmailPanel({
  email,
  onClose,
}: {
  email: EmailItem;
  onClose: () => void;
}) {
  const [body, setBody] = useState<string | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);
  const [confirmedSubject, setConfirmedSubject] = useState<string | null>(null);
  const [confirmedProvider, setConfirmedProvider] = useState<string | null>(null);

  const category = email.category ?? "info";
  const dateStr = fmtDate(email.date, true);

  // For Gmail: fetch full body on open. Outlook already has full body.
  useEffect(() => {
    if (!email.message_id) { setBody(email.body || ""); return; }
    if (email.provider === "gmail") {
      setBodyLoading(true);
      apiFetch<{ body: string }>(`/emails/body/${email.message_id}?provider=gmail`)
        .then((r) => setBody(r.body))
        .catch(() => setBody(email.body || ""))
        .finally(() => setBodyLoading(false));
    } else {
      setBody(email.body || "");
    }
  }, [email.message_id, email.provider, email.body]);

  const handleConfirm = async () => {
    if (!email.db_id) { window.open(buildCalendarUrl(email), "_blank"); setConfirmed(true); return; }
    setLoading(true);
    try {
      const result = await apiFetch<any>(`/calendar/confirm/${email.db_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_index: 0, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      if (result?.slot?.start_time) {
        const d = new Date(result.slot.start_time);
        setConfirmedDate(d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }));
      }
      setConfirmedSubject(email.subject ?? null);
      const successProviders: string[] = (result?.providers ?? []).filter((p: any) => !p.error).map((p: any) => p.provider === "google" ? "Google Calendar" : p.provider === "outlook" ? "Outlook Calendar" : p.provider);
      setConfirmedProvider(successProviders.length > 0 ? successProviders.join(" + ") : null);
      const failedProviders = result?.providers?.filter((p: any) => p.error);
      if (failedProviders?.length) {
        console.warn("Some calendar providers failed:", failedProviders);
      }
      setConfirmed(true);
    } catch (err) {
      console.error("Calendar confirm failed:", err);
      alert("Erreur lors de l'ajout au calendrier. Vérifie que ton calendrier est bien connecté !");
    } finally {
      setLoading(false);
    }
  };

  const providerLabel = email.provider === "gmail" ? "Gmail" : email.provider === "outlook" ? "Outlook" : null;
  const accentColor = email.provider === "outlook" ? "#0078D4" : email.provider === "gmail" ? "#4285F4" : "#E8842A";

  function renderAction() {
    if (category === "rdv") {
      if (confirmed) {
        return (
          <div className="flex flex-col gap-1 w-full px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Ajouté à {confirmedProvider ?? "votre calendrier"} ✓</span>
            </div>
            {confirmedSubject && (
              <span className="text-xs font-normal opacity-90 truncate">{confirmedSubject}</span>
            )}
            {confirmedDate && (
              <span className="text-xs font-normal opacity-70">Prévu le {confirmedDate}</span>
            )}
          </div>
        );
      }
      return (
        <button onClick={handleConfirm} disabled={loading} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all" style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}>
          {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar size={15}/>}
          <span>{loading ? "Ajout…" : "Confirmer ce RDV dans Google Calendar"}</span>
        </button>
      );
    }
    if (done) return <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold"><CheckCircle2 size={16}/><span>Fait ✓</span></div>;
    if (category === "action") return <button onClick={() => setDone(true)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all" style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}><Zap size={15}/><span>Marquer comme traité</span></button>;
    if (category === "attente") return <button onClick={() => setDone(true)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-accent active:scale-[0.98] transition-all"><Clock size={15}/><span>Envoyer un rappel</span></button>;
    if (category === "bonsplans") return <button onClick={() => setDone(true)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-accent active:scale-[0.98] transition-all"><Tag size={15}/><span>Voir l'offre</span></button>;
    return <button onClick={() => setDone(true)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-muted/30 text-muted-foreground hover:bg-accent active:scale-[0.98] transition-all"><BookOpen size={15}/><span>Marquer comme lu</span></button>;
  }

  return (
    <div className="flex flex-col h-full border-l border-border/40 bg-card overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 flex-shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{email.sender || "Expéditeur inconnu"}</p>
        </div>
        {providerLabel && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${accentColor}18`, color: accentColor }}>
            {providerLabel}
          </span>
        )}
        <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0">
          <X size={15} />
        </button>
      </div>

      {/* Subject + meta */}
      <div className="px-5 pt-4 pb-3 border-b border-border/30 flex-shrink-0">
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${accentColor}18` }}>
            <Mail size={14} style={{ color: accentColor }} />
          </div>
          <h2 className="text-sm font-semibold text-foreground leading-snug pt-0.5">
            {email.subject || "(Sans objet)"}
          </h2>
        </div>
        {dateStr && <p className="text-xs text-muted-foreground/70 ml-10">{dateStr}</p>}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {bodyLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Chargement du contenu…
          </div>
        ) : body ? (
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
            {body}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Aucun contenu.</p>
        )}
      </div>

      {/* Action */}
      <div className="px-5 pb-5 pt-3 border-t border-border/30 flex-shrink-0">
        {renderAction()}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmailCard (list item)
// ---------------------------------------------------------------------------

function EmailCard({
  email,
  isIrisActive,
  isSelected,
  onSelect,
}: {
  email: EmailItem;
  isIrisActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const category = email.category ?? "info";
  const subject = email.subject || "(Sans objet)";
  const sender = email.sender || "Expéditeur inconnu";
  const dateStr = fmtDate(email.date);
  const accentColor = email.provider === "outlook" ? "#0078D4" : email.provider === "gmail" ? "#4285F4" : "#E8842A";

  return (
    <div
      className={`rounded-2xl cursor-pointer transition-all duration-150 ${cardClass(email.provider)} ${
        isSelected ? "ring-1 ring-primary/40 bg-primary/5" : ""
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-2.5">
        {/* Icon */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${accentColor}18` }}>
          <Mail size={13} style={{ color: accentColor }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug truncate">{subject}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            <span style={{ color: accentColor, opacity: 0.85 }}>{sender}</span>
            {dateStr && <span className="text-muted-foreground/50"> · {dateStr}</span>}
          </p>
          {email.body && (
            <p className="text-xs text-muted-foreground/55 mt-1 line-clamp-1 leading-relaxed">
              {email.body.slice(0, 120)}
            </p>
          )}
        </div>

        {/* Category pill */}
        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground flex-shrink-0 mt-0.5">
          {category === "rdv" ? "RDV" : category === "bonsplans" ? "deal" : category}
        </span>
      </div>

      {/* Quick action — disabled when Iris asleep */}
      <div
        className="px-4 pb-3 transition-opacity duration-150"
        style={{ opacity: isIrisActive ? 1 : 0.28, pointerEvents: isIrisActive ? "auto" : "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <QuickAction email={email} category={category} />
      </div>
    </div>
  );
}

function QuickAction({ email, category }: { email: EmailItem; category: string }) {
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calError, setCalError] = useState(false);

  if (confirmed || done) {
    return (
      <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
        <CheckCircle2 size={13} /><span>Fait ✓</span>
      </div>
    );
  }

  if (category === "rdv") {
    if (calError) {
      return (
        <button onClick={() => setCalError(false)} className="flex items-center gap-1.5 text-xs font-semibold text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-all" title="Réessayer">
          <X size={12}/><span>Erreur calendrier</span>
        </button>
      );
    }
    const handle = async () => {
      if (!email.db_id) { window.open(buildCalendarUrl(email), "_blank"); setConfirmed(true); return; }
      setLoading(true);
      try {
        await apiFetch(`/calendar/confirm/${email.db_id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slot_index: 0, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) });
        setConfirmed(true);
      } catch (err) {
        console.error("Calendar confirm failed:", err);
        setCalError(true);
      } finally { setLoading(false); }
    };
    return (
      <button onClick={handle} disabled={loading} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all" style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}>
        {loading ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar size={12}/>}
        <span>{loading ? "…" : "Confirmer RDV"}</span>
      </button>
    );
  }
  if (category === "action") return <button onClick={() => setDone(true)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all" style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}><Zap size={12}/><span>Traiter</span></button>;
  if (category === "attente") return <button onClick={() => setDone(true)} className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-card text-foreground px-3 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] transition-all"><Clock size={12}/><span>Rappel</span></button>;
  if (category === "bonsplans") return <button onClick={() => setDone(true)} className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-card text-foreground px-3 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] transition-all"><Tag size={12}/><span>Voir</span></button>;
  return <button onClick={() => setDone(true)} className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-muted/30 text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] transition-all"><BookOpen size={12}/><span>Lu</span></button>;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const TABS = [
  { id: "rdv",       label: "RDV" },
  { id: "action",    label: "Action" },
  { id: "attente",   label: "En attente" },
  { id: "bonsplans", label: "Bons plans" },
  { id: "info",      label: "Info" },
] as const;

export default function EmailsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("rdv");
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [connectingOutlook, setConnectingOutlook] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { isIrisActive, setEmailCount } = useAuth();

  const { connected: gmailConnected, enabled: gmailEnabled, isLoading: gmailStatusLoading, error: gmailStatusError, refetchStatus: refetchGmail } = useGmailConnection();
  const { connected: outlookConnected, isLoading: outlookStatusLoading, refetchStatus: refetchOutlook } = useOutlookConnection();

  const anyConnected = (gmailEnabled && gmailConnected) || outlookConnected;

  const {
    data: feedData,
    isLoading: feedLoading,
    isFetching,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEmailFeed(anyConnected);

  // Fast cached read — shows last-known emails instantly while the feed loads in background
  const { data: cachedData } = useQuery({
    queryKey: ["emails-cached"],
    queryFn: () => apiFetch<{ emails: import("@/types/email").EmailItem[]; has_more: boolean }>("/emails/cached?limit=50"),
    enabled: anyConnected,
    staleTime: 30_000,
  });

  const allEmails =
    feedData?.pages.flatMap((p) => p.emails) ??
    cachedData?.emails ??
    [];
  // Don't show the full-page spinner when cached emails are already available
  const isLoading = feedLoading && !cachedData?.emails?.length;
  const isRefreshing = isFetching && !feedLoading;

  // Compute tab counts over ALL loaded emails
  const tabCounts: Record<string, number> = { rdv: 0, action: 0, attente: 0, bonsplans: 0, info: 0 };
  for (const e of allEmails) {
    const cat = e.category ?? "info";
    tabCounts[cat in tabCounts ? cat : "info"]++;
  }

  // Filtered list for the active tab
  const filteredEmails = allEmails.filter((e) => (e.category ?? "info") === activeTab);

  // Sync total email count to sidebar badge
  useEffect(() => { setEmailCount(allEmails.length); }, [allEmails.length, setEmailCount]);

  // Infinite scroll — when sentinel is visible, load next page
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // OAuth callbacks
  useEffect(() => {
    const { gmail, outlook, reason } = getOAuthCallbackParams();
    if (!gmail && !outlook) return;
    clearCallbackParams();
    if (gmail === "error") { setStatusMsg({ text: `Gmail connection failed.${import.meta.env.DEV && reason ? ` (${reason})` : ""}`, ok: false }); return; }
    if (outlook === "error") { setStatusMsg({ text: `Outlook connection failed.${import.meta.env.DEV && reason ? ` (${reason})` : ""}`, ok: false }); return; }
    if (gmail === "connected") {
      localStorage.setItem("gmail_enabled", "true");
      setStatusMsg({ text: "Gmail connecté ! Vos emails se chargent…", ok: true });
      void (async () => {
        const r = await refetchGmail();
        if (r.data?.connected) { await notifyGmailConnected({ gmailEmail: r.data.gmail_email }); await queryClient.invalidateQueries({ queryKey: ["emails-feed"] }); }
        else setStatusMsg({ text: "Gmail lié, mais Iris n'a pas pu confirmer la boîte. Actualisez.", ok: false });
      })();
    }
    if (outlook === "success") {
      setStatusMsg({ text: "Outlook connecté ! Vos emails se chargent…", ok: true });
      void (async () => { await refetchOutlook(); await queryClient.invalidateQueries({ queryKey: ["emails-feed"] }); })();
    }
  }, [queryClient, refetchGmail, refetchOutlook]);

  const emailErrorStatus = (error as Error & { status?: number } | null)?.status;
  const gmailStatusErrorStatus = (gmailStatusError as Error & { status?: number } | null)?.status;
  const isSessionExpired = gmailStatusErrorStatus === 401 || gmailStatusErrorStatus === 403;
  const noProviderConnected = !gmailStatusLoading && !outlookStatusLoading && !gmailConnected && !outlookConnected && !isSessionExpired && emailErrorStatus !== 200;
  const pendingCount = tabCounts["rdv"];

  async function handleConnectGmail() {
    setConnectingGmail(true);
    try {
      const { auth_url } = await apiFetch<{ auth_url: string }>("/auth/google");
      if (window.irisDesktop?.openExternal) {
        window.irisDesktop.openExternal(auth_url);
      } else {
        window.location.href = auth_url;
      }
    }
    catch { setStatusMsg({ text: "Impossible de démarrer la connexion Gmail. Vérifiez la config backend.", ok: false }); setConnectingGmail(false); }
  }

  useEffect(() => {
    if (!window.irisDesktop?.onOAuthCallback) return;
    const unsubscribe = window.irisDesktop.onOAuthCallback((params) => {
      if (params.gmail === "connected") {
        localStorage.setItem("gmail_enabled", "true");
        setConnectingGmail(false);
        setStatusMsg({ text: "Gmail connecté ! Vos emails se chargent…", ok: true });
        void (async () => {
          const r = await refetchGmail();
          if (r.data?.connected) { await notifyGmailConnected({ gmailEmail: r.data.gmail_email }); await queryClient.invalidateQueries({ queryKey: ["emails-feed"] }); }
          else setStatusMsg({ text: "Gmail lié, mais Iris n'a pas pu confirmer la boîte. Actualisez.", ok: false });
        })();
      } else if (params.gmail === "error") {
        setConnectingGmail(false);
        setStatusMsg({ text: "Gmail connection failed.", ok: false });
      }
    });
    return unsubscribe;
  }, [queryClient, refetchGmail]);

  async function handleConnectOutlook() {
    setConnectingOutlook(true);
    try {
      const { auth_url } = await apiFetch<{ auth_url: string }>("/auth/microsoft");
      if (window.irisDesktop?.openExternal) {
        window.irisDesktop.openExternal(auth_url);
      } else {
        window.location.href = auth_url;
      }
    }
    catch { setStatusMsg({ text: "Impossible de démarrer la connexion Outlook. Vérifiez la config backend.", ok: false }); setConnectingOutlook(false); }
  }

  const handleSelectEmail = useCallback((email: EmailItem) => {
    setSelectedEmail((prev) => (prev?.message_id === email.message_id ? null : email));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Emails</h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            {gmailConnected && outlookConnected ? "Gmail + Outlook" : gmailConnected ? "Gmail" : outlookConnected ? "Outlook" : "Connectez une boîte mail"}
            {isRefreshing && (
              <span className="flex items-center gap-1 text-[10px] text-primary/70">
                <span className="w-2 h-2 border border-primary/60 border-t-transparent rounded-full animate-spin" />
                Actualisation…
              </span>
            )}
          </p>
        </div>

        {isIrisActive ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card">
            <span className="text-xs text-primary">✦</span>
            <span className="text-xs text-muted-foreground">Iris analyse…</span>
            <div className="w-3 h-3 border-[1.5px] border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/30">
            <span className="text-xs text-muted-foreground opacity-40">✦</span>
            <span className="text-xs text-muted-foreground italic">Iris est en sommeil</span>
          </div>
        )}
      </div>

      {/* ── Banners ─────────────────────────────────────────────────────── */}
      {statusMsg && (
        <div className={`mx-6 mb-2 px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${statusMsg.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="opacity-60 hover:opacity-100 transition-opacity ml-2"><X size={13}/></button>
        </div>
      )}
      {anyConnected && pendingCount > 0 && (
        <div className="mx-6 mb-2 px-3 py-2 rounded-xl text-xs font-medium bg-primary/10 border border-primary/30 text-primary flex items-center gap-2">
          <Calendar size={13}/>
          <span>{pendingCount} RDV{pendingCount > 1 ? "s" : ""} à confirmer</span>
          <span className="ml-auto px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">{pendingCount}</span>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex px-6 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium cursor-pointer transition-all border-b-2 -mb-px whitespace-nowrap"
            style={{ color: activeTab === t.id ? "#E8842A" : "rgba(255,255,255,0.4)", borderColor: activeTab === t.id ? "#E8842A" : "transparent", background: "transparent" }}
          >
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className="px-1.5 py-px rounded-full text-[10px] font-bold tabular-nums" style={{ background: activeTab === t.id ? "#E8842A" : "rgba(255,255,255,0.12)", color: activeTab === t.id ? "white" : "rgba(255,255,255,0.45)" }}>
                {tabCounts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content (list + panel side-by-side) ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Email list */}
        <div className={`flex flex-col overflow-y-auto transition-all duration-200 ${selectedEmail ? "w-[400px] flex-shrink-0" : "flex-1"}`}>
          <div className="flex-1 px-4 pt-3 pb-6 space-y-2">

            {/* No provider */}
            {noProviderConnected && (
              <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">✉️</div>
                <div>
                  <p className="text-foreground font-semibold mb-1">Connectez votre boîte mail</p>
                  <p className="text-xs text-muted-foreground max-w-xs">Iris lit vos emails et détecte automatiquement les rendez-vous.</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button onClick={handleConnectGmail} disabled={connectingGmail} className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                    <Mail size={15}/>{connectingGmail ? "Redirection…" : "Connecter Gmail"}
                  </button>
                  <button onClick={handleConnectOutlook} disabled={connectingOutlook} className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50">
                    <MicrosoftIcon/>{connectingOutlook ? "Redirection…" : "Connecter Outlook"}
                  </button>
                </div>
              </div>
            )}

            {/* Gmail disabled */}
            {!noProviderConnected && !gmailEnabled && !outlookConnected && (
              <div className="flex flex-col items-center py-14 gap-2 text-center">
                <p className="text-muted-foreground text-sm">Gmail est désactivé.</p>
                <p className="text-xs text-muted-foreground/50">Activez-le dans Paramètres → Services connectés.</p>
              </div>
            )}

            {/* Loading first page */}
            {anyConnected && isLoading && (
              <div className="flex items-center justify-center py-14 gap-2.5 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm">Chargement de vos emails…</span>
              </div>
            )}

            {isSessionExpired && <div className="text-center py-14 text-red-400 text-sm">Session expirée. Reconnectez-vous.</div>}
            {error && !noProviderConnected && emailErrorStatus !== 404 && <div className="text-center py-14 text-red-400 text-sm">Erreur de chargement. Réessayez.</div>}

            {/* Empty state for tab */}
            {anyConnected && !isLoading && allEmails.length > 0 && filteredEmails.length === 0 && (
              <div className="text-center py-10 text-muted-foreground/40 text-sm">Aucun email dans cette catégorie.</div>
            )}
            {anyConnected && !isLoading && allEmails.length === 0 && !error && (
              <div className="text-center py-14 text-muted-foreground text-sm">Aucun email trouvé.</div>
            )}

            {/* Email cards */}
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.message_id ?? email.subject}
                email={email}
                isIrisActive={isIrisActive}
                isSelected={selectedEmail?.message_id === email.message_id}
                onSelect={() => handleSelectEmail(email)}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {/* Loading next page */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                <span className="text-xs">Chargement de la suite…</span>
              </div>
            )}

            {/* End of list per tab */}
            {!hasNextPage && !isFetchingNextPage && filteredEmails.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/30 py-3">
                — Tous les emails de cette catégorie sont chargés —
              </p>
            )}

            {/* Connect nudges */}
            {gmailConnected && !outlookConnected && !noProviderConnected && (
              <div className="mt-1 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-dashed border-border bg-muted/15">
                <Plug size={14} className="text-muted-foreground flex-shrink-0"/>
                <p className="text-xs text-muted-foreground">Aussi sur Outlook ?{" "}
                  <button onClick={handleConnectOutlook} disabled={connectingOutlook} className="text-primary font-semibold hover:underline disabled:opacity-50">
                    {connectingOutlook ? "…" : "Connecter →"}
                  </button>
                </p>
              </div>
            )}
            {outlookConnected && !gmailConnected && !noProviderConnected && (
              <div className="mt-1 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-dashed border-border bg-muted/15">
                <Plug size={14} className="text-muted-foreground flex-shrink-0"/>
                <p className="text-xs text-muted-foreground">Aussi sur Gmail ?{" "}
                  <button onClick={handleConnectGmail} disabled={connectingGmail} className="text-primary font-semibold hover:underline disabled:opacity-50">
                    {connectingGmail ? "…" : "Connecter →"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Email detail side panel — always visible */}
        <div className="flex-1 overflow-hidden border-l border-border/40">
          {selectedEmail ? (
            <EmailPanel email={selectedEmail} onClose={() => setSelectedEmail(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20 select-none pointer-events-none">
              <img src="./icon.png" alt="" className="w-16 h-16 object-contain" />
              <p className="text-sm text-muted-foreground font-medium">Sélectionnez un email</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Microsoft icon
// ---------------------------------------------------------------------------

function MicrosoftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}
