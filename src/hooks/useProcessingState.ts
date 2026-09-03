import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ProcessingState } from "@/types/processingState";

export function useProcessingState(poll: boolean = true) {
  return useQuery<ProcessingState, Error>({
    queryKey: ["processing-state"],
    queryFn: () => apiFetch<ProcessingState>("/processing-state"),
    refetchInterval: poll ? 2000 : false,
    refetchIntervalInBackground: false,
    enabled: !!localStorage.getItem("iris_token"),
  });
}

export function useToggleProcessing() {
  const queryClient = useQueryClient();
  return useMutation<ProcessingState, Error, void>({
    mutationFn: () => apiFetch<ProcessingState>("/processing-state/toggle", { method: "POST" }),
    onSuccess: (data) => {
      // The toggle endpoint already returns the fresh flipped state, so write
      // it straight into the cache instead of invalidating and waiting on a
      // refetch — the backend flip isn't idempotent, so a second click landing
      // before that refetch resolves would otherwise flip it right back.
      queryClient.setQueryData(["processing-state"], data);
    },
  });
}
