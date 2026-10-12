from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.schemas.cycle import CycleCreate, CycleResponse
from app.controllers.cycle_controller import create_cycle, get_cycles_by_user, get_latest_cycle

router = APIRouter(prefix="/cycles", tags=["Cycles"])


@router.post("/", response_model=CycleResponse, status_code=status.HTTP_201_CREATED)
def add_cycle(
    data: CycleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Enregistre un nouveau cycle à partir de la date de début des règles."""
    db_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profil introuvable. Veuillez compléter l'onboarding."
        )
    cycle = create_cycle(db, data, current_user.id)
    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du cycle."
        )
    return cycle


@router.get("/latest", response_model=CycleResponse)
def latest_cycle(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retourne le dernier cycle enregistré."""
    cycle = get_latest_cycle(db, current_user.id)
    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun cycle enregistré pour le moment."
        )
    return cycle


@router.get("/", response_model=List[CycleResponse])
def list_cycles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retourne tous les cycles de l'utilisatrice."""
    return get_cycles_by_user(db, current_user.id)
