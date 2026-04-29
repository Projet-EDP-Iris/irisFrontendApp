import { useState } from "react";
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
  const [disconnecting, setDisconnecting] = useState(false);

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

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await apiFetch("/auth/google", { method: "DELETE" });
      localStorage.setItem("gmail_enabled", "false");
      queryClient.setQueryData(ENABLED_KEY, false);
      await queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
    } finally {
      setDisconnecting(false);
    }
  };

  return {
    connected: status?.connected ?? false,
    gmailEmail: status?.gmail_email ?? null,
    enabled,
    isLoading,
    disconnecting,
    error,
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    disconnect,
    refetchStatus: refetch,
  };
}
