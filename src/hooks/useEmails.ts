import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { EmailItem } from "@/types/email";

export function useEmails(maxResults = 20, enabled = true) {
  return useQuery<EmailItem[], Error>({
    queryKey: ["emails", maxResults],
    queryFn: () => apiFetch<EmailItem[]>(`/emails?max_results=${maxResults}`),
    enabled,
    retry: false,
  });
}
