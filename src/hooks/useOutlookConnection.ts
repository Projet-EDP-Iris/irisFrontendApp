import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface OutlookStatus {
  connected: boolean;
  outlook_email: string | null;
  enabled: boolean;
}

export function useOutlookConnection() {
  const queryClient = useQueryClient();
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: status, isLoading, error, refetch } = useQuery<OutlookStatus>({
    queryKey: ["outlook-status"],
    queryFn: () => apiFetch<OutlookStatus>("/auth/microsoft/status"),
    staleTime: 30_000,
    retry: false,
  });

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await apiFetch("/auth/microsoft", { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["outlook-status"] });
    } finally {
      setDisconnecting(false);
    }
  };

  return {
    connected: status?.connected ?? false,
    outlookEmail: status?.outlook_email ?? null,
    isLoading,
    disconnecting,
    error,
    disconnect,
    refetchStatus: refetch,
  };
}
