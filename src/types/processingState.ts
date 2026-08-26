export interface CategoryProgress {
  total: number;
  done: number;
}

export interface ProcessingState {
  user_id: number;
  is_active: boolean;
  total_emails: number;
  processed_emails: number;
  processed_by_category: Record<string, CategoryProgress>;
  updated_at: string;
}
