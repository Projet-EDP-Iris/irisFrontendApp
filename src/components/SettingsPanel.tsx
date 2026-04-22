import { X, Mail, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProfileIconById, PROFILE_ICON_OPTIONS } from "@/constants/profileIcons";
import {
  isDesktopNotificationsEnabled,
  isSoundAlertsEnabled,
  setNotificationPreference,
} from "@/lib/notificationPreferences";

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
    availableInDemo: true,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: <Calendar size={18} className="text-primary" />,
    lastSync: "2 min ago",
    enabled: true,
    color: "bg-primary/20",
    availableInDemo: true,
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
    availableInDemo: false,
  },
  {
    id: "apple-calendar",
    name: "Apple Calendar",
    icon: <Calendar size={18} className="text-gray-400" />,
    lastSync: "2 min ago",
    enabled: false,
    color: "bg-gray-500/20",
    availableInDemo: false,
  },
];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { user, updateProfile } = useAuth();
  const [apps, setApps] = useState(connectedApps);
  const [desktopNotif, setDesktopNotif] = useState(isDesktopNotificationsEnabled());
  const [soundAlerts, setSoundAlerts] = useState(isSoundAlertsEnabled());
  const initialName = user?.name ?? user?.email?.split("@")[0] ?? "";
  const initialEmail = user?.email ?? "";
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [selectedIcon, setSelectedIcon] = useState(getProfileIconById(user?.profile_icon).id);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isNameDirty = name.trim() !== initialName.trim();
  const isEmailDirty = email.trim() !== initialEmail.trim();
  const isIconDirty = selectedIcon !== getProfileIconById(user?.profile_icon).id;
  const hasProfileChanges = isNameDirty || isEmailDirty || isIconDirty;

  const toggleApp = (id: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id !== id || !app.availableInDemo) return app;
        return { ...app, enabled: !app.enabled };
      })
    );
  };

  const handleSaveProfile = async () => {
    if (!hasProfileChanges) {
      setSaveMessage("Aucune modification detectee.");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), profile_icon: selectedIcon });
      setSaveMessage("Profil mis a jour.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur lors de la sauvegarde";
      setSaveMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDesktopNotifToggle = () => {
    const nextValue = !desktopNotif;
    setDesktopNotif(nextValue);
    setNotificationPreference("desktop", nextValue);
  };

  const handleSoundAlertsToggle = () => {
    const nextValue = !soundAlerts;
    setSoundAlerts(nextValue);
    setNotificationPreference("sound", nextValue);
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-80 h-full bg-sidebar border-l border-sidebar-border overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm">
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
              {PROFILE_ICON_OPTIONS.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => setSelectedIcon(icon.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    selectedIcon === icon.id ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ background: icon.bg }}
                >
                  {icon.icon}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 ${
                    isNameDirty
                      ? "bg-card border border-primary/50 text-foreground focus:ring-primary"
                      : "bg-card/50 border border-border/70 text-foreground/75 focus:ring-primary"
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@google.com"
                  className={`w-full rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 ${
                    isEmailDirty
                      ? "bg-card border border-primary/50 text-foreground focus:ring-primary"
                      : "bg-card/50 border border-border/70 text-foreground/75 focus:ring-primary"
                  }`}
                />
              </div>
              <div className="pt-1 space-y-2">
                <button className="w-full rounded-xl py-2 text-xs font-medium border border-primary/35 text-primary hover:bg-primary/10 transition-colors">
                  Changer le mot de passe
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !hasProfileChanges}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Enregistrement..." : "Enregistrer le profil"}
                </button>
              </div>
              {saveMessage && <p className="text-xs text-muted-foreground">{saveMessage}</p>}
            </div>
          </div>

          {/* Language */}
          <div className="opacity-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">🌐</span>
              <span className="text-sm font-medium text-foreground">Langue</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Demo</span>
            </div>
            <select
              disabled
              className="w-full bg-card/60 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            >
              <option>Français</option>
              <option>English</option>
              <option>Español</option>
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">Indisponible dans cette version demo.</p>
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
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                    app.availableInDemo ? "bg-card border-border" : "bg-card/35 border-border/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${app.color} flex items-center justify-center`}>
                      {app.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground">{app.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Last sync: {app.lastSync}
                        {!app.availableInDemo && " • Demo indisponible"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp(app.id)}
                    disabled={!app.availableInDemo}
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
                  onClick={handleDesktopNotifToggle}
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
                  <div className="text-sm text-foreground">Sound</div>
                  <div className="text-[11px] text-muted-foreground">Play sound when events detected</div>
                </div>
                <button
                  onClick={handleSoundAlertsToggle}
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
