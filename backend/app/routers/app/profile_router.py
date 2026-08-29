from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.profile import ProfileCreate, ProfileResponse
from app.controllers import profile_controller
from app.core.security import get_current_user # Ton middleware JWT

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.post("/onboarding", response_model=ProfileResponse)
def save_onboarding(
    profile: ProfileCreate = Body(...), 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user) # ID récupéré du token JWT
):
    # Met à jour le profil s'il existe déjà, sinon le crée (Upsert)
    return profile_controller.create_or_update_profile(db, profile, current_user.id)

@router.get("/me", response_model=ProfileResponse)
def read_mine(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_profile = profile_controller.get_profile_by_user_id(db, current_user.id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return db_profile