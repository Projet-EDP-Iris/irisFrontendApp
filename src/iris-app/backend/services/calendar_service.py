from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from models.schemas import CalendarEvent, CreateEventRequest, CreateEventResponse
from services.graph_client import GraphClient


def parse_calendar_event(raw: Dict[str, Any]) -> CalendarEvent:
    location_obj = raw.get("location", {})
    location = location_obj.get("displayName") if isinstance(location_obj, dict) else None

    organizer_obj = raw.get("organizer", {}).get("emailAddress", {})
    organizer = organizer_obj.get("name") or organizer_obj.get("address")

    start_obj = raw.get("start", {})
    end_obj = raw.get("end", {})

    return CalendarEvent(
        id=raw.get("id", ""),
        subject=raw.get("subject", "(No subject)"),
        start=start_obj.get("dateTime", ""),
        end=end_obj.get("dateTime", ""),
        location=location,
        organizer=organizer,
        body_preview=raw.get("bodyPreview", "")[:300],
        is_online_meeting=raw.get("isOnlineMeeting", False),
        join_url=raw.get("onlineMeetingUrl"),
    )


async def list_events(
    client: GraphClient,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    top: int = 20,
) -> List[CalendarEvent]:
    data = await client.get_calendar_events(start_date, end_date, top)
    return [parse_calendar_event(e) for e in data.get("value", [])]


async def create_event_from_request(
    client: GraphClient,
    request: CreateEventRequest,
) -> CreateEventResponse:
    attendees_list = [
        {
            "emailAddress": {"address": email},
            "type": "required",
        }
        for email in request.attendees
    ]

    event_payload: Dict[str, Any] = {
        "subject": request.subject,
        "start": {
            "dateTime": request.start_datetime,
            "timeZone": request.timezone,
        },
        "end": {
            "dateTime": request.end_datetime,
            "timeZone": request.timezone,
        },
        "attendees": attendees_list,
    }

    if request.location:
        event_payload["location"] = {"displayName": request.location}

    if request.description:
        event_payload["body"] = {
            "contentType": "text",
            "content": request.description,
        }

    try:
        created = await client.create_calendar_event(event_payload)
        return CreateEventResponse(
            success=True,
            event_id=created.get("id"),
            event_url=created.get("webLink"),
            message="Événement créé avec succès dans votre calendrier Outlook.",
        )
    except Exception as e:
        return CreateEventResponse(
            success=False,
            message=f"Erreur lors de la création de l'événement : {str(e)}",
        )
