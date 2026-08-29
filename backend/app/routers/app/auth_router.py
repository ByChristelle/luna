from fastapi import APIRouter, Depends, status, HTTPException , Query ,status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import os
import httpx
import logging
from app.core.config import settings

from app.core.database import get_db
from app.requests.auth_request import RegisterRequest, LoginRequest
from app.resources.auth_resource import TokenResource
from app.controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["Auth"])

# Configuration Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return auth_controller.register_user(db, data)


@router.post("/login", response_model=TokenResource)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return auth_controller.login_user(db, data)


# --- ROUTES GOOGLE OAUTH ---

@router.get("/google/login")
def google_login():
    google_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&scope=openid%20email%20profile"
    )
    return RedirectResponse(url=google_url)


# app/routers/app/auth_router.py

@router.get("/google/callback")
async def google_callback(
    code: str,
    iss: str = Query(None),
    db: Session = Depends(get_db)
):
    try:
        async with httpx.AsyncClient() as client:
            token_res = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                },
            )
            token_data = token_res.json()

            if "access_token" not in token_data:
                raise HTTPException(status_code=400, detail="Échec token Google")

            user_res = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            google_user = user_res.json()

        token = auth_controller.google_auth_user(db, google_user)
        
        redirect_url = f"http://localhost:8081/login?token={token}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))