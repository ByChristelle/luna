from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import httpx

from app.core.security import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.message import MessageResponse
from app.controllers.message_controller import save_message, get_messages_by_user

router = APIRouter(prefix="/ai", tags=["AI"])

class AskRequest(BaseModel):
    prompt: str
    cycle_phase: str = "folliculaire"
    cycle_day: int = 1

@router.post("/ask", response_model=MessageResponse)
async def ask_luna(
    data: AskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="Clé API Groq manquante dans le .env")

    # 1. Sauvegarder le message de l'utilisatrice
    save_message(db, current_user.id, "user", data.prompt)

    # 2. Appeler Groq
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "groq/compound-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            f"Tu es Luna, une assistante experte en santé féminine et suivi de cycle menstruel. "
                            f"Contexte utilisateur : Jour {data.cycle_day} du cycle, Phase actuelle : {data.cycle_phase}. "
                            f"Réponds toujours en français. Sois brève, claire et bienveillante."
                        ),
                    },
                    {"role": "user", "content": data.prompt},
                ],
                "temperature": 0.5,
                "max_tokens": 300,
            },
            timeout=30.0,
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur API Groq: {response.status_code} — {response.text}"
        )

    reply = response.json()["choices"][0]["message"]["content"]

    # 3. Sauvegarder la réponse de Luna
    saved = save_message(db, current_user.id, "assistant", reply)

    return saved

@router.get("/history", response_model=List[MessageResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retourne l'historique complet des messages de l'utilisatrice."""
    return get_messages_by_user(db, current_user.id)
