import { X, Mail, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProfileIconById, PROFILE_ICON_OPTIONS } from "@/constants/profileIcons";
import {
  isDesktopNotificationsEnabled,
  isSoundAlertsEnabled,
  setNotificationPreference,
} from "@/lib/notificationPreferences";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { GmailConnectModal } from "@/components/GmailConnectModal";

interface SettingsPanelProps {
  onClose: () => void;
}

function Toggle({ enabled, onClick, disabled = false }: { enabled: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${enabled ? "bg-primary" : "bg-muted"} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { user, updateProfile } = useAuth();
  const { connected: gmailConnected, gmailEmail, disconnecting, disconnect: disconnectGmail } = useGmailConnection();
  const [showGmailModal, setShowGmailModal] = useState(false);
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
    <>
      {showGmailModal && <GmailConnectModal onClose={() => setShowGmailModal(false)} />}

      <div className="absolute inset-0 z-50 flex justify-end" onClick={onClose}>
        <div
          className="w-80 h-full bg-sidebar border-l border-sidebar-border overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm">
            <h2 className="text-base font-semibold text-foreground">Paramètres</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${selectedIcon === icon.id ? "ring-2 ring-primary" : ""}`}
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
                    className={`w-full rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 ${isNameDirty ? "bg-card border border-primary/50 text-foreground focus:ring-primary" : "bg-card/50 border border-border/70 text-foreground/75 focus:ring-primary"}`}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@google.com"
                    className={`w-full rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 ${isEmailDirty ? "bg-card border border-primary/50 text-foreground focus:ring-primary" : "bg-card/50 border border-border/70 text-foreground/75 focus:ring-primary"}`}
                  />
                </div>
                <div className="pt-1 space-y-2">
                  <button className="hidden w-full rounded-xl py-2 text-xs font-medium border border-primary/35 text-primary hover:bg-primary/10 transition-colors">
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
              <select disabled className="w-full bg-card/60 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
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

                {/* Gmail */}
                <div className="rounded-xl border bg-card border-border overflow-hidden">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground">Gmail</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {gmailConnected ? (gmailEmail ?? "Connecté") : "Non connecté"}
                      </div>
                    </div>
                    {gmailConnected ? (
                      <button
                        onClick={disconnectGmail}
                        disabled={disconnecting}
                        className="text-[10px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 flex-shrink-0 border border-border/60 rounded-lg px-2 py-1"
                      >
                        {disconnecting ? "..." : "Déconnecter"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowGmailModal(true)}
                        className="text-[10px] text-primary hover:opacity-80 transition-opacity flex-shrink-0 border border-primary/40 rounded-lg px-2 py-1"
                      >
                        Connecter
                      </button>
                    )}
                  </div>
                </div>

                {/* Google Calendar */}
                <div className="rounded-xl border bg-card border-border overflow-hidden">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground">Google Calendar</div>
                      <div className="text-[10px] text-muted-foreground">
                        {gmailConnected ? "Connecté via Gmail" : "Requiert Gmail"}
                      </div>
                    </div>
                    <span className={`text-[10px] flex-shrink-0 px-2 py-1 rounded-lg border ${gmailConnected ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground border-border/40 opacity-50"}`}>
                      {gmailConnected ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>

                {/* Outlook — not implemented */}
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border bg-card/30 border-border/50 opacity-50 cursor-not-allowed">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 rounded bg-blue-500/70 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">O</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">Outlook</div>
                    <div className="text-[10px] text-muted-foreground">Bientôt disponible</div>
                  </div>
                </div>

                {/* Apple Calendar — not implemented */}
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border bg-card/30 border-border/50 opacity-50 cursor-not-allowed">
                  <div className="w-7 h-7 rounded-lg bg-gray-500/15 flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">Apple Calendar</div>
                    <div className="text-[10px] text-muted-foreground">Bientôt disponible</div>
                  </div>
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
                  <Toggle enabled={desktopNotif} onClick={handleDesktopNotifToggle} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground">Sound</div>
                    <div className="text-[11px] text-muted-foreground">Play sound when events detected</div>
                  </div>
                  <Toggle enabled={soundAlerts} onClick={handleSoundAlertsToggle} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
