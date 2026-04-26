import { MoreHorizontal, Calendar, CheckCircle2, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEmails } from "@/hooks/useEmails";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { apiFetch } from "@/lib/api";
import { getGmailCallbackParams, clearGmailCallbackStatus } from "@/lib/signupDraft";
import { notifyGmailConnected } from "@/lib/desktopNotifications";
import type { EmailItem } from "@/types/email";

function buildGoogleCalendarUrl(email: EmailItem): string {
  // Use the email date as event start (or default to tomorrow 10am)
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

  const bodyPreview = email.body?.slice(0, 200) ?? "";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: email.subject,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: bodyPreview,
    location: "",
  });
  if (email.sender) params.set("add", email.sender);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function EmailCard({ email }: { email: EmailItem }) {
  const [confirmed, setConfirmed] = useState(false);

  const subject = email.subject ?? "(Sans objet)";
  const sender = email.sender ?? "Expéditeur inconnu";
  const dateStr = email.date
    ? new Date(email.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  const handleConfirm = () => {
    const url = buildGoogleCalendarUrl(email);
    window.open(url, "_blank");
    setConfirmed(true);
  };

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        confirmed ? "border-green-500/30 bg-green-500/5" : "border-card-border bg-card"
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

      {/* Calendar confirmation button */}
      <div className="px-5 pb-4">
        {confirmed ? (
          <div className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold">
            <CheckCircle2 size={16} />
            <span>RDV ajouté à Google Calendar ✓</span>
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #E8842A 0%, #d4751f 100%)" }}
          >
            <Calendar size={15} />
            <span>Confirmer ce RDV dans Google Calendar</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function EmailsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("rdv");
  const [connecting, setConnecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const { isIrisActive } = useAuth();
  const {
    connected: gmailConnected,
    enabled: gmailEnabled,
    isLoading: statusLoading,
    error: statusError,
    refetchStatus,
  } = useGmailConnection();
  const { data: emails, isLoading, error } = useEmails(20, gmailEnabled && gmailConnected);

  useEffect(() => {
    const { status: gmail, reason } = getGmailCallbackParams();
    if (!gmail) return;

    clearGmailCallbackStatus();

    if (gmail === "error") {
      const devSuffix = import.meta.env.DEV && reason ? ` (${reason})` : "";
      setStatusMsg({ text: `Gmail connection failed. Please try again.${devSuffix}`, ok: false });
      return;
    }

    localStorage.setItem("gmail_enabled", "true");
    setStatusMsg({ text: "Gmail connected! Your emails are loading…", ok: true });

    void (async () => {
      const statusResult = await refetchStatus();

      if (statusResult.data?.connected) {
        await notifyGmailConnected({ gmailEmail: statusResult.data.gmail_email });
        await queryClient.invalidateQueries({ queryKey: ["emails"] });
        return;
      }

      setStatusMsg({ text: "Gmail linked, but Iris could not confirm the inbox yet. Please refresh once.", ok: false });
    })();
  }, [queryClient, refetchStatus]);

  // Show connect CTA when: status says not connected, OR emails endpoint says not connected (404)
  const emailErrorStatus = (error as Error & { status?: number } | null)?.status;
  const statusErrorStatus = (statusError as Error & { status?: number } | null)?.status;
  const isGmailNotConnected =
    (!statusLoading && !gmailConnected && statusErrorStatus !== 401 && statusErrorStatus !== 403) ||
    (emailErrorStatus === 404 && !gmailConnected);

  async function handleConnectGmail() {
    setConnecting(true);
    try {
      const { auth_url } = await apiFetch<{ auth_url: string }>("/auth/google");
      window.location.href = auth_url;
    } catch {
      setStatusMsg({ text: "Could not start Gmail connection. Check backend config.", ok: false });
      setConnecting(false);
    }
  }

  // Pending appointments count (all RDV emails = appointments to confirm)
  const pendingCount = emails?.length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emails</h1>
          <p className="text-sm text-muted-foreground mt-0.5">From your Gmail inbox</p>
        </div>
        {isIrisActive ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
            <span className="text-xs text-primary">✦</span>
            <span className="text-sm text-muted-foreground">Iris is summarizing your emails...</span>
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
      {gmailEnabled && gmailConnected && pendingCount > 0 && (
        <div className="mx-8 mb-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 border border-primary/30 text-primary flex items-center gap-2">
          <Calendar size={15} />
          <span>
            {pendingCount} RDV{pendingCount > 1 ? "s" : ""} à confirmer dans Google Calendar
          </span>
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
        {[
          { id: "rdv",       label: "RDV",        count: emails?.length ?? 0 },
          { id: "action",    label: "Action",     count: 0 },
          { id: "attente",   label: "En attente", count: 0 },
          { id: "bonsplans", label: "Bons plans", count: 0 },
          { id: "info",      label: "Info",       count: 0 },
        ].map((t) => (
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
            {t.count > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: activeTab === t.id ? "#E8842A" : "rgba(255,255,255,0.15)",
                  color: activeTab === t.id ? "white" : "rgba(255,255,255,0.5)",
                  fontSize: 10,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 space-y-3">
        {/* Gmail disabled by the user */}
        {!gmailEnabled && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-muted-foreground text-sm">Gmail is turned off.</p>
            <p className="text-xs text-muted-foreground/60">Enable it in Settings → Services connectés.</p>
          </div>
        )}

        {/* Loading */}
        {gmailEnabled && isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading your emails…</span>
          </div>
        )}

        {/* Gmail not connected */}
        {isGmailNotConnected && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <div>
              <p className="text-foreground font-semibold mb-1">Connect your Gmail</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Link your Gmail account so Iris can read your emails and help you manage meetings.
              </p>
            </div>
            <button
              onClick={handleConnectGmail}
              disabled={connecting}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {connecting ? "Redirecting…" : "Connect Gmail"}
            </button>
          </div>
        )}

        {/* Other errors */}
        {error && !isGmailNotConnected && (
          <div className="text-center py-16 text-red-400 text-sm">
            Failed to load emails. Please try again later.
          </div>
        )}

        {statusErrorStatus && (statusErrorStatus === 401 || statusErrorStatus === 403) && (
          <div className="text-center py-16 text-red-400 text-sm">
            Your Iris session expired. Please log in again to reconnect Gmail.
          </div>
        )}

        {/* Email list */}
        {emails && emails.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No emails found in your inbox.
          </div>
        )}

        {activeTab === "rdv" && emails?.map((email) => (
          <EmailCard key={email.message_id} email={email} />
        ))}
      </div>
    </div>
  );
}
