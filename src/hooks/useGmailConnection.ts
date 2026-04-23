import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface GmailStatus {
  connected: boolean;
  gmail_email: string | null;
}

const ENABLED_KEY = ["gmail-enabled"];

function getStoredEnabled(): boolean {
  return localStorage.getItem("gmail_enabled") !== "false";
}

export function useGmailConnection() {
  const queryClient = useQueryClient();

  const { data: status, isLoading, error, refetch } = useQuery<GmailStatus>({
    queryKey: ["gmail-status"],
    queryFn: () => apiFetch<GmailStatus>("/auth/google/status"),
    staleTime: 30_000,
    retry: false,
  });

  const { data: enabled = getStoredEnabled() } = useQuery<boolean>({
    queryKey: ENABLED_KEY,
    queryFn: getStoredEnabled,
    staleTime: Infinity,
  });

  const setEnabled = (value: boolean) => {
    localStorage.setItem("gmail_enabled", value.toString());
    queryClient.setQueryData(ENABLED_KEY, value);
  };

  return {
    connected: status?.connected ?? false,
    gmailEmail: status?.gmail_email ?? null,
    enabled,
    isLoading,
    error,
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    refetchStatus: refetch,
  };
}
