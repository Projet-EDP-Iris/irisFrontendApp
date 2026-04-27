export interface EmailItem {
  subject: string;
  body: string;
  message_id: string;
  sender: string | null;
  date: string | null;
  category?: string; // "rdv" | "action" | "attente" | "bonsplans" | "info"
  db_id?: number;   // DB primary key — present when backend has stored the email
}
