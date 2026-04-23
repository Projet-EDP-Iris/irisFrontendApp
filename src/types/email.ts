export interface EmailItem {
  subject: string;
  body: string;
  message_id: string;
  sender: string | null;
  date: string | null;
}
