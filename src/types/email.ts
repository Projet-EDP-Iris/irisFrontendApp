export interface EmailItem {
  subject: string;
  body: string;
  message_id: string;
  rfc_message_id?: string | null;
  sender: string | null;
  date: string | null;
  category?: string; // "rdv" | "action" | "attente" | "bonsplans" | "info"
  db_id?: number;
  provider?: "gmail" | "outlook" | "unknown";
  suggested_reply?: string | null;
}
