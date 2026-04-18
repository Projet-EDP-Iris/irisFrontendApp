import msal
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from config import settings
from models.schemas import AuthStatus

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_msal_app() -> msal.ConfidentialClientApplication:
    return msal.ConfidentialClientApplication(
        client_id=settings.AZURE_CLIENT_ID,
        client_credential=settings.AZURE_CLIENT_SECRET,
        authority=f"https://login.microsoftonline.com/{settings.AZURE_TENANT_ID}",
    )


SCOPES = [
    "User.Read",
    "Mail.Read",
    "Calendars.ReadWrite",
]


@router.get("/login")
async def login(request: Request):
    msal_app = get_msal_app()
    auth_url = msal_app.get_authorization_request_url(
        scopes=SCOPES,
        redirect_uri=settings.AZURE_REDIRECT_URI,
        state="iris_oauth_state",
    )
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def auth_callback(request: Request, code: str = None, error: str = None, state: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")

    if not code:
        raise HTTPException(status_code=400, detail="Authorization code missing")

    msal_app = get_msal_app()
    result = msal_app.acquire_token_by_authorization_code(
        code=code,
        scopes=SCOPES,
        redirect_uri=settings.AZURE_REDIRECT_URI,
    )

    if "error" in result:
        raise HTTPException(
            status_code=400,
            detail=f"Token error: {result.get('error_description', result.get('error'))}",
        )

    access_token = result.get("access_token")
    id_token_claims = result.get("id_token_claims", {})

    request.session["access_token"] = access_token
    request.session["user_email"] = id_token_claims.get("preferred_username", "")
    request.session["user_name"] = id_token_claims.get("name", "")

    return RedirectResponse(url=f"{settings.FRONTEND_URL}?auth=success")


@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url=settings.FRONTEND_URL)


@router.get("/status", response_model=AuthStatus)
async def auth_status(request: Request):
    access_token = request.session.get("access_token")
    if not access_token:
        return AuthStatus(authenticated=False)

    return AuthStatus(
        authenticated=True,
        user_email=request.session.get("user_email"),
        user_name=request.session.get("user_name"),
    )
