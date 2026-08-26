import { X } from "lucide-react";

interface HelpItem {
  icon: string;
  title: string;
  description: string;
}

const HOME_ITEMS: HelpItem[] = [
  {
    icon: "⏻",
    title: "Bouton Iris",
    description:
      "Le bouton principal d'Iris. Il n'active pas l'analyse des emails — celle-ci tourne automatiquement en arrière-plan, en continu. Il active ou verrouille les actions rapides sur chaque email (confirmer, résumer, répondre, marquer comme fait…).",
  },
  {
    icon: "◔",
    title: "Anneau de progression",
    description:
      "Affiche en temps réel le nombre d'emails déjà traités par le tri IA sur le total (ex. 78/101 · 77%), indépendamment de l'état du bouton Iris.",
  },
];

const EMAIL_ITEMS: HelpItem[] = [
  {
    icon: "⋮",
    title: "Actions rapides (⋮)",
    description:
      "Cliquez sur les trois points oranges d'un email pour révéler les actions disponibles selon sa catégorie : confirmer un rendez-vous, générer un Plan, marquer comme fait, ajouter un rappel, copier un code promo, résumer ou répondre.",
  },
  {
    icon: "▬",
    title: "Barres de progression",
    description:
      "Une barre globale sous les onglets, et une petite barre par catégorie (sous chaque onglet) — chacune indique la part d'emails déjà traités et flashe brièvement dès qu'un nouvel email de cette catégorie est terminé.",
  },
  {
    icon: "📅",
    title: "RDV",
    description:
      "Emails contenant une proposition de rendez-vous détectée par Iris. Confirmez directement dans votre calendrier Google ou Apple en un clic.",
  },
  {
    icon: "⚡",
    title: "Action",
    description:
      "Emails nécessitant une action de votre part (signature, paiement, formulaire…). Utilisez le bouton Plan pour obtenir des étapes suggérées par IA, ou Fait une fois traité.",
  },
  {
    icon: "⏳",
    title: "En attente",
    description:
      "Emails en attente d'une réponse ou d'un suivi. Ajoutez un rappel pour ne pas les oublier.",
  },
  {
    icon: "🏷",
    title: "Bons plans",
    description:
      "Promotions, offres et réductions détectées dans vos emails. Si un code promo est présent, il s'affiche directement — cliquez pour le copier.",
  },
  {
    icon: "ℹ️",
    title: "Info",
    description:
      "Emails purement informatifs (newsletters, confirmations…). Utilisez le bouton Résumer pour en extraire l'essentiel en quelques secondes.",
  },
];

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-card border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">?</span>
            <span className="font-semibold text-foreground">Aide &amp; Tutoriel</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Accueil section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accueil</span>
            </div>
            <div className="space-y-2">
              {HOME_ITEMS.map((item) => (
                <HelpCard key={item.title} item={item} />
              ))}
            </div>
          </section>

          {/* E-mails section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-mails</span>
            </div>
            <div className="space-y-2">
              {EMAIL_ITEMS.map((item) => (
                <HelpCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function HelpCard({ item }: { item: HelpItem }) {
  return (
    <div className="flex gap-3 px-3 py-3 rounded-xl bg-muted/30 border border-border/40">
      <span className="text-lg leading-none mt-0.5 shrink-0 w-6 text-center">{item.icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground mb-0.5">{item.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}
