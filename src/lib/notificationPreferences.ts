const DESKTOP_NOTIFICATIONS_KEY = "iris_desktop_notifications_enabled";
const SOUND_ALERTS_KEY = "iris_sound_alerts_enabled";

type NotificationPreferenceKey = "desktop" | "sound";

const KEY_MAP: Record<NotificationPreferenceKey, string> = {
  desktop: DESKTOP_NOTIFICATIONS_KEY,
  sound: SOUND_ALERTS_KEY,
};

function readBooleanPreference(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "true";
}

export function isDesktopNotificationsEnabled(): boolean {
  return readBooleanPreference(DESKTOP_NOTIFICATIONS_KEY, true);
}

export function isSoundAlertsEnabled(): boolean {
  return readBooleanPreference(SOUND_ALERTS_KEY, true);
}

export function setNotificationPreference(type: NotificationPreferenceKey, enabled: boolean): void {
  localStorage.setItem(KEY_MAP[type], String(enabled));
}
