from fastapi import APIRouter, Request, HTTPException, Query
from typing import Optional
from models.schemas import EmailScanResult, ScannedEmail
from services.graph_client import GraphClient
from services.email_extractor import parse_email

router = APIRouter(prefix="/emails", tags=["Emails"])


def get_access_token(request: Request) -> str:
    token = request.session.get("access_token")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Non authentifié. Veuillez vous connecter via /api/auth/login",
        )
    return token


@router.get("/scan", response_model=EmailScanResult)
async def scan_emails(
    request: Request,
    top: int = Query(default=50, le=100, ge=1, description="Nombre d'emails à analyser"),
    only_appointments: bool = Query(default=False, description="Retourner uniquement les emails avec rendez-vous"),
):
    token = get_access_token(request)
    client = GraphClient(access_token=token)

    try:
        raw_data = await client.get_messages(top=top)
        raw_emails = raw_data.get("value", [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erreur Microsoft Graph: {str(e)}")

    parsed_emails = [parse_email(e) for e in raw_emails]

    if only_appointments:
        parsed_emails = [e for e in parsed_emails if e.is_appointment]

    appointments_found = sum(1 for e in parsed_emails if e.is_appointment)

    return EmailScanResult(
        total_scanned=len(raw_emails),
        appointments_found=appointments_found,
        emails=parsed_emails,
    )


@router.get("/appointments", response_model=list[ScannedEmail])
async def get_appointment_emails(
    request: Request,
    top: int = Query(default=30, le=100, ge=1),
):
    token = get_access_token(request)
    client = GraphClient(access_token=token)

    try:
        raw_data = await client.get_messages(top=top)
        raw_emails = raw_data.get("value", [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erreur Microsoft Graph: {str(e)}")

    parsed = [parse_email(e) for e in raw_emails]
    appointments = [e for e in parsed if e.is_appointment]

    return appointments


@router.get("/{email_id}", response_model=ScannedEmail)
async def get_email(request: Request, email_id: str):
    token = get_access_token(request)
    client = GraphClient(access_token=token)

    try:
        raw = await client.get_message(email_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Email introuvable: {str(e)}")

    return parse_email(raw)
