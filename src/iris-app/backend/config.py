from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    AZURE_CLIENT_ID: str = ""
    AZURE_CLIENT_SECRET: str = ""
    AZURE_TENANT_ID: str = "common"
    AZURE_REDIRECT_URI: str = "http://localhost:8000/api/auth/callback"

    SESSION_SECRET_KEY: str = "change-this-secret-key-in-production"

    FRONTEND_URL: str = "http://localhost:5173"

    PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
