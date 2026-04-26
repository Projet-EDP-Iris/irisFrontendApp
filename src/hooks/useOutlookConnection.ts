import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface OutlookStatus {
  connected: boolean;
  outlook_email: string | null;
  enabled: boolean;
}

export function useOutlookConnection() {
  const { data: status, isLoading, error, refetch } = useQuery<OutlookStatus>({
    queryKey: ["outlook-status"],
    queryFn: () => apiFetch<OutlookStatus>("/auth/microsoft/status"),
    staleTime: 30_000,
    retry: false,
  });

  return {
    connected: status?.connected ?? false,
    outlookEmail: status?.outlook_email ?? null,
    isLoading,
    error,
    refetchStatus: refetch,
  };
}
