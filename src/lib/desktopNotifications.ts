import { isDesktopNotificationsEnabled, isSoundAlertsEnabled } from "@/lib/notificationPreferences";

type SignupNotificationPayload = {
  userName?: string | null;
};

type GmailNotificationPayload = {
  gmailEmail?: string | null;
};

export async function notifySignupSuccess(payload: SignupNotificationPayload): Promise<void> {
  if (!isDesktopNotificationsEnabled()) return;

  const notify = window.irisDesktop?.notifySignupSuccess;
  if (!notify) return;

  try {
    await notify({
      userName: payload.userName ?? "",
      soundEnabled: isSoundAlertsEnabled(),
    });
  } catch {
    // Desktop notifications are non-critical; avoid blocking signup flow.
  }
}

export async function notifyGmailConnected(payload: GmailNotificationPayload = {}): Promise<void> {
  if (!isDesktopNotificationsEnabled()) return;

  const notify = window.irisDesktop?.notifyGmailConnected;
  if (!notify) return;

  try {
    await notify({
      gmailEmail: payload.gmailEmail ?? "",
      soundEnabled: isSoundAlertsEnabled(),
    });
  } catch {
    // Desktop notifications are non-critical; avoid blocking Gmail flow.
  }
}
