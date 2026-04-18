from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from models.schemas import EmailScanResult, ScannedEmail
from services.gmail_service import scan_gmail, fetch_gmail_emails
from services.email_extractor import parse_email

router = APIRouter(prefix="/gmail", tags=["Gmail"])


class GmailCredentials(BaseModel):
    gmail_address: str
    app_password: str


@router.post("/scan", response_model=EmailScanResult)
async def scan_gmail_emails(
    credentials: GmailCredentials,
    top: int = Query(default=50, le=100, ge=1, description="Nombre d'emails à analyser"),
    only_appointments: bool = Query(default=False, description="Retourner uniquement les emails avec rendez-vous"),
):
    try:
        result = scan_gmail(
            gmail_address=credentials.gmail_address,
            app_password=credentials.app_password,
            top=top,
            only_appointments=only_appointments,
        )
        return result
    except Exception as e:
        error_msg = str(e)
        if "AUTHENTICATIONFAILED" in error_msg or "authentication" in error_msg.lower():
            raise HTTPException(
                status_code=401,
                detail="Authentification Gmail échouée. Vérifiez votre adresse email et votre mot de passe d'application.",
            )
        raise HTTPException(status_code=502, detail=f"Erreur de connexion Gmail: {error_msg}")


@router.post("/appointments", response_model=list[ScannedEmail])
async def get_gmail_appointments(
    credentials: GmailCredentials,
    top: int = Query(default=50, le=100, ge=1),
):
    try:
        raw_emails = fetch_gmail_emails(
            gmail_address=credentials.gmail_address,
            app_password=credentials.app_password,
            top=top,
        )
        parsed = [parse_email(e) for e in raw_emails]
        return [e for e in parsed if e.is_appointment]
    except Exception as e:
        error_msg = str(e)
        if "AUTHENTICATIONFAILED" in error_msg or "authentication" in error_msg.lower():
            raise HTTPException(
                status_code=401,
                detail="Authentification Gmail échouée. Vérifiez votre adresse email et votre mot de passe d'application.",
            )
        raise HTTPException(status_code=502, detail=f"Erreur de connexion Gmail: {error_msg}")


@router.get("/setup-guide")
async def gmail_setup_guide():
    return {
        "title": "Comment configurer l'accès Gmail",
        "steps": [
            {
                "step": 1,
                "action": "Activer la vérification en 2 étapes",
                "url": "https://myaccount.google.com/signinoptions/two-step-verification",
                "description": "Obligatoire pour créer un mot de passe d'application"
            },
            {
                "step": 2,
                "action": "Générer un mot de passe d'application",
                "url": "https://myaccount.google.com/apppasswords",
                "description": "Sélectionne 'Autre (nom personnalisé)', entre 'Iris App', copie le mot de passe généré (16 caractères)"
            },
            {
                "step": 3,
                "action": "Utiliser l'API",
                "description": "Envoie ton adresse Gmail et le mot de passe d'application dans les requêtes POST /api/gmail/scan"
            }
        ],
        "note": "Le mot de passe d'application est différent de ton mot de passe Google habituel. Il est généré spécialement pour Iris."
    }
