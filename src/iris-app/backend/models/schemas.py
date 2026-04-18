from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TokenInfo(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: Optional[int] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None


class AuthStatus(BaseModel):
    authenticated: bool
    user_email: Optional[str] = None
    user_name: Optional[str] = None


class EmailAddress(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None


class AppointmentInfo(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    subject: Optional[str] = None
    organizer: Optional[str] = None
    attendees: List[str] = []
    description: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class ScannedEmail(BaseModel):
    id: str
    subject: str
    sender: EmailAddress
    received_at: str
    preview: str
    body: Optional[str] = None
    is_appointment: bool = False
    appointment: Optional[AppointmentInfo] = None
    calendar_event_created: bool = False
    calendar_event_id: Optional[str] = None


class EmailScanResult(BaseModel):
    total_scanned: int
    appointments_found: int
    emails: List[ScannedEmail]


class CalendarEvent(BaseModel):
    id: str
    subject: str
    start: str
    end: str
    location: Optional[str] = None
    organizer: Optional[str] = None
    body_preview: Optional[str] = None
    is_online_meeting: bool = False
    join_url: Optional[str] = None


class CreateEventRequest(BaseModel):
    email_id: str
    subject: str
    start_datetime: str
    end_datetime: str
    location: Optional[str] = None
    description: Optional[str] = None
    attendees: List[str] = []
    timezone: str = "Europe/Paris"


class CreateEventResponse(BaseModel):
    success: bool
    event_id: Optional[str] = None
    event_url: Optional[str] = None
    message: str


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
