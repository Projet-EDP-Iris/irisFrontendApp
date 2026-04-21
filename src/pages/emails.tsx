import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const focusedEmails = [
  {
    id: 1,
    sender: "Marie Dubois",
    initials: "MD",
    subject: "Réunion projet Q1 - disponibilités",
    type: "Meeting",
    description: "Propose 18 oct 10:00, visio; 2 participants",
    action: "Prepare event",
    actionColor: "bg-primary",
  },
  {
    id: 2,
    sender: "Thomas Martin",
    initials: "TM",
    subject: "Suivi devis - rappel",
    type: "Follow-up",
    description: "Rappel sur Devis #2024-156",
    action: "Create follow-up",
    actionColor: "bg-primary",
  },
  {
    id: 3,
    sender: "Sophie Bernard",
    initials: "SB",
    subject: "Proposition de créneau pour démo",
    type: "Meeting",
    description: "Propose 20 oct 15:00, bureaux Paris; 2 participants",
    action: "Prepare event",
    actionColor: "bg-primary",
  },
];

const otherEmails = [
  {
    id: 4,
    sender: "Newsletter",
    initials: "NL",
    subject: "Actualités de la semaine",
    type: "Info",
    description: "Digest hebdomadaire",
    action: null,
    actionColor: "",
  },
  {
    id: 5,
    sender: "Support",
    initials: "SP",
    subject: "Votre ticket #456 mis à jour",
    type: "Support",
    description: "Statut: En cours de traitement",
    action: null,
    actionColor: "",
  },
  {
    id: 6,
    sender: "Facturation",
    initials: "FA",
    subject: "Facture octobre 2024",
    type: "Finance",
    description: "Montant: 120€ - Échéance 31 oct",
    action: null,
    actionColor: "",
  },
];

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<"focused" | "other">("focused");
  const { isIrisActive } = useAuth();
  
  // Only show summarizing indicator if Iris is active
  const isSummarizing = isIrisActive;

  const emails = activeTab === "focused" ? focusedEmails : otherEmails;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emails</h1>
          <p className="text-sm text-muted-foreground mt-0.5">From your emails</p>
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

      {/* Tabs */}
      <div className="px-8 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("focused")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "focused"
                ? "bg-card border border-primary/50 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>✦</span>
            <span>Focused</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                activeTab === "focused" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {focusedEmails.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("other")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "other"
                ? "bg-card border border-border text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>✉</span>
            <span>Other</span>
            <span className="px-1.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
              {otherEmails.length}
            </span>
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto px-8 space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border border-card-border hover:border-primary/30 transition-colors"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{email.initials}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-foreground">{email.sender}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-foreground/90 truncate">{email.subject}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary/70">{email.type}</span>
                {" · "}
                {email.description}
              </p>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {email.action && (
                <button
                  disabled={!isIrisActive}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isIrisActive 
                      ? `${email.actionColor} text-white hover:opacity-90 shadow-sm` 
                      : "bg-primary/20 text-primary/40 cursor-not-allowed"
                  }`}
                >
                  {email.action}
                </button>
              )}
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}

        {emails.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Aucun e-mail dans cette catégorie
          </div>
        )}
      </div>
    </div>
  );
}
