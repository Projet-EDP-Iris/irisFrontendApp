import { X, Mail, Calendar } from "lucide-react";
import { useState } from "react";

interface SettingsPanelProps {
  onClose: () => void;
}

const connectedApps = [
  {
    id: "gmail",
    name: "Gmail",
    icon: <Mail size={18} className="text-primary" />,
    lastSync: "2 min ago",
    enabled: true,
    color: "bg-primary/20",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: <Calendar size={18} className="text-primary" />,
    lastSync: "2 min ago",
    enabled: true,
    color: "bg-primary/20",
  },
  {
    id: "outlook",
    name: "Outlook",
    icon: (
      <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
        <span className="text-white text-[8px] font-bold">O</span>
      </div>
    ),
    lastSync: "2 min ago",
    enabled: false,
    color: "bg-blue-500/20",
  },
  {
    id: "apple-calendar",
    name: "Apple Calendar",
    icon: <Calendar size={18} className="text-gray-400" />,
    lastSync: "2 min ago",
    enabled: false,
    color: "bg-gray-500/20",
  },
];

const profileIcons = ["🟠", "⭐", "👤", "👤", "👤"];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [apps, setApps] = useState(connectedApps);
  const [desktopNotif, setDesktopNotif] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [scanMode, setScanMode] = useState("Continuous scanning");
  const [sessionDuration, setSessionDuration] = useState("1 hour");

  const toggleApp = (id: string) => {
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, enabled: !app.enabled } : app))
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-80 h-full bg-sidebar border-l border-sidebar-border overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <h2 className="text-base font-semibold text-foreground">Paramètres</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Profile section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">⚙</span>
              <span className="text-sm font-medium text-foreground">Paramètres du profil</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Profile Icon</div>
            <div className="flex gap-2 mb-4">
              {profileIcons.map((icon, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    i === 0 ? "ring-2 ring-primary" : ""
                  } bg-primary/20 hover:bg-primary/30 transition-colors`}
                >
                  {i === 0 ? "🟠" : i === 1 ? "⭐" : "👤"}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Nom</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="user@google.com"
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button className="text-xs text-primary hover:underline">
                Changer le mot de passe
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">🌐</span>
              <span className="text-sm font-medium text-foreground">Langue</span>
            </div>
            <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Français</option>
              <option>English</option>
              <option>Español</option>
            </select>
          </div>

          {/* Connected services */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs">⚡</span>
              <span className="text-sm font-medium text-foreground">Services connectés</span>
            </div>
            <div className="space-y-2">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between bg-card rounded-xl px-3 py-2.5 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${app.color} flex items-center justify-center`}>
                      {app.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground">{app.name}</div>
                      <div className="text-[10px] text-muted-foreground">Last sync: {app.lastSync}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp(app.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      app.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        app.enabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
              <button className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-1">
                Add New App
              </button>
            </div>
          </div>

          {/* Schedules */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs">⚙</span>
              <span className="text-sm font-medium text-foreground">Schedules</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Session Duration</label>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Scan Mode</label>
                <select
                  value={scanMode}
                  onChange={(e) => setScanMode(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Continuous scanning</option>
                  <option>Scheduled scanning</option>
                  <option>Manual only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs">🔔</span>
              <span className="text-sm font-medium text-foreground">Notifications</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground">Desktop Notifications</div>
                  <div className="text-[11px] text-muted-foreground">Show system notifications for events</div>
                </div>
                <button
                  onClick={() => setDesktopNotif(!desktopNotif)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    desktopNotif ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      desktopNotif ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground">Sound Alerts</div>
                  <div className="text-[11px] text-muted-foreground">Play sound when events detected</div>
                </div>
                <button
                  onClick={() => setSoundAlerts(!soundAlerts)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    soundAlerts ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      soundAlerts ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
