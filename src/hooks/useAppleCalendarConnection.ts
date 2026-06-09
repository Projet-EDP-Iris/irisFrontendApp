import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface AppleCalendarStatus {
  connected: boolean;
  email: string | null;
}

export function useAppleCalendarConnection() {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: status, isLoading, error, refetch } = useQuery<AppleCalendarStatus>({
    queryKey: ["apple-calendar-status"],
    queryFn: () => apiFetch<AppleCalendarStatus>("/auth/apple/status"),
    staleTime: 30_000,
    retry: false,
  });

  const connect = async (appleUser: string, applePassword: string) => {
    setConnecting(true);
    try {
      await apiFetch("/users/me/calendar-setup", {
        method: "PATCH",
        body: JSON.stringify({
          calendar_provider: "apple",
          apple_caldav_user: appleUser,
          apple_caldav_password: applePassword,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["apple-calendar-status"] });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await apiFetch("/users/me/calendar-disconnect?provider=apple", { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["apple-calendar-status"] });
    } finally {
      setDisconnecting(false);
    }
  };

  return {
    connected: status?.connected ?? false,
    appleEmail: status?.email ?? null,
    isLoading,
    connecting,
    disconnecting,
    error,
    connect,
    disconnect,
    refetchStatus: refetch,
  };
}
