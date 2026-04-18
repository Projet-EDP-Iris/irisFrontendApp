import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from config import settings
from routers import auth, emails, calendar, gmail

app = FastAPI(
    title="Iris Backend API",
    description="Backend pour Iris — extraction d'emails Outlook et gestion du calendrier via Microsoft Graph API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    max_age=3600 * 8,
)

app.include_router(auth.router, prefix="/api")
app.include_router(emails.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(gmail.router, prefix="/api")


@app.get("/api/healthz")
async def health_check():
    return {"status": "ok", "service": "iris-backend"}


@app.get("/api")
async def root():
    return {
        "message": "Iris Backend API",
        "docs": "/api/docs",
        "endpoints": {
            "auth": {
                "login": "GET /api/auth/login",
                "callback": "GET /api/auth/callback",
                "logout": "GET /api/auth/logout",
                "status": "GET /api/auth/status",
            },
            "emails": {
                "scan": "GET /api/emails/scan",
                "appointments": "GET /api/emails/appointments",
                "detail": "GET /api/emails/{email_id}",
            },
            "calendar": {
                "events": "GET /api/calendar/events",
                "create": "POST /api/calendar/events",
                "delete": "DELETE /api/calendar/events/{event_id}",
            },
            "gmail": {
                "scan": "POST /api/gmail/scan",
                "appointments": "POST /api/gmail/appointments",
                "setup_guide": "GET /api/gmail/setup-guide",
            },
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=False)
