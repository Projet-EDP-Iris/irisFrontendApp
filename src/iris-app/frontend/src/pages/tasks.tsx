import { ChevronRight, MoreHorizontal, Clock, Calendar, AlertTriangle } from "lucide-react";
import { useState } from "react";

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

export default function TasksPage() {
  const [tasks, setTasks] = useState(tasksData);

  const acceptTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, accepted: true } : t))
    );
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
              <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                <MoreHorizontal size={16} />
              </button>
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-accent transition-colors border border-border">
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
