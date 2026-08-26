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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["processing-state"] });
    },
  });
}
