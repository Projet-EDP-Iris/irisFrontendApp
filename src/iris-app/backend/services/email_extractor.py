import re
from typing import Optional, List, Tuple
from models.schemas import ScannedEmail, AppointmentInfo, EmailAddress


APPOINTMENT_KEYWORDS_FR = [
    "réunion", "rendez-vous", "rdv", "entretien", "meeting",
    "conférence", "appel", "appel téléphonique", "visioconférence",
    "webinaire", "formation", "séminaire", "atelier", "présentation",
]

APPOINTMENT_KEYWORDS_EN = [
    "meeting", "appointment", "call", "conference", "interview",
    "webinar", "training", "seminar", "workshop", "presentation",
    "standup", "sync", "1:1", "one-on-one", "review", "session",
    "teams meeting", "zoom", "google meet", "skype",
]

ALL_KEYWORDS = APPOINTMENT_KEYWORDS_FR + APPOINTMENT_KEYWORDS_EN

DATE_PATTERNS = [
    r'\b(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{2,4})\b',
    r'\b(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})\b',
    r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})\b',
    r'\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s+(\d{1,2})\b',
    r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b',
    r'\b(\d{4})-(\d{2})-(\d{2})\b',
]

TIME_PATTERNS = [
    r'\b(\d{1,2})[h:](\d{2})\s*(am|pm)?\b',
    r'\b(\d{1,2})\s*(am|pm)\b',
    r'\b(\d{1,2})[hH]\b',
    r'\b(\d{1,2}):(\d{2})\b',
]

DURATION_PATTERNS = [
    r'(\d+)\s*h(?:eure)?s?\s*(?:(\d+)\s*min(?:ute)?s?)?\b',
    r'(\d+)\s*min(?:ute)?s?\b',
    r'(\d+)\s*hour[s]?\b',
]

LOCATION_PATTERNS = [
    r'(?:lieu|place|location|salle|room|adresse|address)\s*[:\-]?\s*([^\n,\.]{5,80})',
    r'(?:à|at|in)\s+([A-Z][a-zéèêëàâùûü][^\n,\.]{3,60})',
    r'\b(?:en ligne|online|virtual|teams|zoom|meet)\b',
]


def calculate_appointment_score(subject: str, body: str) -> Tuple[float, List[str]]:
    text = (subject + " " + body).lower()
    found_keywords = []
    score = 0.0

    for keyword in ALL_KEYWORDS:
        if keyword.lower() in text:
            found_keywords.append(keyword)
            score += 0.15

    has_date = any(re.search(p, text, re.IGNORECASE) for p in DATE_PATTERNS)
    has_time = any(re.search(p, text, re.IGNORECASE) for p in TIME_PATTERNS)

    if has_date:
        score += 0.25
    if has_time:
        score += 0.20

    invitation_signals = [
        "vous êtes invité", "you are invited", "invitation", "invite",
        "join us", "rejoignez", "participer", "participate",
        "ics", "calendar", "calendrier", "confirmer", "confirm",
        "accept", "decline", "rsvp",
    ]
    for signal in invitation_signals:
        if signal in text:
            score += 0.10
            break

    return min(score, 1.0), found_keywords


def extract_date(text: str) -> Optional[str]:
    for pattern in DATE_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return None


def extract_time(text: str) -> Optional[str]:
    for pattern in TIME_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return None


def extract_duration(text: str) -> Optional[str]:
    for pattern in DURATION_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return None


def extract_location(text: str) -> Optional[str]:
    for pattern in LOCATION_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return match.group(1).strip()
            except IndexError:
                return match.group(0).strip()
    return None


def parse_email(raw_email: dict) -> ScannedEmail:
    email_id = raw_email.get("id", "")
    subject = raw_email.get("subject", "(No subject)")
    received_at = raw_email.get("receivedDateTime", "")
    preview = raw_email.get("bodyPreview", "")

    body_obj = raw_email.get("body", {})
    body_content = body_obj.get("content", preview) if isinstance(body_obj, dict) else preview

    clean_body = re.sub(r'<[^>]+>', ' ', body_content)
    clean_body = re.sub(r'\s+', ' ', clean_body).strip()

    from_obj = raw_email.get("from", {}).get("emailAddress", {})
    sender = EmailAddress(
        name=from_obj.get("name"),
        address=from_obj.get("address"),
    )

    score, keywords = calculate_appointment_score(subject, clean_body)
    is_appointment = score >= 0.3

    appointment = None
    if is_appointment:
        full_text = subject + " " + clean_body
        appointment = AppointmentInfo(
            subject=subject,
            date=extract_date(full_text),
            time=extract_time(full_text),
            duration=extract_duration(full_text),
            location=extract_location(full_text),
            organizer=sender.name or sender.address,
            confidence=round(score, 2),
        )

    return ScannedEmail(
        id=email_id,
        subject=subject,
        sender=sender,
        received_at=received_at,
        preview=preview[:200],
        body=clean_body[:1000],
        is_appointment=is_appointment,
        appointment=appointment,
    )
