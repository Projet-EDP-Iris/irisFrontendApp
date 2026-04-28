export {};

declare global {
  interface Window {
    irisDesktop?: {
      notifySignupSuccess: (payload: { userName?: string; soundEnabled: boolean }) => Promise<{
        shown: boolean;
        reason?: string;
      }>;
      notifyGmailConnected: (payload: { gmailEmail?: string; soundEnabled: boolean }) => Promise<{
        shown: boolean;
        reason?: string;
      }>;
      openExternal: (url: string) => Promise<void>;
      onOAuthCallback: (callback: (params: Record<string, string>) => void) => () => void;
    };
  }
}
