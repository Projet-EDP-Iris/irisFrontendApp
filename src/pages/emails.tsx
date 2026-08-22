import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { playDotsClick } from "@/lib/sounds";
import {
  Mail, Calendar, CheckCircle2, Plug, Clock, Tag,
  X, ArrowLeft, FileText, MessageSquare, ListChecks,
} from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEmailFeed } from "@/hooks/useEmailFeed";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useOutlookConnection } from "@/hooks/useOutlookConnection";
import { useProcessingState } from "@/hooks/useProcessingState";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { notifyGmailConnected } from "@/lib/desktopNotifications";
import { PowerButtonWithProgress } from "@/components/PowerButtonWithProgress";
import { CategoryProgressBar } from "@/components/CategoryProgressBar";
import { EmailsProgressBar } from "@/components/EmailsProgressBar";
import type { EmailItem } from "@/types/email";


// Promo code extractor

function extractPromoCode(body: string): string | null {
  const promoKeywords = /\b(code|promo|coupon|remise|réduction|reduction|offre|discount)\b/i;
  const lines = body.split(/\n|\r/);
  for (const line of lines) {
    if (promoKeywords.test(line)) {
      const match = line.match(/\b([A-Z0-9]{4,16})\b/);
      if (match) return match[1];
    }
  }
  // Fallback: look for CODE: pattern anywhere
  const fallback = body.match(/CODE[:\s]+([A-Z0-9]{4,16})/i);
  return fallback ? fallback[1].toUpperCase() : null;
}

// OAuth callback helpers

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

// Helpers

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

// Shared types

type ReplyVariant = { label: string; content: string };
type PanelMode = "read" | "summary" | "reply" | "compose" | "plan";

// Reply variants display (used inside EmailPanel in reply mode)

function ReplyVariantsView({
  variants,
  onSelect,
}: {
  variants: ReplyVariant[];
  onSelect?: (content: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!variants.length) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Aucune réponse générée.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Réponses suggérées · IA
      </p>
      {variants.map((v) => (
        <div key={v.label} className="p-3 rounded-xl border border-border/40 bg-muted/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-foreground/70">{v.label}</span>
            <div className="flex items-center gap-2">
              {onSelect && (
                <button
                  onClick={() => onSelect(v.content)}
                  className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Utiliser →
                </button>
              )}
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(v.content);
                  setCopied(v.label);
                  setTimeout(() => setCopied(null), 1500);
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied === v.label ? "Copié ✓" : "Copier"}
              </button>
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {v.content}
          </p>
        </div>
      ))}
    </div>
  );
}

// Reply composer — shown after user selects a variant

function ReplyComposer({
  email,
  initialText,
  onBack,
  onSent,
}: {
  email: EmailItem;
  initialText: string;
  onBack: () => void;
  onSent: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    if (!email.db_id) { setError("Identifiant email manquant."); return; }
    setSending(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("reply_text", text);
      for (const f of files) form.append("attachments", f);
      const token = localStorage.getItem("iris_token");
      const resp = await fetch(`${API_BASE_URL}/emails/reply/${email.db_id}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail ?? "Erreur lors de l'envoi.");
      }
      onSent();
    } catch (err) {
      setError((err as Error).message ?? "Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full gap-3 px-5 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft size={13} /> Retour aux suggestions
      </button>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Rédiger la réponse
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full rounded-xl border border-border/40 bg-muted/20 p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
        placeholder="Votre réponse…"
      />

      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          {files.length > 0 ? `${files.length} fichier(s) joint(s)` : "Joindre des fichiers"}
        </button>
        {files.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {files.map((f) => (
              <li key={f.name} className="text-[10px] text-muted-foreground/70 truncate">{f.name}</li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={() => void handleSend()}
        disabled={sending || !text.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
        style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
      >
        {sending ? (
          <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Envoi…</>
        ) : (
          "Envoyer la réponse"
        )}
      </button>
    </div>
  );
}

// Email Detail Side Panel

function EmailPanel({
  email,
  onClose,
  mode = "read",
  summary = null,
  replyVariants = null,
  composerText = "",
  planSteps = null,
  onSelectVariant,
  onModeChange,
}: {
  email: EmailItem;
  onClose: () => void;
  mode?: PanelMode;
  summary?: string | null;
  replyVariants?: ReplyVariant[] | null;
  composerText?: string;
  planSteps?: string[] | null;
  onSelectVariant?: (text: string) => void;
  onModeChange?: (mode: PanelMode) => void;
}) {
  const [body, setBody] = useState<string | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [showingOriginal, setShowingOriginal] = useState(false);
  const queryClient = useQueryClient();

  const category = email.category ?? "info";
  const dateStr = fmtDate(email.date, true);

  // Reset "show original" toggle whenever the mode or email changes
  useEffect(() => { setShowingOriginal(false); }, [mode, email.message_id]);

  // For Gmail: fetch full body on open. Outlook already has full body.
  // This also marks the email is_done server-side (e.g. Info category "read" signal),
  // so refresh processing-state to reflect it promptly.
  useEffect(() => {
    if (!email.message_id) { setBody(email.body || ""); return; }
    if (email.provider === "gmail") {
      setBodyLoading(true);
      apiFetch<{ body: string }>(`/emails/body/${email.message_id}?provider=gmail`)
        .then((r) => {
          setBody(r.body);
          void queryClient.invalidateQueries({ queryKey: ["processing-state"] });
        })
        .catch(() => setBody(email.body || ""))
        .finally(() => setBodyLoading(false));
    } else {
      setBody(email.body || "");
    }
  }, [email.message_id, email.provider, email.body, queryClient]);

  const providerLabel = email.provider === "gmail" ? "Gmail" : email.provider === "outlook" ? "Outlook" : null;
  const accentColor = email.provider === "outlook" ? "#0078D4" : email.provider === "gmail" ? "#4285F4" : "#E8842A";

  // Suppress unused-variable warning — category is kept for future use
  void category;

  function renderBody() {
    if (bodyLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Chargement du contenu…
        </div>
      );
    }

    if (mode === "summary") {
      return (
        <div className="flex flex-col gap-3">
          {/* Summary card */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Résumé · IA
            </p>
            <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
              {summary || "Résumé indisponible."}
            </p>
          </div>

          {/* Hover-reveal toggle for original */}
          <div className="group">
            <button
              onClick={() => setShowingOriginal((v) => !v)}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-2 transition-colors"
            >
              {showingOriginal ? "Masquer l'original" : "Voir l'original"}
            </button>
            {showingOriginal && (
              <div className="mt-2 p-3 rounded-xl bg-muted/10 border border-border/20">
                <p className="text-xs text-muted-foreground/70 leading-relaxed whitespace-pre-wrap break-words">
                  {body || email.body || "Aucun contenu."}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (mode === "plan") {
      return (
        <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Plan · IA
          </p>
          <ol className="flex flex-col gap-1.5 list-decimal list-inside text-sm text-foreground/85 leading-relaxed">
            {(planSteps ?? []).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      );
    }

    if (mode === "reply") {
      return (
        <ReplyVariantsView
          variants={replyVariants ?? []}
          onSelect={(content) => {
            onSelectVariant?.(content);
            onModeChange?.("compose");
          }}
        />
      );
    }

    if (mode === "compose") {
      return (
        <ReplyComposer
          email={email}
          initialText={composerText}
          onBack={() => onModeChange?.("reply")}
          onSent={() => { onModeChange?.("read"); }}
        />
      );
    }

    // Default: read mode
    return body ? (
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
        {body}
      </p>
    ) : (
      <p className="text-sm text-muted-foreground italic">Aucun contenu.</p>
    );
  }

  // Mode label shown in the panel header
  const modeLabel = mode === "summary" ? "Résumé" : mode === "reply" ? "Réponses suggérées" : mode === "compose" ? "Rédiger la réponse" : mode === "plan" ? "Plan" : null;

  return (
    <div className="flex flex-col h-full border-l border-border/40 bg-card overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 flex-shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{email.sender || "Expéditeur inconnu"}</p>
          {modeLabel && (
            <p className="text-[10px] text-primary/70 font-medium">✦ {modeLabel}</p>
          )}
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

      {/* Body / mode content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {renderBody()}
      </div>
    </div>
  );
}

// EmailCard (list item)

function EmailCard({
  email,
  isIrisActive,
  isSelected,
  isRead,
  onSelect,
  onSummarize,
  onGenerateReply,
  onGeneratePlan,
}: {
  email: EmailItem;
  isIrisActive: boolean;
  isSelected: boolean;
  isRead: boolean;
  onSelect: () => void;
  onSummarize?: (summary: string) => void;
  onGenerateReply?: (variants: ReplyVariant[]) => void;
  onGeneratePlan?: (steps: string[]) => void;
}) {
  const category = email.category ?? "info";
  const subject = email.subject || "(Sans objet)";
  const sender = email.sender || "Expéditeur inconnu";
  const dateStr = fmtDate(email.date);
  const accentColor = email.provider === "outlook" ? "#0078D4" : email.provider === "gmail" ? "#4285F4" : "#E8842A";

  return (
    <div
      className={`rounded-2xl cursor-pointer transition-all duration-200 relative ${cardClass(email.provider)} ${
        isSelected ? "ring-1 ring-primary/40 bg-primary/5" : ""
      } ${isRead && !isSelected ? "opacity-50 grayscale-[0.25]" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      {isRead && (
        <span className="absolute top-2 right-2 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide pointer-events-none">
          Lu
        </span>
      )}
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

        {/* Category pill — leave space for "Lu" badge */}
        <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground flex-shrink-0 mt-0.5 ${isRead ? "mr-6" : ""}`}>
          {category === "rdv" ? "RDV" : category === "bonsplans" ? "deal" : category}
        </span>
      </div>

      {/* Quick action — disabled when Iris asleep */}
      <div
        className="px-4 pb-3 transition-opacity duration-150"
        style={{ opacity: isIrisActive ? 1 : 0.28, pointerEvents: isIrisActive ? "auto" : "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <QuickAction
          email={email}
          category={category}
          onSummarize={onSummarize}
          onGenerateReply={onGenerateReply}
          onGeneratePlan={onGeneratePlan}
        />
      </div>
    </div>
  );
}

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  google:  { label: "Google",  icon: "🔵", color: "#4285F4" },
  apple:   { label: "Apple",   icon: "🍎", color: "#555" },
  outlook: { label: "Outlook", icon: "🟦", color: "#0078D4" },
};

function QuickAction({
  email,
  category,
  onSummarize,
  onGenerateReply,
  onGeneratePlan,
}: {
  email: EmailItem;
  category: string;
  onSummarize?: (summary: string) => void;
  onGenerateReply?: (variants: ReplyVariant[]) => void;
  onGeneratePlan?: (steps: string[]) => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  // Seeded from server data (see issue #99) so "Fait ✓"/"RDV ajouté" correctly show
  // right after remount (logout/login, app restart) instead of always starting blank.
  const [done, setDone] = useState(email.is_done ?? false);
  const [confirmed, setConfirmed] = useState(email.status === "confirmed");
  const [confirmedSlot, setConfirmedSlot] = useState<{ start_time: string } | null>(null);
  const [calProviderErrors, setCalProviderErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [calError, setCalError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [planning, setPlanning] = useState(false);
  const lastClickTimeRef = useRef<number>(0);
  const manuallyClosed = useRef(false);

  async function handleMarkDone() {
    if (email.db_id) {
      try {
        await apiFetch(`/emails/${email.db_id}/mark-done`, { method: "POST" });
        void queryClient.invalidateQueries({ queryKey: ["processing-state"] });
      } catch {
        // best-effort — still reflect completion locally even if the call failed
      }
    }
    setDone(true);
  }

  async function handleSummarize() {
    if (!onSummarize) return;
    setSummarizing(true);
    try {
      const res = await apiFetch<{ summary: string }>("/emails/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject ?? "", body: email.body ?? "" }),
      });
      onSummarize(res.summary || "Résumé indisponible.");
    } catch {
      onSummarize("Erreur lors du résumé.");
    } finally {
      setSummarizing(false);
    }
  }

  async function handleGenerateReply() {
    if (!onGenerateReply) return;
    setReplying(true);
    try {
      const res = await apiFetch<{ variants: ReplyVariant[] }>("/suggest-inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject ?? "", body: email.body ?? "" }),
      });
      onGenerateReply(res.variants ?? []);
    } catch {
      onGenerateReply([]);
    } finally {
      setReplying(false);
    }
  }

  async function handleGeneratePlan() {
    if (!onGeneratePlan) return;
    setPlanning(true);
    try {
      const res = await apiFetch<{ steps: string[] }>("/emails/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject ?? "", body: email.body ?? "" }),
      });
      onGeneratePlan(res.steps?.length ? res.steps : ["Aucune étape suggérée."]);
    } catch {
      onGeneratePlan(["Erreur lors de la génération du plan."]);
    } finally {
      setPlanning(false);
    }
  }

  // Keep action visible once completed, unless the user explicitly closed it
  useEffect(() => {
    if ((done || confirmed) && !manuallyClosed.current) setOpen(true);
  }, [done, confirmed]);

  function renderContent() {
    if (confirmed) {
      const dateLabel = confirmedSlot
        ? new Date(confirmedSlot.start_time).toLocaleString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold whitespace-nowrap">
            <CheckCircle2 size={13} />
            <span>RDV ajouté{dateLabel ? ` · ${dateLabel}` : ""}</span>
          </div>
          {calProviderErrors.length > 0 && (
            <p className="text-[10px] text-orange-400 leading-tight">
              {calProviderErrors.join(" · ")}
            </p>
          )}
        </div>
      );
    }
    if (done) {
      return (
        <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold whitespace-nowrap">
          <CheckCircle2 size={13} /><span>Fait ✓</span>
        </div>
      );
    }

    if (category === "rdv") {
      if (calError) {
        return (
          <button
            onClick={() => setCalError(false)}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-all whitespace-nowrap"
          >
            <X size={12}/><span>Erreur — Réessayer</span>
          </button>
        );
      }

      const connectedProviders = user?.calendar_providers ?? [];
      const multiProvider = connectedProviders.length > 1 && !!email.db_id;

      const confirmTo = async (providers?: string[]) => {
        if (!email.db_id) {
          window.open(buildCalendarUrl(email), "_blank");
          return; // user must manually save in the browser tab
        }
        setLoading(true);
        try {
          const res = await apiFetch<{
            slot: { start_time: string; end_time: string };
            providers: { provider: string; event_id?: string | null; error: string | null }[];
          }>(`/calendar/confirm/${email.db_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slot_index: 0, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, ...(providers ? { providers } : {}) }),
          });
          const failed = res.providers?.filter(p => p.error).map(p => `${p.provider}: ${p.error}`) ?? [];
          setCalProviderErrors(failed);
          setConfirmedSlot(res.slot ?? null);
          setConfirmed(true);
          void queryClient.invalidateQueries({ queryKey: ["processing-state"] });
        } catch (err) {
          console.error("Calendar confirm failed:", err);
          setCalError(true);
        } finally { setLoading(false); }
      };

      const rdvSummarizeBtn = (
        <button
          onClick={() => void handleSummarize()}
          disabled={summarizing}
          className="flex items-center gap-1 text-xs font-semibold border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
        >
          {summarizing ? <span className="w-3 h-3 border border-foreground/30 border-t-foreground/80 rounded-full animate-spin" /> : <FileText size={11}/>}
          <span>Résumer</span>
        </button>
      );

      const rdvReplyBtn = (
        <button
          onClick={() => void handleGenerateReply()}
          disabled={replying}
          className="flex items-center gap-1 text-xs font-semibold border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
        >
          {replying ? <span className="w-3 h-3 border border-foreground/30 border-t-foreground/80 rounded-full animate-spin" /> : <MessageSquare size={11}/>}
          <span>Répondre</span>
        </button>
      );

      if (showPicker) {
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => confirmTo()}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
            >
              {loading ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar size={11}/>}
              <span>{loading ? "…" : "Les deux"}</span>
            </button>
            {connectedProviders.filter(p => p in PROVIDER_META).map((p) => (
              <button
                key={p}
                onClick={() => confirmTo([p])}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-accent active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
              >
                <span>{PROVIDER_META[p].icon}</span>
                <span>{PROVIDER_META[p].label}</span>
              </button>
            ))}
            {rdvSummarizeBtn}
            {rdvReplyBtn}
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={multiProvider ? () => setShowPicker(true) : () => void confirmTo()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
          >
            {loading ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar size={11}/>}
            <span>{loading ? "…" : email.db_id ? "Confirmer RDV" : "Ouvrir dans le calendrier →"}</span>
          </button>
          {rdvSummarizeBtn}
          {rdvReplyBtn}
        </div>
      );
    }

    const summarizeBtn = (
      <button
        onClick={() => void handleSummarize()}
        disabled={summarizing}
        className="flex items-center gap-1 text-xs font-semibold border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
      >
        {summarizing
          ? <span className="w-3 h-3 border border-foreground/30 border-t-foreground/80 rounded-full animate-spin" />
          : <FileText size={11}/>}
        <span>Résumer</span>
      </button>
    );

    const replyBtn = (
      <button
        onClick={() => void handleGenerateReply()}
        disabled={replying}
        className="flex items-center gap-1 text-xs font-semibold border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
      >
        {replying
          ? <span className="w-3 h-3 border border-foreground/30 border-t-foreground/80 rounded-full animate-spin" />
          : <MessageSquare size={11}/>}
        <span>Répondre</span>
      </button>
    );

    if (category === "action") return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => void handleGeneratePlan()}
          disabled={planning}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
          style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
        >
          {planning ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <ListChecks size={11}/>}
          <span>Plan</span>
        </button>
        <button
          onClick={() => void handleMarkDone()}
          className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <CheckCircle2 size={11}/><span>Fait</span>
        </button>
        {summarizeBtn}
        {replyBtn}
      </div>
    );
    if (category === "attente") return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => void handleMarkDone()} className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] transition-all whitespace-nowrap"><Clock size={11}/><span>Rappel</span></button>
        {summarizeBtn}
        {replyBtn}
      </div>
    );
    if (category === "bonsplans") {
      const promoCode = extractPromoCode(email.body ?? "");
      return (
        <div className="flex items-center gap-1.5">
          {promoCode && (
            done ? (
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold whitespace-nowrap">
                <CheckCircle2 size={13} /><span>Copié ✓</span>
              </div>
            ) : (
              <button
                onClick={() => { navigator.clipboard.writeText(promoCode).catch(() => {}); void handleMarkDone(); }}
                className="flex items-center gap-1.5 text-xs font-semibold border border-primary/40 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/20 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Tag size={11}/><span>{promoCode}</span>
              </button>
            )
          )}
          {summarizeBtn}
        </div>
      );
    }
    // info and everything else — no "Lu" button, just summarize
    return (
      <div className="flex items-center gap-1.5">
        {summarizeBtn}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Three orange vertical dots — always visible trigger */}
      <button
        data-tour="quick-action"
        onClick={() => {
          const now = Date.now();
          if (now - lastClickTimeRef.current < 300) {
            // Double-click: go back one step
            lastClickTimeRef.current = 0;
            if (showPicker) { setShowPicker(false); }
            else { manuallyClosed.current = true; setOpen(false); }
            return;
          }
          lastClickTimeRef.current = now;
          manuallyClosed.current = false;
          playDotsClick();
          setOpen((o) => !o);
        }}
        className="flex flex-col items-center justify-center gap-[3.5px] px-1.5 py-2 rounded-lg hover:bg-orange-500/10 active:scale-95 transition-all flex-shrink-0"
        style={{ opacity: category === "info" && !open && !done ? 0.35 : 1 }}
        title="Actions (double-cliquer pour revenir)"
      >
        <span className="w-[3.5px] h-[3.5px] rounded-full flex-shrink-0" style={{ background: "#E8842A" }} />
        <span className="w-[3.5px] h-[3.5px] rounded-full flex-shrink-0" style={{ background: "#E8842A" }} />
        <span className="w-[3.5px] h-[3.5px] rounded-full flex-shrink-0" style={{ background: "#E8842A" }} />
      </button>

      {/* Action content — slides in horizontally to the right */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxWidth: open ? "320px" : "0", opacity: open ? 1 : 0 }}
      >
        <div className="flex items-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Main page

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
  const [panelMode, setPanelMode] = useState<PanelMode>("read");
  const [panelSummary, setPanelSummary] = useState<string | null>(null);
  const [panelReplyVariants, setPanelReplyVariants] = useState<ReplyVariant[] | null>(null);
  const [panelComposerText, setPanelComposerText] = useState<string>("");
  const [panelPlanSteps, setPanelPlanSteps] = useState<string[] | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  function openPanel(email: EmailItem, mode: PanelMode = "read") {
    setSelectedEmail(email);
    setPanelMode(mode);
    if (mode !== "summary") setPanelSummary(null);
    if (mode !== "reply" && mode !== "compose") setPanelReplyVariants(null);
    if (mode !== "compose") setPanelComposerText("");
    if (mode !== "plan") setPanelPlanSteps(null);
  }

  function closePanel() {
    setSelectedEmail(null);
    setPanelMode("read");
    setPanelSummary(null);
    setPanelReplyVariants(null);
    setPanelComposerText("");
    setPanelPlanSteps(null);
  }

  const { setEmailCount } = useAuth();
  const { data: processingState } = useProcessingState();
  const isIrisActive = processingState?.is_active ?? false;

  // Flash a tab pill whenever its category's "done" count increases (RDV confirm,
  // Action "Fait", En attente "Rappel", Bons plans copy, Info auto-read).
  const [pulsingTabs, setPulsingTabs] = useState<Set<string>>(new Set());
  const prevCategoryDoneRef = useRef<Record<string, number>>({});
  useEffect(() => {
    const byCategory = processingState?.processed_by_category;
    if (!byCategory) return;
    const increased: string[] = [];
    for (const t of TABS) {
      const done = byCategory[t.id]?.done ?? 0;
      const prev = prevCategoryDoneRef.current[t.id];
      if (prev !== undefined && done > prev) increased.push(t.id);
      prevCategoryDoneRef.current[t.id] = done;
    }
    if (increased.length === 0) return;
    setPulsingTabs((prev) => new Set([...prev, ...increased]));
    const timer = setTimeout(() => {
      setPulsingTabs((prev) => {
        const next = new Set(prev);
        for (const id of increased) next.delete(id);
        return next;
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [processingState?.processed_by_category]);

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

  // Per-category server-side query — each tab fetches its own emails independently.
  // The queryKey includes activeTab so React Query re-fetches automatically on tab switch.
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["emails-by-category", activeTab],
    queryFn: () => apiFetch<{ emails: import("@/types/email").EmailItem[]; has_more: boolean }>(
      `/emails/cached?category=${activeTab}&limit=200`
    ),
    enabled: anyConnected,
    staleTime: 30_000,
  });

  // Counts query for tab badges — fast DB aggregate, no full email load needed
  const { data: countsData } = useQuery({
    queryKey: ["emails-counts"],
    queryFn: () => apiFetch<{ counts: Record<string, number>; total: number }>("/emails/counts"),
    enabled: anyConnected,
    staleTime: 30_000,
    refetchInterval: 3 * 60 * 1000,
  });

  // allEmails kept for background sync tracking only (useEmailFeed populates the DB)
  const allEmails =
    feedData?.pages.flatMap((p) => p.emails) ??
    [];

  // Don't show the full-page spinner when category data is already available
  const isLoading = (feedLoading || categoryLoading) && !categoryData?.emails?.length;
  const isRefreshing = isFetching && !feedLoading;

  // Tab counts from fast DB aggregate endpoint
  const tabCounts: Record<string, number> = {
    rdv: 0, action: 0, attente: 0, bonsplans: 0, info: 0,
    ...(countsData?.counts ?? {}),
  };

  // Display list: server-filtered — no client-side filter needed
  const displayEmails = categoryData?.emails ?? [];

  // Sync total email count to sidebar badge
  useEffect(() => {
    setEmailCount(countsData?.total ?? allEmails.length);
  }, [countsData?.total, allEmails.length, setEmailCount]);

  // Invalidate category + counts caches after each background feed sync
  useEffect(() => {
    if (!isFetching) {
      void queryClient.invalidateQueries({ queryKey: ["emails-by-category"] });
      void queryClient.invalidateQueries({ queryKey: ["emails-counts"] });
    }
  }, [isFetching, queryClient]);

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
    setPanelMode("read");
    setPanelSummary(null);
    setPanelReplyVariants(null);
    setPanelComposerText("");
    setPanelPlanSteps(null);

    // Persist "read" server-side (see issue #99) so it survives logout/login,
    // instead of the old local-only readIds Set that reset on every remount.
    if (email.db_id && !email.is_read) {
      void apiFetch(`/emails/${email.db_id}/mark-read`, { method: "POST" })
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ["emails-by-category"] });
          void queryClient.invalidateQueries({ queryKey: ["processing-state"] });
        })
        .catch(() => {});
    }
  }, [queryClient]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

        <PowerButtonWithProgress size="small" />
      </div>
      {statusMsg && (
        <div className={`mx-6 mb-2 px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${statusMsg.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="opacity-60 hover:opacity-100 transition-opacity ml-2"><X size={13}/></button>
        </div>
      )}
      <div data-tour="email-tabs" className="flex px-6 flex-shrink-0 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        {TABS.map((t) => {
          const catProgress = processingState?.processed_by_category?.[t.id] ?? { total: 0, done: 0 };
          const pulsing = pulsingTabs.has(t.id);
          return (
            <motion.button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              animate={
                pulsing
                  ? {
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        "0 0 0px rgba(249,115,22,0)",
                        "0 0 20px rgba(249,115,22,0.85)",
                        "0 0 0px rgba(249,115,22,0)",
                      ],
                    }
                  : { scale: 1, boxShadow: "0 0 0px rgba(249,115,22,0)" }
              }
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col gap-1 px-3 pt-2.5 pb-2 text-xs font-medium cursor-pointer transition-all border-b-2 -mb-px whitespace-nowrap rounded-t-lg"
              style={{ color: activeTab === t.id ? "#E8842A" : "hsl(var(--foreground) / 0.4)", borderColor: activeTab === t.id ? "#E8842A" : "transparent", background: "transparent" }}
            >
              <span className="flex items-center gap-1.5">
                {t.label}
                {tabCounts[t.id] > 0 && (
                  <span className="px-1.5 py-px rounded-full text-[10px] font-bold tabular-nums" style={{ background: activeTab === t.id ? "#E8842A" : "hsl(var(--foreground) / 0.1)", color: activeTab === t.id ? "white" : "hsl(var(--foreground) / 0.5)" }}>
                    {tabCounts[t.id]}
                  </span>
                )}
              </span>
              <CategoryProgressBar done={catProgress.done} total={catProgress.total} isActive={isIrisActive} />
            </motion.button>
          );
        })}
      </div>
      <EmailsProgressBar />
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
            {anyConnected && !isLoading && tabCounts[activeTab] > 0 && displayEmails.length === 0 && (
              <div className="text-center py-10 text-muted-foreground/40 text-sm">Aucun email dans cette catégorie.</div>
            )}
            {anyConnected && !isLoading && (countsData?.total ?? 0) === 0 && !error && (
              <div className="text-center py-14 text-muted-foreground text-sm">Aucun email trouvé.</div>
            )}

            {/* Email cards */}
            {displayEmails.map((email) => (
              <EmailCard
                key={email.message_id ?? email.subject}
                email={email}
                isIrisActive={isIrisActive}
                isSelected={selectedEmail?.message_id === email.message_id}
                isRead={email.is_read ?? false}
                onSelect={() => handleSelectEmail(email)}
                onSummarize={(summary) => { setPanelSummary(summary); openPanel(email, "summary"); }}
                onGenerateReply={(variants) => { setPanelReplyVariants(variants); openPanel(email, "reply"); }}
                onGeneratePlan={(steps) => { setPanelPlanSteps(steps); openPanel(email, "plan"); }}
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
            {!categoryData?.has_more && displayEmails.length > 0 && (
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
            <EmailPanel
              email={selectedEmail}
              onClose={closePanel}
              mode={panelMode}
              summary={panelSummary}
              replyVariants={panelReplyVariants}
              composerText={panelComposerText}
              planSteps={panelPlanSteps}
              onSelectVariant={(text) => { setPanelComposerText(text); }}
              onModeChange={(m) => setPanelMode(m)}
            />
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

// Microsoft icon

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
