import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { playDotsClick } from "@/lib/sounds";
import {
  Mail, Calendar, CheckCircle2, Plug, Zap, Clock, Tag,
  X, ArrowLeft, FileText, MessageSquare,
} from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEmailFeed } from "@/hooks/useEmailFeed";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useOutlookConnection } from "@/hooks/useOutlookConnection";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { notifyGmailConnected } from "@/lib/desktopNotifications";
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
type PanelMode = "read" | "summary" | "reply" | "compose";
type ConflictItem = { provider: string; title: string; start: string; end: string };

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
  onSelectVariant,
  onModeChange,
}: {
  email: EmailItem;
  onClose: () => void;
  mode?: PanelMode;
  summary?: string | null;
  replyVariants?: ReplyVariant[] | null;
  composerText?: string;
  onSelectVariant?: (text: string) => void;
  onModeChange?: (mode: PanelMode) => void;
}) {
  const [body, setBody] = useState<string | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [showingOriginal, setShowingOriginal] = useState(false);

  const category = email.category ?? "info";
  const dateStr = fmtDate(email.date, true);

  // Reset "show original" toggle whenever the mode or email changes
  useEffect(() => { setShowingOriginal(false); }, [mode, email.message_id]);

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
  const modeLabel = mode === "summary" ? "Résumé" : mode === "reply" ? "Réponses suggérées" : mode === "compose" ? "Rédiger la réponse" : null;

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
}: {
  email: EmailItem;
  isIrisActive: boolean;
  isSelected: boolean;
  isRead: boolean;
  onSelect: () => void;
  onSummarize?: (summary: string) => void;
  onGenerateReply?: (variants: ReplyVariant[]) => void;
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
}: {
  email: EmailItem;
  category: string;
  onSummarize?: (summary: string) => void;
  onGenerateReply?: (variants: ReplyVariant[]) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calError, setCalError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ConflictItem[] | null>(null);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  async function handleSummarize() {
    if (!onSummarize) return;
    setSummarizing(true);
    try {
      const res = await apiFetch<{ summary: string }>("/emails/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject ?? "", body: email.body ?? "", db_id: email.db_id ?? null }),
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

  // (no force-open effect — user can collapse the panel at any time)

  function renderContent() {
    if (confirmed || done) {
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
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const _doConfirm = async (providers?: string[]) => {
        if (!email.db_id) { window.open(buildCalendarUrl(email), "_blank"); setConfirmed(true); return; }
        setLoading(true);
        try {
          await apiFetch(`/calendar/confirm/${email.db_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slot_index: 0, timezone: tz, ...(providers ? { providers } : {}) }),
          });
          setConfirmed(true);
          setConflictInfo(null);
        } catch (err) {
          console.error("Calendar confirm failed:", err);
          setCalError(true);
        } finally { setLoading(false); }
      };

      const handleConfirmRdv = async (providers?: string[]) => {
        if (!email.db_id) { void _doConfirm(providers); return; }
        setCheckingConflicts(true);
        try {
          const result = await apiFetch<{ has_conflict: boolean; conflicts: ConflictItem[] }>(
            `/calendar/check-conflicts/${email.db_id}?timezone=${encodeURIComponent(tz)}`
          );
          if (result.has_conflict && result.conflicts.length > 0) {
            setConflictInfo(result.conflicts);
          } else {
            void _doConfirm(providers);
          }
        } catch {
          void _doConfirm(providers);
        } finally {
          setCheckingConflicts(false);
        }
      };

      // Conflict warning state
      if (conflictInfo !== null) {
        const fmtConflictTime = (iso: string) => {
          try { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
          catch { return iso; }
        };
        return (
          <div className="flex flex-col gap-1.5 min-w-0">
            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide whitespace-nowrap">
              ⚠ Créneau occupé
            </p>
            {conflictInfo.map((c, i) => (
              <p key={i} className="text-[10px] text-muted-foreground/70 truncate max-w-[220px]">
                {PROVIDER_META[c.provider]?.icon ?? "📅"} {c.title}
                {c.start ? ` · ${fmtConflictTime(c.start)}` : ""}
              </p>
            ))}
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                onClick={() => void _doConfirm()}
                disabled={loading}
                className="flex items-center gap-1 text-[10px] font-semibold text-white px-2 py-1 rounded-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
                style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
              >
                {loading ? <span className="w-2.5 h-2.5 border border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar size={10}/>}
                <span>Confirmer quand même</span>
              </button>
              <button
                onClick={() => setConflictInfo(null)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                Annuler
              </button>
            </div>
          </div>
        );
      }

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
              onClick={() => void handleConfirmRdv()}
              disabled={loading || checkingConflicts}
              className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
            >
              {loading || checkingConflicts ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar size={11}/>}
              <span>{loading || checkingConflicts ? "…" : "Les deux"}</span>
            </button>
            {connectedProviders.filter(p => p in PROVIDER_META).map((p) => (
              <button
                key={p}
                onClick={() => void handleConfirmRdv([p])}
                disabled={loading || checkingConflicts}
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
            onClick={multiProvider ? () => setShowPicker(true) : () => void handleConfirmRdv()}
            disabled={loading || checkingConflicts}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}
          >
            {loading || checkingConflicts ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar size={11}/>}
            <span>{loading ? "…" : checkingConflicts ? "Vérification…" : "Confirmer RDV"}</span>
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
        <button onClick={() => setDone(true)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap" style={{ background: "linear-gradient(135deg,#E8842A,#d4751f)" }}><Zap size={11}/><span>Traiter</span></button>
        {summarizeBtn}
        {replyBtn}
      </div>
    );
    if (category === "attente") return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => setDone(true)} className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent active:scale-[0.98] transition-all whitespace-nowrap"><Clock size={11}/><span>Rappel</span></button>
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
                onClick={() => { navigator.clipboard.writeText(promoCode).catch(() => {}); setDone(true); }}
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
          playDotsClick();
          if (open) {
            setOpen(false);
            setShowPicker(false);
            setConflictInfo(null);
            setCalError(false);
          } else {
            setOpen(true);
          }
        }}
        className="flex flex-col items-center justify-center gap-[3.5px] px-1.5 py-2 rounded-lg hover:bg-orange-500/10 active:scale-95 transition-all flex-shrink-0"
        style={{ opacity: category === "info" && !open && !done ? 0.35 : 1 }}
        title="Actions"
      >
        <span className="w-[3.5px] h-[3.5px] rounded-full flex-shrink-0" style={{ background: "#E8842A" }} />
        <span className="w-[3.5px] h-[3.5px] rounded-full flex-shrink-0" style={{ background: "#E8842A" }} />
        <span className="w-[3.5px] h-[3.5px] rounded-full flex-shrink-0" style={{ background: "#E8842A" }} />
      </button>

      {/* Action content — slides in horizontally to the right */}
      <div
        className={`transition-all duration-300 ease-out ${open ? "overflow-x-auto" : "overflow-hidden"}`}
        style={{ maxWidth: open ? "460px" : "0", opacity: open ? 1 : 0 }}
      >
        <div className="flex items-center gap-1.5 pb-0.5">
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
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null); // kept for future infinite scroll on detail load

  function openPanel(email: EmailItem, mode: PanelMode = "read") {
    setSelectedEmail(email);
    setPanelMode(mode);
    if (mode !== "summary") setPanelSummary(null);
    if (mode !== "reply" && mode !== "compose") setPanelReplyVariants(null);
    if (mode !== "compose") setPanelComposerText("");
  }

  function closePanel() {
    setSelectedEmail(null);
    setPanelMode("read");
    setPanelSummary(null);
    setPanelReplyVariants(null);
    setPanelComposerText("");
  }

  const { isIrisActive, setIsIrisActive, setEmailCount } = useAuth();

  const { connected: gmailConnected, enabled: gmailEnabled, isLoading: gmailStatusLoading, error: gmailStatusError, refetchStatus: refetchGmail } = useGmailConnection();
  const { connected: outlookConnected, isLoading: outlookStatusLoading, refetchStatus: refetchOutlook } = useOutlookConnection();

  const anyConnected = (gmailEnabled && gmailConnected) || outlookConnected;

  // Background sync: fetch fresh emails from providers → categorise → store to DB.
  // Fires once on mount then every 3 min. Not used for display.
  const { data: feedData, isFetching: feedSyncing } = useEmailFeed(anyConnected);

  // Per-tab display: query the DB directly — instant, always shows correct categories.
  const {
    data: tabData,
    isLoading: tabLoading,
    error,
  } = useQuery({
    queryKey: ["emails-tab", activeTab],
    queryFn: () => apiFetch<{ emails: import("@/types/email").EmailItem[]; has_more: boolean }>(
      `/emails/cached?category=${activeTab}&limit=200`
    ),
    enabled: anyConnected,
    staleTime: 30_000,
    refetchInterval: 3 * 60 * 1000,
  });

  // Per-category counts: one GROUP BY query — feeds all tab badges + sidebar total.
  const { data: countsData } = useQuery({
    queryKey: ["emails-counts"],
    queryFn: () => apiFetch<Record<string, number>>("/emails/counts"),
    enabled: anyConnected,
    staleTime: 30_000,
    refetchInterval: 3 * 60 * 1000,
  });

  // When background sync completes (feedData changes), refresh all tab caches from DB.
  useEffect(() => {
    if (feedData) {
      void queryClient.invalidateQueries({ queryKey: ["emails-tab"] });
      void queryClient.invalidateQueries({ queryKey: ["emails-counts"] });
    }
  }, [feedData, queryClient]);

  const allEmails = tabData?.emails ?? [];
  const isLoading = tabLoading && !allEmails.length;
  const isRefreshing = feedSyncing;

  // Tab counts from dedicated counts endpoint — all tabs get their badge at once.
  const tabCounts = countsData ?? { rdv: 0, action: 0, attente: 0, bonsplans: 0, info: 0 };
  const totalEmailCount = (Object.values(tabCounts) as number[]).reduce((a, b) => a + b, 0);

  // Backend already filtered by category; keep client filter as bulletproof safety net.
  const filteredEmails = allEmails.filter((e) => (e.category ?? "info") === activeTab);

  // Sync total email count to sidebar badge
  useEffect(() => { setEmailCount(totalEmailCount); }, [totalEmailCount, setEmailCount]);

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
    setReadIds((prev) => new Set(prev).add(email.message_id));
  }, []);

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

        <motion.button
          data-tour="iris-toggle"
          onClick={() => setIsIrisActive(!isIrisActive)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          animate={{
            boxShadow: isIrisActive
              ? "0 0 18px rgba(249,115,22,0.8), inset 0 0 6px rgba(255,255,255,0.2)"
              : "0 0 8px rgba(184,76,40,0.3)",
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: isIrisActive
              ? "radial-gradient(circle, #f97316 0%, #ea580c 100%)"
              : "linear-gradient(135deg, #b84c28 0%, #8a3518 100%)",
          }}
          title={isIrisActive ? "Iris est active" : "Iris est en sommeil"}
        >
          <motion.div
            animate={{ rotate: isIrisActive ? 360 : 0, scale: isIrisActive ? 1.15 : 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" strokeLinecap="round" />
              <line x1="12" y1="2" x2="12" y2="12" strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.button>
      </div>
      {statusMsg && (
        <div className={`mx-6 mb-2 px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${statusMsg.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="opacity-60 hover:opacity-100 transition-opacity ml-2"><X size={13}/></button>
        </div>
      )}
      <div data-tour="email-tabs" className="flex px-6 flex-shrink-0 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium cursor-pointer transition-all border-b-2 -mb-px whitespace-nowrap"
            style={{ color: activeTab === t.id ? "#E8842A" : "hsl(var(--foreground) / 0.4)", borderColor: activeTab === t.id ? "#E8842A" : "transparent", background: "transparent" }}
          >
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className="px-1.5 py-px rounded-full text-[10px] font-bold tabular-nums" style={{ background: activeTab === t.id ? "#E8842A" : "hsl(var(--foreground) / 0.1)", color: activeTab === t.id ? "white" : "hsl(var(--foreground) / 0.5)" }}>
                {tabCounts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>
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
                isRead={readIds.has(email.message_id)}
                onSelect={() => handleSelectEmail(email)}
                onSummarize={(summary) => { setPanelSummary(summary); openPanel(email, "summary"); }}
                onGenerateReply={(variants) => { setPanelReplyVariants(variants); openPanel(email, "reply"); }}
              />
            ))}

            {/* End of list per tab */}
            {!tabLoading && filteredEmails.length > 0 && (
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
