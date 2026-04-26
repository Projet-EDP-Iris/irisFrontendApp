import { ChevronRight, MoreHorizontal, Clock, Calendar, AlertTriangle, Trash2, CalendarPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const tasksData = [
  {
    id: 1,
    title: "Projet Mood App — contribution du groupe",
    source: "e-mail de Clara — livrable vendredi",
    icon: <Calendar size={14} className="text-primary" />,
    draft: false,
    accepted: false,
  },
  {
    id: 2,
    title: "Préparation réunion Marketing — campagne Q3",
    source: "Réunion Marketing — jeudi 14:00 (visio)",
    icon: <Calendar size={14} className="text-primary" />,
    draft: false,
    accepted: false,
  },
  {
    id: 3,
    title: "Répondre à la proposition de Thomas Martin",
    source: "e-mail de Thomas — réponse attendue avant mardi",
    icon: <Calendar size={14} className="text-primary" />,
    draft: true,
    accepted: false,
  },
];

function buildPlanCalendarUrl(title: string): string {
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: "Bloc de travail planifié via Iris",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState(tasksData);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const acceptTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, accepted: true } : t))
    );
    toast({ title: "Tâche acceptée", description: "La tâche a été ajoutée à votre plan." });
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setOpenMenuId(null);
    toast({ title: "Tâche supprimée", description: "La tâche a été retirée de votre liste." });
  };

  const postponeTask = (id: number) => {
    setOpenMenuId(null);
    toast({ title: "Tâche reportée", description: "La tâche sera rappelée demain." });
  };

  const handlePlan60 = (task: typeof tasksData[0]) => {
    const url = buildPlanCalendarUrl(task.title);
    window.open(url, "_blank");
    toast({ title: "Bloc de 60 min créé", description: "Google Calendar s'ouvre pour confirmer le créneau." });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">From your emails</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Synced with Google Tasks</span>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-8 space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={36} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Aucune tâche pour le moment</p>
          </div>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-2xl border transition-colors ${
              task.draft
                ? "border-primary/40 bg-primary/10"
                : "border-card-border bg-card"
            }`}
          >
            {task.draft && (
              <div className="flex items-center gap-2 px-5 pt-3 pb-0">
                <AlertTriangle size={14} className="text-yellow-500" />
                <span className="text-xs text-yellow-400 font-medium">Plan brouillon — à valider</span>
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {task.title}
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1.5">
                  {task.icon}
                  <span className="text-xs text-muted-foreground">{task.source}</span>
                </div>
              </div>

              {/* Context menu */}
              <div className="relative" ref={openMenuId === task.id ? menuRef : undefined}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                {openMenuId === task.id && (
                  <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-card shadow-lg py-1">
                    <button
                      onClick={() => { handlePlan60(task); setOpenMenuId(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <CalendarPlus size={14} />
                      Bloquer 60 min
                    </button>
                    <button
                      onClick={() => postponeTask(task.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <Clock size={14} />
                      Reporter à demain
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-5 pb-4">
              <button
                onClick={() => acceptTask(task.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  task.accepted
                    ? "bg-green-600 text-white"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {task.accepted ? "✓ Accepté" : "Accept plan"}
              </button>
              <button
                onClick={() => handlePlan60(task)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-accent transition-colors border border-border"
              >
                <Clock size={13} />
                <span>Plan 60 min</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
