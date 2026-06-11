import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { EmailItem } from "@/types/email";

export interface EmailFeedPage {
  emails: EmailItem[];
  has_more: boolean;
  gmail_next_cursor: string | null;
  outlook_next_skip: number;
}

interface PageParam {
  gmailCursor: string | null;
  outlookSkip: number;
}

const FEED_LIMIT = 50;

export function useEmailFeed(enabled = true, category?: string) {
  return useInfiniteQuery<EmailFeedPage, Error, { pages: EmailFeedPage[] }, string[], PageParam>({
    queryKey: ["emails-feed", category ?? "all"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(FEED_LIMIT) });
      if (pageParam.gmailCursor) params.set("gmail_cursor", pageParam.gmailCursor);
      if (pageParam.outlookSkip > 0) params.set("outlook_skip", String(pageParam.outlookSkip));
      if (category) params.set("category", category);
      return apiFetch<EmailFeedPage>(`/emails/feed?${params}`);
    },
    getNextPageParam: (lastPage) =>
      lastPage.has_more
        ? { gmailCursor: lastPage.gmail_next_cursor, outlookSkip: lastPage.outlook_next_skip }
        : undefined,
    initialPageParam: { gmailCursor: null, outlookSkip: 0 },
    enabled,
    retry: false,
    staleTime: 60_000,
    refetchInterval: 3 * 60 * 1000,
  });
}
