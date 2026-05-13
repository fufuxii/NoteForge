import os

class Config:
    PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "noteforge-sm2026")
    REGION = os.environ.get("GCP_REGION", "global")
    BUCKET = os.environ.get("GCS_BUCKET", "noteforge-sm2026.firebasestorage.app")
    ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    DEV_MOCK_AUTH = os.environ.get("DEV_MOCK_AUTH", "0") == "1"