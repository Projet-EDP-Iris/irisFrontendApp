from fastapi import APIRouter, Request, HTTPException, Query
from typing import Optional
from models.schemas import CalendarEvent, CreateEventRequest, CreateEventResponse
from services.graph_client import GraphClient
from services.calendar_service import list_events, create_event_from_request

router = APIRouter(prefix="/calendar", tags=["Calendar"])


def get_access_token(request: Request) -> str:
    token = request.session.get("access_token")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Non authentifié. Veuillez vous connecter via /api/auth/login",
        )
    return token


@router.get("/events", response_model=list[CalendarEvent])
async def get_calendar_events(
    request: Request,
    start_date: Optional[str] = Query(default=None, description="Date de début ISO 8601 (ex: 2024-01-01T00:00:00Z)"),
    end_date: Optional[str] = Query(default=None, description="Date de fin ISO 8601 (ex: 2024-12-31T23:59:59Z)"),
    top: int = Query(default=20, le=50, ge=1),
):
    token = get_access_token(request)
    client = GraphClient(access_token=token)

    try:
        events = await list_events(client, start_date, end_date, top)
        return events
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erreur Microsoft Graph: {str(e)}")


@router.post("/events", response_model=CreateEventResponse)
async def create_calendar_event(
    request: Request,
    event_request: CreateEventRequest,
):
    token = get_access_token(request)
    client = GraphClient(access_token=token)

    result = await create_event_from_request(client, event_request)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result


@router.delete("/events/{event_id}")
async def delete_calendar_event(request: Request, event_id: str):
    token = get_access_token(request)
    client = GraphClient(access_token=token)

    try:
        success = await client.delete_calendar_event(event_id)
        if not success:
            raise HTTPException(status_code=400, detail="Impossible de supprimer l'événement")
        return {"success": True, "message": "Événement supprimé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erreur: {str(e)}")
