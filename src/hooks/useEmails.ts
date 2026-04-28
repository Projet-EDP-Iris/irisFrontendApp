import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { EmailItem } from "@/types/email";

export function useEmails(enabled = true) {
  return useQuery<EmailItem[], Error>({
    queryKey: ["emails"],
    queryFn: () => apiFetch<EmailItem[]>("/emails"),
    enabled,
    retry: false,
  });
}
