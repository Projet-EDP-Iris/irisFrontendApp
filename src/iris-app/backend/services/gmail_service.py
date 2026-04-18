import imaplib
import email as email_lib
import email.header
from typing import List, Optional
from models.schemas import ScannedEmail, EmailAddress, EmailScanResult
from services.email_extractor import parse_email as detect_appointment


GMAIL_IMAP_HOST = "imap.gmail.com"
GMAIL_IMAP_PORT = 993


def decode_header_value(value: str) -> str:
    decoded_parts = email.header.decode_header(value)
    result = []
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            result.append(part.decode(encoding or "utf-8", errors="replace"))
        else:
            result.append(part)
    return "".join(result)


def extract_body(msg) -> str:
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = str(part.get("Content-Disposition", ""))
            if content_type == "text/plain" and "attachment" not in disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    body = payload.decode(charset, errors="replace")
                    break
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            body = payload.decode(charset, errors="replace")
    return body.strip()


def fetch_gmail_emails(
    gmail_address: str,
    app_password: str,
    top: int = 50,
    folder: str = "INBOX",
) -> List[dict]:
    mail = imaplib.IMAP4_SSL(GMAIL_IMAP_HOST, GMAIL_IMAP_PORT)
    mail.login(gmail_address, app_password)
    mail.select(folder)

    _, message_ids = mail.search(None, "ALL")
    all_ids = message_ids[0].split()

    recent_ids = all_ids[-top:] if len(all_ids) > top else all_ids
    recent_ids = list(reversed(recent_ids))

    raw_emails = []
    for msg_id in recent_ids:
        _, msg_data = mail.fetch(msg_id, "(RFC822)")
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email_lib.message_from_bytes(response_part[1])

                subject = decode_header_value(msg.get("Subject", "(No subject)"))
                from_raw = msg.get("From", "")
                from_decoded = decode_header_value(from_raw)
                date_str = msg.get("Date", "")
                message_id = msg.get("Message-ID", str(msg_id.decode()))

                body = extract_body(msg)
                preview = body[:200].replace("\n", " ").strip()

                sender_name = ""
                sender_addr = from_decoded
                if "<" in from_decoded and ">" in from_decoded:
                    parts = from_decoded.split("<")
                    sender_name = parts[0].strip().strip('"')
                    sender_addr = parts[1].replace(">", "").strip()

                raw_emails.append({
                    "id": message_id.strip("<>"),
                    "subject": subject,
                    "from": {
                        "emailAddress": {
                            "name": sender_name,
                            "address": sender_addr,
                        }
                    },
                    "receivedDateTime": date_str,
                    "bodyPreview": preview,
                    "body": {
                        "content": body,
                        "contentType": "text",
                    },
                })

    mail.logout()
    return raw_emails


def scan_gmail(
    gmail_address: str,
    app_password: str,
    top: int = 50,
    only_appointments: bool = False,
) -> EmailScanResult:
    raw_emails = fetch_gmail_emails(gmail_address, app_password, top)

    from services.email_extractor import parse_email
    parsed = [parse_email(e) for e in raw_emails]

    if only_appointments:
        parsed = [e for e in parsed if e.is_appointment]

    appointments_found = sum(1 for e in parsed if e.is_appointment)

    return EmailScanResult(
        total_scanned=len(raw_emails),
        appointments_found=appointments_found,
        emails=parsed,
    )
