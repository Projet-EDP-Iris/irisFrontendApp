import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEmails } from "@/hooks/useEmails";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { apiFetch } from "@/lib/api";
import { notifyGmailConnected } from "@/lib/desktopNotifications";
import type { EmailItem } from "@/types/email";

function getGmailCallbackParams(): { status: "connected" | "error" | null; reason: string | null } {
  const hash = window.location.hash || "";
  const queryIndex = hash.indexOf("?");
  const query = queryIndex >= 0 ? hash.slice(queryIndex + 1) : window.location.search.slice(1);
  const params = new URLSearchParams(query);
  const gmail = params.get("gmail");
  return {
    status: gmail === "connected" || gmail === "error" ? gmail : null,
    reason: params.get("gmail_reason"),
  };
}

function clearGmailCallbackStatus() {
  const cleanHash = (window.location.hash || "").split("?")[0] || "#/emails";
  window.history.replaceState({}, "", `${window.location.pathname}${cleanHash}`);
}

function parseSender(sender: string | null): { name: string; initials: string } {
  if (!sender) return { name: "Unknown", initials: "?" };
  const match = sender.match(/^(.*?)\s*<[^>]+>$/);
  const name = (match ? match[1].trim() : sender) || sender;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");
  return { name, initials: initials || "?" };
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

function EmailCard({ email }: { email: EmailItem }) {
  const { name, initials } = parseSender(email.sender);
  const description = truncate(email.body.replace(/\s+/g, " ").trim(), 80);

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border border-card-border hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-primary">{initials}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-foreground/90 truncate">{email.subject}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-primary/70">Email</span>
          {" · "}
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <MoreHorizontal size={16} />
        </button>
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
